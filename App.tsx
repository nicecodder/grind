import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, SafeAreaView, TouchableOpacity, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './context/AppContext';
import { Theme } from './components/Theme';
import { ToastContainer } from './components/ToastContainer';
import { AdOverlay } from './components/AdOverlay';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OnboardingWizard from './screens/OnboardingWizard';
import DashboardScreen from './screens/DashboardScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminConsole from './screens/AdminConsole';

function MainAppContent() {
  const { state, userProfile, loading, switchView } = useApp();
  const [bypassLogin, setBypassLogin] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.accentYellow} />
        <Text style={styles.loadingText}>Initializing Grind...</Text>
      </View>
    );
  }

  // 1. Auth check
  const isAuthenticated = state.isUserSignedIn;

  if (!isAuthenticated && !bypassLogin) {
    if (authScreen === 'login') {
      return (
        <LoginScreen
          onNavigateToSignup={() => setAuthScreen('signup')}
          onBypass={() => setBypassLogin(true)}
        />
      );
    } else {
      return (
        <SignupScreen
          onNavigateToLogin={() => setAuthScreen('login')}
          onBypass={() => setBypassLogin(true)}
        />
      );
    }
  }

  // 2. Onboarding check
  if (!state.onboardingCompleted) {
    return <OnboardingWizard />;
  }

  // 3. Main app interface with Tab Navigation
  const renderActiveScreen = () => {
    switch (state.activeView) {
      case 'home':
        return <DashboardScreen />;
      case 'workout':
        return <WorkoutScreen />;
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'achievements':
        return <AchievementsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'admin':
        return userProfile?.role === 'admin' ? <AdminConsole /> : <DashboardScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const tabs = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'workout', label: 'Workout', icon: '🏋️' },
    { key: 'leaderboard', label: 'Arena', icon: '🏆' },
    { key: 'achievements', label: 'Quests', icon: '🥇' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ];

  // Render Admin tab if user is admin
  if (userProfile?.role === 'admin') {
    tabs.push({ key: 'admin', label: 'Admin', icon: '⚙️' });
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>

      {/* Glassmorphic Custom Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = state.activeView === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.85}
              onPress={() => switchView(tab.key)}
              style={styles.tabItem}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <View style={{ flex: 1, backgroundColor: Theme.colors.bgApp }}>
        <StatusBar style="light" />
        <MainAppContent />
        <ToastContainer />
        <AdOverlay />
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Theme.colors.bgApp,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  appContainer: {
    flex: 1,
    backgroundColor: Theme.colors.bgApp,
    paddingTop: RNStatusBar.currentHeight || 0,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: 'rgba(22, 24, 28, 0.92)',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    paddingTop: 4,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#fff',
    fontWeight: '900',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.accentYellow,
    shadowColor: Theme.colors.accentYellow,
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
