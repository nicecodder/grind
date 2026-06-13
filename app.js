// HTML Escaping Utility for XSS Prevention
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// APPLICATION STATE
const state = {
  activeView: 'home',
  streak: 0,
  totalXP: 0,
  waterCount: 0,
  gymDuration: 0,
  studyHours: 0.0,
  sleepHours: '--',
  
  // Steps tracking
  stepsCount: 0,
  isSyncActive: false,
  
  // Onboarding & Preferences
  onboardingStep: 1,
  onboardingCompleted: false,
  gender: 'male',
  workoutPlan: 5,
  avatarIndex: 0,
  
  // Active workout tracking
  workout: {
    started: false,
    completed: false,
    exercises: [
      { id: 'pullups', name: 'Pull-ups / Lat Pulldown', sets: 4, completedSets: 0, reps: '8-10 reps', muscles: 'Back, Biceps, Rear Delts' },
      { id: 'bbrow', name: 'Barbell Row', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Back, Biceps, Rear Delts' },
      { id: 'cablerow', name: 'Seated Cable Row', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps, Rear Delts' },
      { id: 'facepulls', name: 'Face Pulls', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Back, Biceps, Rear Delts' }
    ]
  },
  
  // Scanner state
  selectedPreset: 'shredded',
  isScanning: false,
  hasScanned: false,
  
  // Profile settings
  grinderName: 'Athlete',
  avatarUrl: '',
  units: 'Metric (kg, km)',
  theme: 'Deep Black',

  // Daily tracker flags
  gymCompletedToday: false,
  lastRestDayXpCreditedDate: '',
  lastDayCheckedDate: '',

  // Subscription & Ads
  subscriptionPlan: 'free', // 'free', 'pro', 'elite'
  selectedPlan: 'pro', // currently selected in modal
  billingCycle: 'monthly', // 'monthly' or 'yearly'
  adWatchedToday: false, // rewarded ad flag
  expBoostActive: false, // 1.5x or 2x boost
  expBoostMultiplier: 1, // 1, 1.5, or 2
  adCooldownTimestamp: 0, // throttle ads
  taskCompletionsSinceLastAd: 0, // show ad every 3 task completions for free users
  
  // Sign in and premium details
  isUserSignedIn: false,
  streakShields: 0,
  eliteColor: '#ffffff',
  eliteTitle: 'GRINDER',
  eliteFrame: 'none',
  lastWorkoutStudySameDayDate: '',
  lastMorningRoutineDate: '',
  
  // Stats for 54 Achievements
  workoutCount: 0,
  workoutStreak: 0,
  cardioCount: 0,
  strengthCount: 0,
  totalStudyHours: 0.0,
  studySessionsCount: 0,
  studyStreak: 0,
  maxStudySessionDuration: 0,
  sleepLogsCount: 0,
  sleepStreak: 0,
  nightsWith8HrsSleep: 0,
  earlyRiseSleepGoalCount: 0,
  totalWaterCount: 0,
  waterStreak: 0,
  maxWaterSingleDay: 0,
  morningHydrationCount: 0,
  consistentWaterDays: 0,
  perfectDaysCount: 0,
  perfectDaysStreak: 0,
  workoutAndStudySameDayCount: 0,
  morningRoutineCompletedCount: 0,
  workoutBefore7AMCount: 0,
  workoutAfter9PMCount: 0,
  studyBefore8AMCount: 0,
  studyPastMidnightCount: 0,
  daysUsedCount: 1,
  season: 1,

  // Achievements progress
  unlockedAchievements: new Set(),
  achievements: {},

  // Daily Grind Tasks Checklist
  tasks: [
    { id: 'workout-task', text: "Complete Today's Workout Routine", xp: 150, completed: false, isDefault: true },
    { id: 'water-task', text: "Drink 8/8 Glasses of Water", xp: 50, completed: false, isDefault: true },
    { id: 'study-task', text: "Log 4.0 Hours of Studies", xp: 100, completed: false, isDefault: true },
    { id: 'sleep-task', text: "Log 8.0 Hours of Sleep", xp: 80, completed: false, isDefault: true }
  ]
};

// 54 ACHIEVEMENT DEFINITIONS FROM tasks.txt
const ACHIEVEMENT_DEFINITIONS = [
  { id: 1, category: "workout", name: "First rep", description: "Complete your first workout session.", xp: 100, target: 1, img: "achivement/dumble.png" },
  { id: 2, category: "workout", name: "Heat check", description: "Work out 3 days in a row.", xp: 200, target: 3, img: "achivement/lifting.png" },
  { id: 3, category: "workout", name: "Locked in", description: "Complete 7 straight days of workouts.", xp: 350, target: 7, img: "achivement/muscles.png" },
  { id: 4, category: "workout", name: "Iron week", description: "Hit every workout for a full week with no skips.", xp: 400, target: 7, img: "achivement/lifting.png" },
  { id: 5, category: "workout", name: "On a mission", description: "Log 20 total workout sessions.", xp: 350, target: 20, img: "achivement/dumble.png" },
  { id: 6, category: "workout", name: "Cardio king", description: "Log 10 cardio sessions.", xp: 250, target: 10, img: "achivement/run.png" },
  { id: 7, category: "workout", name: "Lifter", description: "Log 10 strength training sessions.", xp: 250, target: 10, img: "achivement/lifting.png" },
  { id: 8, category: "workout", name: "Sweat streak", description: "Work out 30 days in a month.", xp: 500, target: 30, img: "achivement/muscles.png" },
  { id: 9, category: "workout", name: "Early bird lifts", description: "Complete a workout before 7 AM.", xp: 200, target: 1, img: "achivement/dumble.png" },
  { id: 10, category: "workout", name: "Night grinder", description: "Complete a workout after 9 PM.", xp: 150, target: 1, img: "achivement/lifting.png" },
  { id: 11, category: "workout", name: "Gains machine", description: "Log 50 total workout sessions.", xp: 600, target: 50, img: "achivement/muscles.png" },
  { id: 12, category: "workout", name: "Century", description: "Reach 100 total workouts.", xp: 700, target: 100, img: "achivement/muscles.png" },

  { id: 13, category: "study", name: "First page", description: "Log your first study session.", xp: 100, target: 1, img: "study/study 1.png" },
  { id: 14, category: "study", name: "Study buddy", description: "Study 3 days in a row.", xp: 200, target: 3, img: "study/study 2.png" },
  { id: 15, category: "study", name: "Deep focus", description: "Study for 2+ hours in a single session.", xp: 250, target: 1, img: "study/study 3.png" },
  { id: 16, category: "study", name: "Time investor", description: "Log 10 total hours of studying.", xp: 300, target: 10, img: "study/study 4.png" },
  { id: 17, category: "study", name: "Weekly scholar", description: "Study every day for a full week.", xp: 350, target: 7, img: "study/study 5.png" },
  { id: 18, category: "study", name: "Grind mode", description: "Log 7 study sessions in a week.", xp: 400, target: 7, img: "study/study 6.png" },
  { id: 19, category: "study", name: "Big brain", description: "Log 50 total hours of studying.", xp: 500, target: 50, img: "study/study 7.png" },
  { id: 20, category: "study", name: "Scholar", description: "Study consistently for 30 days.", xp: 550, target: 30, img: "study/study 8.png" },
  { id: 21, category: "study", name: "100 hour club", description: "Hit 100 total study hours.", xp: 700, target: 100, img: "study/study 7.png" },
  { id: 22, category: "study", name: "Morning mind", description: "Start a study session before 8 AM.", xp: 150, target: 1, img: "study/study 1.png" },
  { id: 23, category: "study", name: "Late night grind", description: "Study past midnight.", xp: 150, target: 1, img: "study/study 3.png" },
  { id: 24, category: "study", name: "Consistent learner", description: "Study at least 30 min every day for 14 days.", xp: 400, target: 14, img: "study/study 5.png" },

  { id: 25, category: "sleep", name: "Lights out", description: "Log your first sleep session.", xp: 100, target: 1, img: "study/study 2.png" },
  { id: 26, category: "sleep", name: "Rest locked", description: "Hit your sleep goal 3 nights in a row.", xp: 200, target: 3, img: "study/study 4.png" },
  { id: 27, category: "sleep", name: "8 hours", description: "Sleep 8+ hours in a single night.", xp: 150, target: 1, img: "study/study 6.png" },
  { id: 28, category: "sleep", name: "Perfect rest", description: "Hit your sleep goal 7 nights straight.", xp: 350, target: 7, img: "study/study 8.png" },
  { id: 29, category: "sleep", name: "Sleep king", description: "Maintain your sleep goal for 30 days.", xp: 500, target: 30, img: "study/study 3.png" },
  { id: 30, category: "sleep", name: "Early riser", description: "Wake up before 6 AM after 7+ hours of sleep.", xp: 250, target: 1, img: "study/study 1.png" },
  { id: 31, category: "sleep", name: "Recharge master", description: "Average 8 hours of sleep for a full week.", xp: 400, target: 7, img: "study/study 5.png" },
  { id: 32, category: "sleep", name: "Recovery mode", description: "Log 14 straight nights of solid sleep.", xp: 450, target: 14, img: "study/study 6.png" },
  { id: 33, category: "sleep", name: "Well-rested warrior", description: "Maintain a healthy sleep schedule for 60 days.", xp: 650, target: 60, img: "study/study 8.png" },
  { id: 34, category: "sleep", name: "Dream streak", description: "Never miss your sleep log for 21 days.", xp: 350, target: 21, img: "study/study 2.png" },

  { id: 35, category: "water", name: "First sip", description: "Log your first water intake.", xp: 100, target: 1, img: "study/study 4.png" },
  { id: 36, category: "water", name: "Hydrated", description: "Hit your daily water goal for the first time.", xp: 150, target: 1, img: "study/study 2.png" },
  { id: 37, category: "water", name: "3-day flow", description: "Hit your water goal 3 days in a row.", xp: 200, target: 3, img: "study/study 7.png" },
  { id: 38, category: "water", name: "Hydration streak", description: "Hit your water goal 7 days straight.", xp: 300, target: 7, img: "study/study 4.png" },
  { id: 39, category: "water", name: "Flood season", description: "Drink 3L+ (12+ glasses) in a single day.", xp: 200, target: 1, img: "study/study 1.png" },
  { id: 40, category: "water", name: "H2O master", description: "Hit your water goal for 30 days straight.", xp: 500, target: 30, img: "study/study 3.png" },
  { id: 41, category: "water", name: "Aqua warrior", description: "Log water intake every single day for 14 days.", xp: 350, target: 14, img: "study/study 5.png" },
  { id: 42, category: "water", name: "Water legend", description: "Hit your water goal for 60 days straight.", xp: 650, target: 60, img: "study/study 8.png" },
  { id: 43, category: "water", name: "Morning hydration", description: "Drink water within 10 minutes of waking up, 7 days.", xp: 250, target: 7, img: "study/study 2.png" },
  { id: 44, category: "water", name: "Consistent sipper", description: "Log at least 1.5L (6+ glasses) every day for 21 days.", xp: 400, target: 21, img: "study/study 6.png" },

  { id: 45, category: "special", name: "The full lock-in", description: "Hit all 4 goals in a single day.", xp: 500, target: 1, img: "achivement/muscles.png" },
  { id: 46, category: "special", name: "Perfect week", description: "Hit all 4 goals every day for 7 days straight.", xp: 700, target: 7, img: "achivement/lifting.png" },
  { id: 47, category: "special", name: "30-day grind", description: "Hit all 4 goals every day for 30 days.", xp: 700, target: 30, img: "achivement/muscles.png" },
  { id: 48, category: "special", name: "Grind OG", description: "Use the app for 100 days.", xp: 600, target: 100, img: "study/study 6.png" },
  { id: 49, category: "special", name: "Multi-tasker", description: "Log a workout and study session on the same day.", xp: 300, target: 1, img: "achivement/lifting.png" },
  { id: 50, category: "special", name: "Morning routine", description: "Complete workout, water, and study before noon.", xp: 450, target: 1, img: "achivement/muscles.png" },
  { id: 51, category: "special", name: "No days off", description: "Log at least one activity every day for 60 days.", xp: 650, target: 60, img: "study/study 8.png" },
  { id: 52, category: "special", name: "Level up", description: "Earn 5,000 total XP.", xp: 500, target: 5000, img: "study/study 1.png" },
  { id: 53, category: "special", name: "Fully locked", description: "Earn 10,000 total XP.", xp: 700, target: 10000, img: "study/study 3.png" },
  { id: 54, category: "special", name: "Grind legend", description: "Unlock at least 40 achievements.", xp: 700, target: 40, img: "achivement/muscles.png" }
];

// Initialize achievements in state
ACHIEVEMENT_DEFINITIONS.forEach(def => {
  state.achievements[def.id] = { current: 0, target: def.target, xp: def.xp, unlocked: false, category: def.category };
});

// WORKOUT PLANS & DAILY ROUTINES DATA
const WORKOUT_ROUTINES = {
  5: {
    1: { // Monday
      title: 'Monday — Push',
      focus: 'Chest, Shoulders, Triceps',
      exercises: [
        { id: 'bench', name: 'Bench Press', sets: 4, completedSets: 0, reps: '6-8 reps', muscles: 'Chest, Shoulders, Triceps' },
        { id: 'incdb', name: 'Incline Dumbbell Press', sets: 3, completedSets: 0, reps: '8-10 reps', muscles: 'Chest, Shoulders, Triceps' },
        { id: 'ohp', name: 'Shoulder Press', sets: 3, completedSets: 0, reps: '8-10 reps', muscles: 'Chest, Shoulders, Triceps' },
        { id: 'latraise', name: 'Lateral Raises', sets: 4, completedSets: 0, reps: '12-15 reps', muscles: 'Chest, Shoulders, Triceps' },
        { id: 'fly', name: 'Chest Fly', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Chest, Shoulders, Triceps' },
        { id: 'pushdown', name: 'Tricep Pushdown', sets: 3, completedSets: 0, reps: '10-12 reps', muscles: 'Chest, Shoulders, Triceps' },
        { id: 'ovhext', name: 'Overhead Tricep Extension', sets: 3, completedSets: 0, reps: '10-12 reps', muscles: 'Chest, Shoulders, Triceps' }
      ]
    },
    2: { // Tuesday
      title: 'Tuesday — Pull',
      focus: 'Back, Biceps, Rear Delts',
      exercises: [
        { id: 'pullups', name: 'Pull-ups / Lat Pulldown', sets: 4, completedSets: 0, reps: '8-10 reps', muscles: 'Back, Biceps, Rear Delts' },
        { id: 'bbrow', name: 'Barbell Row', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Back, Biceps, Rear Delts' },
        { id: 'cablerow', name: 'Seated Cable Row', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps, Rear Delts' },
        { id: 'facepulls', name: 'Face Pulls', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Back, Biceps, Rear Delts' },
        { id: 'dbcurl', name: 'Dumbbell Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps, Rear Delts' },
        { id: 'hammercurl', name: 'Hammer Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps, Rear Delts' },
        { id: 'wristcurl', name: 'Wrist Curl', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Back, Biceps, Rear Delts' }
      ]
    },
    3: { // Wednesday
      title: 'Wednesday — Rest Day',
      focus: 'Active Recovery',
      exercises: []
    },
    4: { // Thursday
      title: 'Thursday — Legs',
      focus: 'Quads, Hamstrings, Calves, Core',
      exercises: [
        { id: 'squats', name: 'Squats', sets: 4, completedSets: 0, reps: '6-8 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
        { id: 'rdl', name: 'Romanian Deadlift', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
        { id: 'legpress', name: 'Leg Press', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
        { id: 'legcurl', name: 'Leg Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
        { id: 'legext', name: 'Leg Extension', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
        { id: 'calfraise', name: 'Calf Raises', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Quads, Hamstrings, Calves, Core' },
        { id: 'hangingleg', name: 'Hanging Leg Raises', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Quads, Hamstrings, Calves, Core' }
      ]
    },
    5: { // Friday
      title: 'Friday — Upper Body',
      focus: 'Chest, Back, Shoulders, Arms',
      exercises: [
        { id: 'incbench', name: 'Incline Bench Press', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Chest, Back, Shoulders, Arms' },
        { id: 'pullups_amrap', name: 'Pull-ups', sets: 4, completedSets: 0, reps: 'AMRAP reps', muscles: 'Chest, Back, Shoulders, Arms' },
        { id: 'dbpress', name: 'Dumbbell Shoulder Press', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Chest, Back, Shoulders, Arms' },
        { id: 'suprow', name: 'Chest Supported Row', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Chest, Back, Shoulders, Arms' },
        { id: 'latraise_high', name: 'Lateral Raises', sets: 4, completedSets: 0, reps: '15 reps', muscles: 'Chest, Back, Shoulders, Arms' },
        { id: 'ezcurl', name: 'EZ Bar Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Chest, Back, Shoulders, Arms' },
        { id: 'skullcrush', name: 'Skull Crushers', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Chest, Back, Shoulders, Arms' }
      ]
    },
    6: { // Saturday
      title: 'Saturday — Lower + Core',
      focus: 'Legs, Core strength',
      exercises: [
        { id: 'deadlift', name: 'Deadlift', sets: 3, completedSets: 0, reps: '5 reps', muscles: 'Legs, Core' },
        { id: 'split_squat', name: 'Bulgarian Split Squat', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Legs, Core' },
        { id: 'hipthrust', name: 'Hip Thrust', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Legs, Core' },
        { id: 'hamcurl', name: 'Hamstring Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Legs, Core' },
        { id: 'stdcalf', name: 'Standing Calf Raise', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Legs, Core' },
        { id: 'cablecrunch', name: 'Cable Crunch', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Legs, Core' },
        { id: 'plank', name: 'Plank', sets: 3, completedSets: 0, reps: '1 min', muscles: 'Legs, Core' }
      ]
    },
    0: { // Sunday
      title: 'Sunday — Full Rest',
      focus: 'Full recovery day',
      exercises: []
    }
  },
  6: {
    1: { // Monday
      title: 'Monday — Chest + Triceps',
      focus: 'Chest, Triceps',
      exercises: [
        { id: 'bench', name: 'Bench Press', sets: 4, completedSets: 0, reps: '6-8 reps', muscles: 'Chest, Triceps' },
        { id: 'incdb', name: 'Incline Dumbbell Press', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Chest, Triceps' },
        { id: 'fly', name: 'Chest Fly', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Chest, Triceps' },
        { id: 'dips', name: 'Dips', sets: 3, completedSets: 0, reps: 'AMRAP reps', muscles: 'Chest, Triceps' },
        { id: 'pushdown', name: 'Tricep Pushdown', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Chest, Triceps' },
        { id: 'ovhext', name: 'Overhead Extension', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Chest, Triceps' }
      ]
    },
    2: { // Tuesday
      title: 'Tuesday — Back + Biceps',
      focus: 'Back, Biceps',
      exercises: [
        { id: 'pullups', name: 'Pull-ups', sets: 4, completedSets: 0, reps: 'AMRAP reps', muscles: 'Back, Biceps' },
        { id: 'bbrow', name: 'Barbell Row', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Back, Biceps' },
        { id: 'latdown', name: 'Lat Pulldown', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps' },
        { id: 'seatedrow', name: 'Seated Row', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps' },
        { id: 'bbcurl', name: 'Barbell Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Back, Biceps' },
        { id: 'hammercurl', name: 'Hammer Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Back, Biceps' }
      ]
    },
    3: { // Wednesday
      title: 'Wednesday — Legs',
      focus: 'Quads, Hamstrings, Calves',
      exercises: [
        { id: 'squats', name: 'Squats', sets: 4, completedSets: 0, reps: '6-8 reps', muscles: 'Quads, Hamstrings, Calves' },
        { id: 'rdl', name: 'Romanian Deadlift', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Quads, Hamstrings, Calves' },
        { id: 'legpress', name: 'Leg Press', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Quads, Hamstrings, Calves' },
        { id: 'legcurl', name: 'Leg Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Quads, Hamstrings, Calves' },
        { id: 'calfraise', name: 'Calf Raises', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Quads, Hamstrings, Calves' },
        { id: 'hangingleg', name: 'Hanging Leg Raises', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Quads, Hamstrings, Calves' }
      ]
    },
    4: { // Thursday
      title: 'Thursday — Shoulders + Forearms',
      focus: 'Shoulders, Forearms',
      exercises: [
        { id: 'ohp', name: 'Overhead Press', sets: 4, completedSets: 0, reps: '8 reps', muscles: 'Shoulders, Forearms' },
        { id: 'latraise', name: 'Lateral Raise', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Shoulders, Forearms' },
        { id: 'reardelt', name: 'Rear Delt Fly', sets: 4, completedSets: 0, reps: '15 reps', muscles: 'Shoulders, Forearms' },
        { id: 'uprow', name: 'Upright Row', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Shoulders, Forearms' },
        { id: 'shrugs', name: 'Shrugs', sets: 4, completedSets: 0, reps: '12 reps', muscles: 'Shoulders, Forearms' },
        { id: 'wristcurl', name: 'Wrist Curl', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Shoulders, Forearms' },
        { id: 'revwrist', name: 'Reverse Wrist Curl', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Shoulders, Forearms' }
      ]
    },
    5: { // Friday
      title: 'Friday — Upper Power',
      focus: 'Upper Power',
      exercises: [
        { id: 'bench_power', name: 'Bench Press', sets: 4, completedSets: 0, reps: '5 reps', muscles: 'Upper Power' },
        { id: 'wt_pullups', name: 'Weighted Pull-ups', sets: 4, completedSets: 0, reps: '6 reps', muscles: 'Upper Power' },
        { id: 'bbrow_power', name: 'Barbell Row', sets: 4, completedSets: 0, reps: '6 reps', muscles: 'Upper Power' },
        { id: 'incpress', name: 'Incline Press', sets: 3, completedSets: 0, reps: '8 reps', muscles: 'Upper Power' },
        { id: 'dbcurl', name: 'Dumbbell Curl', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Upper Power' },
        { id: 'skullcrush', name: 'Skull Crushers', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Upper Power' }
      ]
    },
    6: { // Saturday
      title: 'Saturday — Lower Power',
      focus: 'Lower Power',
      exercises: [
        { id: 'deadlift_power', name: 'Deadlift', sets: 4, completedSets: 0, reps: '5 reps', muscles: 'Lower Power' },
        { id: 'frontsquat', name: 'Front Squat', sets: 4, completedSets: 0, reps: '6 reps', muscles: 'Lower Power' },
        { id: 'split_squat', name: 'Bulgarian Split Squat', sets: 3, completedSets: 0, reps: '10 reps', muscles: 'Lower Power' },
        { id: 'hamcurl', name: 'Hamstring Curl', sets: 3, completedSets: 0, reps: '12 reps', muscles: 'Lower Power' },
        { id: 'calfraise', name: 'Calf Raises', sets: 5, completedSets: 0, reps: '15 reps', muscles: 'Lower Power' },
        { id: 'cablecrunch', name: 'Cable Crunch', sets: 3, completedSets: 0, reps: '15 reps', muscles: 'Lower Power' }
      ]
    },
    0: { // Sunday
      title: 'Sunday — Rest Day',
      focus: 'Complete recovery',
      exercises: []
    }
  }
};

// DOM ELEMENTS
const DOM = {
  views: document.querySelectorAll('.view-content'),
  navItems: document.querySelectorAll('.nav-item'),
  mainHeader: document.getElementById('main-header'),
  
  // Tab switch triggers
  rankBadge: document.getElementById('home-rank-badge'),
  rewardsBackBtn: document.getElementById('rewards-back-btn'),
  settingsBtn: document.getElementById('settings-btn'),
  
  // Water Habit
  waterHabit: document.getElementById('water-habit'),
  waterCount: document.getElementById('water-count'),
  waterProgressBar: document.getElementById('water-progress-bar'),
  
  // Gym Habit
  gymHabit: document.getElementById('gym-habit'),
  gymDuration: document.getElementById('gym-duration'),
  gymProgressBar: document.getElementById('gym-progress-bar'),
  gymStatus: document.getElementById('gym-status'),
  workoutInteractiveSection: document.getElementById('workout-interactive-section'),
  
  // Study Habit
  studyHabit: document.getElementById('study-habit'),
  studyHours: document.getElementById('study-hours'),
  studyProgressBar: document.getElementById('study-progress-bar'),
  
  // Sleep Habit
  sleepHabit: document.getElementById('sleep-habit'),
  sleepHours: document.getElementById('sleep-hours'),
  sleepProgressBar: document.getElementById('sleep-progress-bar'),
  
  // Stats
  streakCount: document.getElementById('streak-days-count'),
  statStreak: document.getElementById('stat-streak'),
  statXp: document.getElementById('stat-xp'),
  statPrs: document.getElementById('stat-prs'),
  profileDisplayName: document.getElementById('profile-display-name'),
  userXpScore: document.getElementById('user-xp-score'),
  
  // Scanner View
  presetCards: document.querySelectorAll('.preset-card'),
  simulateScanBtn: document.getElementById('simulate-scan-btn'),
  cameraScanBtn: document.getElementById('camera-scan-btn'),
  scanLaser: document.getElementById('scan-laser'),
  scannerStatusVisual: document.getElementById('scanner-status-visual'),
  scanResultPanel: document.getElementById('scan-result-panel'),
  resultPreset: document.getElementById('result-preset'),
  resultSymmetry: document.getElementById('result-symmetry'),
  resultRating: document.getElementById('result-rating'),
  resultRank: document.getElementById('result-rank'),
  
  // Rewards View
  rewardRankTitle: document.getElementById('reward-rank-title'),
  rewardRankDesc: document.getElementById('reward-rank-desc'),
  rewardRankXpFill: document.getElementById('reward-rank-xp-fill'),
  rewardRankXpText: document.getElementById('reward-rank-xp-text'),
  filterPills: document.querySelectorAll('.filter-pill'),
  achievementsList: document.getElementById('achievements-list'),
  homeRankBadgeImg: document.getElementById('home-rank-badge-img'),
  largeRankBadgeImg: document.getElementById('large-rank-badge-img'),
  largeRankBadgeGlow: document.getElementById('large-rank-badge-glow'),
  leaderboardBadge1: document.getElementById('leaderboard-badge-1'),
  
  // Modals & Forms
  personalInfoModal: document.getElementById('personal-info-modal'),
  btnPersonalInfo: document.getElementById('btn-personal-info'),
  closePersonalBtn: document.getElementById('close-personal-btn'),
  inputDisplayName: document.getElementById('input-display-name'),
  btnUploadAvatar: document.getElementById('btn-upload-avatar'),
  fileAvatarInput: document.getElementById('file-avatar-input'),
  btnResetAvatar: document.getElementById('btn-reset-avatar'),
  savePersonalBtn: document.getElementById('save-personal-btn'),
  userAvatarImg: document.getElementById('user-avatar-img'),
  userAvatarSvg: document.getElementById('user-avatar-svg'),
  avatarContainer: document.getElementById('avatar-container'),
  
  // Quick Log Modal
  quickLogModal: document.getElementById('quick-log-modal'),
  fabBoxBtn: document.getElementById('fab-box-btn'),
  closeQuickBtn: document.getElementById('close-quick-btn'),
  logGymOpt: document.getElementById('log-gym-opt'),
  logStudyOpt: document.getElementById('log-study-opt'),
  logSleepOpt: document.getElementById('log-sleep-opt'),
  logWaterOpt: document.getElementById('log-water-opt'),

  // Sleep Input Modal
  sleepInputModal: document.getElementById('sleep-input-modal'),
  closeSleepBtn: document.getElementById('close-sleep-btn'),
  sleepSlider: document.getElementById('input-sleep-slider'),
  sleepSliderVal: document.getElementById('sleep-slider-val'),
  saveSleepBtn: document.getElementById('save-sleep-btn'),

  // Leaderboard full view
  homeLeaderboardCard: document.getElementById('home-leaderboard-card'),
  homeLeaderboardList: document.getElementById('home-leaderboard-list'),
  fullLeaderboardList: document.getElementById('full-leaderboard-list'),
  playerStandingCard: document.getElementById('player-standing-card'),
  leaderboardBackBtn: document.getElementById('leaderboard-back-btn'),
  
  // Preferences buttons
  btnUnits: document.getElementById('btn-units'),
  unitsValText: document.getElementById('units-val-text'),
  btnTheme: document.getElementById('btn-theme'),
  themeValText: document.getElementById('theme-val-text'),
  btnWorkoutPlan: document.getElementById('btn-workout-plan'),
  workoutPlanValText: document.getElementById('workout-plan-val-text'),
  btnSignOut: document.getElementById('btn-sign-out'),
  
  // Toasts
  toastContainer: document.getElementById('toast-container'),

  // Daily Grind Tasks Checklist
  homeTasksList: document.getElementById('home-tasks-list'),
  tasksCountText: document.getElementById('tasks-count-text'),
  inputTaskName: document.getElementById('input-task-name'),
  btnAddTask: document.getElementById('btn-add-task'),

  // Upgrade banner
  upgradeBanner: document.getElementById('upgrade-banner'),

  // Ad overlay
  adOverlay: document.getElementById('ad-overlay'),
  adTimer: document.getElementById('ad-timer'),
  adSkipBtn: document.getElementById('ad-skip-btn'),
  adCloseBtn: document.getElementById('ad-close-btn'),
  adRewardInfo: document.getElementById('ad-reward-info')
};

// INIT APPLICATION
function init() {
  const isGoogleCallback = window.location.hash && window.location.hash.includes('access_token=');
  
  if (isGoogleCallback) {
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
    const frame = document.querySelector('.onboarding-phone-frame');
    if (frame) {
      window.originalOnboardingHTML = frame.innerHTML;
      frame.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px; padding: 24px; text-align: center;">
          <div class="walking-logo-circle" style="animation: spin-slow 2s infinite linear; color: var(--accent-yellow); width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(235, 212, 91, 0.15); display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-top: 10px;">Securing Session</h2>
          <p style="font-size: 0.88rem; color: var(--color-text-secondary); max-width: 250px; line-height: 1.4;">Verifying Google credentials... Please wait.</p>
        </div>
      `;
    }
  }

  loadLocalStorage();

  // If first-time onboarding not completed, set default details
  if (!state.onboardingCompleted) {
    state.onboardingCompleted = true;
    state.grinderName = 'Athlete';
    state.avatarUrl = 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png';
    state.workoutPlan = 5;
    saveLocalStorage();
  }

  if (isGoogleCallback) {
    handleGoogleAuthCallback();
  } else {
    // Run splash loading sequence
    startSplashSequence(() => {
      initializeWorkoutSchedule();
      updateUI();
      renderTasks();
      renderWorkoutView();
      renderLeaderboards();
      setDateText();
    });
  }

  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewName = item.getAttribute('data-view');
      switchView(viewName);
    });
  });

  if (DOM.rankBadge) {
    DOM.rankBadge.addEventListener('click', () => {
      switchView('achievements');
    });
  }

  if (DOM.rewardsBackBtn) {
    DOM.rewardsBackBtn.addEventListener('click', () => {
      switchView('profile');
    });
  }

  if (DOM.gymHabit) {
    DOM.gymHabit.addEventListener('click', () => {
      if (state.gymDuration < 45 && state.gymStatus !== 'Rest Day') {
        switchView('workout');
      } else if (state.gymStatus === 'Rest Day') {
        showToast('Rest Day Active', 'No workout scheduled today. Lock in and recover! 🧘', 'success');
      } else {
        showToast('Gym Habit Completed', 'You have hit 45/45 mins today!', 'success');
      }
    });
  }

  if (DOM.studyHabit) {
    DOM.studyHabit.addEventListener('click', (e) => {
      addStudyHours(0.5, e);
    });
  }

  if (DOM.sleepHabit) {
    DOM.sleepHabit.addEventListener('click', () => {
      const currentHours = state.sleepHours === '--' ? 8.0 : parseFloat(state.sleepHours);
      if (DOM.sleepSlider) {
        DOM.sleepSlider.value = currentHours;
      }
      if (DOM.sleepSliderVal) {
        DOM.sleepSliderVal.textContent = currentHours.toFixed(1);
      }
      updateSleepPillClasses(currentHours);
      openModal(DOM.sleepInputModal);
    });
  }

  if (DOM.sleepSlider) {
    DOM.sleepSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (DOM.sleepSliderVal) {
        DOM.sleepSliderVal.textContent = val.toFixed(1);
      }
      updateSleepPillClasses(val);
    });
  }

  if (DOM.closeSleepBtn) {
    DOM.closeSleepBtn.addEventListener('click', () => closeModal(DOM.sleepInputModal));
  }
  if (DOM.saveSleepBtn) {
    DOM.saveSleepBtn.addEventListener('click', saveSleepInput);
  }

  if (DOM.homeLeaderboardCard) {
    DOM.homeLeaderboardCard.addEventListener('click', () => {
      switchView('leaderboard');
    });
  }
  if (DOM.leaderboardBackBtn) {
    DOM.leaderboardBackBtn.addEventListener('click', () => {
      switchView('home');
    });
  }

  if (DOM.waterHabit) {
    DOM.waterHabit.addEventListener('click', (e) => {
      addWater(1, e);
    });
  }

  DOM.presetCards.forEach(card => {
    card.addEventListener('click', () => {
      DOM.presetCards.forEach(c => c.classList.remove('active-preset'));
      card.classList.add('active-preset');
      state.selectedPreset = card.getAttribute('data-preset');
    });
  });

  if (DOM.simulateScanBtn) {
    DOM.simulateScanBtn.addEventListener('click', startScanSimulation);
  }
  if (DOM.cameraScanBtn) {
    DOM.cameraScanBtn.addEventListener('click', () => {
      showToast('Camera Permission Required', 'Please simulate scan instead.', 'error');
    });
  }

  if (DOM.fabBoxBtn) {
    DOM.fabBoxBtn.addEventListener('click', () => openModal(DOM.quickLogModal));
  }
  const rewardsFab = document.getElementById('rewards-fab-btn');
  if (rewardsFab) {
    rewardsFab.addEventListener('click', () => openModal(DOM.quickLogModal));
  }
  if (DOM.closeQuickBtn) {
    DOM.closeQuickBtn.addEventListener('click', () => closeModal(DOM.quickLogModal));
  }

  DOM.logGymOpt.addEventListener('click', () => { if (state.gymStatus !== 'Rest Day') { logGym(45); } else { showToast('Rest Day', 'Today is a rest day!', 'success'); } closeModal(DOM.quickLogModal); });
  DOM.logStudyOpt.addEventListener('click', () => { logStudy(1.0); closeModal(DOM.quickLogModal); });
  DOM.logSleepOpt.addEventListener('click', () => { logSleep(8.0); closeModal(DOM.quickLogModal); });
  DOM.logWaterOpt.addEventListener('click', () => { addWater(1); closeModal(DOM.quickLogModal); });

  if (DOM.btnPersonalInfo) {
    DOM.btnPersonalInfo.addEventListener('click', () => {
      DOM.inputDisplayName.value = state.grinderName;
      openModal(DOM.personalInfoModal);
    });
  }
  if (DOM.closePersonalBtn) {
    DOM.closePersonalBtn.addEventListener('click', () => closeModal(DOM.personalInfoModal));
  }
  if (DOM.savePersonalBtn) {
    DOM.savePersonalBtn.addEventListener('click', savePersonalInfo);
  }

  if (DOM.btnUploadAvatar) {
    DOM.btnUploadAvatar.addEventListener('click', () => DOM.fileAvatarInput.click());
  }
  if (DOM.fileAvatarInput) {
    DOM.fileAvatarInput.addEventListener('change', handleAvatarUpload);
  }
  if (DOM.btnResetAvatar) {
    DOM.btnResetAvatar.addEventListener('click', resetAvatar);
  }

  if (DOM.btnUnits) {
    DOM.btnUnits.addEventListener('click', toggleUnits);
  }
  if (DOM.btnTheme) {
    DOM.btnTheme.addEventListener('click', toggleTheme);
  }
  if (DOM.btnWorkoutPlan) {
    DOM.btnWorkoutPlan.addEventListener('click', toggleWorkoutPlan);
  }
  if (DOM.btnSignOut) {
    DOM.btnSignOut.addEventListener('click', signOut);
  }

  DOM.filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      DOM.filterPills.forEach(p => p.classList.remove('active-filter'));
      pill.classList.add('active-filter');
      const category = pill.getAttribute('data-filter');
      filterAchievements(category);
    });
  });

  const closeAchDetailsBtn = document.getElementById('close-ach-details-btn');
  if (closeAchDetailsBtn) {
    closeAchDetailsBtn.addEventListener('click', () => closeModal(document.getElementById('achievement-details-modal')));
  }
  const closeRanksBtn = document.getElementById('close-ranks-btn');
  if (closeRanksBtn) {
    closeRanksBtn.addEventListener('click', () => closeModal(document.getElementById('ranks-progression-modal')));
  }
  
  const largeRankImg = document.getElementById('large-rank-badge-img');
  if (largeRankImg) {
    largeRankImg.addEventListener('click', showRanksProgression);
  }
  const rankCard = document.querySelector('.rank-status-card');
  if (rankCard) {
    rankCard.addEventListener('click', showRanksProgression);
  }

  initStepsTracker();

  // Subscription modal
  const btnSubscription = document.getElementById('btn-subscription');
  if (btnSubscription) {
    btnSubscription.addEventListener('click', () => openSubscriptionModal());
  }
  const closeSubBtn = document.getElementById('close-subscription-btn');
  if (closeSubBtn) {
    closeSubBtn.addEventListener('click', () => closeModal(document.getElementById('subscription-modal')));
  }

  // Premium listeners
  const btnStreakShields = document.getElementById('btn-streak-shields');
  if (btnStreakShields) {
    btnStreakShields.addEventListener('click', () => {
      const shieldText = state.subscriptionPlan === 'elite' ? 'Unlimited' : `${state.streakShields} active`;
      showToast('Streak Shields 🛡️', `You have ${shieldText} streak shields protecting your progress.`, 'success');
    });
  }
  const btnWeeklyReport = document.getElementById('btn-weekly-report');
  if (btnWeeklyReport) {
    btnWeeklyReport.addEventListener('click', () => {
      if (state.subscriptionPlan === 'free') {
        showToast('Pro Feature', 'Upgrade to Grind Pro or Elite to unlock weekly habit reports!', 'error');
        openSubscriptionModal();
      } else {
        openWeeklyHabitReport();
      }
    });
  }
  const btnEliteCustomization = document.getElementById('btn-elite-customization');
  if (btnEliteCustomization) {
    btnEliteCustomization.addEventListener('click', () => {
      if (state.subscriptionPlan !== 'elite') {
        showToast('Elite Feature', 'Upgrade to Grind Elite to unlock custom profile settings!', 'error');
        openSubscriptionModal();
      } else {
        openModal(document.getElementById('elite-customization-modal'));
      }
    });
  }
  const btnEliteChallenges = document.getElementById('btn-elite-challenges');
  if (btnEliteChallenges) {
    btnEliteChallenges.addEventListener('click', () => {
      if (state.subscriptionPlan !== 'elite') {
        showToast('Elite Feature', 'Upgrade to Grind Elite to participate in exclusive challenges!', 'error');
        openSubscriptionModal();
      } else {
        openModal(document.getElementById('elite-challenges-modal'));
      }
    });
  }

  // Upgrade banner visibility
  updateUpgradeBanner();

  if (DOM.btnAddTask) {
    DOM.btnAddTask.addEventListener('click', addTask);
  }
  if (DOM.inputTaskName) {
    DOM.inputTaskName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTask();
      }
    });
  }

  checkNewDayRollover();
  checkRestDayXpCredit();

  // Add click listener for achievements settings gear
  const rewardsSettingsBtn = document.getElementById('rewards-settings-btn');
  if (rewardsSettingsBtn) {
    rewardsSettingsBtn.addEventListener('click', () => switchView('profile'));
  }

  // Add click listener for achievements help button
  const achHelpBtn = document.getElementById('achievements-help-btn');
  if (achHelpBtn) {
    achHelpBtn.addEventListener('click', () => {
      showToast('Achievements & Quests 💡', 'Complete habits and milestones to unlock achievements! Actions labeled "Go" will navigate to tracking sections.', 'success');
    });
  }

  // Underline alignment on resize
  window.addEventListener('resize', updateFilterUnderline);

  updateUI();
  renderTasks();
  renderWorkoutView();
  renderLeaderboards();
  
  setDateText();
}

// NAVIGATION / ROUTING SYSTEM
function switchView(viewName) {
  state.activeView = viewName;
  
  // Hide all screens
  DOM.views.forEach(view => {
    view.classList.remove('active');
  });

  // Show active screen
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update navigation items styling (highlight Profile for achievements view too)
  DOM.navItems.forEach(item => {
    const itemName = item.getAttribute('data-view');
    if (itemName === viewName || (viewName === 'achievements' && itemName === 'profile')) {
      item.classList.add('active-nav');
    } else {
      item.classList.remove('active-nav');
    }
  });

  // Apply achievements theme active class to phone-frame
  const frame = document.querySelector('.phone-frame');
  if (frame) {
    if (viewName === 'achievements') {
      frame.classList.add('achievements-theme-active');
    } else {
      frame.classList.remove('achievements-theme-active');
    }
  }

  // Show/Hide top main header
  if (viewName === 'achievements') {
    DOM.mainHeader.style.display = 'none';
    // Update moving underline indicator
    setTimeout(updateFilterUnderline, 50);
  } else {
    DOM.mainHeader.style.display = 'flex';
  }

  // Run daily checks and update UI
  updateUI();

  if (viewName === 'workout') {
    renderWorkoutView();
  }

  // Save tab view selection to storage
  saveLocalStorage();
}

// WATER TRACKER ACTIONS
function addWater(amount, event = null) {
  if (state.waterCount < 8) {
    state.waterCount = Math.min(8, state.waterCount + amount);
    state.totalWaterCount += amount;
    
    if (state.waterCount > state.maxWaterSingleDay) {
      state.maxWaterSingleDay = state.waterCount;
    }
    
    showToast('Intake Logged', `Drank ${amount} glass of water.`, 'success');
    addXP(10, event);
    
    if (state.waterCount >= 8) {
      const task = state.tasks.find(t => t.id === 'water-task');
      if (task && !task.completed) {
        task.completed = true;
        addXP(task.xp, event, true);
      }
      if (state.waterStreak === 0) state.waterStreak = 1;
    }
    
    checkAchievements();
    updateUI();
    renderTasks();
    saveLocalStorage();
  } else {
    showToast('Hydration Target Met', 'You have hit 8/8 glasses today!', 'success');
  }
}

// WORKOUT TIMERS & ACTIONS
function logGym(duration, event = null) {
  state.gymDuration = Math.min(45, state.gymDuration + duration);
  state.gymStatus = state.gymDuration >= 45 ? 'Completed' : 'In Progress';
  
  const hr = new Date().getHours();
  if (hr < 7) {
    state.workoutBefore7AMCount = (state.workoutBefore7AMCount || 0) + 1;
  } else if (hr >= 21) {
    state.workoutAfter9PMCount = (state.workoutAfter9PMCount || 0) + 1;
  }
  
  if (state.gymDuration >= 45) {
    state.workout.started = false;
    state.workout.completed = true;
    
    if (!state.gymCompletedToday) {
      state.gymCompletedToday = true;
      state.workoutCount++;
      state.strengthCount++;
      state.workoutStreak = (state.workoutStreak || 0) + 1;
      state.streak = Math.max(state.streak, state.workoutStreak);
    }
    
    const task = state.tasks.find(t => t.id === 'workout-task');
    if (task && !task.completed) {
      task.completed = true;
      addXP(task.xp, event, true);
    }
  }
  
  addXP(120, event);
  
  checkAchievements();
  showToast('Workout Logged', `Completed gym activity of ${duration} mins.`, 'success');
  updateUI();
  renderTasks();
  renderWorkoutView();
  saveLocalStorage();
  renderLeaderboards();
}

// STUDY LOG
function logStudy(hours) {
  if (state.studyHours >= 4.0) {
    showToast('Study Goal Completed', 'You have hit 4/4 hours of study today!', 'success');
    return;
  }
  
  const hr = new Date().getHours();
  if (hr < 8) {
    state.studyBefore8AMCount = (state.studyBefore8AMCount || 0) + 1;
  } else if (hr >= 0 && hr < 4) {
    state.studyPastMidnightCount = (state.studyPastMidnightCount || 0) + 1;
  }
  
  state.studyHours = Math.min(4.0, state.studyHours + hours);
  state.totalStudyHours += hours;
  state.studySessionsCount++;
  if (hours > state.maxStudySessionDuration) {
    state.maxStudySessionDuration = hours;
  }
  
  addXP(Math.round(hours * 50));
  
  if (state.studyHours >= 4.0) {
    const task = state.tasks.find(t => t.id === 'study-task');
    if (task && !task.completed) {
      task.completed = true;
      addXP(task.xp, null, true);
    }
    if (state.studyStreak === 0) state.studyStreak = 1;
  }
  
  checkAchievements();
  showToast('Study Tracked', `Logged ${hours} hour of deep study.`, 'success');
  updateUI();
  saveLocalStorage();
  renderLeaderboards();
}

// SLEEP LOG
function logSleep(hours) {
  state.sleepHours = hours;
  state.sleepLogsCount++;
  
  if (hours >= 8.0) {
    state.nightsWith8HrsSleep = (state.nightsWith8HrsSleep || 0) + 1;
    const task = state.tasks.find(t => t.id === 'sleep-task');
    if (task && !task.completed) {
      task.completed = true;
      addXP(task.xp, null, true);
    }
    if (state.sleepStreak === 0) state.sleepStreak = 1;
  }
  
  const hr = new Date().getHours();
  if (hr < 6 && hours >= 7.0) {
    state.earlyRiseSleepGoalCount = (state.earlyRiseSleepGoalCount || 0) + 1;
  }
  
  addXP(50);
  
  checkAchievements();
  showToast('Sleep Synced', `Logged ${hours} hours of restorative sleep.`, 'success');
  updateUI();
  saveLocalStorage();
  renderLeaderboards();
}

// SCANNER SIMULATION ACTION
function startScanSimulation() {
  if (state.isScanning) return;
  
  state.isScanning = true;
  state.hasScanned = false;
  
  DOM.scanResultPanel.style.display = 'none';
  DOM.scannerStatusVisual.style.display = 'flex';
  DOM.scanLaser.classList.add('scanning');
  showToast('AI Scanner Initializing', 'Positioning camera and computing grid...', 'success');
  
  setTimeout(() => {
    DOM.scanLaser.classList.remove('scanning');
    state.isScanning = false;
    state.hasScanned = true;
    DOM.scannerStatusVisual.style.display = 'none';
    DOM.scanResultPanel.style.display = 'flex';
    displayScanResult();
    addXP(150);
    showToast('Scan Completed', 'Your physique ratings have been generated.', 'success');
  }, 2500);
}

function displayScanResult() {
  const preset = state.selectedPreset;
  let name = '';
  let symmetry = '';
  let rating = '';
  let rank = '';
  
  switch(preset) {
    case 'shredded':
      name = 'Shredded Aesthetic';
      symmetry = (92.5 + Math.random() * 4).toFixed(1) + '%';
      rating = 'A+ Godlike';
      rank = 'Top ' + (0.5 + Math.random() * 1).toFixed(2) + '%';
      break;
    case 'bulk':
      name = 'Titan Bulk';
      symmetry = (85.2 + Math.random() * 5).toFixed(1) + '%';
      rating = 'A bulked';
      rank = 'Top ' + (3.0 + Math.random() * 2).toFixed(2) + '%';
      break;
    case 'lean':
      name = 'Lean Athletic';
      symmetry = (90.0 + Math.random() * 4).toFixed(1) + '%';
      rating = 'A- Lean';
      rank = 'Top ' + (2.0 + Math.random() * 1).toFixed(2) + '%';
      break;
    case 'beginner':
      name = 'Gym Beginner';
      symmetry = (74.0 + Math.random() * 8).toFixed(1) + '%';
      rating = 'B- Base level';
      rank = 'Top ' + (15 + Math.random() * 10).toFixed(1) + '%';
      break;
  }
  
  DOM.resultPreset.textContent = name;
  DOM.resultSymmetry.textContent = symmetry;
  DOM.resultRating.textContent = rating;
  DOM.resultRank.textContent = rank;
}

// 54 ACHIEVEMENTS CENTRAL CHECK & UNLOCK SYSTEM
function checkAchievements() {
  let unlockedCount = 0;
  
  // Calculate current unlocked count first
  ACHIEVEMENT_DEFINITIONS.forEach(def => {
    const ach = state.achievements[def.id];
    if (ach && ach.unlocked) {
      unlockedCount++;
    }
  });

  ACHIEVEMENT_DEFINITIONS.forEach(def => {
    const ach = state.achievements[def.id];
    if (!ach) return;
    
    let val = 0;
    switch(def.id) {
      case 1: val = state.workoutCount; break;
      case 2: val = state.workoutStreak; break;
      case 3: val = state.workoutStreak; break;
      case 4: val = state.workoutStreak >= 7 ? 7 : 0; break;
      case 5: val = state.workoutCount; break;
      case 6: val = state.cardioCount; break;
      case 7: val = state.strengthCount; break;
      case 8: val = state.workoutCount; break;
      case 9: val = state.workoutBefore7AMCount || 0; break;
      case 10: val = state.workoutAfter9PMCount || 0; break;
      case 11: val = state.workoutCount; break;
      case 12: val = state.workoutCount; break;

      case 13: val = state.studySessionsCount; break;
      case 14: val = state.studyStreak; break;
      case 15: val = state.maxStudySessionDuration || 0; break;
      case 16: val = Math.floor(state.totalStudyHours); break;
      case 17: val = state.studyStreak; break;
      case 18: val = state.studySessionsCount; break;
      case 19: val = Math.floor(state.totalStudyHours); break;
      case 20: val = state.studyStreak; break;
      case 21: val = Math.floor(state.totalStudyHours); break;
      case 22: val = state.studyBefore8AMCount || 0; break;
      case 23: val = state.studyPastMidnightCount || 0; break;
      case 24: val = state.studyStreak >= 14 ? 14 : 0; break;

      case 25: val = state.sleepLogsCount; break;
      case 26: val = state.sleepStreak; break;
      case 27: val = state.nightsWith8HrsSleep || 0; break;
      case 28: val = state.sleepStreak; break;
      case 29: val = state.sleepStreak; break;
      case 30: val = state.earlyRiseSleepGoalCount || 0; break;
      case 31: val = state.sleepStreak >= 7 ? 7 : 0; break;
      case 32: val = state.sleepStreak; break;
      case 33: val = state.sleepStreak; break;
      case 34: val = state.sleepLogsCount; break;

      case 35: val = state.totalWaterCount; break;
      case 36: val = state.waterStreak >= 1 ? 1 : 0; break;
      case 37: val = state.waterStreak; break;
      case 38: val = state.waterStreak; break;
      case 39: val = state.maxWaterSingleDay >= 12 ? 1 : 0; break;
      case 40: val = state.waterStreak; break;
      case 41: val = state.waterStreak >= 14 ? 14 : 0; break;
      case 42: val = state.waterStreak; break;
      case 43: val = state.morningHydrationCount || 0; break;
      case 44: val = state.consistentWaterDays || 0; break;

      case 45: val = state.perfectDaysCount || 0; break;
      case 46: val = state.perfectDaysStreak >= 7 ? 7 : 0; break;
      case 47: val = state.perfectDaysStreak >= 30 ? 30 : 0; break;
      case 48: val = state.daysUsedCount || 1; break;
      case 49: val = state.workoutAndStudySameDayCount || 0; break;
      case 50: val = state.morningRoutineCompletedCount || 0; break;
      case 51: val = state.perfectDaysStreak >= 60 ? 60 : 0; break;
      case 52: val = state.totalXP; break;
      case 53: val = state.totalXP; break;
      case 54: val = unlockedCount; break;
    }
    
    ach.current = Math.min(ach.target, val);
    
    if (ach.current >= ach.target && !ach.unlocked) {
      ach.unlocked = true;
      addXP(ach.xp, null, true);
      showToast('Achievement Unlocked!', `${def.name.toUpperCase()} (+${ach.xp} XP)`, 'achievement');
    }
  });

  // Re-run for the final check of "Grind legend" (id 54) which depends on unlockedCount
  let finalUnlockedCount = 0;
  ACHIEVEMENT_DEFINITIONS.forEach(def => {
    if (state.achievements[def.id] && state.achievements[def.id].unlocked) {
      finalUnlockedCount++;
    }
  });

  const grindLegend = state.achievements[54];
  if (grindLegend && !grindLegend.unlocked) {
    grindLegend.current = Math.min(grindLegend.target, finalUnlockedCount);
    if (grindLegend.current >= grindLegend.target) {
      grindLegend.unlocked = true;
      addXP(grindLegend.xp, null, true);
      showToast('Achievement Unlocked!', `GRIND LEGEND (+${grindLegend.xp} XP)`, 'achievement');
    }
  }
}

function triggerAchievementAction(id) {
  const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === id);
  if (!def) return;
  
  const ach = state.achievements[id];
  if (ach && ach.unlocked) return;
  
  switch (def.category) {
    case 'workout':
      switchView('workout');
      break;
    case 'study':
      switchView('home');
      setTimeout(() => {
        const el = DOM.studyHabit;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      break;
    case 'sleep':
      switchView('home');
      setTimeout(() => {
        const el = DOM.sleepHabit;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      break;
    case 'water':
      switchView('home');
      setTimeout(() => {
        const el = DOM.waterHabit;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      break;
    default:
      switchView('home');
  }
}

function filterAchievements(category) {
  renderAchievements(category);
  setTimeout(updateFilterUnderline, 20);
}

function updateFilterUnderline() {
  const activePill = document.querySelector('.filter-pill.active-filter');
  const underline = document.getElementById('filter-underline');
  if (!activePill || !underline) return;
  
  const left = activePill.offsetLeft;
  const width = activePill.offsetWidth;
  
  underline.style.left = `${left}px`;
  underline.style.width = `${width}px`;
}

// DYNAMIC ACHIEVEMENTS HTML RENDERING
function renderAchievements(filter = 'all') {
  if (!DOM.achievementsList) return;
  
  let html = '';
  ACHIEVEMENT_DEFINITIONS.forEach(def => {
    if (filter !== 'all' && def.category !== filter) return;
    
    const ach = state.achievements[def.id];
    if (!ach) return;
    
    const isUnlocked = ach.unlocked;
    const isActionable = ['workout', 'study', 'sleep', 'water'].includes(def.category);
    const showGoButton = !isUnlocked && isActionable;
    
    html += `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}" data-category="${def.category}" onclick="showAchievementDetails(${def.id})">
        <div class="achievement-icon-wrapper">
          <div class="ach-icon-circle-new ${isUnlocked ? 'unlocked' : 'locked'}">
            <img src="${def.img}" alt="${def.name}" class="achievement-icon-img" />
            <div class="status-overlay">
              ${isUnlocked ? `
                <svg class="status-icon medal-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ` : `
                <svg class="status-icon lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              `}
            </div>
          </div>
          <span class="badge-xp-text-new">+${def.xp} XP</span>
        </div>
        <div class="achievement-details">
          <h3 class="ach-title-new">${isUnlocked ? '' : '🔒 '}${def.name}</h3>
          <p class="ach-desc-new">${def.description}</p>
          ${def.target > 1 ? `
            <div class="ach-progress-sub-new">
              <span class="ach-prog-val-new">${ach.current} / ${def.target}</span> complete
            </div>
          ` : ''}
        </div>
        ${showGoButton ? `
          <button class="ach-go-btn-new" data-ach-id="${def.id}" onclick="event.stopPropagation(); triggerAchievementAction(${def.id});">
            Go
          </button>
        ` : ''}
      </div>
    `;
  });
  
  DOM.achievementsList.innerHTML = html;
}

// POPUP ACHIEVEMENT DETAIL MODAL
function showAchievementDetails(id) {
  const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === id);
  const ach = state.achievements[id];
  if (!def || !ach) return;
  
  const modal = document.getElementById('achievement-details-modal');
  const modalImg = document.getElementById('ach-modal-img');
  const modalXp = document.getElementById('ach-modal-xp');
  const modalTitle = document.getElementById('ach-modal-title');
  const modalCat = document.getElementById('ach-modal-category');
  const modalDesc = document.getElementById('ach-modal-desc');
  const modalProgressText = document.getElementById('ach-modal-progress-text');
  const modalProgressFill = document.getElementById('ach-modal-progress-fill');
  const modalActionBtn = document.getElementById('ach-modal-action-btn');
  
  if (!modal) return;
  
  modalImg.src = def.img;
  if (ach.unlocked) {
    modalImg.style.filter = 'none';
  } else {
    modalImg.style.filter = 'grayscale(100%) brightness(0.4) opacity(0.5)';
  }
  
  modalXp.textContent = `+${def.xp} XP`;
  modalTitle.textContent = def.name;
  modalCat.textContent = def.category.toUpperCase();
  modalDesc.textContent = def.description;
  modalProgressText.textContent = `${ach.current} / ${def.target}`;
  
  const percent = Math.min(100, (ach.current / def.target) * 100);
  modalProgressFill.style.width = `${percent}%`;
  
  if (ach.unlocked) {
    modalActionBtn.textContent = 'Completed & Claimed! 🏆';
    modalActionBtn.className = 'btn outline-btn w-full';
    modalActionBtn.style.color = 'var(--accent-green)';
    modalActionBtn.style.borderColor = 'rgba(0, 230, 118, 0.2)';
    modalActionBtn.onclick = null;
  } else {
    modalActionBtn.textContent = 'Go Track Activity 🔥';
    modalActionBtn.className = 'btn filled-btn w-full';
    modalActionBtn.style.color = '';
    modalActionBtn.style.borderColor = '';
    modalActionBtn.onclick = () => {
      closeModal(modal);
      triggerAchievementAction(id);
    };
  }
  
  openModal(modal);
}

// POPUP RANKS PROGRESSION MODAL
const RANKS_DEFINITIONS = [
  { name: 'BRONZE 1 GRINDER', minXp: 0, maxXp: 2999, badge: 'badges/bronze.png', desc: 'Rookie Grinder. Just starting the journey.' },
  { name: 'SILVER GRINDER', minXp: 3000, maxXp: 7999, badge: 'badges/silver.png', desc: 'Dedicated Grinder. Finding the groove.' },
  { name: 'GOLD GRINDER', minXp: 8000, maxXp: 15999, badge: 'badges/gold.png', desc: 'Advanced Grinder. Showing real strength and discipline.' },
  { name: 'DIAMOND GRINDER', minXp: 16000, maxXp: 29999, badge: 'badges/dimond.png', desc: 'Elite athlete. Exemplary consistency and mindset.' },
  { name: 'MASTER GRINDER', minXp: 30000, maxXp: 49999, badge: 'badges/master.png', desc: 'Master of consistency. Dominating the leaderboard.' },
  { name: 'SUPREME GRINDER', minXp: 50000, maxXp: 99999, badge: 'badges/supreme.png', desc: 'Absolute powerhouse. Nearing peak performance.' },
  { name: 'ULTRA SUPREME GRINDER', minXp: 100000, maxXp: Infinity, badge: 'badges/ultrasupreme.png', desc: 'Godlike status. Reach 100,000 XP to unlock. The ultimate physical specimen.' }
];

function showRanksProgression() {
  const modal = document.getElementById('ranks-progression-modal');
  const container = document.getElementById('ranks-progression-list');
  if (!modal || !container) return;
  
  let html = '';
  RANKS_DEFINITIONS.forEach(rank => {
    const isCurrent = state.totalXP >= rank.minXp && state.totalXP <= rank.maxXp;
    
    html += `
      <div class="rank-progress-item ${isCurrent ? 'active-rank' : ''}">
        <img src="${rank.badge}" alt="${rank.name}" class="rank-progress-badge" />
        <div class="rank-progress-info">
          <span class="rank-progress-name">${rank.name} ${isCurrent ? '(Your Rank)' : ''}</span>
          <span class="rank-progress-desc">${rank.desc}</span>
        </div>
        <span class="rank-progress-xp-req">
          ${rank.maxXp === Infinity ? `${rank.minXp.toLocaleString()}+ XP` : `${rank.minXp.toLocaleString()} XP`}
        </span>
      </div>
    `;
  });
  
  container.innerHTML = html;
  openModal(modal);
}

// ROLLOVER & REST DAY MANAGEMENT
function checkNewDayRollover() {
  const todayStr = new Date().toDateString();
  if (state.lastDayCheckedDate && state.lastDayCheckedDate !== todayStr) {
    let shieldUsed = false;
    const missedAny = (state.waterCount < 8 || state.studyHours < 4.0 || state.sleepHours === '--' || parseFloat(state.sleepHours) < 8.0 || !state.gymCompletedToday);
    
    if (missedAny) {
      if (state.subscriptionPlan === 'elite') {
        shieldUsed = true;
      } else if (state.subscriptionPlan === 'pro' && state.streakShields > 0) {
        state.streakShields--;
        shieldUsed = true;
      }
    }
    
    if (shieldUsed) {
      showToast('Streak Shield Activated 🛡️', 'Your missed day was forgiven! Streaks preserved.', 'achievement');
      // Retain streaks, increment those that were met, keep others same
      state.waterStreak = state.waterCount >= 8 ? state.waterStreak + 1 : state.waterStreak;
      state.studyStreak = state.studyHours >= 4.0 ? state.studyStreak + 1 : state.studyStreak;
      state.sleepStreak = (state.sleepHours !== '--' && parseFloat(state.sleepHours) >= 8.0) ? state.sleepStreak + 1 : state.sleepStreak;
      state.workoutStreak = state.gymCompletedToday ? state.workoutStreak + 1 : state.workoutStreak;
    } else {
      // Standard reset logic
      if (state.waterCount >= 8) state.waterStreak++; else state.waterStreak = 0;
      if (state.studyHours >= 4.0) state.studyStreak++; else state.studyStreak = 0;
      if (state.sleepHours !== '--' && parseFloat(state.sleepHours) >= 8.0) state.sleepStreak++; else state.sleepStreak = 0;
      if (state.gymCompletedToday) state.workoutStreak++; else state.workoutStreak = 0;
      state.perfectDaysStreak = 0;
    }

    if (state.waterCount >= 8 && state.studyHours >= 4.0 && state.sleepHours !== '--' && parseFloat(state.sleepHours) >= 8.0 && state.gymCompletedToday) {
      state.perfectDaysCount = (state.perfectDaysCount || 0) + 1;
      state.perfectDaysStreak = (state.perfectDaysStreak || 0) + 1;
    }

    // Update consistent water days
    if (state.waterCount >= 6) {
      state.consistentWaterDays = (state.consistentWaterDays || 0) + 1;
    } else {
      state.consistentWaterDays = 0;
    }
    
    state.waterCount = 0;
    state.gymDuration = 0;
    state.gymStatus = 'Not started';
    state.gymCompletedToday = false;
    state.studyHours = 0.0;
    state.sleepHours = '--';
    
    state.adWatchedToday = false; // Reset daily ad watched flag
    
    state.tasks.forEach(t => {
      if (t.isDefault) t.completed = false;
    });

    state.daysUsedCount = (state.daysUsedCount || 1) + 1;

    // Reset daily workout so it regenerates for the new day
    state.workout = null;
  }
  
  state.lastDayCheckedDate = todayStr;
}

function checkRestDayXpCredit() {
  const todayStr = new Date().toDateString();
  const plan = state.workoutPlan || 5;
  const dayOfWeek = new Date().getDay();
  const routine = WORKOUT_ROUTINES[plan][dayOfWeek];
  
  const isRestDay = !routine.exercises || routine.exercises.length === 0;
  
  if (isRestDay) {
    state.gymDuration = 45;
    state.gymStatus = 'Rest Day';
    state.gymCompletedToday = true;
    
    const task = state.tasks.find(t => t.id === 'workout-task');
    if (task && !task.completed) {
      task.completed = true;
    }
    
    if (state.lastRestDayXpCreditedDate !== todayStr) {
      state.lastRestDayXpCreditedDate = todayStr;
      addXP(150, null, true);
      showToast('Rest Day Active', 'Today is a rest day! +150 XP credited.', 'success');
    }
  }
}

function getRankTierName(xp) {
  if (xp < 3000) return 'BRONZE 1 GRINDER';
  if (xp < 8000) return 'SILVER GRINDER';
  if (xp < 16000) return 'GOLD GRINDER';
  if (xp < 30000) return 'DIAMOND GRINDER';
  if (xp < 50000) return 'MASTER GRINDER';
  if (xp < 100000) return 'SUPREME GRINDER';
  return 'ULTRA SUPREME GRINDER';
}

// LEVEL & RANK ACCUMULATION SYSTEM
function addXP(amount, event = null, isAchievement = false) {
  updateExpBoostState(); // ensure boost multiplier is current
  const adjustedAmount = amount > 0 ? Math.round(amount * state.expBoostMultiplier) : amount;
  
  const oldRank = getRankTierName(state.totalXP);
  state.totalXP += adjustedAmount;
  const newRank = getRankTierName(state.totalXP);
  const leveledUp = (oldRank !== newRank);
  
  // Track task completions for ad trigger
  if (isAchievement || amount >= 50) {
    state.taskCompletionsSinceLastAd++;
  }
  
  // Spawn floating XP text popup
  const frame = document.querySelector('.phone-frame');
  const container = document.getElementById('xp-popups-container');
  if (frame && container) {
    let x = frame.clientWidth / 2;
    let y = frame.clientHeight / 2 - 50; // default center-ish
    
    if (event && event.clientX && event.clientY) {
      const rect = frame.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }
    
    const popup = document.createElement('div');
    popup.className = `xp-popup ${isAchievement ? 'achievement-xp' : ''}`;
    popup.innerHTML = `+${adjustedAmount} XP${state.expBoostMultiplier > 1 ? ' (' + state.expBoostMultiplier + 'x)' : ''}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    container.appendChild(popup);
    
    setTimeout(() => {
      popup.remove();
    }, 1200);
  }
  
  // Check compound daily achievements
  checkDailyCompoundAchievements();

  // Display level achievements or toasts if rank boundaries are crossed
  updateRankProgress();
  updateUI();
  
  // Trigger ads at breakpoints (after task or on level up)
  if (amount > 0) {
    triggerAdAtBreakpoint(leveledUp);
  }
}

function updateRankProgress() {
  const xp = state.totalXP;
  let tierTitle = 'BRONZE 1 GRINDER';
  let nextRankName = 'Silver';
  let tierXpTarget = 3000;
  let progressXp = xp;
  let percent = 0;
  let badgeSrc = 'badges/bronze.png';
  let desc = 'Rookie Grinder. Just starting the journey.';

  if (xp < 3000) {
    tierTitle = 'BRONZE 1 GRINDER';
    nextRankName = 'Silver';
    tierXpTarget = 3000;
    progressXp = xp;
    badgeSrc = 'badges/bronze.png';
    desc = 'Rookie Grinder. Just starting the journey.';
  } else if (xp >= 3000 && xp < 8000) {
    tierTitle = 'SILVER GRINDER';
    nextRankName = 'Gold';
    tierXpTarget = 8000;
    progressXp = xp;
    badgeSrc = 'badges/silver.png';
    desc = 'Dedicated Grinder. Finding the groove.';
  } else if (xp >= 8000 && xp < 16000) {
    tierTitle = 'GOLD GRINDER';
    nextRankName = 'Diamond';
    tierXpTarget = 16000;
    progressXp = xp;
    badgeSrc = 'badges/gold.png';
    desc = 'Advanced Grinder. Showing real strength and discipline.';
  } else if (xp >= 16000 && xp < 30000) {
    tierTitle = 'DIAMOND GRINDER';
    nextRankName = 'Master';
    tierXpTarget = 30000;
    progressXp = xp;
    badgeSrc = 'badges/dimond.png';
    desc = 'Elite athlete. Exemplary consistency and mindset.';
  } else if (xp >= 30000 && xp < 50000) {
    tierTitle = 'MASTER GRINDER';
    nextRankName = 'Supreme';
    tierXpTarget = 50000;
    progressXp = xp;
    badgeSrc = 'badges/master.png';
    desc = 'Master of consistency. Dominating the leaderboard.';
  } else if (xp >= 50000 && xp < 100000) {
    tierTitle = 'SUPREME GRINDER';
    nextRankName = 'Ultra Supreme';
    tierXpTarget = 100000;
    progressXp = xp;
    badgeSrc = 'badges/supreme.png';
    desc = 'Absolute powerhouse. Nearing peak performance.';
  } else {
    tierTitle = 'ULTRA SUPREME GRINDER';
    nextRankName = 'Max';
    tierXpTarget = 100000;
    progressXp = xp;
    badgeSrc = 'badges/ultrasupreme.png';
    desc = 'Godlike status. Reach 100,000 XP to unlock. The ultimate physical specimen.';
  }

  percent = Math.min(100, (progressXp / tierXpTarget) * 100);

  // Update UI values
  if (DOM.rewardRankTitle) DOM.rewardRankTitle.textContent = tierTitle;
  if (DOM.rewardRankDesc) DOM.rewardRankDesc.textContent = desc;
  if (DOM.rewardRankXpFill) DOM.rewardRankXpFill.style.width = `${percent}%`;
  
  if (DOM.rewardRankXpText) {
    if (nextRankName === 'Max') {
      DOM.rewardRankXpText.textContent = `${xp.toLocaleString()} XP Maxed Out!`;
    } else {
      DOM.rewardRankXpText.textContent = `${progressXp.toLocaleString()} / ${tierXpTarget.toLocaleString()} XP to next rank`;
    }
  }

  const nextRankLabel = document.querySelector('.next-rank-name');
  if (nextRankLabel) {
    nextRankLabel.textContent = nextRankName;
  }

  // Update badge images
  if (DOM.homeRankBadgeImg) DOM.homeRankBadgeImg.src = badgeSrc;
  if (DOM.largeRankBadgeImg) DOM.largeRankBadgeImg.src = badgeSrc;

  // Update badge glow dynamically
  if (DOM.largeRankBadgeGlow) {
    let glowGradient = 'radial-gradient(circle, rgba(217, 119, 6, 0.45) 0%, rgba(217, 119, 6, 0) 70%)';
    if (xp < 1500) {
      glowGradient = 'radial-gradient(circle, rgba(217, 119, 6, 0.45) 0%, rgba(217, 119, 6, 0) 70%)';
    } else if (xp >= 1500 && xp < 4000) {
      glowGradient = 'radial-gradient(circle, rgba(156, 163, 175, 0.45) 0%, rgba(156, 163, 175, 0) 70%)';
    } else if (xp >= 4000 && xp < 8000) {
      glowGradient = 'radial-gradient(circle, rgba(234, 179, 8, 0.45) 0%, rgba(234, 179, 8, 0) 70%)';
    } else if (xp >= 8000 && xp < 15000) {
      glowGradient = 'radial-gradient(circle, rgba(6, 182, 212, 0.45) 0%, rgba(6, 182, 212, 0) 70%)';
    } else if (xp >= 15000 && xp < 25000) {
      glowGradient = 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(139, 92, 246, 0) 70%)';
    } else if (xp >= 25000 && xp < 50000) {
      glowGradient = 'radial-gradient(circle, rgba(236, 72, 153, 0.45) 0%, rgba(236, 72, 153, 0) 70%)';
    } else {
      glowGradient = 'radial-gradient(circle, rgba(244, 63, 94, 0.5) 0%, rgba(244, 63, 94, 0) 70%)';
    }
    DOM.largeRankBadgeGlow.style.background = glowGradient;
  }

  // Update David Laid's leaderboard badge dynamically
  const davidLaidXp = 5200 + state.totalXP;
  let davidLaidBadge = 'badges/gold.png';
  if (davidLaidXp < 1500) {
    davidLaidBadge = 'badges/bronze.png';
  } else if (davidLaidXp >= 1500 && davidLaidXp < 4000) {
    davidLaidBadge = 'badges/silver.png';
  } else if (davidLaidXp >= 4000 && davidLaidXp < 8000) {
    davidLaidBadge = 'badges/gold.png';
  } else if (davidLaidXp >= 8000 && davidLaidXp < 15000) {
    davidLaidBadge = 'badges/dimond.png';
  } else if (davidLaidXp >= 15000 && davidLaidXp < 25000) {
    davidLaidBadge = 'badges/master.png';
  } else if (davidLaidXp >= 25000 && davidLaidXp < 50000) {
    davidLaidBadge = 'badges/supreme.png';
  } else {
    davidLaidBadge = 'badges/ultrasupreme.png';
  }
  if (DOM.leaderboardBadge1) DOM.leaderboardBadge1.src = davidLaidBadge;
}

// PROFILE PERSONAL INFORMATION SAVE
function savePersonalInfo() {
  const newName = DOM.inputDisplayName.value.trim();
  if (newName !== '') {
    state.grinderName = newName;
    showToast('Profile Saved', 'Grinder name updated successfully.', 'success');
    closeModal(DOM.personalInfoModal);
    updateUI();
    saveLocalStorage();
    renderLeaderboards();
  }
}

// AVATAR FILE HANDLER
function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    state.avatarUrl = e.target.result;
    
    DOM.userAvatarImg.src = state.avatarUrl;
    DOM.userAvatarImg.style.display = 'block';
    DOM.userAvatarSvg.style.display = 'none';
    
    showToast('Avatar Uploaded', 'Custom profile picture updated.', 'success');
    saveLocalStorage();
  };
  reader.readAsDataURL(file);
}

function resetAvatar() {
  state.avatarUrl = '';
  DOM.userAvatarImg.style.display = 'none';
  DOM.userAvatarSvg.style.display = 'block';
  DOM.fileAvatarInput.value = '';
  showToast('Avatar Reset', 'Profile picture reset to default.', 'success');
  saveLocalStorage();
}

// PREFERENCES ACCORDIONS toggles
function toggleUnits() {
  if (state.units === 'Metric (kg, km)') {
    state.units = 'Imperial (lb, mi)';
  } else {
    state.units = 'Metric (kg, km)';
  }
  DOM.unitsValText.textContent = state.units;
  showToast('Units Changed', `Measurement updated to ${state.units}.`, 'success');
  saveLocalStorage();
}

function toggleTheme() {
  if (state.theme === 'Deep Black') {
    state.theme = 'Light Mode';
    document.body.style.setProperty('--bg-app', '#f4f5f6');
    document.body.style.setProperty('--bg-card', '#ffffff');
    document.body.style.setProperty('--border-color', '#e2e8f0');
    document.body.style.setProperty('--color-text-primary', '#0b0c0e');
    document.body.style.setProperty('--color-text-secondary', '#64748b');
    DOM.themeValText.textContent = 'Light Mode';
  } else {
    state.theme = 'Deep Black';
    document.body.style.setProperty('--bg-app', '#0b0c0e');
    document.body.style.setProperty('--bg-card', '#16181c');
    document.body.style.setProperty('--border-color', '#24272c');
    document.body.style.setProperty('--color-text-primary', '#ffffff');
    document.body.style.setProperty('--color-text-secondary', '#8c8f96');
    DOM.themeValText.textContent = 'Deep Black';
  }
  showToast('Theme Updated', `Style theme changed to ${state.theme}.`, 'success');
  saveLocalStorage();
}

function signOut() {
  const token = localStorage.getItem('grind_auth_token');
  const confirmMsg = token 
    ? "Are you sure you want to sign out? Your progress is securely saved on your account."
    : "Are you sure you want to sign out? This will reset all your stats and progress because you are not signed in.";

  if (confirm(confirmMsg)) {
    // Perform final sync immediately before clearing auth credentials
    if (token) {
      syncStateWithBackend(true);
    }

    // Clear auth credentials
    localStorage.removeItem('grind_auth_token');
    localStorage.removeItem('grind_user_role');
    
    // Hide admin control panel
    const adminBtn = document.getElementById('btn-admin-dashboard');
    if (adminBtn) adminBtn.style.display = 'none';

    // Clear localStorage
    localStorage.removeItem('grind_app_state');
    
    // Reset state to defaults
    state.activeView = 'home';
    state.streak = 0;
    state.totalXP = 0;
    state.waterCount = 0;
    state.gymDuration = 0;
    state.studyHours = 0.0;
    state.sleepHours = '--';
    
    state.stepsCount = 0;
    state.isSyncActive = false;
    
    state.onboardingStep = 1;
    state.onboardingCompleted = false;
    state.gender = 'male';
    state.workoutPlan = 5;
    state.avatarIndex = 0;
    
    state.workout = {
      started: false,
      completed: false,
      exercises: []
    };
    
    state.selectedPreset = 'shredded';
    state.isScanning = false;
    state.hasScanned = false;
    
    state.grinderName = 'Athlete';
    state.avatarUrl = '';
    state.units = 'Metric (kg, km)';
    state.theme = 'Deep Black';
    
    state.gymCompletedToday = false;
    state.lastRestDayXpCreditedDate = '';
    state.lastDayCheckedDate = '';
    
    state.subscriptionPlan = 'free';
    state.selectedPlan = 'pro';
    state.billingCycle = 'monthly';
    state.adWatchedToday = false;
    state.expBoostActive = false;
    state.expBoostMultiplier = 1;
    state.adCooldownTimestamp = 0;
    state.taskCompletionsSinceLastAd = 0;
    
    state.isUserSignedIn = false;
    state.streakShields = 0;
    state.eliteColor = '#ffffff';
    state.eliteTitle = 'GRINDER';
    state.eliteFrame = 'none';
    state.lastWorkoutStudySameDayDate = '';
    state.lastMorningRoutineDate = '';
    
    // Reset stats for 54 Achievements
    state.workoutCount = 0;
    state.workoutStreak = 0;
    state.cardioCount = 0;
    state.strengthCount = 0;
    state.totalStudyHours = 0.0;
    state.studySessionsCount = 0;
    state.studyStreak = 0;
    state.maxStudySessionDuration = 0;
    state.sleepLogsCount = 0;
    state.sleepStreak = 0;
    state.nightsWith8HrsSleep = 0;
    state.earlyRiseSleepGoalCount = 0;
    state.totalWaterCount = 0;
    state.waterStreak = 0;
    state.maxWaterSingleDay = 0;
    state.morningHydrationCount = 0;
    state.consistentWaterDays = 0;
    state.perfectDaysCount = 0;
    state.perfectDaysStreak = 0;
    state.workoutAndStudySameDayCount = 0;
    state.morningRoutineCompletedCount = 0;
    state.workoutBefore7AMCount = 0;
    state.workoutAfter9PMCount = 0;
    state.studyBefore8AMCount = 0;
    state.studyPastMidnightCount = 0;
    state.daysUsedCount = 1;
    
    // Reset achievements
    state.unlockedAchievements = new Set();
    state.achievements = {};
    ACHIEVEMENT_DEFINITIONS.forEach(def => {
      state.achievements[def.id] = { current: 0, target: def.target, xp: def.xp, unlocked: false, category: def.category };
    });
    
    // Reset default tasks
    state.tasks = [
      { id: 'workout-task', text: "Complete Today's Workout Routine", xp: 150, completed: false, isDefault: true },
      { id: 'water-task', text: "Drink 8/8 Glasses of Water", xp: 50, completed: false, isDefault: true },
      { id: 'study-task', text: "Log 4.0 Hours of Studies", xp: 100, completed: false, isDefault: true },
      { id: 'sleep-task', text: "Log 8.0 Hours of Sleep", xp: 80, completed: false, isDefault: true }
    ];
    
    // Apply theme
    document.body.style.setProperty('--bg-app', '#0b0c0e');
    document.body.style.setProperty('--bg-card', '#16181c');
    document.body.style.setProperty('--border-color', '#24272c');
    document.body.style.setProperty('--color-text-primary', '#ffffff');
    document.body.style.setProperty('--color-text-secondary', '#8c8f96');
    if (DOM.themeValText) DOM.themeValText.textContent = 'Deep Black';
    
    state.onboardingCompleted = true;
    state.grinderName = 'Athlete';
    state.avatarUrl = 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png';
    state.workoutPlan = 5;

    // Show onboarding overlay (splash screen) and reset fill
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      const fill = document.getElementById('splash-loading-fill');
      if (fill) fill.style.width = '0%';
    }
    
    // Remove fade-in from app container
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.remove('fade-in-app');
    }
    
    // Return to home tab internally
    switchView('home');
    
    // Commit the reset state to local storage
    saveLocalStorage();
    
    // Run splash loading sequence
    startSplashSequence(() => {
      // Update dashboard UI
      updateUI();
      renderTasks();
      renderWorkoutView();
      renderLeaderboards();
      showToast('Signed Out', 'Your session has been reset.', 'success');
    });
  }
}

// UI RENDERING SYNCHRONIZATION
function updateUI() {
  // Check rest day and rollover states
  checkNewDayRollover();
  checkRestDayXpCredit();
  initializeWorkoutSchedule();

  // Water UI
  if (DOM.waterCount) DOM.waterCount.textContent = state.waterCount;
  if (DOM.waterProgressBar) {
    DOM.waterProgressBar.style.width = `${(state.waterCount / 8) * 100}%`;
  }
  
  // Gym UI
  if (DOM.gymDuration) DOM.gymDuration.textContent = state.gymDuration === 45 && state.gymStatus === 'Rest Day' ? 'Rest' : state.gymDuration;
  if (DOM.gymProgressBar) {
    DOM.gymProgressBar.style.width = `${(state.gymDuration / 45) * 100}%`;
  }
  if (DOM.gymStatus) DOM.gymStatus.textContent = state.gymStatus;
  
  // Studies UI
  if (DOM.studyHours) DOM.studyHours.textContent = state.studyHours.toFixed(1);
  if (DOM.studyProgressBar) {
    DOM.studyProgressBar.style.width = `${(state.studyHours / 4) * 100}%`;
  }

  // Sleep UI
  if (DOM.sleepHours) DOM.sleepHours.textContent = state.sleepHours;
  if (DOM.sleepProgressBar) {
    const sleepPercent = state.sleepHours === '--' ? 0 : (parseFloat(state.sleepHours) / 8) * 100;
    DOM.sleepProgressBar.style.width = `${Math.min(100, sleepPercent)}%`;
  }

  // Steps UI
  updateStepsUI();

  // Stats UI
  if (DOM.streakCount) DOM.streakCount.textContent = state.streak;
  if (DOM.statStreak) DOM.statStreak.textContent = state.streak;
  if (DOM.statXp) DOM.statXp.textContent = state.totalXP.toLocaleString();
  if (DOM.profileDisplayName) DOM.profileDisplayName.textContent = state.grinderName;
  if (DOM.userXpScore) DOM.userXpScore.textContent = state.totalXP.toLocaleString();

  // Workout Plan UI Sync
  if (DOM.workoutPlanValText) {
    DOM.workoutPlanValText.textContent = state.workoutPlan === 5 ? '5 Days / Week' : '6 Days / Week';
  }

  // Render Achievements dynamically
  const activeFilterBtn = document.querySelector('.filter-pill.active-filter');
  const activeCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
  renderAchievements(activeCategory);

  // Avatar Image Sync
  if (state.avatarUrl) {
    DOM.userAvatarImg.src = state.avatarUrl;
    DOM.userAvatarImg.style.display = 'block';
    DOM.userAvatarSvg.style.display = 'none';
  } else {
    DOM.userAvatarImg.style.display = 'none';
    DOM.userAvatarSvg.style.display = 'block';
  }
  
  // Sign In Header button visibility
  const signInBtn = document.getElementById('header-signin-btn');
  if (signInBtn) {
    signInBtn.style.display = state.isUserSignedIn ? 'none' : 'block';
  }

  // Premium settings menu items visibility
  const shieldMenu = document.getElementById('btn-streak-shields');
  const reportMenu = document.getElementById('btn-weekly-report');
  const eliteMenu = document.getElementById('btn-elite-customization');
  const challengesMenu = document.getElementById('btn-elite-challenges');
  const subTag = document.getElementById('profile-sub-tag');
  
  if (subTag) {
    subTag.textContent = state.subscriptionPlan.toUpperCase();
    if (state.subscriptionPlan === 'pro') {
      subTag.className = 'pro-tag';
      subTag.style.background = 'var(--accent-yellow)';
      subTag.style.color = '#000';
    } else if (state.subscriptionPlan === 'elite') {
      subTag.className = 'pro-tag';
      subTag.style.background = 'linear-gradient(135deg, #ebd45b 0%, #ff8f00 100%)';
      subTag.style.color = '#000';
    } else {
      subTag.className = 'pro-tag';
      subTag.style.background = '#2d3139';
      subTag.style.color = '#8c8f96';
    }
  }

  if (shieldMenu) {
    shieldMenu.style.display = state.subscriptionPlan !== 'free' ? 'flex' : 'none';
    const shieldValText = document.getElementById('shields-val-text');
    if (shieldValText) {
      shieldValText.textContent = state.subscriptionPlan === 'elite' ? 'Unlimited' : `${state.streakShields} Active`;
    }
  }
  if (reportMenu) {
    reportMenu.style.display = state.subscriptionPlan !== 'free' ? 'flex' : 'none';
  }
  if (eliteMenu) {
    eliteMenu.style.display = state.subscriptionPlan === 'elite' ? 'flex' : 'none';
  }
  if (challengesMenu) {
    challengesMenu.style.display = state.subscriptionPlan === 'elite' ? 'flex' : 'none';
  }

  // Rewarded ad home card visibility
  const rewardedAdHomeCard = document.getElementById('rewarded-ad-home-card');
  if (rewardedAdHomeCard) {
    rewardedAdHomeCard.style.display = (state.subscriptionPlan === 'free' && !state.adWatchedToday) ? 'flex' : 'none';
  }

  // Elite Profile customizations
  const profileNameEl = document.getElementById('profile-display-name');
  if (profileNameEl) {
    profileNameEl.textContent = state.grinderName;
    if (state.subscriptionPlan === 'elite') {
      profileNameEl.style.color = state.eliteColor || 'var(--accent-yellow)';
      profileNameEl.className = 'profile-name elite-username';
      // Display title
      const profileSub = document.querySelector('.profile-sub');
      if (profileSub) {
        profileSub.innerHTML = `${state.eliteTitle || 'ELITE GRINDER'} • JOINED 2024`;
        profileSub.style.color = 'var(--accent-yellow)';
      }
    } else {
      profileNameEl.style.color = '#fff';
      profileNameEl.className = 'profile-name';
      const profileSub = document.querySelector('.profile-sub');
      if (profileSub) {
        profileSub.innerHTML = 'GRINDER • JOINED 2024';
        profileSub.style.color = '';
      }
    }
  }

  // Elite Avatar frame styling
  const avatarCircle = document.querySelector('.avatar-circle');
  if (avatarCircle) {
    // Reset elite classes
    avatarCircle.classList.remove('gold-frame', 'neon-frame', 'cyber-frame');
    if (state.subscriptionPlan === 'elite' && state.eliteFrame && state.eliteFrame !== 'none') {
      avatarCircle.classList.add(state.eliteFrame);
    }
  }
  
  // Enforce categories select content
  updateCategorySelect();
  updateUpgradeBanner();

  updateRankProgress();
}

function updateCategorySelect() {
  const categorySelect = document.getElementById('select-task-category');
  if (!categorySelect) return;
}

// MODAL CONTROLS
function openModal(modal) {
  modal.classList.add('open');
}

function closeModal(modal) {
  modal.classList.remove('open');
  if (modal && modal.id === 'signin-modal') {
    cancelOtpVerification();
  }
}

// TOAST NOTIFICATIONS CORE
function showToast(header, body, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  toast.innerHTML = `
    <div class="toast-header">${header}</div>
    <div class="toast-body">${body}</div>
  `;
  
  DOM.toastContainer.appendChild(toast);
  
  // Auto remove toast
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// DATE TEXT HELPER
function setDateText() {
  const dateEl = DOM.streakCount ? document.getElementById('current-date') : null;
  if (!dateEl) return;
  
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const today = new Date();
  
  // Set in Workout Header: e.g. "TUESDAY, JUNE 2"
  dateEl.textContent = today.toLocaleDateString('en-US', options).toUpperCase();
}

// PERSISTENCE LOCAL STORAGE
function saveLocalStorage() {
  const dataToSave = {
    streak: state.streak,
    totalXP: state.totalXP,
    waterCount: state.waterCount,
    gymDuration: state.gymDuration,
    studyHours: state.studyHours,
    sleepHours: state.sleepHours,
    grinderName: state.grinderName,
    avatarUrl: state.avatarUrl,
    units: state.units,
    theme: state.theme,
    achievements: state.achievements,
    activeView: state.activeView,
    workout: state.workout,
    tasks: state.tasks,
    
    // Subscription & Ads
    subscriptionPlan: state.subscriptionPlan,
    billingCycle: state.billingCycle,
    adWatchedToday: state.adWatchedToday,
    expBoostMultiplier: state.expBoostMultiplier,
    expBoostActive: state.expBoostActive,
    
    // Sign in and premium details
    isUserSignedIn: state.isUserSignedIn,
    streakShields: state.streakShields,
    eliteColor: state.eliteColor,
    eliteTitle: state.eliteTitle,
    eliteFrame: state.eliteFrame,
    lastWorkoutStudySameDayDate: state.lastWorkoutStudySameDayDate,
    lastMorningRoutineDate: state.lastMorningRoutineDate,
    
    // Steps tracking
    stepsCount: state.stepsCount,
    isSyncActive: state.isSyncActive,
    
    // Daily flags
    gymCompletedToday: state.gymCompletedToday,
    lastRestDayXpCreditedDate: state.lastRestDayXpCreditedDate,
    lastDayCheckedDate: state.lastDayCheckedDate,
    
    // Achievements tracking
    workoutCount: state.workoutCount,
    workoutStreak: state.workoutStreak,
    cardioCount: state.cardioCount,
    strengthCount: state.strengthCount,
    totalStudyHours: state.totalStudyHours,
    studySessionsCount: state.studySessionsCount,
    studyStreak: state.studyStreak,
    maxStudySessionDuration: state.maxStudySessionDuration,
    sleepLogsCount: state.sleepLogsCount,
    sleepStreak: state.sleepStreak,
    nightsWith8HrsSleep: state.nightsWith8HrsSleep,
    earlyRiseSleepGoalCount: state.earlyRiseSleepGoalCount,
    totalWaterCount: state.totalWaterCount,
    waterStreak: state.waterStreak,
    maxWaterSingleDay: state.maxWaterSingleDay,
    morningHydrationCount: state.morningHydrationCount,
    consistentWaterDays: state.consistentWaterDays,
    perfectDaysCount: state.perfectDaysCount,
    perfectDaysStreak: state.perfectDaysStreak,
    workoutAndStudySameDayCount: state.workoutAndStudySameDayCount,
    morningRoutineCompletedCount: state.morningRoutineCompletedCount,
    workoutBefore7AMCount: state.workoutBefore7AMCount,
    workoutAfter9PMCount: state.workoutAfter9PMCount,
    studyBefore8AMCount: state.studyBefore8AMCount,
    studyPastMidnightCount: state.studyPastMidnightCount,
    daysUsedCount: state.daysUsedCount,

    // Onboarding properties
    onboardingStep: state.onboardingStep,
    onboardingCompleted: state.onboardingCompleted,
    gender: state.gender,
    workoutPlan: state.workoutPlan,
    avatarIndex: state.avatarIndex
  };
  localStorage.setItem('grind_app_state', JSON.stringify(dataToSave));
  
  // Sync automatically with backend
  syncStateWithBackend();
}

function loadLocalStorage() {
  const saved = localStorage.getItem('grind_app_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.streak = parsed.streak || 0;
      state.totalXP = parsed.totalXP || 0;
      state.waterCount = parsed.waterCount || 0;
      state.gymDuration = parsed.gymDuration || 0;
      state.studyHours = parsed.studyHours || 0.0;
      state.sleepHours = parsed.sleepHours || '--';
      state.grinderName = parsed.grinderName || 'Athlete';
      state.avatarUrl = parsed.avatarUrl || '';
      state.units = parsed.units || 'Metric (kg, km)';
      state.theme = parsed.theme || 'Deep Black';
      state.activeView = parsed.activeView || 'home';
      
      // Steps tracking
      state.stepsCount = parsed.stepsCount || 0;
      state.isSyncActive = parsed.isSyncActive || false;
      state.gymCompletedToday = parsed.gymCompletedToday || false;
      state.lastRestDayXpCreditedDate = parsed.lastRestDayXpCreditedDate || '';
      state.lastDayCheckedDate = parsed.lastDayCheckedDate || '';
      state.workoutCount = parsed.workoutCount || 0;
      state.workoutStreak = parsed.workoutStreak || 0;
      state.cardioCount = parsed.cardioCount || 0;
      state.strengthCount = parsed.strengthCount || 0;
      state.totalStudyHours = parsed.totalStudyHours || 0.0;
      state.studySessionsCount = parsed.studySessionsCount || 0;
      state.studyStreak = parsed.studyStreak || 0;
      state.maxStudySessionDuration = parsed.maxStudySessionDuration || 0;
      state.sleepLogsCount = parsed.sleepLogsCount || 0;
      state.sleepStreak = parsed.sleepStreak || 0;
      state.nightsWith8HrsSleep = parsed.nightsWith8HrsSleep || 0;
      state.earlyRiseSleepGoalCount = parsed.earlyRiseSleepGoalCount || 0;
      state.totalWaterCount = parsed.totalWaterCount || 0;
      state.waterStreak = parsed.waterStreak || 0;
      state.maxWaterSingleDay = parsed.maxWaterSingleDay || 0;
      state.morningHydrationCount = parsed.morningHydrationCount || 0;
      state.consistentWaterDays = parsed.consistentWaterDays || 0;
      state.perfectDaysCount = parsed.perfectDaysCount || 0;
      state.perfectDaysStreak = parsed.perfectDaysStreak || 0;
      state.workoutAndStudySameDayCount = parsed.workoutAndStudySameDayCount || 0;
      state.morningRoutineCompletedCount = parsed.morningRoutineCompletedCount || 0;
      state.workoutBefore7AMCount = parsed.workoutBefore7AMCount || 0;
      state.workoutAfter9PMCount = parsed.workoutAfter9PMCount || 0;
      state.studyBefore8AMCount = parsed.studyBefore8AMCount || 0;
      state.studyPastMidnightCount = parsed.studyPastMidnightCount || 0;
      state.daysUsedCount = parsed.daysUsedCount || 1;
      state.season = parsed.season || 1;

      // Onboarding properties
      state.onboardingStep = parsed.onboardingStep || 1;
      state.onboardingCompleted = parsed.onboardingCompleted || false;
      state.gender = parsed.gender || 'male';
      state.workoutPlan = parsed.workoutPlan || 5;
      state.avatarIndex = parsed.avatarIndex || 0;
      
      if (parsed.achievements) {
        // Initialize achievements first to ensure all definitions exist
        ACHIEVEMENT_DEFINITIONS.forEach(def => {
          state.achievements[def.id] = { current: 0, target: def.target, xp: def.xp, unlocked: false, category: def.category };
        });
        // Merge saved progress from local storage
        Object.keys(parsed.achievements).forEach(id => {
          if (state.achievements[id]) {
            state.achievements[id].current = parsed.achievements[id].current || 0;
            state.achievements[id].unlocked = parsed.achievements[id].unlocked || false;
          }
        });
      }
      if (parsed.workout) {
        state.workout = parsed.workout;
      }
      if (parsed.tasks) {
        state.tasks = parsed.tasks;
      }

      // Subscription & Ads
      state.subscriptionPlan = parsed.subscriptionPlan || 'free';
      state.billingCycle = parsed.billingCycle || 'monthly';
      state.adWatchedToday = parsed.adWatchedToday || false;
      state.expBoostMultiplier = parsed.expBoostMultiplier || 1;
      state.expBoostActive = parsed.expBoostActive || false;
      
      // Sign in and premium details
      state.isUserSignedIn = parsed.isUserSignedIn || false;
      state.streakShields = parsed.streakShields || 0;
      state.eliteColor = parsed.eliteColor || '#ffffff';
      state.eliteTitle = parsed.eliteTitle || 'GRINDER';
      state.eliteFrame = parsed.eliteFrame || 'none';
      state.lastWorkoutStudySameDayDate = parsed.lastWorkoutStudySameDayDate || '';
      state.lastMorningRoutineDate = parsed.lastMorningRoutineDate || '';

      // Set boost multiplier based on plan
      if (state.subscriptionPlan === 'pro') {
        state.expBoostMultiplier = 1.5;
        state.expBoostActive = true;
      } else if (state.subscriptionPlan === 'elite') {
        state.expBoostMultiplier = 2;
        state.expBoostActive = true;
      } else if (state.subscriptionPlan === 'free') {
        if (state.adWatchedToday) {
          state.expBoostMultiplier = 1.5;
          state.expBoostActive = true;
        } else {
          state.expBoostMultiplier = 1.0;
          state.expBoostActive = false;
        }
      }
    } catch (e) {
      console.error('Error parsing localStorage state:', e);
    }
  }

  // Load state from server asynchronously if token is present
  const token = localStorage.getItem('grind_auth_token');
  const role = localStorage.getItem('grind_user_role');
  if (token) {
    state.isUserSignedIn = true;
    
    // Show admin control panel if role is admin
    const adminBtn = document.getElementById('btn-admin-dashboard');
    if (adminBtn && role === 'admin') {
      adminBtn.style.display = 'flex';
    }

    fetch('/api/user/state', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch state');
        return res.json();
      })
      .then(serverState => {
        if (serverState) {
          // Merge server state into active state
          Object.keys(serverState).forEach(key => {
            state[key] = serverState[key];
          });
          state.isUserSignedIn = true; // force flag alignment
          
          if (serverState.achievements) {
            Object.keys(serverState.achievements).forEach(id => {
              if (state.achievements[id]) {
                state.achievements[id].current = serverState.achievements[id].current || 0;
                state.achievements[id].unlocked = serverState.achievements[id].unlocked || false;
              }
            });
          }

          updateUI();
          renderTasks();
          renderWorkoutView();
          renderLeaderboards();
        }
      })
      .catch(err => {
        console.error('Error loading state from backend server:', err);
      });
  }
}

// INTERACTIVE WORKOUT VIEW RENDERING
function renderWorkoutView() {
  if (!DOM.workoutInteractiveSection) return;
  
  const w = state.workout;
  
  if (!w || !w.exercises || w.exercises.length === 0) {
    DOM.workoutInteractiveSection.innerHTML = `
      <div class="rest-day-card" style="margin-top: 10px;">
        <div class="rest-day-icon">🧘</div>
        <h3 class="rest-day-title">Rest & Recover</h3>
        <p class="rest-day-note">
          Today is a rest day. Relax, perform light stretching, eat well, and sleep well to let your muscles rebuild. ⚡
        </p>
      </div>
    `;
    return;
  }
  
  if (state.gymDuration >= 45 || w.completed) {
    DOM.workoutInteractiveSection.innerHTML = `
      <div class="workout-completed-card" style="margin-top: 10px;">
        <div class="workout-completed-icon">🏆</div>
        <h3 class="exercise-name" style="font-size: 1.45rem; margin-bottom: 4px;">Workout Mastered!</h3>
        <p class="exercise-muscles" style="font-size: 0.85rem; max-width: 280px; text-align: center; line-height: 1.4; color: var(--color-text-secondary);">
          Phenomenal work! Today's ${w.title ? (w.title.split(' — ')[1] || 'routine') : 'routine'} routine has been fully completed. Rest, recover, and grind again tomorrow. ⚡
        </p>
      </div>
    `;
    return;
  }
  
  if (!w.started) {
    DOM.workoutInteractiveSection.innerHTML = `
      <span class="section-title">TODAY'S WORKOUT ROUTINE</span>
      <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${w.exercises.map(ex => `
            <div class="exercise-card">
              <div class="exercise-info-left">
                <h3 class="exercise-name">${ex.name}</h3>
                <span class="exercise-muscles">${ex.muscles}</span>
              </div>
              <div class="exercise-info-right">
                <span class="exercise-sets" style="color: var(--accent-yellow); font-weight: 700;">${ex.sets} sets</span>
                <span class="exercise-reps" style="font-size: 0.75rem; color: var(--color-text-secondary);">${ex.reps}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="workout-start-btn" onclick="startWorkout()">
          <span>🔥</span> Start ${w.title ? (w.title.split(' — ')[1] || 'Workout') : 'Workout'} Workout
        </button>
      </div>
    `;
    return;
  }
  
  let allExercisesFinished = true;
  let totalSets = 0;
  let totalCompletedSets = 0;
  
  w.exercises.forEach(ex => {
    totalSets += ex.sets;
    totalCompletedSets += ex.completedSets;
    if (ex.completedSets < ex.sets) {
      allExercisesFinished = false;
    }
  });

  const progressPercent = Math.round((totalCompletedSets / totalSets) * 100);
  const activeExIndex = w.exercises.findIndex(ex => ex.completedSets < ex.sets);
  
  const exercisesListHtml = w.exercises.map((ex, exIndex) => {
    const isFinished = ex.completedSets >= ex.sets;
    const isActive = exIndex === activeExIndex;
    
    let setButtonsHtml = '';
    for (let i = 1; i <= ex.sets; i++) {
      const isCompleted = i <= ex.completedSets;
      setButtonsHtml += `
        <button class="set-btn ${isCompleted ? 'completed' : ''}" onclick="toggleSet(${exIndex}, ${i}, event)">
          ${i}
        </button>
      `;
    }
    
    return `
      <div class="exercise-card active-exercise ${isFinished ? 'fully-completed' : ''} ${isActive ? 'current-active-card' : 'inactive-card'}">
        <div class="exercise-header-row">
          <div class="exercise-info-left">
            <h3 class="exercise-name" style="font-size: 0.95rem; font-weight: 700; color: #fff;">${ex.name}</h3>
            <span class="exercise-muscles" style="font-size: 0.75rem; color: var(--color-text-secondary);">${ex.muscles} • ${ex.reps}</span>
          </div>
          <div class="exercise-info-right">
            <span class="exercise-sets" style="font-weight: 700; font-size: 0.9rem;">${ex.completedSets}/${ex.sets} sets</span>
          </div>
        </div>
        <div class="exercise-sets-container">
          ${setButtonsHtml}
        </div>
        ${isActive ? `
          <button class="log-set-btn-primary" onclick="toggleSet(${exIndex}, ${ex.completedSets + 1}, event)">
            🏋️ Log Set ${ex.completedSets + 1}
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
  
  DOM.workoutInteractiveSection.innerHTML = `
    <div class="workout-progress-card">
      <div class="workout-progress-info">
        <span class="workout-progress-title">Overall Sets Progress</span>
        <span class="workout-progress-value">${totalCompletedSets} / ${totalSets} completed (${progressPercent}%)</span>
      </div>
      <div class="workout-progress-bar-container">
        <div class="workout-progress-bar-fill" style="width: ${progressPercent}%;"></div>
      </div>
    </div>

    <span class="section-title">ACTIVE WORKOUT CHECKLIST</span>
    <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${exercisesListHtml}
      </div>
      ${allExercisesFinished ? `
        <button class="workout-complete-btn" onclick="completeWorkout(event)">
          <span>🏆</span> Complete Today's Workout (+150 XP)
        </button>
      ` : `
        <div style="text-align: center; font-size: 0.75rem; color: var(--color-text-secondary); padding: 8px; line-height: 1.4;">
          Log sets sequentially by tapping the main button or individual set numbers! 🏋️
        </div>
      `}
    </div>
  `;
}

function startWorkout() {
  state.workout.started = true;
  state.workout.completed = false;
  state.workout.exercises.forEach(ex => ex.completedSets = 0);
  showToast('Workout Started', 'Lock in and crush those sets! ⚡', 'success');
  renderWorkoutView();
  saveLocalStorage();
}

function toggleSet(exIndex, setNum, event = null) {
  const ex = state.workout.exercises[exIndex];
  if (!ex) return;
  
  if (setNum !== ex.completedSets + 1 && setNum !== ex.completedSets) {
    showToast('Hold On', `Please complete Set ${ex.completedSets + 1} first!`, 'error');
    return;
  }
  
  if (ex.completedSets === setNum) {
    ex.completedSets = setNum - 1;
    addXP(-15, event);
    showToast('Set Removed', `Removed Set ${setNum} of ${ex.name}.`, 'error');
  } else {
    ex.completedSets = setNum;
    addXP(15, event);
    showToast('Set Logged', `Completed Set ${setNum} of ${ex.name}. (+15 XP)`, 'success');
  }
  
  renderWorkoutView();
  saveLocalStorage();
  renderLeaderboards();
}

function completeWorkout(event = null) {
  state.workout.started = false;
  state.workout.completed = true;
  logGym(45, event);
  addXP(150, event);
  
  const task = state.tasks.find(t => t.id === 'workout-task');
  if (task && !task.completed) {
    task.completed = true;
    addXP(task.xp, event, true);
  }
  
  showToast('Workout Mastered!', 'You smashed all exercises! (+150 XP)', 'achievement');
  updateUI();
  renderTasks();
  renderWorkoutView();
  saveLocalStorage();
  renderLeaderboards();
  
  setTimeout(() => {
    switchView('home');
    const container = document.querySelector('.phone-frame');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 1000);
}

window.startWorkout = startWorkout;
window.toggleSet = toggleSet;
window.completeWorkout = completeWorkout;

// STUDY WIDGET CLICK LOG
function addStudyHours(hours, event = null) {
  if (state.studyHours >= 4.0) {
    showToast('Study Goal Completed', 'You have hit 4/4 hours of study today!', 'success');
    return;
  }
  
  const hr = new Date().getHours();
  if (hr < 8) {
    state.studyBefore8AMCount = (state.studyBefore8AMCount || 0) + 1;
  } else if (hr >= 0 && hr < 4) {
    state.studyPastMidnightCount = (state.studyPastMidnightCount || 0) + 1;
  }
  
  state.studyHours = Math.min(4.0, state.studyHours + hours);
  state.totalStudyHours += hours;
  state.studySessionsCount++;
  if (hours > state.maxStudySessionDuration) {
    state.maxStudySessionDuration = hours;
  }
  
  addXP(25, event);
  
  if (state.studyHours >= 4.0) {
    const task = state.tasks.find(t => t.id === 'study-task');
    if (task && !task.completed) {
      task.completed = true;
      addXP(task.xp, event, true);
    }
    if (state.studyStreak === 0) state.studyStreak = 1;
  }

  checkAchievements();
  showToast('Study Hours Logged', `Logged +${hours} hours of deep study. (+25 XP)`, 'success');
  updateUI();
  renderTasks();
  saveLocalStorage();
  renderLeaderboards();
}

// SLEEP WIDGET INPUT SAVE
function saveSleepInput(event = null) {
  if (!DOM.sleepSlider) return;
  const val = parseFloat(DOM.sleepSlider.value);
  if (isNaN(val) || val <= 0 || val > 24) {
    showToast('Invalid Input', 'Please enter a valid amount of sleep.', 'error');
    return;
  }
  
  state.sleepHours = val;
  state.sleepLogsCount++;
  
  if (val >= 8.0) {
    state.nightsWith8HrsSleep = (state.nightsWith8HrsSleep || 0) + 1;
    const task = state.tasks.find(t => t.id === 'sleep-task');
    if (task && !task.completed) {
      task.completed = true;
      addXP(task.xp, event, true);
    }
    if (state.sleepStreak === 0) state.sleepStreak = 1;
  }
  
  const hr = new Date().getHours();
  if (hr < 6 && val >= 7.0) {
    state.earlyRiseSleepGoalCount = (state.earlyRiseSleepGoalCount || 0) + 1;
  }
  
  addXP(50, event);
  
  checkAchievements();
  showToast('Sleep Logged', `Synced ${val} hours of deep sleep. (+50 XP)`, 'success');
  closeModal(DOM.sleepInputModal);
  updateUI();
  renderTasks();
  saveLocalStorage();
  renderLeaderboards();
}

function updateSleepPillClasses(hours) {
  document.querySelectorAll('.quick-sleep-pill').forEach(pill => {
    const val = parseFloat(pill.textContent);
    if (val === hours) {
      pill.classList.add('active-pill');
    } else {
      pill.classList.remove('active-pill');
    }
  });
}

function setSleepSlider(hours) {
  if (DOM.sleepSlider) {
    DOM.sleepSlider.value = hours;
  }
  if (DOM.sleepSliderVal) {
    DOM.sleepSliderVal.textContent = hours.toFixed(1);
  }
  updateSleepPillClasses(hours);
}

window.updateSleepPillClasses = updateSleepPillClasses;
window.setSleepSlider = setSleepSlider;

// STEPS COUNTER GYRO & SIMULATOR LOGIC
let stepSyncInterval = null;
let lastAcc = { x: 0, y: 0, z: 0 };
let stepThreshold = 11.5;
let lastStep = 0;

function initStepsTracker() {
  const syncBtn = document.getElementById('btn-sync-sensor');
  const simBtn = document.getElementById('btn-sim-walk');
  
  if (syncBtn) {
    syncBtn.addEventListener('click', toggleWatchSync);
  }
  if (simBtn) {
    simBtn.addEventListener('click', () => simulateSteps(1000));
  }
  
  updateStepsUI();
}

function toggleWatchSync() {
  const syncBtn = document.getElementById('btn-sync-sensor');
  const statusBadge = document.getElementById('sensor-status');
  
  if (state.isSyncActive) {
    state.isSyncActive = false;
    if (stepSyncInterval) {
      clearInterval(stepSyncInterval);
      stepSyncInterval = null;
    }
    window.removeEventListener('devicemotion', handleGyroMotion);
    
    if (syncBtn) {
      syncBtn.classList.remove('active-sync');
      syncBtn.querySelector('span').textContent = 'Sync';
    }
    if (statusBadge) {
      statusBadge.className = 'sensor-status-badge';
      statusBadge.textContent = 'Watch Disconnected';
    }
    showToast('Sync Deactivated', 'Smart watch sensor disconnected.', 'error');
  } else {
    state.isSyncActive = true;
    
    if (syncBtn) {
      syncBtn.classList.add('active-sync');
      syncBtn.querySelector('span').textContent = 'Syncing...';
    }
    if (statusBadge) {
      statusBadge.className = 'sensor-status-badge syncing';
      statusBadge.textContent = 'Syncing Gyro...';
    }
    
    stepSyncInterval = setInterval(() => {
      if (state.isSyncActive) {
        const addedSteps = Math.floor(4 + Math.random() * 8);
        simulateSteps(addedSteps, false);
      }
    }, 2500);
    
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response == 'granted') {
            window.addEventListener('devicemotion', handleGyroMotion, true);
            statusBadge.className = 'sensor-status-badge connected';
            statusBadge.textContent = 'Watch Live (Gyro)';
          } else {
            statusBadge.className = 'sensor-status-badge connected';
            statusBadge.textContent = 'Watch Connected (Sim)';
          }
        })
        .catch(() => {
          statusBadge.className = 'sensor-status-badge connected';
          statusBadge.textContent = 'Watch Connected (Sim)';
        });
    } else {
      window.addEventListener('devicemotion', handleGyroMotion, true);
      statusBadge.className = 'sensor-status-badge connected';
      statusBadge.textContent = 'Watch Connected (Sim)';
    }
    
    showToast('Watch Synced', 'Smart watch gyro & accelerometer connected!', 'success');
  }
  saveLocalStorage();
}

function handleGyroMotion(event) {
  let acc = event.accelerationIncludingGravity;
  if (!acc) return;

  let x = acc.x || 0;
  let y = acc.y || 0;
  let z = acc.z || 0;

  let change = Math.abs(x - lastAcc.x) + Math.abs(y - lastAcc.y) + Math.abs(z - lastAcc.z);
  let now = Date.now();
  
  if (change > stepThreshold && (now - lastStep > 320)) {
    simulateSteps(1, false);
    lastStep = now;
  }
  
  lastAcc = { x: x, y: y, z: z };
}

function simulateSteps(amount, showFeedback = true) {
  const oldSteps = state.stepsCount;
  state.stepsCount += amount;
  
  const oldThousands = Math.floor(oldSteps / 1000);
  const newThousands = Math.floor(state.stepsCount / 1000);
  if (newThousands > oldThousands) {
    const xpGained = (newThousands - oldThousands) * 10;
    addXP(xpGained);
    showToast('Walking XP', `Logged ${amount.toLocaleString()} steps! (+${xpGained} XP)`, 'success');
  } else if (showFeedback) {
    showToast('Steps Logged', `Added +${amount} steps.`, 'success');
  }
  
  const oldCardios = Math.floor(oldSteps / 5000);
  const newCardios = Math.floor(state.stepsCount / 5000);
  if (newCardios > oldCardios) {
    state.cardioCount += (newCardios - oldCardios);
    showToast('Cardio Session Logged!', `Cardio count: ${state.cardioCount}`, 'achievement');
  }

  checkAchievements();
  updateStepsUI();
  saveLocalStorage();
}

function updateStepsUI() {
  const stepsNum = document.getElementById('steps-count');
  const progressFill = document.getElementById('steps-progress-bar');
  
  if (stepsNum) stepsNum.textContent = state.stepsCount.toLocaleString();
  if (progressFill) {
    const percent = Math.min(100, (state.stepsCount / 10000) * 100);
    progressFill.style.width = `${percent}%`;
  }
}

// LEADERBOARD INTEGRATION DATA
const MOCK_TOP_COMPETITORS = [
  { name: 'mollitommy', xp: 50000, lvl: 150, plan: 'pro', badge: 'badges/ultrasupreme.png', handle: '@mollitommy', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'jefryjerry', xp: 30000, lvl: 120, plan: 'pro', badge: 'badges/master.png', handle: '@jefryjerry', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'kolitrurne', xp: 20000, lvl: 100, plan: 'pro', badge: 'badges/dimond.png', handle: '@kolitrurne', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Theresa Webb', xp: 18500, lvl: 100, plan: 'free', badge: 'badges/gold.png', handle: '@meraty', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Kathryn Murphy', xp: 15200, lvl: 50, plan: 'free', badge: 'badges/silver.png', handle: '@faueod', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Jane Cooper', xp: 12100, lvl: 25, plan: 'free', badge: 'badges/bronze.png', handle: '@jikolim', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' }
];

const LEADERBOARD_MEMES = [
  { name: 'David Laid', baseXP: 11000, lvl: 22, badge: 'badges/gold.png' },
  { name: 'Zyzz', baseXP: 9800, lvl: 19, badge: 'badges/gold.png' },
  { name: 'C-Bum', baseXP: 8120, lvl: 16, badge: 'badges/silver.png' },
  { name: 'Sam Sulek', baseXP: 7900, lvl: 15, badge: 'badges/silver.png' },
  { name: 'Arnold', baseXP: 6600, lvl: 13, badge: 'badges/silver.png' },
  { name: 'Noel Deyzel', baseXP: 5200, lvl: 11, badge: 'badges/bronze.png' },
  { name: 'Ronnie C', baseXP: 4950, lvl: 10, badge: 'badges/bronze.png' },
  { name: 'Jeff Seid', baseXP: 3450, lvl: 8, badge: 'badges/bronze.png' },
  { name: 'Alex Eubank', baseXP: 2200, lvl: 5, badge: 'badges/bronze.png' }
];

function generateLeaderboard() {
  const competitors = [];
  
  MOCK_TOP_COMPETITORS.forEach(p => {
    competitors.push({
      ...p,
      isUser: false
    });
  });
  
  LEADERBOARD_MEMES.forEach((m, idx) => {
    competitors.push({
      name: m.name,
      xp: m.baseXP,
      lvl: m.lvl,
      badge: m.badge,
      isUser: false,
      plan: m.name === 'Zyzz' ? 'elite' : (m.name === 'David Laid' ? 'pro' : 'free'),
      avatarUrl: (idx % 2 === 0) ? 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' : 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png'
    });
  });
  
  const firstNames = ['Marcus', 'Jake', 'Leon', 'Sophia', 'Ethan', 'Chloe', 'Ryan', 'Zoe', 'Lucas', 'Mia', 'Kai', 'Tristan', 'Tyler', 'Gavin', 'Jared', 'Will', 'Bruce', 'Clara', 'Olivia', 'Emma'];
  const lastNames = ['Iron', 'Lift', 'Slayer', 'Grinder', 'Pump', 'Flex', 'Aesthetic', 'Beast', 'Gainz', 'Sweat', 'Power', 'Hustle', 'Steel', 'Stone'];
  
  for (let i = 0; i < 80; i++) {
    const name = firstNames[i % firstNames.length] + ' ' + lastNames[(i * 3) % lastNames.length];
    const xp = Math.round(2100 - (i * 22) + Math.random() * 40);
    let lvl = 10;
    let badge = 'badges/bronze.png';
    if (xp >= 3000 && xp < 8000) {
      lvl = 20;
      badge = 'badges/silver.png';
    } else if (xp >= 8000) {
      lvl = 30;
      badge = 'badges/gold.png';
    }
    competitors.push({
      name: name,
      xp: xp,
      lvl: lvl,
      badge: badge,
      isUser: false,
      plan: 'free',
      avatarUrl: (i % 2 === 0) ? 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' : 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png'
    });
  }
  
  // Only add user to leaderboard if they are NOT on the free plan (which is unranked)
  const isFree = state.subscriptionPlan === 'free';
  if (!isFree) {
    const userXP = state.totalXP;
    let userLvl = 10;
    let userBadge = 'badges/bronze.png';
    if (userXP < 3000) {
      userLvl = 10;
      userBadge = 'badges/bronze.png';
    } else if (userXP >= 3000 && userXP < 8000) {
      userLvl = 20;
      userBadge = 'badges/silver.png';
    } else if (userXP >= 8000 && userXP < 16000) {
      userLvl = 30;
      userBadge = 'badges/gold.png';
    } else if (userXP >= 16000 && userXP < 30000) {
      userLvl = 40;
      userBadge = 'badges/dimond.png';
    } else if (userXP >= 30000 && userXP < 50000) {
      userLvl = 50;
      userBadge = 'badges/master.png';
    } else if (userXP >= 50000 && userXP < 100000) {
      userLvl = 60;
      userBadge = 'badges/supreme.png';
    } else {
      userLvl = 70;
      userBadge = 'badges/ultrasupreme.png';
    }
    
    const priorityXP = state.subscriptionPlan === 'elite' ? userXP + 1000 : userXP;
    
    competitors.push({
      name: state.grinderName,
      xp: userXP,
      priorityXP: priorityXP,
      lvl: userLvl,
      badge: userBadge,
      isUser: true,
      plan: state.subscriptionPlan,
      avatarUrl: state.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png'
    });
  }
  
  competitors.sort((a, b) => {
    const aVal = a.priorityXP !== undefined ? a.priorityXP : a.xp;
    const bVal = b.priorityXP !== undefined ? b.priorityXP : b.xp;
    return bVal - aVal;
  });
  
  return competitors;
}

function renderLeaderboards() {
  const renderList = (list) => {
    const isFree = state.subscriptionPlan === 'free';
    const userIndex = list.findIndex(p => p.isUser);
    const userRank = isFree ? 'Unranked' : userIndex + 1;
    
    if (DOM.playerStandingCard) {
      if (isFree) {
        DOM.playerStandingCard.innerHTML = `
          <div class="rank-status-left">
            <div class="large-rank-badge" style="filter: grayscale(100%); opacity: 0.5;">
              <img src="badges/bronze.png" alt="Standing Badge" class="large-rank-badge-img" style="width: 50px; height: 50px;" />
            </div>
          </div>
          <div class="rank-status-right">
            <span class="rank-tier-pill" style="background: rgba(255,255,255,0.05); color: #8c8f96;">GLOBAL ARENA LEAGUE</span>
            <h2 class="rank-tier-title" style="font-size: 1.15rem; color: #8c8f96;">GLOBAL RANK: UNRANKED</h2>
            <p class="rank-tier-desc" style="margin-bottom: 0; font-size: 0.8rem; line-height: 1.3;">
              Upgrade to <strong>Grind Pro</strong> or <strong>Elite</strong> to rank on the global leaderboard and show off your badges!
            </p>
          </div>
        `;
      } else {
        const userP = list[userIndex];
        DOM.playerStandingCard.innerHTML = `
          <div class="rank-status-left">
            <div class="large-rank-badge">
              <img src="${userP ? userP.badge : 'badges/bronze.png'}" alt="Standing Badge" class="large-rank-badge-img" style="width: 50px; height: 50px;" />
            </div>
          </div>
          <div class="rank-status-right">
            <span class="rank-tier-pill">GLOBAL ARENA LEAGUE</span>
            <h2 class="rank-tier-title" style="font-size: 1.15rem;">GLOBAL RANK: #${userRank}</h2>
            <p class="rank-tier-desc" style="margin-bottom: 0; font-size: 0.8rem; line-height: 1.3;">
              Grinding hard! You are currently ranking in the <strong>Top ${userRank}</strong> globally.
            </p>
          </div>
        `;
      }
    }
    
    if (DOM.homeLeaderboardList) {
      let html = '';
      for (let i = 0; i < Math.min(10, list.length); i++) {
        const p = list[i];
        const rank = i + 1;
        
        let miniBadgeHTML = '';
        if (p.plan === 'elite') {
          miniBadgeHTML = `<span class="elite-badge-mini">ELITE</span>`;
        } else if (p.plan === 'pro') {
          miniBadgeHTML = `<span class="pro-badge-mini">PRO</span>`;
        }
        
        let nameStyle = '';
        let titleHTML = '';
        if (p.plan === 'elite') {
          const titleText = p.isUser ? (state.eliteTitle || 'ELITE') : 'ZYZZ';
          const nameColor = p.isUser ? (state.eliteColor || '#ebd45b') : '#ebd45b';
          nameStyle = `color: ${nameColor}; font-weight: 800; text-shadow: 0 0 8px ${nameColor}44;`;
          titleHTML = `<span style="font-size: 0.65rem; color: #ebd45b; font-weight: 700; margin-left: 5px;">[${titleText}]</span>`;
        } else if (p.isUser) {
          nameStyle = 'font-weight: 700;';
        }
        
        html += `
          <div class="leaderboard-item ${p.isUser ? 'active-user' : ''}">
            <div class="user-info-left">
              <span class="leaderboard-rank">${rank}</span>
              ${rank === 1 ? `
                <svg class="crown-icon" viewBox="0 0 24 24" width="14" height="14" fill="#ebd45b" style="margin-left: 2px;">
                  <path d="M2 4l3 5 7-6 7 6 3-5-2 16H4L2 4z"/>
                </svg>
              ` : ''}
              <div class="leaderboard-rank-mini-badge" style="margin-left: 2px;">
                <img src="${p.badge}" alt="Mini Badge" class="mini-rank-badge-img" />
              </div>
              <div class="user-details" style="margin-left: 6px;">
                <span class="user-name" style="${nameStyle}">${escapeHTML(p.name)} ${p.isUser ? ' (You)' : ''} ${miniBadgeHTML} ${titleHTML}</span>
                <span class="user-level">Lvl ${p.lvl}</span>
              </div>
            </div>
            <div class="user-xp">
              <span class="xp-val">${p.xp.toLocaleString()}</span>
              <span class="xp-unit">XP</span>
            </div>
          </div>
        `;
      }
      DOM.homeLeaderboardList.innerHTML = html;
    }
    
    // Render podium for top 3 in dedicated full view
    const podiumContainer = document.getElementById('leaderboard-podium');
    if (podiumContainer && list.length >= 3) {
      const p1 = list[0]; // 1st
      const p2 = list[1]; // 2nd
      const p3 = list[2]; // 3rd

      const getAvatarHtml = (player, rankStyle) => {
        const avatar = player.isUser ? (state.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png') : (player.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png');
        let overlayBadge = '';
        if (rankStyle === 'column-1') overlayBadge = '<span class="podium-badge-overlay gold">🏆</span>';
        else if (rankStyle === 'column-2') overlayBadge = '<span class="podium-badge-overlay silver">🥈</span>';
        else if (rankStyle === 'column-3') overlayBadge = '<span class="podium-badge-overlay bronze">🥉</span>';

        return `
          <div class="podium-avatar-wrapper" onclick="showPlayerProfile('${escapeHTML(player.name).replace(/'/g, "\\'")}', '${avatar}', '${escapeHTML(player.handle || '@' + player.name.toLowerCase().replace(/\s+/g, ''))}', ${player.lvl}, ${player.xp})">
            <img src="${avatar}" alt="${escapeHTML(player.name)}" class="podium-avatar" />
            ${overlayBadge}
          </div>
        `;
      };

      podiumContainer.innerHTML = `
        <!-- Rank 2 (Left) -->
        <div class="podium-column column-2">
          ${getAvatarHtml(p2, 'column-2')}
          <div class="podium-username" onclick="showPlayerProfile('${escapeHTML(p2.name).replace(/'/g, "\\'")}', '${p2.isUser ? (state.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png') : (p2.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png')}', '${escapeHTML(p2.handle || '@' + p2.name.toLowerCase().replace(/\s+/g, ''))}', ${p2.lvl}, ${p2.xp})">${escapeHTML(p2.name)}</div>
          <div class="podium-exp-pill">${p2.xp.toLocaleString()} XP</div>
          <div class="podium-block">
            <span class="podium-block-num">2</span>
          </div>
        </div>
        <!-- Rank 1 (Center) -->
        <div class="podium-column column-1">
          ${getAvatarHtml(p1, 'column-1')}
          <div class="podium-username" onclick="showPlayerProfile('${escapeHTML(p1.name).replace(/'/g, "\\'")}', '${p1.isUser ? (state.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png') : (p1.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png')}', '${escapeHTML(p1.handle || '@' + p1.name.toLowerCase().replace(/\s+/g, ''))}', ${p1.lvl}, ${p1.xp})">${escapeHTML(p1.name)}</div>
          <div class="podium-exp-pill">${p1.xp.toLocaleString()} XP</div>
          <div class="podium-block">
            <span class="podium-block-num">1</span>
          </div>
        </div>
        <!-- Rank 3 (Right) -->
        <div class="podium-column column-3">
          ${getAvatarHtml(p3, 'column-3')}
          <div class="podium-username" onclick="showPlayerProfile('${escapeHTML(p3.name).replace(/'/g, "\\'")}', '${p3.isUser ? (state.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png') : (p3.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png')}', '${escapeHTML(p3.handle || '@' + p3.name.toLowerCase().replace(/\s+/g, ''))}', ${p3.lvl}, ${p3.xp})">${escapeHTML(p3.name)}</div>
          <div class="podium-exp-pill">${p3.xp.toLocaleString()} XP</div>
          <div class="podium-block">
            <span class="podium-block-num">3</span>
          </div>
        </div>
      `;
    }

    // Render Ranks 4+ in scrollable list
    if (DOM.fullLeaderboardList) {
      let html = '';
      for (let i = 3; i < list.length; i++) {
        const p = list[i];
        const rank = i + 1;
        
        let miniBadgeHTML = '';
        if (p.plan === 'elite') {
          miniBadgeHTML = `<span class="elite-badge-mini">ELITE</span>`;
        } else if (p.plan === 'pro') {
          miniBadgeHTML = `<span class="pro-badge-mini">PRO</span>`;
        }
        
        let nameStyle = '';
        let titleHTML = '';
        if (p.plan === 'elite') {
          const titleText = p.isUser ? (state.eliteTitle || 'ELITE') : 'ZYZZ';
          const nameColor = p.isUser ? (state.eliteColor || '#ebd45b') : '#ebd45b';
          nameStyle = `color: ${nameColor}; font-weight: 800; text-shadow: 0 0 8px ${nameColor}44;`;
          titleHTML = `<span style="font-size: 0.65rem; color: #ebd45b; font-weight: 700; margin-left: 5px;">[${titleText}]</span>`;
        } else if (p.isUser) {
          nameStyle = 'color: var(--accent-yellow); font-weight: 800;';
        }

        const avatar = p.isUser ? (state.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png') : (p.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png');
        const handleName = p.name.toLowerCase().replace(/\s+/g, '');
        const handle = p.handle || `@${handleName}`;

        html += `
          <div class="leaderboard-item ${p.isUser ? 'active-user' : ''}" style="margin-bottom: 6px; padding: 12px; border-radius: var(--border-radius-md);" onclick="showPlayerProfile('${escapeHTML(p.name).replace(/'/g, "\\'")}', '${avatar}', '${escapeHTML(handle)}', ${p.lvl}, ${p.xp})">
            <div class="user-info-left">
              <span class="leaderboard-rank" style="font-weight: 800; width: 28px; color: var(--color-text-secondary); display: flex; align-items: center; gap: 4px;">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity: 0.5;">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6v5zm12 0h1.5a2.5 2.5 0 0 0 0-5H18v5z" fill="none"/>
                  <path d="M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
                  <path d="M12 2a6 6 0 0 0-6 6v3c0 2.5 1.84 4.5 4.5 4.9V2h3v13.9c2.66-.4 4.5-2.4 4.5-4.9V8a6 6 0 0 0-6-6z" fill="currentColor" opacity="0.3"/>
                </svg>
                ${rank}
              </span>
              <div class="list-avatar-wrapper" style="margin-left: 8px;">
                <img src="${avatar}" alt="${escapeHTML(p.name)}" class="list-avatar" />
                <span class="list-avatar-badge">💎</span>
              </div>
              <div class="user-details" style="margin-left: 10px;">
                <span class="user-name" style="${nameStyle}">${escapeHTML(p.name)} ${p.isUser ? ' (You)' : ''} ${miniBadgeHTML} ${titleHTML}</span>
                <span class="user-handle">${escapeHTML(handle)}</span>
              </div>
            </div>
            <div class="list-progress-detail" style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 2px;">
              <span class="user-score" style="font-size: 0.95rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 4px;">
                <span style="color: #ffd700;">⭐</span> ${Math.round(p.xp / 150)}
              </span>
              <span class="user-percent" style="font-size: 0.72rem; color: #8e9297; font-weight: 600;">
                ${p.xp.toLocaleString()} XP
              </span>
            </div>
          </div>
        `;
      }
      DOM.fullLeaderboardList.innerHTML = html;
    }
  };

  // Async API dynamic fetch with standard sync fallback
  const token = localStorage.getItem('grind_auth_token');
  if (state.isUserSignedIn && token) {
    fetch('/api/leaderboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Map to tag logged in user
        const mapped = data.map(p => ({
          ...p,
          isUser: p.isRealUser && p.name === state.grinderName
        }));
        renderList(mapped);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard from API, falling back to static generation:', err);
        renderList(generateLeaderboard());
      });
  } else {
    renderList(generateLeaderboard());
  }
}

// DAILY GRIND TASKS CONTROLLERS
function renderTasks() {
  if (!DOM.homeTasksList || !DOM.tasksCountText) return;
  
  let completedCount = 0;
  let html = '';
  
  state.tasks.forEach(task => {
    if (task.completed) {
      completedCount++;
    }
    
    html += `
      <div class="task-item ${task.completed ? 'completed-task' : ''}">
        <div class="task-item-left">
          <label class="task-checkbox-wrapper">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}', event)">
            <span class="checkmark"></span>
          </label>
          <span class="task-text">${escapeHTML(task.text)}</span>
        </div>
        <div class="task-item-right">
          <span class="task-xp-pill">+${task.xp} XP</span>
          ${!task.isDefault ? `
            <button class="task-delete-btn" onclick="deleteTask('${task.id}')" aria-label="Delete Task">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  DOM.homeTasksList.innerHTML = html;
  DOM.tasksCountText.textContent = `${completedCount} / ${state.tasks.length} completed`;
}

function toggleTask(id, event) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  
  task.completed = event.target.checked;
  
  if (task.completed) {
    addXP(task.xp, event);
    showToast('Task Completed', `${task.text} (+${task.xp} XP)`, 'success');
  } else {
    addXP(-task.xp, event);
    showToast('Task Unchecked', `XP removed: -${task.xp} XP`, 'error');
  }
  
  renderTasks();
  saveLocalStorage();
}

function addTask() {
  if (!DOM.inputTaskName) return;
  const text = DOM.inputTaskName.value.trim();
  if (text === '') return;
  
  if (state.subscriptionPlan === 'free' && state.tasks.length >= 5) {
    showToast('Task Limit Reached ⚠️', 'Grind Free is limited to 5 tasks/day. Upgrade to Pro/Elite for unlimited tasks!', 'error');
    openSubscriptionModal();
    return;
  }

  const categorySelect = document.getElementById('select-task-category');
  const category = categorySelect ? categorySelect.value : 'other';

  const id = 'custom-' + Date.now();
  state.tasks.push({
    id: id,
    text: text,
    xp: 30,
    completed: false,
    isDefault: false,
    category: category
  });
  
  DOM.inputTaskName.value = '';
  showToast('Task Added', `Added task: "${text}"`, 'success');
  
  renderTasks();
  saveLocalStorage();
}

function deleteTask(id) {
  const taskIndex = state.tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return;
  
  const task = state.tasks[taskIndex];
  if (task.isDefault) return;
  
  state.tasks.splice(taskIndex, 1);
  showToast('Task Deleted', `Removed task: "${task.text}"`, 'success');
  
  renderTasks();
  saveLocalStorage();
}

window.renderTasks = renderTasks;
window.toggleTask = toggleTask;
window.addTask = addTask;
window.deleteTask = deleteTask;

// ==========================================
// ONBOARDING & SCHEDULING FLOW CONTROLLERS
// ==========================================

function updateOnboardingUI() {
  document.querySelectorAll('.ob-step').forEach(step => {
    step.classList.remove('active');
  });
  
  const activeStep = document.getElementById(`ob-step-${state.onboardingStep}`);
  if (activeStep) {
    activeStep.classList.add('active');
  }
  
  const progressFill = document.getElementById('ob-progress-fill');
  if (progressFill) {
    const percent = (state.onboardingStep / 6) * 100;
    progressFill.style.width = `${percent}%`;
  }
}

function selectGender(gender) {
  state.gender = gender;
  
  const maleCard = document.getElementById('ob-gender-male');
  const femaleCard = document.getElementById('ob-gender-female');
  
  if (gender === 'male') {
    maleCard?.classList.add('selected');
    femaleCard?.classList.remove('selected');
  } else {
    maleCard?.classList.remove('selected');
    femaleCard?.classList.add('selected');
  }
}

function nextOnboardingStep() {
  if (state.onboardingStep < 6) {
    if (state.onboardingStep === 3) {
      const nameInput = document.getElementById('ob-name-input');
      if (nameInput) {
        const val = nameInput.value.trim();
        if (val !== '') {
          state.grinderName = val;
        }
      }
    }
    
    state.onboardingStep++;
    updateOnboardingUI();
  }
}

function selectAvatar(index) {
  state.avatarIndex = index;
  
  const avatar0 = document.getElementById('ob-avatar-0');
  const avatar1 = document.getElementById('ob-avatar-1');
  
  if (index === 0) {
    avatar0?.classList.add('selected');
    avatar1?.classList.remove('selected');
    state.avatarUrl = 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png';
  } else {
    avatar0?.classList.remove('selected');
    avatar1?.classList.add('selected');
    state.avatarUrl = 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png';
  }
}

function selectPlan(days) {
  state.workoutPlan = days;
  
  const plan5 = document.getElementById('ob-plan-5');
  const plan6 = document.getElementById('ob-plan-6');
  
  if (days === 5) {
    plan5?.classList.add('selected');
    plan6?.classList.remove('selected');
  } else {
    plan5?.classList.remove('selected');
    plan6?.classList.add('selected');
  }
}

function allowNotifications() {
  showToast('Notifications Enabled', 'You will receive daily reminders to grind! 🔔', 'success');
  setTimeout(() => {
    finishOnboarding();
  }, 800);
}

function skipNotifications() {
  showToast('Notifications Skipped', 'You can enable reminders in settings later.', 'success');
  setTimeout(() => {
    finishOnboarding();
  }, 800);
}

function finishOnboarding() {
  const nameInput = document.getElementById('ob-name-input');
  if (nameInput) {
    const val = nameInput.value.trim();
    if (val !== '') {
      state.grinderName = val;
    }
  }
  
  if (state.avatarIndex === 0) {
    state.avatarUrl = 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png';
  } else {
    state.avatarUrl = 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png';
  }
  
  state.onboardingCompleted = true;
  initializeWorkoutSchedule();
  saveLocalStorage();
  
  updateUI();
  renderTasks();
  renderWorkoutView();
  renderLeaderboards();
  
  const overlay = document.getElementById('onboarding-overlay');
  const appContainer = document.querySelector('.app-container');
  
  if (overlay) {
    overlay.classList.add('hidden');
  }
  
  if (appContainer) {
    appContainer.classList.add('fade-in-app');
  }
  
  showToast('Onboarding Complete', 'Welcome to Grind, lock in today! 🔥', 'success');
}

function initializeWorkoutSchedule() {
  const plan = state.workoutPlan || 5;
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const routine = WORKOUT_ROUTINES[plan][dayOfWeek];
  
  const scheduleTitle = document.getElementById('schedule-title');
  const scheduleFocus = document.getElementById('schedule-focus');
  if (scheduleTitle) scheduleTitle.textContent = routine.title;
  if (scheduleFocus) scheduleFocus.textContent = routine.focus;
  
  if (!state.workout || state.workout.title !== routine.title) {
    state.workout = {
      title: routine.title,
      started: false,
      completed: false,
      exercises: JSON.parse(JSON.stringify(routine.exercises))
    };
  }
}

window.selectGender = selectGender;
window.nextOnboardingStep = nextOnboardingStep;
window.selectAvatar = selectAvatar;
window.selectPlan = selectPlan;
window.allowNotifications = allowNotifications;
window.skipNotifications = skipNotifications;
window.finishOnboarding = finishOnboarding;
window.initializeWorkoutSchedule = initializeWorkoutSchedule;
window.signOut = signOut;

// ==========================================
// SUBSCRIPTION & BILLING SYSTEM
// ==========================================

function openSubscriptionModal() {
  const modal = document.getElementById('subscription-modal');
  if (modal) {
    openModal(modal);
    
    // Reset status text
    const statusText = document.getElementById('paywall-status-text');
    if (statusText) {
      statusText.textContent = '';
      statusText.className = 'paywall-status-text';
    }
    
    // Enable button
    const btn = document.getElementById('paywall-primary-btn');
    if (btn) btn.disabled = false;
    
    // Default to Pro and Monthly
    setPaywallBillingCycle('monthly');
    selectPaywallPlan('pro');
  }
}

function setPaywallBillingCycle(cycle) {
  state.billingCycle = cycle;
  
  // Update toggle buttons active class
  const btnMonthly = document.getElementById('paywall-toggle-monthly');
  const btnAnnual = document.getElementById('paywall-toggle-annual');
  if (cycle === 'monthly') {
    btnMonthly?.classList.add('active');
    btnAnnual?.classList.remove('active');
  } else {
    btnMonthly?.classList.remove('active');
    btnAnnual?.classList.add('active');
  }
  
  // Transition prices (crossDissolve animation with 0.2s fade)
  const proPriceEl = document.getElementById('paywall-pro-price-val');
  const proPeriodEl = document.getElementById('paywall-pro-period-val');
  const proAnnualEl = document.getElementById('paywall-pro-annual-note');
  
  const elitePriceEl = document.getElementById('paywall-elite-price-val');
  const elitePeriodEl = document.getElementById('paywall-elite-period-val');
  const eliteAnnualEl = document.getElementById('paywall-elite-annual-note');
  
  // Add fade class
  const priceEls = [proPriceEl, proPeriodEl, proAnnualEl, elitePriceEl, elitePeriodEl, eliteAnnualEl].filter(Boolean);
  priceEls.forEach(el => el.classList.add('paywall-price-transition'));
  
  setTimeout(() => {
    if (cycle === 'monthly') {
      if (proPriceEl) proPriceEl.textContent = '$2.99';
      if (proPeriodEl) proPeriodEl.textContent = '/ month';
      if (proAnnualEl) proAnnualEl.style.display = 'none';
      
      if (elitePriceEl) elitePriceEl.textContent = '$4.99';
      if (elitePeriodEl) elitePeriodEl.textContent = '/ month';
      if (eliteAnnualEl) eliteAnnualEl.style.display = 'none';
    } else {
      if (proPriceEl) proPriceEl.textContent = '$1.99';
      if (proPeriodEl) proPeriodEl.textContent = '/ mo';
      if (proAnnualEl) {
        proAnnualEl.textContent = 'billed $23.88/yr';
        proAnnualEl.style.display = 'block';
      }
      
      if (elitePriceEl) elitePriceEl.textContent = '$3.33';
      if (elitePeriodEl) elitePeriodEl.textContent = '/ mo';
      if (eliteAnnualEl) {
        eliteAnnualEl.textContent = 'billed $39.99/yr';
        eliteAnnualEl.style.display = 'block';
      }
    }
    
    // Update CTA button text/price
    updatePaywallCTA();
    
    // Remove fade class
    priceEls.forEach(el => el.classList.remove('paywall-price-transition'));
  }, 200);
}

function selectPaywallPlan(planId) {
  state.selectedPlan = planId;
  
  // Update card active classes
  const cardFree = document.getElementById('paywall-card-free');
  const cardPro = document.getElementById('paywall-card-pro');
  const cardElite = document.getElementById('paywall-card-elite');
  
  cardFree?.classList.remove('active');
  cardPro?.classList.remove('active');
  cardElite?.classList.remove('active');
  
  const selectedCard = document.getElementById(`paywall-card-${planId}`);
  selectedCard?.classList.add('active');
  
  // Update CTA button text/price
  updatePaywallCTA();
}

function updatePaywallCTA() {
  const btn = document.getElementById('paywall-primary-btn');
  if (!btn) return;
  
  const plan = state.selectedPlan;
  const cycle = state.billingCycle;
  
  if (plan === 'free') {
    btn.textContent = 'Continue with Free';
  } else if (plan === 'pro') {
    const priceText = cycle === 'monthly' ? '$2.99/mo' : '$1.99/mo';
    btn.textContent = `Start Pro — ${priceText}`;
  } else if (plan === 'elite') {
    const priceText = cycle === 'monthly' ? '$4.99/mo' : '$3.33/mo';
    btn.textContent = `Start Elite — ${priceText}`;
  }
}

function handlePaywallPurchase() {
  const plan = state.selectedPlan;
  const cycle = state.billingCycle;
  
  const btn = document.getElementById('paywall-primary-btn');
  const statusText = document.getElementById('paywall-status-text');
  
  if (plan === 'free') {
    // Just dismiss sheet
    closeModal(document.getElementById('subscription-modal'));
    return;
  }
  
  // Generate StoreKit 2 Product ID
  let productId = '';
  if (plan === 'pro') {
    productId = cycle === 'monthly' ? 'com.grind.pro.monthly' : 'com.grind.pro.annual';
  } else if (plan === 'elite') {
    productId = cycle === 'monthly' ? 'com.grind.elite.monthly' : 'com.grind.elite.annual';
  }
  
  if (btn) btn.disabled = true;
  if (statusText) {
    statusText.textContent = 'Connecting to App Store...';
    statusText.className = 'paywall-status-text loading';
  }
  
  // Step 1: Connecting to App Store (0.6s)
  setTimeout(() => {
    if (statusText) {
      statusText.textContent = `Authorizing purchase for ${productId}...`;
    }
    
    // Step 2: Authorizing and executing purchase (0.8s)
    setTimeout(() => {
      // Entitle client
      // Securely upgrade on backend if logged in
      const token = localStorage.getItem('grind_auth_token');
      if (state.isUserSignedIn && token) {
        fetch('/api/user/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ plan })
        })
        .then(res => {
          if (!res.ok) throw new Error('Backend failed to process entitlement');
          return res.json();
        })
        .then(() => {
          showToast('Upgrade Sync Complete', 'Subscription verified with database.', 'success');
        })
        .catch(err => {
          console.error('Subscription sync error:', err);
          showToast('Sync Warning', 'Upgraded locally, but sync to account failed.', 'error');
        });
      }

      state.subscriptionPlan = plan;
      if (plan === 'pro') {
        state.expBoostMultiplier = 1.5;
        state.expBoostActive = true;
        state.streakShields = 2; // grant 2 shields
        showToast('Upgraded to Grind Pro! 🔥', 'No ads, 1.5x EXP active, unlimited tasks!', 'achievement');
      } else if (plan === 'elite') {
        state.expBoostMultiplier = 2;
        state.expBoostActive = true;
        state.streakShields = 999; // unlimited representation
        showToast('Upgraded to Grind Elite! 👑', '2x EXP active, unlimited shields, elite customizer!', 'achievement');
      }
      
      // Update inline status text
      if (statusText) {
        statusText.textContent = 'Purchase Successful!';
        statusText.className = 'paywall-status-text success';
      }
      
      // Update application UI state
      updateUpgradeBanner();
      saveLocalStorage();
      renderLeaderboards();
      
      // Step 3: Dismiss the modal after short delay to let user see success state (0.8s)
      setTimeout(() => {
        closeModal(document.getElementById('subscription-modal'));
        if (btn) btn.disabled = false;
        if (statusText) {
          statusText.textContent = '';
          statusText.className = 'paywall-status-text';
        }
      }, 800);
      
    }, 800);
    
  }, 600);
}

function restoreSubscriptionNew() {
  showToast('Restoring Purchases...', 'Checking App Store / Google Play accounts.', 'success');
  setTimeout(() => {
    const token = localStorage.getItem('grind_auth_token');
    if (state.isUserSignedIn && token) {
      fetch('/api/user/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: 'pro' })
      })
      .catch(err => console.error('Subscription restore sync failure:', err));
    }

    state.subscriptionPlan = 'pro';
    state.expBoostMultiplier = 1.5;
    state.expBoostActive = true;
    state.streakShields = 2;
    updateUpgradeBanner();
    closeModal(document.getElementById('subscription-modal'));
    saveLocalStorage();
    renderLeaderboards();
    showToast('Purchase Restored! 🛡️', 'Grind Pro subscription activated.', 'success');
  }, 1000);
}

function cancelSubscription() {
  const token = localStorage.getItem('grind_auth_token');
  if (state.isUserSignedIn && token) {
    fetch('/api/user/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan: 'free' })
    })
    .catch(err => console.error('Subscription cancellation sync failure:', err));
  }

  state.subscriptionPlan = 'free';
  state.expBoostMultiplier = 1;
  state.expBoostActive = false;
  state.streakShields = 0;
  updateUpgradeBanner();
  showToast('Subscription Cancelled', 'Reverted to free plan.', 'error');
  saveLocalStorage();
}

function updateUpgradeBanner() {
  if (DOM.upgradeBanner) {
    if (state.subscriptionPlan === 'free') {
      DOM.upgradeBanner.classList.remove('hidden');
    } else {
      DOM.upgradeBanner.classList.add('hidden');
    }
  }
}

window.openSubscriptionModal = openSubscriptionModal;
window.setPaywallBillingCycle = setPaywallBillingCycle;
window.selectPaywallPlan = selectPaywallPlan;
window.handlePaywallPurchase = handlePaywallPurchase;
window.restoreSubscriptionNew = restoreSubscriptionNew;
window.cancelSubscription = cancelSubscription;

// ==========================================
// AD SYSTEM — Fullscreen Video Ads
// ==========================================
// Golden rule: Only show ads at natural break points (after a task, on level-up)
// Make rewarded ads feel like a bonus ("watch for 2x EXP") — not a punishment
// Never interrupt an active session

let adTimerInterval = null;

function shouldShowAd() {
  // Never show ads for paying users
  if (state.subscriptionPlan !== 'free') return false;
  
  // Cooldown: don't show more than one ad per 120 seconds
  const now = Date.now();
  if (now - state.adCooldownTimestamp < 120000) return false;
  
  // Show after every 3 task completions
  if (state.taskCompletionsSinceLastAd >= 3) return true;
  
  return false;
}

function showAd(isRewarded = false) {
  if (state.subscriptionPlan !== 'free') return;
  
  const overlay = DOM.adOverlay;
  if (!overlay) return;

  state.adCooldownTimestamp = Date.now();
  state.taskCompletionsSinceLastAd = 0;

  // Configure rewarded vs standard
  if (DOM.adRewardInfo) {
    DOM.adRewardInfo.style.display = isRewarded ? 'flex' : 'none';
  }
  
  overlay.classList.add('open');

  // Start countdown
  let countdown = 5;
  const skipBtn = DOM.adSkipBtn;
  const closeBtn = DOM.adCloseBtn;
  const timerEl = DOM.adTimer;

  if (skipBtn) {
    skipBtn.style.display = 'block';
    skipBtn.disabled = true;
    skipBtn.textContent = `Skip in ${countdown}s`;
  }
  if (closeBtn) closeBtn.style.display = 'none';
  if (timerEl) timerEl.textContent = `Skip in ${countdown}s`;

  adTimerInterval = setInterval(() => {
    countdown--;
    if (timerEl) timerEl.textContent = countdown > 0 ? `Skip in ${countdown}s` : 'Ready';
    if (skipBtn) skipBtn.textContent = countdown > 0 ? `Skip in ${countdown}s` : 'Skip Ad';

    if (countdown <= 0) {
      clearInterval(adTimerInterval);
      if (skipBtn) {
        skipBtn.disabled = false;
        skipBtn.style.display = 'none';
      }
      if (closeBtn) closeBtn.style.display = 'block';

      // If rewarded ad was watched fully, grant bonus
      if (isRewarded) {
        state.adWatchedToday = true;
        state.expBoostMultiplier = 1.5;
        state.expBoostActive = true;
        showToast('Reward Earned! ⭐', '1.5x EXP boost active for your next task!', 'achievement');
        saveLocalStorage();
      }
    }
  }, 1000);
}

function closeAd() {
  if (adTimerInterval) clearInterval(adTimerInterval);
  const overlay = DOM.adOverlay;
  if (overlay) overlay.classList.remove('open');
  updateUI();
}

function triggerAdAtBreakpoint(leveledUp = false) {
  if (state.subscriptionPlan !== 'free') return;
  const isWorkoutActive = state.workout && state.workout.started;
  if (isWorkoutActive) return;
  
  if (leveledUp) {
    setTimeout(() => {
      showAd(false);
    }, 1000);
  } else if (shouldShowAd()) {
    setTimeout(() => {
      showAd(false);
    }, 1000);
  }
}

function showRewardedAd() {
  if (state.subscriptionPlan !== 'free') {
    showToast('Pro Perk', 'You already have a permanent EXP boost!', 'success');
    return;
  }
  if (state.adWatchedToday) {
    showToast('Already Watched', 'You can watch one rewarded ad per day.', 'error');
    return;
  }
  showAd(true);
}

// PREMIUM TIERS AND SIGN IN HELPERS

let authMode = 'login'; // 'login' or 'signup'

function switchAuthTab(mode) {
  authMode = mode;
  const tabLogin = document.getElementById('auth-tab-login');
  const tabSignup = document.getElementById('auth-tab-signup');
  const usernameGroup = document.getElementById('auth-username-group');
  const emailLabel = document.getElementById('auth-label-email');
  const emailInput = document.getElementById('auth-input-email');
  const submitBtn = document.getElementById('auth-submit-btn');
  const errorAlert = document.getElementById('auth-error-alert');
  const modalTitle = document.getElementById('auth-modal-title');

  if (errorAlert) errorAlert.style.display = 'none';

  if (mode === 'signup') {
    if (tabLogin) {
      tabLogin.style.background = 'transparent';
      tabLogin.style.color = 'var(--color-text-secondary)';
    }
    if (tabSignup) {
      tabSignup.style.background = 'var(--bg-card)';
      tabSignup.style.color = '#fff';
    }
    if (usernameGroup) usernameGroup.style.display = 'flex';
    if (emailLabel) emailLabel.textContent = 'Email Address';
    if (emailInput) {
      emailInput.type = 'email';
      emailInput.placeholder = 'Enter your email';
    }
    if (submitBtn) submitBtn.textContent = 'Sign Up';
    if (modalTitle) modalTitle.textContent = 'Create Grind Account';
  } else {
    if (tabLogin) {
      tabLogin.style.background = 'var(--bg-card)';
      tabLogin.style.color = '#fff';
    }
    if (tabSignup) {
      tabSignup.style.background = 'transparent';
      tabSignup.style.color = 'var(--color-text-secondary)';
    }
    if (usernameGroup) usernameGroup.style.display = 'none';
    if (emailLabel) emailLabel.textContent = 'Email or Username';
    if (emailInput) {
      emailInput.type = 'text';
      emailInput.placeholder = 'Enter your email or username';
    }
    if (submitBtn) submitBtn.textContent = 'Log In';
    if (modalTitle) modalTitle.textContent = 'Sign In to Grind';
  }
}

function submitAuthForm() {
  const usernameInput = document.getElementById('auth-input-username');
  const emailInput = document.getElementById('auth-input-email');
  const passwordInput = document.getElementById('auth-input-password');
  const errorAlert = document.getElementById('auth-error-alert');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (errorAlert) errorAlert.style.display = 'none';

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  const username = usernameInput ? usernameInput.value.trim() : '';

  if (!email || !password) {
    if (errorAlert) {
      errorAlert.textContent = 'Email/Username and Password are required';
      errorAlert.style.display = 'block';
    }
    return;
  }

  if (authMode === 'signup' && !username) {
    if (errorAlert) {
      errorAlert.textContent = 'Grinder Name is required for registration';
      errorAlert.style.display = 'block';
    }
    return;
  }

  const endpoint = authMode === 'signup' ? '/api/auth/register' : '/api/auth/login';
  const payload = authMode === 'signup' 
    ? { username, email, password } 
    : { email, password };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = authMode === 'signup' ? 'Signing Up...' : 'Logging In...';
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = authMode === 'signup' ? 'Sign Up' : 'Log In';
      }
      return res.json().then(data => {
        if (!res.ok) throw new Error(data.error || 'Authentication failed');
        return data;
      });
    })
    .then(data => {
      if (data.verificationRequired) {
        // Store verification details
        state.pendingVerificationEmail = data.email;
        
        // Hide normal auth form inputs, show OTP input fields
        const mainContainer = document.getElementById('auth-main-container');
        const otpContainer = document.getElementById('auth-otp-container');
        const otpInfo = document.getElementById('auth-otp-info');
        const modalTitle = document.getElementById('auth-modal-title');
        
        if (mainContainer) mainContainer.style.display = 'none';
        if (otpContainer) otpContainer.style.display = 'flex';
        if (modalTitle) modalTitle.textContent = 'Verify Email Address';
        if (otpInfo) {
          otpInfo.textContent = `We have sent a 6-digit confirmation code to ${data.email}. Please check your inbox and enter it below to complete your registration:`;
        }
        
        showToast('Verification Required 📩', 'Please enter the OTP code sent to your email.', 'success');
        return;
      }

      // Save credentials
      localStorage.setItem('grind_auth_token', data.token);
      localStorage.setItem('grind_user_role', data.user.role);
      
      // Update local state and flag
      state.isUserSignedIn = true;
      state.grinderName = data.user.username;
      state.subscriptionPlan = data.user.subscription_plan;
      
      if (authMode === 'signup') {
        // We are registering. Sync our current local progress up to Supabase immediately.
        syncStateWithBackend(true);
      } else {
        // We are logging in. Compare local XP and server XP.
        const localXPHigher = state.totalXP > (data.state?.totalXP || 0);
        
        if (localXPHigher) {
          showToast('Syncing Progress', 'Your offline progress has been saved to your account.', 'success');
          syncStateWithBackend(true);
        } else if (data.state) {
          // Load user state from response
          Object.keys(data.state).forEach(key => {
            state[key] = data.state[key];
          });
        }
      }
      
      // Manage Admin panel visibility
      const adminBtn = document.getElementById('btn-admin-dashboard');
      if (adminBtn) {
        adminBtn.style.display = data.user.role === 'admin' ? 'flex' : 'none';
      }

      closeModal(document.getElementById('signin-modal'));
      showToast('Authentication Successful!', `Welcome back, ${state.grinderName}! 🔥`, 'success');
      
      // Sync plan with boost states
      updateExpBoostState();
      updateUI();
      renderTasks();
      renderWorkoutView();
      renderLeaderboards();

      // Clear input fields
      if (usernameInput) usernameInput.value = '';
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';

      // Save locally
      saveLocalStorage();
    })
    .catch(err => {
      if (errorAlert) {
        errorAlert.textContent = err.message;
        errorAlert.style.display = 'block';
      }
    });
}

let isVerifyingOtp = false;
function submitOtpVerification() {
  const otpInput = document.getElementById('auth-input-otp');
  const errorAlert = document.getElementById('auth-error-alert');
  const verifyBtn = document.getElementById('auth-verify-btn');
  const email = state.pendingVerificationEmail;

  if (errorAlert) errorAlert.style.display = 'none';

  if (!email) {
    if (errorAlert) {
      errorAlert.textContent = 'No pending registration email found. Please sign up again.';
      errorAlert.style.display = 'block';
    }
    return;
  }

  const token = otpInput ? otpInput.value.trim() : '';
  if (!token || token.length < 6 || token.length > 8) {
    if (errorAlert) {
      errorAlert.textContent = 'Please enter a valid verification code (6 to 8 digits)';
      errorAlert.style.display = 'block';
    }
    return;
  }

  if (isVerifyingOtp) return;
  isVerifyingOtp = true;

  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying Code...';
  }

  fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token })
  })
    .then(res => {
      isVerifyingOtp = false;
      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify & Complete Sign Up';
      }
      return res.json().then(data => {
        if (!res.ok) throw new Error(data.error || 'Verification failed');
        return data;
      });
    })
    .then(data => {
      // Save credentials
      localStorage.setItem('grind_auth_token', data.token);
      localStorage.setItem('grind_user_role', data.user.role);
      
      // Update local state and flag
      state.isUserSignedIn = true;
      state.grinderName = data.user.username;
      state.subscriptionPlan = data.user.subscription_plan;
      
      // We are registering. Sync our current local progress up to Supabase immediately.
      syncStateWithBackend(true);
      
      // Manage Admin panel visibility
      const adminBtn = document.getElementById('btn-admin-dashboard');
      if (adminBtn) {
        adminBtn.style.display = data.user.role === 'admin' ? 'flex' : 'none';
      }

      // Hide the OTP container and show main form container for next time
      cancelOtpVerification();

      closeModal(document.getElementById('signin-modal'));
      showToast('Registration Successful!', `Welcome to Grind, ${state.grinderName}! 🔥`, 'success');
      
      // Sync plan with boost states
      updateExpBoostState();
      updateUI();
      renderTasks();
      renderWorkoutView();
      renderLeaderboards();

      // Clear input fields
      const usernameInput = document.getElementById('auth-input-username');
      const emailInput = document.getElementById('auth-input-email');
      const passwordInput = document.getElementById('auth-input-password');
      if (usernameInput) usernameInput.value = '';
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';

      // Save locally
      saveLocalStorage();
    })
    .catch(err => {
      isVerifyingOtp = false;
      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify & Complete Sign Up';
      }
      if (errorAlert) {
        errorAlert.textContent = err.message;
        errorAlert.style.display = 'block';
      }
    });
}

function cancelOtpVerification() {
  const mainContainer = document.getElementById('auth-main-container');
  const otpContainer = document.getElementById('auth-otp-container');
  const modalTitle = document.getElementById('auth-modal-title');
  const otpInput = document.getElementById('auth-input-otp');
  const errorAlert = document.getElementById('auth-error-alert');

  if (mainContainer) mainContainer.style.display = 'flex';
  if (otpContainer) otpContainer.style.display = 'none';
  if (modalTitle) modalTitle.textContent = authMode === 'signup' ? 'Create Grind Account' : 'Sign In to Grind';
  if (otpInput) otpInput.value = '';
  if (errorAlert) errorAlert.style.display = 'none';
  state.pendingVerificationEmail = null;
}

// State synchronization function
let syncDebounceTimeout = null;
function syncStateWithBackend(immediate = false) {
  const token = localStorage.getItem('grind_auth_token');
  if (!state.isUserSignedIn || !token) return;

  if (syncDebounceTimeout) clearTimeout(syncDebounceTimeout);
  
  const performSync = () => {
    fetch('/api/user/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(state)
    })
      .then(res => {
        if (!res.ok) {
          console.error('Failed to sync progress with backend server');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.updatedState) {
          // Merge updatedState back (e.g. after season reset)
          Object.keys(data.updatedState).forEach(key => {
            state[key] = data.updatedState[key];
          });
          updateUI();
          saveLocalStorage();
        }
      })
      .catch(err => {
        console.error('State sync network error:', err);
      });
  };

  if (immediate) {
    performSync();
  } else {
    syncDebounceTimeout = setTimeout(performSync, 1000); // 1s debounce
  }
}

function openSignInModal() {
  openModal(document.getElementById('signin-modal'));
  switchAuthTab('login'); // default to login
}

function updateExpBoostState() {
  if (state.subscriptionPlan === 'pro') {
    state.expBoostMultiplier = 1.5;
    state.expBoostActive = true;
  } else if (state.subscriptionPlan === 'elite') {
    state.expBoostMultiplier = 2;
    state.expBoostActive = true;
  } else if (state.subscriptionPlan === 'free') {
    if (state.adWatchedToday) {
      state.expBoostMultiplier = 1.5;
      state.expBoostActive = true;
    } else {
      state.expBoostMultiplier = 1.0;
      state.expBoostActive = false;
    }
  }
}

function openWeeklyHabitReport() {
  const reportWeeklyXp = document.getElementById('report-weekly-xp');
  const reportHabitsCount = document.getElementById('report-habits-count');
  const reportShieldsCount = document.getElementById('report-shields-count');
  
  if (reportWeeklyXp) {
    reportWeeklyXp.textContent = `${(1250 + state.totalXP).toLocaleString()} XP`;
  }
  if (reportHabitsCount) {
    const totalSessions = state.workoutCount + state.studySessionsCount + state.sleepLogsCount + state.totalWaterCount;
    reportHabitsCount.textContent = `${totalSessions} sessions logged`;
  }
  if (reportShieldsCount) {
    reportShieldsCount.textContent = state.subscriptionPlan === 'elite' ? 'Unlimited' : `${state.streakShields} Active`;
  }
  
  openModal(document.getElementById('weekly-report-modal'));
}

function applyEliteSettings() {
  const colorSelect = document.getElementById('select-username-color');
  const titleSelect = document.getElementById('select-user-title');
  const frameSelect = document.getElementById('select-user-frame');
  
  if (colorSelect) state.eliteColor = colorSelect.value;
  if (titleSelect) state.eliteTitle = titleSelect.value;
  if (frameSelect) state.eliteFrame = frameSelect.value;
  
  updateUI();
}

function saveEliteCustomization() {
  applyEliteSettings();
  closeModal(document.getElementById('elite-customization-modal'));
  showToast('Settings Saved', 'Elite profile settings updated!', 'success');
  saveLocalStorage();
  renderLeaderboards();
}

function checkDailyCompoundAchievements() {
  const todayStr = new Date().toDateString();
  
  // ID 49: Workout and study on same day
  if (state.gymCompletedToday && state.studyHours >= 4.0) {
    if (state.lastWorkoutStudySameDayDate !== todayStr) {
      state.lastWorkoutStudySameDayDate = todayStr;
      state.workoutAndStudySameDayCount = (state.workoutAndStudySameDayCount || 0) + 1;
    }
  }
  
  // ID 50: Workout, water, study before noon
  if (state.gymCompletedToday && state.waterCount >= 8 && state.studyHours >= 4.0) {
    const hr = new Date().getHours();
    if (hr < 12) {
      if (state.lastMorningRoutineDate !== todayStr) {
        state.lastMorningRoutineDate = todayStr;
        state.morningRoutineCompletedCount = (state.morningRoutineCompletedCount || 0) + 1;
      }
    }
  }

  // ID 43: Morning hydration (water before 8 AM)
  if (state.waterCount === 1) {
    const hr = new Date().getHours();
    if (hr < 8) {
      state.morningHydrationCount = (state.morningHydrationCount || 0) + 1;
    }
  }
}

function signInWithGoogle() {
  window.location.href = '/api/auth/google/login';
}

function handleGoogleAuthCallback() {
  const hash = window.location.hash;
  if (hash && hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      window.history.replaceState(null, null, window.location.pathname + window.location.search);
      
      showToast('Verifying Google Sign-In...', 'Please wait while we secure your session.', 'success');
      
      fetch('/api/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken })
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(data => {
              throw new Error(data.error || 'Google sign-in failed');
            });
          }
          return res.json();
        })
        .then(data => {
          localStorage.setItem('grind_auth_token', data.token);
          localStorage.setItem('grind_user_role', data.user.role);
          
          state.isUserSignedIn = true;
          state.grinderName = data.user.username;
          state.subscriptionPlan = data.user.subscription_plan;
          
          const localXPHigher = state.totalXP > (data.state?.totalXP || 0);
          
          if (localXPHigher) {
            showToast('Syncing Progress', 'Your local progress has been synced to your Google account.', 'success');
            syncStateWithBackend(true);
          } else if (data.state) {
            Object.keys(data.state).forEach(key => {
              state[key] = data.state[key];
            });
          }
          
          const adminBtn = document.getElementById('btn-admin-dashboard');
          if (adminBtn) {
            adminBtn.style.display = data.user.role === 'admin' ? 'flex' : 'none';
          }
          
          const overlay = document.getElementById('onboarding-overlay');
          const appContainer = document.querySelector('.app-container');
          
          const frame = document.querySelector('.onboarding-phone-frame');
          if (frame && window.originalOnboardingHTML) {
            frame.innerHTML = window.originalOnboardingHTML;
          }
          
          state.onboardingCompleted = true;
          
          // Reset splash screen progress bar
          const fill = document.getElementById('splash-loading-fill');
          if (fill) fill.style.width = '0%';
          
          // Run splash loading sequence
          startSplashSequence(() => {
            showToast('Google Sign-In Successful!', `Welcome, ${state.grinderName}! 🔥`, 'success');
            updateExpBoostState();
            updateUI();
            renderTasks();
            renderWorkoutView();
            renderLeaderboards();
            saveLocalStorage();
          });
        })
        .catch(err => {
          showToast('Sign-In Failed', err.message, 'error');
          const frame = document.querySelector('.onboarding-phone-frame');
          if (frame && window.originalOnboardingHTML) {
            frame.innerHTML = window.originalOnboardingHTML;
          }
        });
    }
  }
}

function showPlayerProfile(name, avatar, handle, lvl, xp) {
  const modal = document.getElementById('player-profile-modal');
  const modalAvatar = document.getElementById('player-modal-avatar');
  const modalName = document.getElementById('player-modal-name');
  const modalHandle = document.getElementById('player-modal-handle');
  const modalLevel = document.getElementById('player-modal-level');
  const modalXp = document.getElementById('player-modal-xp');
  
  if (modal && modalAvatar && modalName && modalHandle && modalLevel && modalXp) {
    modalAvatar.src = avatar;
    modalName.textContent = name;
    modalHandle.textContent = handle;
    modalLevel.textContent = `Lvl ${lvl}`;
    modalXp.textContent = xp.toLocaleString();
    
    const frame = document.getElementById('player-modal-avatar-frame');
    if (frame) {
      frame.style.borderColor = name.includes('Zyzz') ? '#ebd45b' : 'var(--accent-yellow)';
    }
    
    openModal(modal);
  }
}

// LEGAL MODALS (Privacy Policy & Terms)
function openLegalModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    // Scroll to top when opening
    const body = modal.querySelector('.legal-modal-body');
    if (body) body.scrollTop = 0;
  }
}

function closeLegalModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
}

function startSplashSequence(callback) {
  const overlay = document.getElementById('onboarding-overlay');
  const fill = document.getElementById('splash-loading-fill');
  const label = document.getElementById('splash-loading-text');
  const appContainer = document.querySelector('.app-container');

  if (!overlay) {
    if (callback) callback();
    return;
  }

  // Ensure overlay is visible and app is initially hidden
  overlay.classList.remove('hidden');
  if (appContainer) {
    appContainer.classList.remove('fade-in-app');
  }

  const duration = 2200; // 2.2s loading simulation
  const stepTime = 50; // update every 50ms
  const steps = duration / stepTime;
  let currentStep = 0;

  const messages = [
    { threshold: 25, text: "Initializing session..." },
    { threshold: 55, text: "Synchronizing schedule..." },
    { threshold: 80, text: "Loading profile metrics..." },
    { threshold: 99, text: "Optimizing workspace..." },
    { threshold: 100, text: "Locking in!" }
  ];

  const interval = setInterval(() => {
    currentStep++;
    const progress = Math.min((currentStep / steps) * 100, 100);
    
    if (fill) {
      fill.style.width = `${progress}%`;
    }

    if (label) {
      const msg = messages.find(m => progress <= m.threshold) || messages[messages.length - 1];
      label.textContent = msg.text;
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        // Fade out splash screen
        overlay.classList.add('hidden');
        if (appContainer) {
          appContainer.classList.add('fade-in-app');
        }
        if (callback) callback();
      }, 300); // Small delay for completed status visualization
    }
  }, stepTime);
}

function toggleWorkoutPlan() {
  const currentPlan = state.workoutPlan || 5;
  const newPlan = currentPlan === 5 ? 6 : 5;
  state.workoutPlan = newPlan;
  
  if (DOM.workoutPlanValText) {
    DOM.workoutPlanValText.textContent = newPlan === 5 ? '5 Days / Week' : '6 Days / Week';
  }
  
  initializeWorkoutSchedule();
  saveLocalStorage();
  
  // Refresh schedule UI
  renderWorkoutView();
  
  showToast('Workout Split Updated', `Your routine has been updated to the ${newPlan} Days / Week split. 🔥`, 'success');
}

// BIND TO WINDOW FOR INLINE HTML CALLS
window.closeAd = closeAd;
window.showRewardedAd = showRewardedAd;
window.openSignInModal = openSignInModal;
window.switchAuthTab = switchAuthTab;
window.submitAuthForm = submitAuthForm;
window.applyEliteSettings = applyEliteSettings;
window.saveEliteCustomization = saveEliteCustomization;
window.showAchievementDetails = showAchievementDetails;
window.triggerAchievementAction = triggerAchievementAction;
window.filterAchievements = filterAchievements;
window.signInWithGoogle = signInWithGoogle;
window.showPlayerProfile = showPlayerProfile;
window.openLegalModal = openLegalModal;
window.closeLegalModal = closeLegalModal;
window.toggleWorkoutPlan = toggleWorkoutPlan;
window.startSplashSequence = startSplashSequence;

// RUN APPLICATION
window.addEventListener('DOMContentLoaded', init);
