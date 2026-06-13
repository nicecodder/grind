import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getAsset } from '../constants/assetsMap';

export const OnboardingWizard: React.FC = () => {
  const {
    state,
    selectGender,
    selectAvatar,
    selectWorkoutPlan,
    updateOnboardingStep,
    finishOnboarding,
    showToast,
  } = useApp();

  const [name, setName] = useState(state.grinderName || '');

  const nextStep = () => {
    if (state.onboardingStep === 3) {
      if (!name.trim()) {
        showToast('Name Required', 'Please enter your grinder name to proceed.', 'error');
        return;
      }
    }
    updateOnboardingStep(state.onboardingStep + 1);
  };

  const prevStep = () => {
    if (state.onboardingStep > 1) {
      updateOnboardingStep(state.onboardingStep - 1);
    }
  };

  const handleFinish = () => {
    finishOnboarding(name.trim());
  };

  const renderStepContent = () => {
    switch (state.onboardingStep) {
      case 1: // Gender Selection
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Select your gender split</Text>
            <Text style={styles.desc}>This helps optimize your strength target calibrations.</Text>
            
            <View style={styles.row}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.genderCard, state.gender === 'male' && styles.genderSelected]}
                onPress={() => selectGender('male')}
              >
                <Text style={styles.emoji}>🏋️‍♂️</Text>
                <Text style={styles.genderTitle}>MALE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.genderCard, state.gender === 'female' && styles.genderSelected]}
                onPress={() => selectGender('female')}
              >
                <Text style={styles.emoji}>🏋️‍♀️</Text>
                <Text style={styles.genderTitle}>FEMALE</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 2: // Avatar Selection
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Choose your avatar</Text>
            <Text style={styles.desc}>This represents you on the global leaderboards.</Text>
            
            <View style={styles.avatarRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.avatarCard, state.avatarIndex === 0 && styles.avatarSelected]}
                onPress={() => selectAvatar(0)}
              >
                <Image
                  source={getAsset('avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png')}
                  style={styles.avatarImg}
                />
                <Text style={styles.avatarLabel}>Aesthetic Grinder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.avatarCard, state.avatarIndex === 1 && styles.avatarSelected]}
                onPress={() => selectAvatar(1)}
              >
                <Image
                  source={getAsset('avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png')}
                  style={styles.avatarImg}
                />
                <Text style={styles.avatarLabel}>Titan Lifter</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3: // Name Selection
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>What's your grinder name?</Text>
            <Text style={styles.desc}>This will be displayed as your profile name.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="e.g. David Laid"
              placeholderTextColor={Theme.colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={15}
            />
          </View>
        );

      case 4: // Split Choice
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Choose your training split</Text>
            <Text style={styles.desc}>Select how many days you commit to hit the iron.</Text>
            
            <View style={styles.splitList}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.splitCard, state.workoutPlan === 5 && styles.splitSelected]}
                onPress={() => selectWorkoutPlan(5)}
              >
                <View style={styles.splitHeader}>
                  <Text style={styles.splitTitle}>5-Day Split</Text>
                  <Text style={styles.splitTag}>Push/Pull/Legs</Text>
                </View>
                <Text style={styles.splitDesc}>
                  Highly recommended for recovery and balanced hypertrophy. Includes Push, Pull, Legs, and rest days.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.splitCard, state.workoutPlan === 6 && styles.splitSelected]}
                onPress={() => selectWorkoutPlan(6)}
              >
                <View style={styles.splitHeader}>
                  <Text style={styles.splitTitle}>6-Day Power Split</Text>
                  <Text style={styles.splitTag}>Power/Hypertrophy</Text>
                </View>
                <Text style={styles.splitDesc}>
                  For dedicated lifters looking to maximize intensity and force. 6 active days, 1 rest day.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 5: // Notifications Opt-in
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Enable daily reminders?</Text>
            <Text style={styles.desc}>Lock in and never miss a habit rollover check. Reminders keep the streaks alive.</Text>
            
            <View style={styles.remindersCard}>
              <Text style={styles.bellIcon}>🔔</Text>
              <Text style={styles.remindersText}>
                Daily notifications to remind you to log sleep, steps, water, workouts, and study sessions.
              </Text>
            </View>
          </View>
        );

      case 6: // Review and Lock in
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Ready to lock in?</Text>
            <Text style={styles.desc}>Double check your setup options. We are setting up your routines.</Text>
            
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Grinder:</Text>
                <Text style={styles.summaryVal}>{name || 'Athlete'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gender Split:</Text>
                <Text style={styles.summaryVal}>{state.gender.toUpperCase()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Training Plan:</Text>
                <Text style={styles.summaryVal}>{state.workoutPlan} Days / Week</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Initial XP:</Text>
                <Text style={styles.summaryVal}>0 XP (Rank Bronze)</Text>
              </View>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${(state.onboardingStep / 6) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.stepCounter}>STEP {state.onboardingStep} OF 6</Text>
        </View>

        {renderStepContent()}

        <View style={styles.navigation}>
          {state.onboardingStep > 1 && (
            <Button
              title="Back"
              onPress={prevStep}
              variant="outline"
              style={styles.navBtn}
            />
          )}
          
          {state.onboardingStep < 6 ? (
            <Button
              title="Next Step"
              onPress={nextStep}
              variant="filled"
              style={styles.navBtnFill}
            />
          ) : (
            <Button
              title="🔥 Lock In & Start"
              onPress={handleFinish}
              variant="filled"
              style={styles.navBtnFill}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgApp,
    paddingTop: 44,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.accentYellow,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  stepCounter: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.accentYellow,
    letterSpacing: 1.5,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 19,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  genderCard: {
    flex: 1,
    backgroundColor: Theme.colors.bgCard,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  genderSelected: {
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.04)',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  genderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarCard: {
    flex: 1,
    backgroundColor: Theme.colors.bgCard,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    alignItems: 'center',
  },
  avatarSelected: {
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.04)',
  },
  avatarImg: {
    height: 90,
    width: 90,
    borderRadius: 45,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    height: 52,
    backgroundColor: Theme.colors.bgCard,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  splitList: {
    gap: 16,
  },
  splitCard: {
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    padding: 18,
  },
  splitSelected: {
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.04)',
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  splitTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  splitTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  splitDesc: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    lineHeight: 17,
  },
  remindersCard: {
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    padding: 24,
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  remindersText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 19,
    textAlign: 'center',
  },
  summaryCard: {
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  summaryVal: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  navBtn: {
    flex: 1,
  },
  navBtnFill: {
    flex: 2,
  },
});
export default OnboardingWizard;
