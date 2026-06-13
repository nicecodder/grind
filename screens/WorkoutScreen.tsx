import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';

export const WorkoutScreen: React.FC = () => {
  const {
    state,
    startWorkout,
    toggleSet,
    completeWorkout,
    switchView,
  } = useApp();

  const w = state.workout;

  // Handle rest day visual representations
  if (!w || !w.exercises || w.exercises.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
        <View style={styles.restCard}>
          <Text style={styles.restIcon}>🧘</Text>
          <Text style={styles.restTitle}>Recovery Split Active</Text>
          <Text style={styles.restDesc}>
            Today is a dedicated rest day. Hydrate, perform active stretching, focus on nutrition, and sleep well to let your muscle fibers rebuild stronger. ⚡
          </Text>
          <Button title="Go to Dashboard" onPress={() => switchView('home')} style={styles.restBtn} />
        </View>
      </ScrollView>
    );
  }

  // Handle fully completed workout status
  if (w.completed || state.gymDuration >= 45) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
        <View style={styles.completedCard}>
          <Text style={styles.completedIcon}>🏆</Text>
          <Text style={styles.completedTitle}>Workout Completed Today!</Text>
          <Text style={styles.completedDesc}>
            Phenomenal effort, Grinder! Today's exercises have been logged and claimed. Rest, recover, and hit the split again tomorrow. ⚡
          </Text>
          <Button title="Return to Dashboard" onPress={() => switchView('home')} style={styles.restBtn} />
        </View>
      </ScrollView>
    );
  }

  // Handle workout preview split (before starting)
  if (!w.started) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.splitCounter}>TODAY'S WORKOUT SPLIT</Text>
        <Text style={styles.splitTitle}>{w.title}</Text>
        <Text style={styles.splitFocus}>Focus: {w.focus}</Text>

        <View style={styles.exerciseList}>
          {w.exercises.map((ex, idx) => (
            <Card key={ex.id} style={styles.exCard}>
              <View style={styles.exHead}>
                <View>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exMuscles}>{ex.muscles}</Text>
                </View>
                <View style={styles.exRight}>
                  <Text style={styles.exSets}>{ex.sets} sets</Text>
                  <Text style={styles.exReps}>{ex.reps}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <Button
          title={`🔥 Start Today's ${w.title?.split(' — ')[1] || 'Workout'}`}
          onPress={startWorkout}
          style={styles.startBtn}
        />
      </ScrollView>
    );
  }

  // Handle active workout sets tracking
  let totalSets = 0;
  let completedSetsCount = 0;
  w.exercises.forEach((ex) => {
    totalSets += ex.sets;
    completedSetsCount += ex.completedSets;
  });

  const progressPercent = totalSets > 0 ? completedSetsCount / totalSets : 0;
  const isAllCompleted = completedSetsCount === totalSets;

  // Active exercise is the first one that has pending sets
  const activeExIndex = w.exercises.findIndex((ex) => ex.completedSets < ex.sets);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.splitCounter}>ACTIVE WORKOUT SESSION</Text>
      <Text style={styles.splitTitle}>{w.title}</Text>
      
      {/* Progress metrics */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Sets Completion Progress</Text>
          <Text style={styles.progressValue}>
            {completedSetsCount} / {totalSets} sets ({Math.round(progressPercent * 100)}%)
          </Text>
        </View>
        <ProgressBar progress={progressPercent} category="gym" />
      </Card>

      <Text style={styles.sectionTitle}>ACTIVE WORKOUT CHECKLIST</Text>
      <View style={styles.exerciseList}>
        {w.exercises.map((ex, exIndex) => {
          const isFinished = ex.completedSets >= ex.sets;
          const isActive = exIndex === activeExIndex;
          
          const setButtons = [];
          for (let i = 1; i <= ex.sets; i++) {
            const isSetCompleted = i <= ex.completedSets;
            setButtons.push(
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                style={[
                  styles.setCircle,
                  isSetCompleted && styles.setCircleCompleted,
                  !isSetCompleted && i === ex.completedSets + 1 && styles.setCircleNext,
                ]}
                onPress={() => toggleSet(exIndex, i)}
              >
                <Text style={[styles.setCircleText, isSetCompleted && styles.setCircleTextCompleted]}>
                  {i}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <Card
              key={ex.id}
              style={[
                styles.exCardActive,
                isFinished && styles.exCardFinished,
                isActive && styles.exCardCurrent,
              ]}
            >
              <View style={styles.exHeadActive}>
                <View>
                  <Text style={styles.exNameActive}>{ex.name}</Text>
                  <Text style={styles.exMusclesActive}>{ex.muscles} • {ex.reps}</Text>
                </View>
                <Text style={styles.exSetsCount}>{ex.completedSets}/{ex.sets} sets</Text>
              </View>

              <View style={styles.setsWrapper}>
                {setButtons}
              </View>

              {isActive && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.setMainBtn}
                  onPress={() => toggleSet(exIndex, ex.completedSets + 1)}
                >
                  <Text style={styles.setMainBtnText}>
                    🏋️ Log Set {ex.completedSets + 1} (+15 XP)
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}
      </View>

      {isAllCompleted ? (
        <Button
          title="🏆 Complete Workout Split (+150 XP)"
          onPress={completeWorkout}
          style={styles.completeBtn}
        />
      ) : (
        <Text style={styles.helpText}>
          Complete all exercises sequentially to finish the workout check!
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgApp,
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  restCard: {
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    padding: 24,
    alignItems: 'center',
  },
  restIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  restTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  restDesc: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  restBtn: {
    width: '100%',
  },
  completedCard: {
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.accentGreen,
    padding: 24,
    alignItems: 'center',
    shadowColor: Theme.colors.accentGreen,
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  completedIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  completedDesc: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  splitCounter: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.accentYellow,
    letterSpacing: 1.5,
  },
  splitTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  splitFocus: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  exerciseList: {
    gap: 12,
    marginBottom: 24,
  },
  exCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  exHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#fff',
  },
  exMuscles: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  exRight: {
    alignItems: 'flex-end',
  },
  exSets: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.accentYellow,
  },
  exReps: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  startBtn: {
    width: '100%',
  },
  progressCard: {
    marginTop: 16,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  exCardActive: {
    borderColor: Theme.colors.border,
  },
  exCardFinished: {
    borderColor: 'rgba(255,255,255,0.03)',
    opacity: 0.5,
  },
  exCardCurrent: {
    borderColor: Theme.colors.accentGreen,
    backgroundColor: 'rgba(0, 230, 118, 0.02)',
    shadowColor: Theme.colors.accentGreen,
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  exHeadActive: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  exNameActive: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#fff',
  },
  exMusclesActive: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  exSetsCount: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.accentGreen,
  },
  setsWrapper: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  setCircle: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setCircleCompleted: {
    backgroundColor: Theme.colors.accentGreen,
    borderColor: Theme.colors.accentGreen,
  },
  setCircleNext: {
    borderColor: Theme.colors.accentGreen,
  },
  setCircleText: {
    color: Theme.colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  setCircleTextCompleted: {
    color: '#050607',
    fontWeight: '800',
  },
  setMainBtn: {
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    borderRadius: Theme.borderRadius.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setMainBtnText: {
    color: Theme.colors.accentGreen,
    fontWeight: '800',
    fontSize: 13,
  },
  completeBtn: {
    width: '100%',
    backgroundColor: Theme.colors.accentGreen,
    borderColor: Theme.colors.accentGreen,
  },
  helpText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 10,
  },
});
export default WorkoutScreen;
