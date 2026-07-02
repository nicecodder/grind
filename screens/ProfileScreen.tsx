import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useApp, getRankDetails } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { getAsset } from '../constants/assetsMap';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

export const ProfileScreen: React.FC = () => {
  const {
    state,
    userProfile,
    toggleUnits,
    toggleTheme,
    toggleWorkoutSplitSetting,
    applyEliteCustomization,
    purchasePlan,
    restorePlan,
    cancelPlan,
    signOut,
    showToast,
  } = useApp();

  const [subModalVisible, setSubModalVisible] = useState(false);
  const [eliteModalVisible, setEliteModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  
  // Paywall states
  const [paywallPlan, setPaywallPlan] = useState<'pro' | 'elite'>('pro');
  const [paywallCycle, setPaywallCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);
  const [buying, setBuying] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Elite customization states
  const [eliteColor, setEliteColor] = useState(state.eliteColor || '#ebd45b');
  const [eliteTitle, setEliteTitle] = useState(state.eliteTitle || 'AESTHETIC DEITY');
  const [eliteFrame, setEliteFrame] = useState(state.eliteFrame || 'none');

  const handleUpgrade = async () => {
    setBuying(true);
    try {
      await purchasePlan(paywallPlan, paywallCycle);
      setSubModalVisible(false);
    } catch (e) {
      // toast shown in context
    } finally {
      setBuying(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restorePlan();
      setSubModalVisible(false);
    } catch (e) {
      // toast shown in context
    } finally {
      setRestoring(false);
    }
  };

  const handleSaveElite = () => {
    applyEliteCustomization(eliteColor, eliteTitle, eliteFrame);
    setEliteModalVisible(false);
  };

  const getPrice = (plan: 'pro' | 'elite', cycle: 'monthly' | 'yearly') => {
    if (plan === 'pro') {
      return cycle === 'monthly' ? '$9.99' : '$4.99/mo';
    } else {
      return cycle === 'monthly' ? '$14.99' : '$7.49/mo';
    }
  };

  const getPriceDetails = (plan: 'pro' | 'elite', cycle: 'monthly' | 'yearly') => {
    if (plan === 'pro') {
      return cycle === 'monthly' ? 'Billed monthly' : 'Billed $59.99 / year';
    } else {
      return cycle === 'monthly' ? 'Billed monthly' : 'Billed $89.99 / year';
    }
  };

  const getBadgeSrc = (xp: number) => {
    return getRankDetails(xp).badge;
  };

  const getRankName = (xp: number) => {
    return getRankDetails(xp).name;
  };

  const getFrameStyle = (frame: string) => {
    switch (frame) {
      case 'gold-frame':
        return { borderColor: '#ebd45b', borderWidth: 3, shadowColor: '#ebd45b', shadowOpacity: 0.4, shadowRadius: 8 };
      case 'neon-frame':
        return { borderColor: '#00e676', borderWidth: 3, shadowColor: '#00e676', shadowOpacity: 0.4, shadowRadius: 8 };
      case 'cyber-frame':
        return { borderColor: '#2979ff', borderWidth: 3, shadowColor: '#2979ff', shadowOpacity: 0.4, shadowRadius: 8 };
      default:
        return { borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5 };
    }
  };

  const isElite = state.subscriptionPlan === 'elite';
  const isPro = state.subscriptionPlan === 'pro';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Profile Card details */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarCircle, getFrameStyle(state.subscriptionPlan === 'elite' ? state.eliteFrame : 'none')]}>
              <Image source={getAsset(state.avatarUrl)} style={styles.avatarImg as any} />
            </View>
            <View style={styles.badgeOverlay}>
              <Image source={getAsset(getBadgeSrc(state.totalXP))} style={styles.overlayBadgeImg as any} />
            </View>
          </View>

          <Text style={[styles.displayName, state.subscriptionPlan === 'elite' && { color: state.eliteColor }]}>
            {state.grinderName}
          </Text>
          <Text style={styles.rankSubText}>
            {state.subscriptionPlan === 'elite' ? state.eliteTitle : `${getRankName(state.totalXP).toUpperCase()} GRINDER`} • JOINED 2024
          </Text>
        </Card>

        {/* 3-Column Stats Row */}
        <View style={styles.statsRowContainer}>
          <Card style={styles.statBoxCard}>
            <Text style={styles.statBoxVal}>{state.streak}</Text>
            <Text style={styles.statBoxLabel}>STREAK</Text>
          </Card>
          <Card style={styles.statBoxCard}>
            <Text style={styles.statBoxVal}>{state.totalXP.toLocaleString()}</Text>
            <Text style={styles.statBoxLabel}>TOTAL XP</Text>
          </Card>
          <Card style={styles.statBoxCard}>
            <Text style={styles.statBoxVal}>{state.perfectDaysCount || 0}</Text>
            <Text style={styles.statBoxLabel}>PRs</Text>
          </Card>
        </View>

        {/* Upgrade Banner (for free users) */}
        {state.subscriptionPlan === 'free' && (
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => setSubModalVisible(true)}
            style={styles.joinProCard}
          >
            {/* Absolute positioned background sparkles to match visual texture */}
            <View style={{ position: 'absolute', top: 12, right: 20, opacity: 0.3 }}>
              <Svg viewBox="0 0 24 24" width="10" height="10" color="#fff">
                <Path d="M12 2c0 5.523 4.477 10 10 10-5.523 0-10 4.477-10 10 0-5.523-4.477-10-10-10 5.523 0 10-4.477 10-10z" fill="currentColor" />
              </Svg>
            </View>
            <View style={{ position: 'absolute', bottom: 12, left: 40, opacity: 0.2 }}>
              <Svg viewBox="0 0 24 24" width="8" height="8" color="#fff">
                <Path d="M12 2c0 5.523 4.477 10 10 10-5.523 0-10 4.477-10 10 0-5.523-4.477-10-10-10 5.523 0 10-4.477 10-10z" fill="currentColor" />
              </Svg>
            </View>
            <View style={{ position: 'absolute', bottom: 14, right: 30, opacity: 0.25 }}>
              <Svg viewBox="0 0 24 24" width="12" height="12" color="#fff">
                <Path d="M12 2c0 5.523 4.477 10 10 10-5.523 0-10 4.477-10 10 0-5.523-4.477-10-10-10 5.523 0 10-4.477 10-10z" fill="currentColor" />
              </Svg>
            </View>

            <View style={styles.joinProCardLeft}>
              <Svg viewBox="0 0 24 24" width="28" height="28" color="#fff">
                <Path d="M12 2c0 5.523 4.477 10 10 10-5.523 0-10 4.477-10 10 0-5.523-4.477-10-10-10 5.523 0 10-4.477 10-10z" fill="currentColor" />
              </Svg>
              <View style={styles.joinProCardText}>
                <Text style={styles.joinProTitle}>Join Pro</Text>
                <Text style={styles.joinProSubtitle}>Subscription or one-time purchase</Text>
              </View>
            </View>

            <View style={styles.upgradePill}>
              <View style={styles.arrowCircle}>
                <Text style={styles.arrowText}>↑</Text>
              </View>
              <Text style={styles.upgradeText}>Upgrade</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Account Section */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <Card style={styles.prefsCard}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => showToast('Account Settings', 'Personal Information settings are managed in your secure profile dashboard.', 'success')} 
            style={styles.prefItem}
          >
            <View style={styles.prefItemLeft}>
              <View style={styles.iconCircleYellow}>
                <Svg viewBox="0 0 24 24" width="18" height="18" color="#ebd45b">
                  <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <Circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </Svg>
              </View>
              <Text style={styles.prefLabel}>Personal Information</Text>
            </View>
            <Svg viewBox="0 0 24 24" width="16" height="16" color={Theme.colors.textSecondary}>
              <Path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => showToast('Security Settings', 'Email and passwords are encrypted and managed in Supabase Auth.', 'success')} 
            style={styles.prefItem}
          >
            <View style={styles.prefItemLeft}>
              <View style={styles.iconCircleYellow}>
                <Svg viewBox="0 0 24 24" width="18" height="18" color="#ebd45b">
                  <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <Path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <Text style={styles.prefLabel}>Email & Security</Text>
            </View>
            <Svg viewBox="0 0 24 24" width="16" height="16" color={Theme.colors.textSecondary}>
              <Path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setSubModalVisible(true)} 
            style={[styles.prefItem, { borderBottomWidth: 0 }]}
          >
            <View style={styles.prefItemLeft}>
              <View style={styles.iconCircleYellow}>
                <Svg viewBox="0 0 24 24" width="18" height="18" color="#ebd45b">
                  <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <Line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
                </Svg>
              </View>
              <Text style={styles.prefLabel}>Subscription Plan</Text>
            </View>
            <View style={styles.prefItemRight}>
              <Text style={[styles.prefVal, { color: Theme.colors.accentYellow }]}>
                {state.subscriptionPlan.toUpperCase()}
              </Text>
              <Svg viewBox="0 0 24 24" width="16" height="16" color={Theme.colors.textSecondary}>
                <Path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <Card style={styles.prefsCard}>
          <TouchableOpacity activeOpacity={0.7} onPress={toggleUnits} style={styles.prefItem}>
            <View style={styles.prefItemLeft}>
              <View style={styles.iconCircleYellow}>
                <Svg viewBox="0 0 24 24" width="18" height="18" color="#ebd45b">
                  <Path d="M5 3h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <Path d="M3 8h3M3 12h5M3 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </Svg>
              </View>
              <Text style={styles.prefLabel}>Units of Measure</Text>
            </View>
            <View style={styles.prefItemRight}>
              <Text style={styles.prefVal}>{state.units}</Text>
              <Svg viewBox="0 0 24 24" width="16" height="16" color={Theme.colors.textSecondary}>
                <Path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={toggleTheme} style={styles.prefItem}>
            <View style={styles.prefItemLeft}>
              <View style={styles.iconCircleYellow}>
                <Svg viewBox="0 0 24 24" width="18" height="18" color="#ebd45b">
                  <Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <Path d="M12 2a10 10 0 0 0 0 20V2z" fill="currentColor"/>
                </Svg>
              </View>
              <Text style={styles.prefLabel}>App Theme</Text>
            </View>
            <View style={styles.prefItemRight}>
              <Text style={styles.prefVal}>{state.theme}</Text>
              <Svg viewBox="0 0 24 24" width="16" height="16" color={Theme.colors.textSecondary}>
                <Path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </View>
          </TouchableOpacity>

          {/* Workout split control row */}
          <View style={styles.prefItemRow}>
            <View style={styles.prefItemLeft}>
              <View style={styles.iconCircleYellow}>
                <Svg viewBox="0 0 24 24" width="18" height="18" color="#ebd45b">
                  <Path d="M18 4h2v16h-2zM4 4h2v16H4zM6 11h12M2 8h2v8H2zM20 8h2v8h-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </Svg>
              </View>
              <Text style={styles.prefLabel}>Workout Split Plan</Text>
            </View>
            <View style={styles.splitSelector}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => state.workoutPlan !== 5 && toggleWorkoutSplitSetting()}
                style={[styles.splitBtn, state.workoutPlan === 5 && styles.splitBtnActive]}
              >
                <Text style={[styles.splitBtnText, state.workoutPlan === 5 && styles.splitBtnTextActive]}>5 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => state.workoutPlan !== 6 && toggleWorkoutSplitSetting()}
                style={[styles.splitBtn, state.workoutPlan === 6 && styles.splitBtnActive]}
              >
                <Text style={[styles.splitBtnText, state.workoutPlan === 6 && styles.splitBtnTextActive]}>6 Days</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.7} onPress={() => setPrivacyModalVisible(true)} style={styles.prefItem}>
            <View style={styles.prefItemLeft}>
              <View style={styles.iconCircleYellow}>
                <Svg viewBox="0 0 24 24" width="18" height="18" color="#ebd45b">
                  <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </Svg>
              </View>
              <Text style={styles.prefLabel}>Privacy Policy</Text>
            </View>
            <Svg viewBox="0 0 24 24" width="16" height="16" color={Theme.colors.textSecondary}>
              <Path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => setTermsModalVisible(true)} style={styles.prefItem}>
            <View style={styles.prefItemLeft}>
              <View style={styles.iconCircleYellow}>
                <Svg viewBox="0 0 24 24" width="18" height="18" color="#ebd45b">
                  <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </Svg>
              </View>
              <Text style={styles.prefLabel}>Terms & Conditions</Text>
            </View>
            <Svg viewBox="0 0 24 24" width="16" height="16" color={Theme.colors.textSecondary}>
              <Path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </TouchableOpacity>

          {/* Red logout button inline at last */}
          <TouchableOpacity activeOpacity={0.7} onPress={signOut} style={[styles.prefItem, { borderBottomWidth: 0 }]}>
            <View style={styles.prefItemLeft}>
              <View style={styles.iconCircleRed}>
                <Svg viewBox="0 0 24 24" width="18" height="18" color={Theme.colors.danger}>
                  <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
              </View>
              <Text style={[styles.prefLabel, { color: Theme.colors.danger }]}>Sign Out</Text>
            </View>
            <Svg viewBox="0 0 24 24" width="16" height="16" color={Theme.colors.danger}>
              <Path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Redesigned Subscription Paywall Modal */}
      <Modal visible={subModalVisible} transparent animationType="slide">
        <View style={styles.paywallModalBackdrop}>
          <View style={styles.paywallContainer}>
            {/* Close button in top right */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setSubModalVisible(false)} 
              style={styles.paywallCloseBtn}
            >
              <Text style={styles.paywallCloseText}>×</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.paywallContent} showsVerticalScrollIndicator={false}>
              {/* Circular Logo */}
              <View style={styles.paywallLogoCircle}>
                <View style={styles.paywallLogoGreenBorder}>
                  <Svg viewBox="0 0 24 24" width="28" height="28" color="#00e676">
                    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c3.31 0 6.24-1.61 8.06-4.09l-2.6-1.5C16.14 18.11 14.21 19 12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7c1.93 0 3.68.79 4.95 2.05L14 10h8V2l-2.95 2.95C17.47 3.25 14.87 2 12 2z" fill="currentColor" />
                  </Svg>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.paywallTitle}>Try Grind Premium for free</Text>

              {/* Features List */}
              <View style={styles.paywallFeaturesList}>
                <View style={styles.paywallFeatureItem}>
                  <Text style={styles.paywallFeatureCheck}>✓</Text>
                  <Text style={styles.paywallFeatureText}>Remove all banner and video ads</Text>
                </View>
                <View style={styles.paywallFeatureItem}>
                  <Text style={styles.paywallFeatureCheck}>✓</Text>
                  <Text style={styles.paywallFeatureText}>Boost points with 1.5x / 2.0x EXP multipliers</Text>
                </View>
                <View style={styles.paywallFeatureItem}>
                  <Text style={styles.paywallFeatureCheck}>✓</Text>
                  <Text style={styles.paywallFeatureText}>Streak Shields to forgive missed days</Text>
                </View>
                <View style={styles.paywallFeatureItem}>
                  <Text style={styles.paywallFeatureCheck}>✓</Text>
                  <Text style={styles.paywallFeatureText}>Elite customization frames & global rankings</Text>
                </View>
              </View>

              {/* Cycle Slider Selector */}
              <View style={styles.slidingCycleSelector}>
                <TouchableOpacity 
                  activeOpacity={0.85}
                  onPress={() => setPaywallCycle('monthly')}
                  style={[styles.slidingTab, paywallCycle === 'monthly' && styles.slidingTabActive]}
                >
                  <Text style={[styles.slidingTabText, paywallCycle === 'monthly' && styles.slidingTabTextActive]}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  activeOpacity={0.85}
                  onPress={() => setPaywallCycle('yearly')}
                  style={[styles.slidingTab, paywallCycle === 'yearly' && styles.slidingTabActive]}
                >
                  <Text style={[styles.slidingTabText, paywallCycle === 'yearly' && styles.slidingTabTextActive]}>Annual (Save 50%)</Text>
                </TouchableOpacity>
              </View>

              {/* Option 1: Grind Pro */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setPaywallPlan('pro')}
                style={[styles.paywallRadioCard, paywallPlan === 'pro' && styles.paywallRadioCardActive]}
              >
                <View style={styles.radioCardLeft}>
                  <Text style={styles.radioCardTitle}>Grind Pro</Text>
                  <Text style={styles.radioCardSubtitle}>
                    {paywallCycle === 'yearly' ? 'Crossed rate $119.88' : 'Billed monthly'}
                  </Text>
                </View>
                <View style={styles.radioCardRight}>
                  <Text style={styles.radioCardPrice}>
                    {paywallCycle === 'yearly' ? '$4.99 / Month' : '$9.99 / Month'}
                  </Text>
                  <View style={styles.radioOutlineCircle}>
                    {paywallPlan === 'pro' && <View style={styles.radioFillCircle} />}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Option 2: Grind Elite */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setPaywallPlan('elite')}
                style={[styles.paywallRadioCard, paywallPlan === 'elite' && styles.paywallRadioCardActive, { marginTop: 18 }]}
              >
                {/* Save 50% badge overlapping top-left */}
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>SAVE 50%</Text>
                </View>

                <View style={styles.radioCardLeft}>
                  <Text style={styles.radioCardTitle}>Grind Elite</Text>
                  <Text style={styles.radioCardSubtitle}>
                    {paywallCycle === 'yearly' ? 'Crossed rate $179.88' : 'Billed monthly'}
                  </Text>
                </View>
                <View style={styles.radioCardRight}>
                  <Text style={styles.radioCardPrice}>
                    {paywallCycle === 'yearly' ? '$7.49 / Month' : '$14.99 / Month'}
                  </Text>
                  <View style={styles.radioOutlineCircle}>
                    {paywallPlan === 'elite' && <View style={styles.radioFillCircle} />}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Free Trial Switch */}
              <View style={styles.trialToggleRow}>
                <Text style={styles.trialToggleLabel}>Free trial enabled</Text>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setFreeTrialEnabled(!freeTrialEnabled)}
                  style={[styles.switchContainer, freeTrialEnabled && styles.switchContainerActive]}
                >
                  <View style={[styles.switchCircle, freeTrialEnabled && styles.switchCircleActive]} />
                </TouchableOpacity>
              </View>

              {/* Yellow Call to Action Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleUpgrade}
                disabled={buying}
                style={styles.yellowCTAButton}
              >
                <Text style={styles.yellowCTAText}>
                  {buying ? "Upgrading..." : freeTrialEnabled ? "Start 7-day Free Trial" : "Upgrade Now"}
                </Text>
              </TouchableOpacity>

              {/* Footer text */}
              <Text style={styles.paywallFooterCancelText}>Cancel anytime</Text>

              {/* Restore Purchases */}
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={handleRestore}
                disabled={restoring}
                style={{ marginTop: 16, alignSelf: 'center' }}
              >
                <Text style={styles.restoreTextBtn}>
                  {restoring ? "Restoring..." : "Restore Purchase"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Elite Customizer Modal */}
      <Modal visible={eliteModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Elite Customizer Settings</Text>
              <TouchableOpacity onPress={() => setEliteModalVisible(false)}>
                <Text style={styles.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.eliteForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Custom User Title</Text>
                <TextInput
                  style={styles.formInput}
                  value={eliteTitle}
                  onChangeText={setEliteTitle}
                  placeholder="e.g. SHREDDED BEAST"
                  placeholderTextColor={Theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Username Hex Color Accent</Text>
                <TextInput
                  style={styles.formInput}
                  value={eliteColor}
                  onChangeText={setEliteColor}
                  placeholder="#ebd45b"
                  placeholderTextColor={Theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Aesthetic Profile Frame</Text>
                <View style={styles.frameOptionRow}>
                  {['none', 'gold-frame', 'neon-frame', 'cyber-frame'].map((frame) => (
                    <TouchableOpacity
                      key={frame}
                      activeOpacity={0.8}
                      onPress={() => setEliteFrame(frame)}
                      style={[styles.frameOption, eliteFrame === frame && styles.frameOptionActive]}
                    >
                      <Text style={[styles.frameOptionText, eliteFrame === frame && styles.frameOptionTextActive]}>
                        {frame.replace('-frame', '').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button title="Save Customizations" onPress={handleSaveElite} style={styles.saveEliteBtn} />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal visible={privacyModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                <Text style={styles.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.legalScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.legalText}>
                Last Updated: June 2026{"\n\n"}
                Grind is committed to protecting your privacy. This Privacy Policy details how we handle your user profile data, workout splits, study logs, steps tracking, and other discipline records.{"\n\n"}
                1. Data Storage{"\n"}
                We store your data locally on your device using AsyncStorage. If you choose to sync your account, your user state and profile details are securely backed up using Supabase.{"\n\n"}
                2. Data Sharing{"\n"}
                Grind does not sell, trade, or otherwise transfer your personally identifiable information to outside parties. Your data is strictly used to provide the XP gamification and tracking features within the application.{"\n\n"}
                3. Consent{"\n"}
                By using the Grind application, you consent to this privacy policy. We reserve the right to modify this policy at any time, with updates reflected on this page.
              </Text>
            </ScrollView>
            <Button title="Close" onPress={() => setPrivacyModalVisible(false)} style={{ marginTop: 12 }} />
          </Card>
        </View>
      </Modal>

      {/* Terms and Conditions Modal */}
      <Modal visible={termsModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
                <Text style={styles.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.legalScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.legalText}>
                Last Updated: June 2026{"\n\n"}
                Welcome to Grind. By accessing or using our mobile application, you agree to comply with and be bound by these Terms and Conditions.{"\n\n"}
                1. User Account & Conduct{"\n"}
                You are responsible for maintaining the confidentiality of your credentials and account information. You agree to use the gamified tracking elements (such as steps, sleep, and workouts) in an honest and fair manner.{"\n\n"}
                2. Gamification & Disclaimer{"\n"}
                The level rankings, XP scores, and virtual achievements are intended solely for personal motivation and self-improvement purposes. All fitness, nutrition, and study challenges are suggestive, and you should consult a doctor before starting any intense physical routine.{"\n\n"}
                3. Limitation of Liability{"\n"}
                Grind and its developers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the application.
              </Text>
            </ScrollView>
            <Button title="Close" onPress={() => setTermsModalVisible(false)} style={{ marginTop: 12 }} />
          </Card>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgApp,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    height: 100,
    width: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#16181c',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBadgeImg: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  rankTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  planTag: {
    fontSize: 10,
    fontWeight: '900',
    color: Theme.colors.textSecondary,
    backgroundColor: '#24272c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  planTagPro: {
    backgroundColor: Theme.colors.accentYellow,
    color: '#0b0c0e',
  },
  planTagElite: {
    backgroundColor: Theme.colors.accentOrange,
    color: '#0b0c0e',
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.02)',
    marginBottom: 24,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Theme.colors.accentYellow,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
  },
  bannerArrow: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginVertical: 14,
  },
  prefsCard: {
    paddingVertical: 6,
    marginBottom: 24,
  },
  prefItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  prefLabel: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  prefVal: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billingPlan: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  billingSub: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  billingBtn: {
    height: 36,
    paddingHorizontal: 14,
  },
  actionsBox: {
    marginTop: 10,
  },
  signoutBtn: {
    width: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
    paddingBottom: 12,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  closeBtn: {
    fontSize: 24,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  eliteForm: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.2,
  },
  formInput: {
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 13.5,
    fontWeight: '600',
  },
  frameOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frameOption: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  frameOptionActive: {
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.04)',
  },
  frameOptionText: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
  },
  frameOptionTextActive: {
    color: '#fff',
  },
  saveEliteBtn: {
    width: '100%',
    marginTop: 10,
  },
  rankSubText: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statsRowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  statBoxCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#16181c',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBoxVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Theme.colors.accentYellow,
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.8,
  },
  prefItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prefItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleYellow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(235, 212, 91, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(234, 67, 53, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1.2,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  splitSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 3,
  },
  splitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitBtnActive: {
    backgroundColor: Theme.colors.accentYellow,
  },
  splitBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  splitBtnTextActive: {
    color: '#050607',
    fontWeight: '900',
  },
  legalScroll: {
    maxHeight: 250,
    marginVertical: 12,
    paddingRight: 4,
  },
  legalText: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    lineHeight: 18.5,
  },
  joinProCard: {
    backgroundColor: '#d84315', // premium rich deep orange
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#d84315',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  joinProCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  joinProCardText: {
    flex: 1,
  },
  joinProTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  joinProSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  upgradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
  },
  arrowCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#d84315',
    lineHeight: 13,
  },
  upgradeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  paywallModalBackdrop: {
    flex: 1,
    backgroundColor: '#0c0d10', // extremely dark premium space gray
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  paywallContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#121318',
    borderRadius: 24,
    padding: 20,
    position: 'relative',
  },
  paywallCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paywallCloseText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  paywallContent: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 40,
  },
  paywallLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
  },
  paywallLogoGreenBorder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#00e676',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paywallTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  paywallFeaturesList: {
    width: '100%',
    marginBottom: 30,
    gap: 12,
  },
  paywallFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  paywallFeatureCheck: {
    color: '#f5a623', // yellow/orange checkmark
    fontSize: 16,
    fontWeight: '900',
  },
  paywallFeatureText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
  },
  slidingCycleSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 24,
    padding: 4,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  slidingTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  slidingTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  slidingTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
  },
  slidingTabTextActive: {
    color: '#fff',
  },
  paywallRadioCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1b1c21',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: '100%',
    position: 'relative',
  },
  paywallRadioCardActive: {
    borderColor: '#ebd45b', // highlight yellow
    backgroundColor: 'rgba(235, 212, 91, 0.02)',
  },
  radioCardLeft: {
    flexDirection: 'column',
    gap: 4,
  },
  radioCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  radioCardSubtitle: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  radioCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCardPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#fff',
  },
  radioOutlineCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioFillCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ebd45b',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#e64a19',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 5,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
  },
  trialToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  trialToggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  switchContainer: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2c2d35',
    padding: 2,
    justifyContent: 'center',
  },
  switchContainerActive: {
    backgroundColor: '#ebd45b',
  },
  switchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  switchCircleActive: {
    transform: [{ translateX: 20 }],
  },
  yellowCTAButton: {
    backgroundColor: '#ebd45b',
    borderRadius: 24,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ebd45b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  yellowCTAText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '900',
  },
  paywallFooterCancelText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 14,
    textAlign: 'center',
  },
  restoreTextBtn: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
export default ProfileScreen;
