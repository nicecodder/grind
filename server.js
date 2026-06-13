const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Manual .env loader
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const PORT = process.env.PORT || 5173;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Check configuration
const isConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_URL.includes('your-project');


if (!isConfigured) {
  console.warn('\n===================================================');
  console.warn('WARNING: Supabase is not fully configured in .env.');
  console.warn('Please fill in SUPABASE_URL, SUPABASE_ANON_KEY,');
  console.warn('and SUPABASE_SERVICE_ROLE_KEY to enable functionality.');
  console.warn('===================================================\n');
}

// Request Helper using native HTTP/fetch fallback
async function makeRequest(url, options = {}) {
  if (typeof fetch === 'function') {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { text };
    }

    if (!res.ok) {
      const errMsg = data.error_description || data.error || (data.msg) || `HTTP Error ${res.status}`;
      const err = new Error(errMsg);
      err.status = res.status;
      err.details = data;
      throw err;
    }
    return data;
  }

  // HTTPS Fallback for Node < 18
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const https = require('https');

    const headers = options.headers || {};
    let postData = '';
    if (options.body) {
      postData = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = { text: data };
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
        } else {
          const errMsg = parsed.error_description || parsed.error || parsed.msg || `HTTP Error ${res.statusCode}`;
          const err = new Error(errMsg);
          err.status = res.statusCode;
          err.details = parsed;
          reject(err);
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Seed admin account on startup
async function seedAdmin() {
  if (!isConfigured) return;

  const adminEmail = 'admin@grind.com';
  try {
    // 1. Check if admin profile exists
    const checkUrl = `${SUPABASE_URL}/rest/v1/profiles?email=eq.${adminEmail}`;
    const profiles = await makeRequest(checkUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (profiles && profiles.length > 0) {
      console.log('Admin account already exists in database.');
      return;
    }

    if (ADMIN_PASSWORD === 'admin123') {
      console.warn('\n===================================================');
      console.warn('WARNING: Admin account is seeded with default password ("admin123").');
      console.warn('Please configure a secure ADMIN_PASSWORD in your .env file!');
      console.warn('===================================================\n');
    }

    console.log('Seeding root administrator account into Supabase...');

    // 2. Create Auth User in GoTrue
    const authUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const authUser = await makeRequest(authUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: adminEmail,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      })
    });

    const adminId = authUser.id;

    // 3. Insert into profiles
    const profileUrl = `${SUPABASE_URL}/rest/v1/profiles`;
    await makeRequest(profileUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: adminId,
        username: 'Administrator',
        email: adminEmail,
        role: 'admin',
        subscription_plan: 'elite'
      })
    });

    // 4. Insert default state
    const defaultState = {
      streak: 0,
      totalXP: 15000,
      waterCount: 0,
      gymDuration: 0,
      studyHours: 0.0,
      sleepHours: '--',
      stepsCount: 0,
      onboardingCompleted: true,
      season: 1,
      grinderName: 'Administrator',
      subscriptionPlan: 'elite',
      eliteColor: '#ebd45b',
      eliteTitle: 'AESTHETIC DEITY',
      eliteFrame: 'gold-frame',
      tasks: [
        { id: 'workout-task', text: "Complete Today's Workout Routine", xp: 150, completed: false, isDefault: true },
        { id: 'water-task', text: "Drink 8/8 Glasses of Water", xp: 50, completed: false, isDefault: true },
        { id: 'study-task', text: "Log 4.0 Hours of Studies", xp: 100, completed: false, isDefault: true },
        { id: 'sleep-task', text: "Log 8.0 Hours of Sleep", xp: 80, completed: false, isDefault: true }
      ]
    };

    const stateUrl = `${SUPABASE_URL}/rest/v1/user_states`;
    await makeRequest(stateUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: adminId,
        state_json: defaultState
      })
    });

    console.log('Seeded root admin account successfully.');
  } catch (e) {
    if (e.message && e.message.includes('already registered')) {
      console.log('Admin auth user exists, sync profile.');
    } else {
      console.error('Failed to seed admin user into Supabase:', e.message || e);
    }
  }
}

// Token Verification helper
async function getVerifiedUser(req) {
  if (!isConfigured) return null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;

  try {
    // Call Supabase /auth/v1/user API to verify the JWT
    const verifyUrl = `${SUPABASE_URL}/auth/v1/user`;
    const userData = await makeRequest(verifyUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });

    // Fetch user profile to read role
    const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userData.id}`;
    const profiles = await makeRequest(profileUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    const profile = profiles[0] || {};
    return {
      id: userData.id,
      email: userData.email,
      username: profile.username || userData.email.split('@')[0],
      role: profile.role || 'user',
      subscription_plan: profile.subscription_plan || 'free'
    };
  } catch (e) {
    console.error('Token verification failed:', e.message);
    return null;
  }
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Response helper
function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Mock Bots for Leaderboard
const LEADERBOARD_BOTS = [
  { name: 'mollitommy', xp: 55200, lvl: 150, plan: 'pro', badge: 'badges/ultrasupreme.png', handle: '@mollitommy', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'jefryjerry', xp: 35200, lvl: 120, plan: 'pro', badge: 'badges/master.png', handle: '@jefryjerry', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'kolitrurne', xp: 25200, lvl: 100, plan: 'pro', badge: 'badges/dimond.png', handle: '@kolitrurne', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Theresa Webb', xp: 18500, lvl: 100, plan: 'free', badge: 'badges/gold.png', handle: '@meraty', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Kathryn Murphy', xp: 15200, lvl: 50, plan: 'free', badge: 'badges/silver.png', handle: '@faueod', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Jane Cooper', xp: 12100, lvl: 25, plan: 'free', badge: 'badges/bronze.png', handle: '@jikolim', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  
  // Memes
  { name: 'Zyzz', xp: 15000, lvl: 19, badge: 'badges/gold.png', plan: 'elite', handle: '@zyzz', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'David Laid', xp: 16200, lvl: 22, badge: 'badges/gold.png', plan: 'pro', handle: '@davidlaid', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'C-Bum', xp: 13320, lvl: 16, badge: 'badges/silver.png', plan: 'free', handle: '@cbum', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Sam Sulek', xp: 13100, lvl: 15, badge: 'badges/silver.png', plan: 'free', handle: '@samsulek', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Arnold', xp: 11800, lvl: 13, badge: 'badges/silver.png', plan: 'free', handle: '@arnold', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Noel Deyzel', xp: 10400, lvl: 11, badge: 'badges/bronze.png', plan: 'free', handle: '@noeldeyzel', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Ronnie C', xp: 10150, lvl: 10, badge: 'badges/bronze.png', plan: 'free', handle: '@ronniec', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Jeff Seid', xp: 8650, lvl: 8, badge: 'badges/bronze.png', plan: 'free', handle: '@jeffseid', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Alex Eubank', xp: 7400, lvl: 5, badge: 'badges/bronze.png', plan: 'free', handle: '@alexeubank', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' }
];

// Add procedural bots
const firstNames = ['Marcus', 'Jake', 'Leon', 'Sophia', 'Ethan', 'Chloe', 'Ryan', 'Zoe', 'Lucas', 'Mia', 'Kai', 'Tristan', 'Tyler', 'Gavin', 'Jared'];
const lastNames = ['Iron', 'Lift', 'Slayer', 'Grinder', 'Pump', 'Flex', 'Aesthetic', 'Beast', 'Gainz', 'Sweat', 'Power', 'Hustle', 'Steel'];
for (let i = 0; i < 40; i++) {
  const name = firstNames[i % firstNames.length] + ' ' + lastNames[(i * 3) % lastNames.length];
  const xp = Math.round(7300 - (i * 120));
  let lvl = Math.floor(xp / 400) + 1;
  let badge = 'badges/bronze.png';
  if (xp >= 3000 && xp < 8000) badge = 'badges/silver.png';
  else if (xp >= 8000) badge = 'badges/gold.png';

  LEADERBOARD_BOTS.push({
    name,
    xp,
    lvl,
    badge,
    plan: 'free',
    handle: `@${name.toLowerCase().replace(/\s+/g, '')}`,
    avatarUrl: (i % 2 === 0) ? 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' : 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png'
  });
}

// Request dispatcher
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Static File Server
  if (method === 'GET' && !pathname.startsWith('/api/')) {
    let filePath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
    let absolutePath = path.join(__dirname, filePath);

    if (!absolutePath.startsWith(__dirname)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(absolutePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // SPA Fallback
        absolutePath = path.join(__dirname, 'index.html');
      }

      const ext = path.extname(absolutePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(absolutePath).pipe(res);
    });
    return;
  }

  // API router
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    let payload = {};
    if (body) {
      try {
        payload = JSON.parse(body);
      } catch (e) {}
    }

    if (!isConfigured && pathname.startsWith('/api/')) {
      return sendJSON(res, { error: 'Supabase credentials not configured in .env.' }, 500);
    }

    // ==========================================
    // AUTHENTICATION ENDPOINTS
    // ==========================================

    // API: Register User
    if (method === 'POST' && pathname === '/api/auth/register') {
      const { username, email, password } = payload;
      if (!username || !email || !password) {
        return sendJSON(res, { error: 'Username, email, and password are required' }, 400);
      }

      try {
        // 1. Call Supabase Auth SignUp API
        const signUpUrl = `${SUPABASE_URL}/auth/v1/signup`;
        const authData = await makeRequest(signUpUrl, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const userId = authData.id || (authData.user && authData.user.id);
        if (!userId) throw new Error('Auth registration failed: No user ID returned');

        // 2. Insert record into Profiles table
        const profileUrl = `${SUPABASE_URL}/rest/v1/profiles`;
        await makeRequest(profileUrl, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: userId,
            username,
            email,
            role: 'user',
            subscription_plan: 'free'
          })
        });

        // 3. Insert record into States table
        const defaultState = {
          streak: 0,
          totalXP: 0,
          waterCount: 0,
          gymDuration: 0,
          studyHours: 0.0,
          sleepHours: '--',
          stepsCount: 0,
          onboardingStep: 1,
          onboardingCompleted: false,
          grinderName: username,
          subscriptionPlan: 'free',
          season: 1,
          tasks: [
            { id: 'workout-task', text: "Complete Today's Workout Routine", xp: 150, completed: false, isDefault: true },
            { id: 'water-task', text: "Drink 8/8 Glasses of Water", xp: 50, completed: false, isDefault: true },
            { id: 'study-task', text: "Log 4.0 Hours of Studies", xp: 100, completed: false, isDefault: true },
            { id: 'sleep-task', text: "Log 8.0 Hours of Sleep", xp: 80, completed: false, isDefault: true }
          ]
        };

        const stateUrl = `${SUPABASE_URL}/rest/v1/user_states`;
        await makeRequest(stateUrl, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            state_json: defaultState
          })
        });

        if (!authData.access_token && !authData.session) {
          return sendJSON(res, {
            verificationRequired: true,
            email: email,
            message: 'Verification OTP sent to your email. Please check your inbox.'
          }, 200);
        }

        return sendJSON(res, {
          token: authData.access_token,
          user: { id: userId, username, email, role: 'user', subscription_plan: 'free' },
          state: defaultState
        }, 201);
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to create user account' }, err.status || 500);
      }
    }

    // API: Login User
    if (method === 'POST' && pathname === '/api/auth/login') {
      const { email, password } = payload;
      if (!email || !password) {
        return sendJSON(res, { error: 'Email and password are required' }, 400);
      }

      try {
        // 1. Authenticate with Supabase Auth
        const loginUrl = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
        const authData = await makeRequest(loginUrl, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const userId = authData.user.id;

        // 2. Fetch Profile from Postgres
        const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
        const profiles = await makeRequest(profileUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        const profile = profiles[0] || { role: 'user', subscription_plan: 'free', username: authData.user.email.split('@')[0] };

        // 3. Fetch State from Postgres
        const stateUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${userId}`;
        const states = await makeRequest(stateUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        const userState = states[0] ? states[0].state_json : {};
        userState.subscriptionPlan = profile.subscription_plan; // align

        return sendJSON(res, {
          token: authData.access_token,
          user: {
            id: userId,
            username: profile.username,
            email: authData.user.email,
            role: profile.role,
            subscription_plan: profile.subscription_plan
          },
          state: userState
        });
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Invalid email/username or password' }, err.status || 400);
      }
    }

    // API: Verify OTP
    if (method === 'POST' && pathname === '/api/auth/verify-otp') {
      const { email, token } = payload;
      if (!email || !token) {
        return sendJSON(res, { error: 'Email and OTP code are required' }, 400);
      }

      try {
        const verifyUrl = `${SUPABASE_URL}/auth/v1/verify`;
        const authData = await makeRequest(verifyUrl, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'signup',
            email,
            token
          })
        });

        const userId = authData.user.id;

        // Fetch Profile from Postgres
        const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
        const profiles = await makeRequest(profileUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        const profile = profiles[0] || { role: 'user', subscription_plan: 'free', username: authData.user.email.split('@')[0] };

        // Fetch State from Postgres
        const stateUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${userId}`;
        const states = await makeRequest(stateUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        const userState = states[0] ? states[0].state_json : {};
        userState.subscriptionPlan = profile.subscription_plan; // align

        return sendJSON(res, {
          token: authData.access_token,
          user: {
            id: userId,
            username: profile.username,
            email: authData.user.email,
            role: profile.role,
            subscription_plan: profile.subscription_plan
          },
          state: userState
        });
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Invalid or expired OTP code' }, err.status || 400);
      }
    }

    // API: Google Login Redirect
    if (method === 'GET' && pathname === '/api/auth/google/login') {
      const referer = req.headers.referer || `http://${req.headers.host}/`;
      const redirectUrl = new URL(referer).origin + '/';
      const authorizeUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
      res.writeHead(302, { 'Location': authorizeUrl });
      res.end();
      return;
    }

    // API: Google Verify & Session Setup
    if (method === 'POST' && pathname === '/api/auth/google/verify') {
      const { access_token } = payload;
      if (!access_token) {
        return sendJSON(res, { error: 'Access token is required' }, 400);
      }

      try {
        // 1. Verify token with Supabase Auth
        const verifyUrl = `${SUPABASE_URL}/auth/v1/user`;
        const userData = await makeRequest(verifyUrl, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${access_token}`
          }
        });

        const userId = userData.id;
        const email = userData.email;
        const userMetadata = userData.user_metadata || {};
        const fullName = userMetadata.full_name || userMetadata.name || email.split('@')[0];

        // 2. Check if Profile exists in Database
        const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
        const profiles = await makeRequest(profileUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        let profile = profiles[0];
        let userState = {};

        if (!profile) {
          // Profile does not exist, create it and state
          const newProfileUrl = `${SUPABASE_URL}/rest/v1/profiles`;
          const profileResult = await makeRequest(newProfileUrl, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              id: userId,
              username: fullName,
              email,
              role: 'user',
              subscription_plan: 'free'
            })
          });
          
          profile = Array.isArray(profileResult) ? profileResult[0] : (profileResult || { id: userId, username: fullName, email, role: 'user', subscription_plan: 'free' });

          // Insert default state
          const defaultState = {
            streak: 0,
            totalXP: 0,
            waterCount: 0,
            gymDuration: 0,
            studyHours: 0.0,
            sleepHours: '--',
            stepsCount: 0,
            onboardingStep: 3,
            onboardingCompleted: false,
            grinderName: fullName,
            subscriptionPlan: 'free',
            season: 1,
            tasks: [
              { id: 'workout-task', text: "Complete Today's Workout Routine", xp: 150, completed: false, isDefault: true },
              { id: 'water-task', text: "Drink 8/8 Glasses of Water", xp: 50, completed: false, isDefault: true },
              { id: 'study-task', text: "Log 4.0 Hours of Studies", xp: 100, completed: false, isDefault: true },
              { id: 'sleep-task', text: "Log 8.0 Hours of Sleep", xp: 80, completed: false, isDefault: true }
            ]
          };

          const stateUrl = `${SUPABASE_URL}/rest/v1/user_states`;
          await makeRequest(stateUrl, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: userId,
              state_json: defaultState
            })
          });

          userState = defaultState;
        } else {
          // Fetch existing user state
          const stateUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${userId}`;
          const states = await makeRequest(stateUrl, {
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            }
          });

          userState = states[0] ? states[0].state_json : {};
          userState.subscriptionPlan = profile.subscription_plan; // align
        }

        return sendJSON(res, {
          token: access_token,
          user: {
            id: userId,
            username: profile.username || fullName,
            email,
            role: profile.role || 'user',
            subscription_plan: profile.subscription_plan || 'free'
          },
          state: userState
        });
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Google Auth Verification Failed' }, err.status || 500);
      }
    }

    // ==========================================
    // USER STATE & LEADERBOARD ENDPOINTS
    // ==========================================
    
    // Auth Guard
    const user = await getVerifiedUser(req);
    if (!user) {
      return sendJSON(res, { error: 'Authentication required or session expired' }, 401);
    }

    // API: Get State
    if (method === 'GET' && pathname === '/api/user/state') {
      try {
        const stateUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${user.id}`;
        const states = await makeRequest(stateUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        if (!states[0]) return sendJSON(res, { error: 'State not found' }, 404);
        
        const userState = states[0].state_json;
        userState.subscriptionPlan = user.subscription_plan;
        return sendJSON(res, userState);
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to fetch state' }, 500);
      }
    }

    // API: Sync State
    if (method === 'POST' && pathname === '/api/user/state') {
      try {
        // Fetch current stored state to check season
        const checkUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${user.id}`;
        const existingStates = await makeRequest(checkUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        let updatedPayload = payload;
        let responsePayload = { success: true };

        if (existingStates && existingStates[0]) {
          const dbState = existingStates[0].state_json || {};
          const dbSeason = dbState.season || 1;
          const clientSeason = payload.season || 1;

          if (dbSeason > clientSeason) {
            // Client is on an old season! Adjust their XP by dropping 70%
            const oldXP = payload.totalXP || 0;
            payload.totalXP = Math.round(oldXP * 0.3);
            payload.season = dbSeason;
            responsePayload.updatedState = payload;
          }
        }

        // Force backend-authorized subscription plan state to prevent client-side tampering
        payload.subscriptionPlan = user.subscription_plan;

        // 1. Update Profiles table details
        const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`;
        await makeRequest(profileUrl, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: payload.grinderName || user.username
          })
        });

        // 2. Update User States table
        const stateUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${user.id}`;
        await makeRequest(stateUrl, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            state_json: payload,
            updated_at: new Date().toISOString()
          })
        });

        return sendJSON(res, responsePayload);
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to sync state' }, 500);
      }
    }

    // API: Upgrade Subscription (secure/isolated endpoint)
    if (method === 'POST' && pathname === '/api/user/upgrade') {
      const { plan } = payload;
      if (!plan || !['free', 'pro', 'elite'].includes(plan)) {
        return sendJSON(res, { error: 'Invalid subscription plan specification' }, 400);
      }

      try {
        // 1. Update Profiles subscription plan
        const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`;
        await makeRequest(profileUrl, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription_plan: plan
          })
        });

        // 2. Update User States JSON payload as well
        const stateGetUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${user.id}`;
        const states = await makeRequest(stateGetUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        if (states[0]) {
          const stateJson = states[0].state_json || {};
          stateJson.subscriptionPlan = plan;
          
          if (plan === 'pro') {
            stateJson.expBoostMultiplier = 1.5;
            stateJson.expBoostActive = true;
            stateJson.streakShields = Math.max(stateJson.streakShields || 0, 2);
          } else if (plan === 'elite') {
            stateJson.expBoostMultiplier = 2;
            stateJson.expBoostActive = true;
            stateJson.streakShields = 999;
          } else {
            stateJson.expBoostMultiplier = 1;
            stateJson.expBoostActive = false;
            stateJson.streakShields = 0;
          }

          const statePatchUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${user.id}`;
          await makeRequest(statePatchUrl, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              state_json: stateJson,
              updated_at: new Date().toISOString()
            })
          });
        }

        return sendJSON(res, { success: true, plan });
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to upgrade subscription' }, 500);
      }
    }

    // API: Leaderboard
    if (method === 'GET' && pathname === '/api/leaderboard') {
      try {
        // Fetch profiles joined with user states (nested selects)
        const fetchUrl = `${SUPABASE_URL}/rest/v1/profiles?select=id,username,subscription_plan,user_states(state_json)&subscription_plan=neq.free`;
        const rows = await makeRequest(fetchUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        const registeredCompetitors = [];
        rows.forEach(row => {
          const stateRow = row.user_states || {};
          const userState = stateRow.state_json || {};

          const totalXP = userState.totalXP || 0;
          let lvl = 10;
          let badge = 'badges/bronze.png';

          if (totalXP < 3000) {
            lvl = 10;
            badge = 'badges/bronze.png';
          } else if (totalXP >= 3000 && totalXP < 8000) {
            lvl = 20;
            badge = 'badges/silver.png';
          } else if (totalXP >= 8000 && totalXP < 16000) {
            lvl = 30;
            badge = 'badges/gold.png';
          } else if (totalXP >= 16000 && totalXP < 30000) {
            lvl = 40;
            badge = 'badges/dimond.png';
          } else if (totalXP >= 30000 && totalXP < 50000) {
            lvl = 50;
            badge = 'badges/master.png';
          } else if (totalXP >= 50000 && totalXP < 100000) {
            lvl = 60;
            badge = 'badges/supreme.png';
          } else {
            lvl = 70;
            badge = 'badges/ultrasupreme.png';
          }

          const priorityXP = row.subscription_plan === 'elite' ? totalXP + 1000 : totalXP;

          registeredCompetitors.push({
            id: row.id,
            name: row.username,
            xp: totalXP,
            priorityXP,
            lvl,
            badge,
            plan: row.subscription_plan,
            handle: `@${row.username.toLowerCase().replace(/\s+/g, '')}`,
            avatarUrl: userState.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png',
            isRealUser: true
          });
        });

        const combined = [...registeredCompetitors, ...LEADERBOARD_BOTS];
        combined.sort((a, b) => {
          const aVal = a.priorityXP !== undefined ? a.priorityXP : a.xp;
          const bVal = b.priorityXP !== undefined ? b.priorityXP : b.xp;
          return bVal - aVal;
        });

        return sendJSON(res, combined);
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to fetch leaderboard data' }, 500);
      }
    }

    // ==========================================
    // ADMIN DASHBOARD ENDPOINTS
    // ==========================================
    if (user.role !== 'admin') {
      return sendJSON(res, { error: 'Administrator access required' }, 403);
    }

    // API: Start New Season
    if (method === 'POST' && pathname === '/api/admin/new-season') {
      try {
        // 1. Fetch all user states
        const fetchUrl = `${SUPABASE_URL}/rest/v1/user_states?select=user_id,state_json`;
        const states = await makeRequest(fetchUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        // 2. Reduce XP of each user by 70% and increment season
        for (const stateRow of states) {
          const userId = stateRow.user_id;
          const stateJson = stateRow.state_json || {};
          
          if (stateJson.totalXP !== undefined) {
            stateJson.totalXP = Math.round(stateJson.totalXP * 0.3); // Drop 70%, keep 30%
          }
          stateJson.season = (stateJson.season || 1) + 1; // Increment season version
          
          // Patch state back to DB
          const patchUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${userId}`;
          await makeRequest(patchUrl, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              state_json: stateJson,
              updated_at: new Date().toISOString()
            })
          });
        }

        return sendJSON(res, { success: true });
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to start new season' }, 500);
      }
    }

    // API: Admin stats
    if (method === 'GET' && pathname === '/api/admin/stats') {
      try {
        const fetchUrl = `${SUPABASE_URL}/rest/v1/profiles?select=subscription_plan,user_states(state_json)`;
        const rows = await makeRequest(fetchUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        const totalUsers = rows.length;
        const proUsers = rows.filter(r => r.subscription_plan === 'pro').length;
        const eliteUsers = rows.filter(r => r.subscription_plan === 'elite').length;
        
        let totalXP = 0;
        rows.forEach(r => {
          const s = r.user_states || {};
          const stateJson = s.state_json || {};
          totalXP += (stateJson.totalXP || 0);
        });

        return sendJSON(res, {
          totalUsers,
          proUsers,
          eliteUsers,
          totalXP
        });
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to query admin stats' }, 500);
      }
    }

    // API: Admin Users list
    if (method === 'GET' && pathname === '/api/admin/users') {
      try {
        const fetchUrl = `${SUPABASE_URL}/rest/v1/profiles?select=id,username,email,role,subscription_plan,created_at,user_states(state_json)`;
        const rows = await makeRequest(fetchUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        const list = rows.map(row => {
          const stateRow = row.user_states || {};
          const userState = stateRow.state_json || {};
          return {
            id: row.id,
            username: row.username,
            email: row.email,
            role: row.role,
            subscription_plan: row.subscription_plan,
            created_at: row.created_at,
            xp: userState.totalXP || 0,
            streak: userState.streak || 0
          };
        });

        return sendJSON(res, list);
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to list registry users' }, 500);
      }
    }

    // API: Admin Edit User
    if (method === 'PUT' && pathname.startsWith('/api/admin/users/')) {
      const parts = pathname.split('/');
      const userId = parts[parts.length - 1]; // UUID

      const { username, email, subscription_plan, role, xp, streak } = payload;
      try {
        // 1. Update Profiles table
        const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
        await makeRequest(profileUrl, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username,
            email,
            role,
            subscription_plan
          })
        });

        // 2. Fetch current state JSON and modify XP / Streak
        const stateGetUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${userId}`;
        const states = await makeRequest(stateGetUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        if (states[0]) {
          const stateJson = states[0].state_json;
          if (xp !== undefined) stateJson.totalXP = parseInt(xp) || 0;
          if (streak !== undefined) stateJson.streak = parseInt(streak) || 0;
          stateJson.grinderName = username;
          stateJson.subscriptionPlan = subscription_plan;

          const statePatchUrl = `${SUPABASE_URL}/rest/v1/user_states?user_id=eq.${userId}`;
          await makeRequest(statePatchUrl, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              state_json: stateJson,
              updated_at: new Date().toISOString()
            })
          });
        }

        return sendJSON(res, { success: true });
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to update user registry details' }, 500);
      }
    }

    // API: Admin Delete User
    if (method === 'DELETE' && pathname.startsWith('/api/admin/users/')) {
      const parts = pathname.split('/');
      const userId = parts[parts.length - 1]; // UUID

      try {
        // GoTrue Admin API deletion: deletes authentication profile
        // Cascade triggers will delete public.profiles and public.user_states
        const deleteUrl = `${SUPABASE_URL}/auth/v1/admin/users/${userId}`;
        await makeRequest(deleteUrl, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        return sendJSON(res, { success: true });
      } catch (err) {
        return sendJSON(res, { error: err.message || 'Failed to delete user account' }, 500);
      }
    }

    return sendJSON(res, { error: 'Route not found' }, 404);
  });
});

// Run server and attempt administrator seed on startup
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`Grind Supabase Gateway Server Running: http://localhost:${PORT}`);
  console.log(`===================================================`);
  
  // Seed admin check
  seedAdmin();
});
