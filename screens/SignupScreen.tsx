import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Button } from '../components/Button';
import { getAsset } from '../constants/assetsMap';

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  onBypass: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigateToLogin, onBypass }) => {
  const { signUp, showToast } = useApp();
  
  // Registration state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password) {
      showToast('Input Required', 'Please fill in username, email, and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp(username.trim(), email.trim(), password);
      if (res.verificationRequired) {
        showToast('Verification Required ✉️', 'Please check your email and verify your account to sign in.', 'success');
        onNavigateToLogin();
      } else {
        showToast('Account Created! 🔥', 'Welcome to Grind.');
      }
    } catch (err: any) {
      showToast('Registration Failed', err.message || 'Error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.logoGroup}>
          <Image source={getAsset('logo')} style={styles.logo as any} resizeMode="contain" />
          <Text style={styles.brandText}>GRIND</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Unlock global leaderboards and quests.</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Grinder Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. iron_beast"
              placeholderTextColor={Theme.colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={Theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Min 6 characters"
              placeholderTextColor={Theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            style={styles.submitBtn}
          />
          
          <Button
            title="Use Locally"
            onPress={onBypass}
            variant="outline"
            style={styles.bypassBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
            <Text style={styles.loginText}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgApp,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  logo: {
    height: 44,
    width: 44,
  },
  brandText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    backgroundColor: Theme.colors.bgCard,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  inputCode: {
    height: 54,
    backgroundColor: Theme.colors.bgCard,
    borderWidth: 1.5,
    borderColor: Theme.colors.accentYellow,
    borderRadius: Theme.borderRadius.md,
    color: Theme.colors.accentYellow,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
  submitBtn: {
    marginTop: 10,
    width: '100%',
  },
  bypassBtn: {
    marginTop: 12,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  loginText: {
    fontSize: 13,
    color: Theme.colors.accentYellow,
    fontWeight: '800',
  },
});
export default SignupScreen;
