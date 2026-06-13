import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { getAsset } from '../constants/assetsMap';

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
  
  // Paywall states
  const [paywallPlan, setPaywallPlan] = useState<'pro' | 'elite'>('pro');
  const [paywallCycle, setPaywallCycle] = useState<'monthly' | 'yearly'>('monthly');
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
      return cycle === 'monthly' ? '$2.99 / mo' : '$1.99 / mo';
    } else {
      return cycle === 'monthly' ? '$4.99 / mo' : '$3.33 / mo';
    }
  };

  const getPriceDetails = (plan: 'pro' | 'elite', cycle: 'monthly' | 'yearly') => {
    if (plan === 'pro') {
      return cycle === 'monthly' ? 'Billed monthly' : 'Billed $23.88 / year';
    } else {
      return cycle === 'monthly' ? 'Billed monthly' : 'Billed $39.99 / year';
    }
  };

  const getBadgeSrc = (xp: number) => {
    if (xp < 3000) return 'badges/bronze.png';
    if (xp < 8000) return 'badges/silver.png';
    if (xp < 16000) return 'badges/gold.png';
    if (xp < 30000) return 'badges/dimond.png';
    if (xp < 50000) return 'badges/master.png';
    if (xp < 100000) return 'badges/supreme.png';
    return 'badges/ultrasupreme.png';
  };

  const getRankName = (xp: number) => {
    if (xp < 3000) return 'Bronze';
    if (xp < 8000) return 'Silver';
    if (xp < 16000) return 'Gold';
    if (xp < 30000) return 'Diamond';
    if (xp < 50000) return 'Master';
    if (xp < 100000) return 'Supreme';
    return 'Ultra Supreme';
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
          <Text style={styles.rankTitle}>
            {state.subscriptionPlan === 'elite' ? state.eliteTitle : `${getRankName(state.totalXP).toUpperCase()} GRINDER`}
          </Text>

          <View style={styles.tagsContainer}>
            <Text style={[styles.planTag, isPro && styles.planTagPro, isElite && styles.planTagElite]}>
              GRIND {state.subscriptionPlan.toUpperCase()}
            </Text>
          </View>
        </Card>

        {/* Upgrade Banner (for free users) */}
        {state.subscriptionPlan === 'free' && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => setSubModalVisible(true)}>
            <Card variant="glow" style={styles.upgradeBanner}>
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerTitle}>UPGRADE TO GRIND PRO</Text>
                <Text style={styles.bannerDesc}>
                  Ad-free, 1.5x EXP Boost, global leaderboards, and streak protection!
                </Text>
              </View>
              <Text style={styles.bannerArrow}>👑</Text>
            </Card>
          </TouchableOpacity>
        )}

        {/* User Statistics */}
        <Text style={styles.sectionTitle}>QUEST STATISTICS</Text>
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Level Rank</Text>
              <Text style={styles.statVal}>{getRankName(state.totalXP)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>XP Score</Text>
              <Text style={styles.statVal}>{state.totalXP.toLocaleString()}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Days Logged</Text>
              <Text style={styles.statVal}>{state.daysUsedCount} days</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Workouts</Text>
              <Text style={styles.statVal}>{state.workoutCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Deep Study</Text>
              <Text style={styles.statVal}>{state.totalStudyHours.toFixed(1)} hrs</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Sleep Logs</Text>
              <Text style={styles.statVal}>{state.sleepLogsCount}</Text>
            </View>
          </View>
        </Card>

        {/* Preferences Accordion list */}
        <Text style={styles.sectionTitle}>APP PREFERENCES</Text>
        <Card style={styles.prefsCard}>
          <TouchableOpacity activeOpacity={0.7} onPress={toggleUnits} style={styles.prefItem}>
            <Text style={styles.prefLabel}>Weight & Distance Units</Text>
            <Text style={styles.prefVal}>{state.units}</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={toggleTheme} style={styles.prefItem}>
            <Text style={styles.prefLabel}>Color UI Theme</Text>
            <Text style={styles.prefVal}>{state.theme}</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={toggleWorkoutSplitSetting} style={styles.prefItem}>
            <Text style={styles.prefLabel}>Hypertrophy Split Plan</Text>
            <Text style={styles.prefVal}>{state.workoutPlan} Days / Week</Text>
          </TouchableOpacity>
        </Card>

        {/* Elite customizations accordion (Elite users only) */}
        {state.subscriptionPlan === 'elite' && (
          <>
            <Text style={styles.sectionTitle}>ELITE CUSTOMIZATION</Text>
            <Card style={styles.prefsCard}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setEliteModalVisible(true)} style={styles.prefItem}>
                <Text style={[styles.prefLabel, { color: Theme.colors.accentYellow }]}>
                  Customize Elite Username & Badges
                </Text>
                <Text style={styles.prefVal}>Configure ⚙️</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* Subscription billing details */}
        {state.subscriptionPlan !== 'free' && (
          <>
            <Text style={styles.sectionTitle}>BILLING STATUS</Text>
            <Card style={styles.prefsCard}>
              <View style={styles.billingRow}>
                <View>
                  <Text style={styles.billingPlan}>Grind {state.subscriptionPlan.toUpperCase()}</Text>
                  <Text style={styles.billingSub}>
                    Active cycle: {state.billingCycle === 'monthly' ? 'Monthly auto-renew' : 'Yearly plan'}
                  </Text>
                </View>
                <Button title="Cancel plan" onPress={cancelPlan} variant="danger" style={styles.billingBtn} />
              </View>
            </Card>
          </>
        )}

        <View style={styles.actionsBox}>
          <Button title="Logout Session" onPress={signOut} variant="outline" style={styles.signoutBtn} />
        </View>
      </ScrollView>

      {/* Subscription Paywall Modal */}
      <Modal visible={subModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Unlock Grind Premium</Text>
              <TouchableOpacity onPress={() => setSubModalVisible(false)}>
                <Text style={styles.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.paywallContent} showsVerticalScrollIndicator={false}>
              {/* Billing Cycle Toggle */}
              <View style={styles.billingCycleToggle}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPaywallCycle('monthly')}
                  style={[styles.toggleBtn, paywallCycle === 'monthly' && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleBtnText, paywallCycle === 'monthly' && styles.toggleBtnTextActive]}>
                    Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPaywallCycle('yearly')}
                  style={[styles.toggleBtn, paywallCycle === 'yearly' && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleBtnText, paywallCycle === 'yearly' && styles.toggleBtnTextActive]}>
                    Yearly (Save 30%)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Plans Comparison */}
              <View style={styles.planCardRow}>
                {/* Pro Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setPaywallPlan('pro')}
                  style={[styles.paywallCard, paywallPlan === 'pro' && styles.paywallCardActive]}
                >
                  <Text style={styles.paywallPlanTitle}>GRIND PRO</Text>
                  <Text style={styles.paywallPlanPrice}>{getPrice('pro', paywallCycle)}</Text>
                  <Text style={styles.paywallPlanSub}>{getPriceDetails('pro', paywallCycle)}</Text>
                  <Text style={styles.paywallPlanDesc}>
                    ✓ Remove Ads{'\n'}✓ 1.5x EXP multiplier{'\n'}✓ 2 Streak Shields/mo{'\n'}✓ Global rankings
                  </Text>
                </TouchableOpacity>

                {/* Elite Card */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setPaywallPlan('elite')}
                  style={[styles.paywallCard, paywallPlan === 'elite' && styles.paywallCardActiveElite]}
                >
                  <Text style={styles.paywallPlanTitleElite}>GRIND ELITE</Text>
                  <Text style={styles.paywallPlanPrice}>{getPrice('elite', paywallCycle)}</Text>
                  <Text style={styles.paywallPlanSub}>{getPriceDetails('elite', paywallCycle)}</Text>
                  <Text style={styles.paywallPlanDesc}>
                    ✓ 2x EXP multiplier{'\n'}✓ Unlimited Shields{'\n'}✓ Elite titles/frames{'\n'}✓ Elite challenges
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title={buying ? "Processing Purchase..." : `Start Upgrading - ${getPrice(paywallPlan, paywallCycle)}`}
                onPress={handleUpgrade}
                loading={buying}
                disabled={buying}
                style={styles.paywallSubmitBtn}
              />

              <Button
                title={restoring ? "Restoring..." : "Restore Purchase"}
                onPress={handleRestore}
                loading={restoring}
                disabled={restoring}
                variant="outline"
                style={styles.paywallRestoreBtn}
              />
            </ScrollView>
          </Card>
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
  paywallContent: {
    gap: 16,
  },
  billingCycleToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    height: 38,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Theme.colors.bgCardHover,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  toggleBtnText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  planCardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paywallCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: 14,
    height: 220,
    justifyContent: 'space-between',
  },
  paywallCardActive: {
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.02)',
  },
  paywallCardActiveElite: {
    borderColor: Theme.colors.accentOrange,
    backgroundColor: 'rgba(255, 112, 67, 0.02)',
  },
  paywallPlanTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Theme.colors.accentYellow,
    letterSpacing: 0.5,
  },
  paywallPlanTitleElite: {
    fontSize: 14,
    fontWeight: '900',
    color: Theme.colors.accentOrange,
    letterSpacing: 0.5,
  },
  paywallPlanPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginTop: 4,
  },
  paywallPlanSub: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  paywallPlanDesc: {
    fontSize: 10.5,
    color: Theme.colors.textSecondary,
    lineHeight: 15,
  },
  paywallSubmitBtn: {
    width: '100%',
    marginTop: 8,
  },
  paywallRestoreBtn: {
    width: '100%',
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
});
export default ProfileScreen;
