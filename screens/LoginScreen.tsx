import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Button } from '../components/Button';
import { getAsset } from '../constants/assetsMap';

interface LoginScreenProps {
  onNavigateToSignup: () => void;
  onBypass: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignup, onBypass }) => {
  const { signIn, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showToast('Input Required', 'Please fill in both email and password fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      showToast('Welcome Back! 🔥', 'Your progress is synchronized.');
    } catch (err: any) {
      showToast('Authentication Failed', err.message || 'Invalid credentials.', 'error');
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

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to secure your streak and access the Arena.</Text>

        <View style={styles.form}>
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
              placeholder="••••••••"
              placeholderTextColor={Theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            title="Log In to Account"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />
          
          <Button
            title="Continue Offline (Bypass)"
            onPress={onBypass}
            variant="outline"
            style={styles.bypassBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Grind?</Text>
          <TouchableOpacity onPress={onNavigateToSignup} activeOpacity={0.7}>
            <Text style={styles.signupText}> Create Account</Text>
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
    marginBottom: 32,
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
    marginBottom: 32,
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
  signupText: {
    fontSize: 13,
    color: Theme.colors.accentYellow,
    fontWeight: '800',
  },
});
export default LoginScreen;
