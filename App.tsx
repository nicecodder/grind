import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, SafeAreaView, TouchableOpacity, Image, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './context/AppContext';
import { Theme } from './components/Theme';
import { ToastContainer } from './components/ToastContainer';
import { AdOverlay } from './components/AdOverlay';
import Svg, { Circle, Path } from 'react-native-svg';

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
import ScannerScreen from './screens/ScannerScreen';
import { getAsset } from './constants/assetsMap';

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
      case 'scanner':
        return <ScannerScreen />;
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
    { key: 'home', label: 'Home', icon: 'Icons/nav_home.png' },
    { key: 'workout', label: 'Workout', icon: 'Icons/nav_dumbbell.png' },
    { key: 'scanner', label: 'Scanner', icon: 'Icons/nav_scan.png' },
    { key: 'profile', label: 'Profile', icon: 'Icons/nav_profile.png' },
  ];

  // Render Admin tab if user is admin
  if (userProfile?.role === 'admin') {
    tabs.push({ key: 'admin', label: 'Admin', icon: '⚙️' });
  }

  const showHeader = state.isUserSignedIn && state.onboardingCompleted;

  return (
    <SafeAreaView style={styles.appContainer}>
      {showHeader && (
        <View style={styles.globalHeader}>
          <View style={styles.headerLeft}>
            {state.activeView !== 'home' && (
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => switchView('home')} 
                style={styles.headerBackBtn}
              >
                <Svg viewBox="0 0 24 24" width="20" height="20" color={Theme.colors.accentYellow}>
                  <Path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </TouchableOpacity>
            )}
            <Image source={getAsset('logo')} style={styles.logoImg} />
            <Text style={styles.headerBrandText}>Grind</Text>
          </View>
          <View style={styles.headerRight}>
            {!state.isUserSignedIn && (
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => setBypassLogin(false)} 
                style={styles.signInHeaderBtn}
              >
                <Text style={styles.signInHeaderText}>Sign In</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => switchView('profile')} 
              style={styles.settingsBtn}
            >
              <Svg viewBox="0 0 24 24" width="22" height="22" color={Theme.colors.textSecondary}>
                <Circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>

      {/* Glassmorphic Custom Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = state.activeView === tab.key;
          const isEmoji = typeof tab.icon === 'string' && !tab.icon.endsWith('.png');
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.85}
              onPress={() => switchView(tab.key)}
              style={styles.tabItem}
            >
              {isEmoji ? (
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                  {tab.icon}
                </Text>
              ) : (
                <Image
                  source={getAsset(tab.icon)}
                  style={[styles.tabIconImage, isActive && styles.tabIconImageActive]}
                  resizeMode="contain"
                />
              )}
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
  globalHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#050607',
    borderBottomWidth: 1.2,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBackBtn: {
    marginRight: 6,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImg: {
    height: 28,
    width: 28,
    resizeMode: 'contain',
  },
  headerBrandText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  settingsBtn: {
    padding: 6,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signInHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1.2,
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.05)',
  },
  signInHeaderText: {
    color: Theme.colors.accentYellow,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  },
  tabIcon: {
    fontSize: 26,
    opacity: 0.75,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabIconImage: {
    width: 28,
    height: 28,
    opacity: 0.75,
  },
  tabIconImageActive: {
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
