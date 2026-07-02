import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Switch } from 'react-native';
import { useApp, CustomExercise } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import Svg, { Path } from 'react-native-svg';

export const WorkoutScreen: React.FC = () => {
  const {
    state,
    startWorkout,
    toggleSet,
    completeWorkout,
    switchView,
    selectWorkoutType,
    addCustomExercise,
    removeExercise,
    toggleExercise,
    reorderExercises,
    resetExercisesToDefault,
  } = useApp();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscles, setNewExMuscles] = useState('Full Body');

  const [customizing, setCustomizing] = useState(false);

  const w = state.workout;
  const type = state.workoutType;
  const days = state.workoutDaysCompleted || 0;

  // Determine current progression level details
  let currentLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  let levelColor = Theme.colors.accentGreen || '#00e676';
  let levelName = 'Beginner';
  let daysToNext = 30 - days;
  let progressRatio = days / 30;

  if (days >= 60) {
    currentLevel = 'advanced';
    levelColor = '#ebd45b'; // gold
    levelName = 'Advanced';
    daysToNext = 0;
    progressRatio = 1.0;
  } else if (days >= 30) {
    currentLevel = 'intermediate';
    levelColor = '#2979ff'; // blue
    levelName = 'Intermediate';
    daysToNext = 60 - days;
    progressRatio = (days - 30) / 30;
  }

  // 1. Selector Screen if no workout type is selected
  if (!type) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
        <Text style={styles.selectorSubtitle}>CHOOSE YOUR DISCIPLINE</Text>
        <Text style={styles.selectorTitle}>Select Workout Split</Text>

        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => selectWorkoutType('calisthenics')}
          style={styles.disciplineCardTouch}
        >
          <Card style={styles.disciplineCard}>
            <View style={styles.disciplineIconBg}>
              <Text style={styles.disciplineEmoji}>🤸</Text>
            </View>
            <View style={styles.disciplineDetails}>
              <Text style={styles.disciplineName}>Calisthenics</Text>
              <Text style={styles.disciplineDesc}>
                Bodyweight training focused on raw strength, gymnastics holds, agility, and absolute physique mastery.
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => selectWorkoutType('home')}
          style={styles.disciplineCardTouch}
        >
          <Card style={[styles.disciplineCard, { borderColor: 'rgba(56, 189, 248, 0.25)' }]}>
            <View style={[styles.disciplineIconBg, { backgroundColor: 'rgba(56, 189, 248, 0.08)' }]}>
              <Text style={styles.disciplineEmoji}>🏠</Text>
            </View>
            <View style={styles.disciplineDetails}>
              <Text style={styles.disciplineName}>Home Workout</Text>
              <Text style={styles.disciplineDesc}>
                Zero equipment required. Functional circuits, core stabilizers, and high-intensity stamina protocols.
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => selectWorkoutType('gym')}
          style={styles.disciplineCardTouch}
        >
          <Card style={[styles.disciplineCard, { borderColor: 'rgba(235, 212, 91, 0.25)' }]}>
            <View style={[styles.disciplineIconBg, { backgroundColor: 'rgba(235, 212, 91, 0.08)' }]}>
              <Text style={styles.disciplineEmoji}>🏋️</Text>
            </View>
            <View style={styles.disciplineDetails}>
              <View style={styles.gymTitleRow}>
                <Text style={styles.disciplineName}>Gym Hypertrophy</Text>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>CLASSIC</Text>
                </View>
              </View>
              <Text style={styles.disciplineDesc}>
                Hypertrophy lifting splits utilizing dumbbells, barbells, and machines. Day of the week routine rotations.
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // 2. Gym Workout Screen Compatibility (delegates to standard split UI if selected)
  if (type === 'gym') {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.splitHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.splitCounter}>TODAY'S CLASSIC SPLIT</Text>
              <Text style={styles.splitTitle}>{w?.title || 'Hypertrophy Split'}</Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => selectWorkoutType(null)} 
              style={styles.changeSplitBtn}
            >
              <Text style={styles.changeSplitText}>Change Split</Text>
            </TouchableOpacity>
          </View>

          {!w || !w.exercises || w.exercises.length === 0 ? (
            <View style={styles.restCard}>
              <Text style={styles.restIcon}>🧘</Text>
              <Text style={styles.restTitle}>Recovery Split Active</Text>
              <Text style={styles.restDesc}>
                Today is a dedicated rest day. Hydrate, stretch, focus on nutrition, and recover. ⚡
              </Text>
              <Button title="Go to Dashboard" onPress={() => switchView('home')} style={styles.restBtn} />
            </View>
          ) : w.completed || state.gymCompletedToday ? (
            <View style={styles.completedCard}>
              <Text style={styles.completedIcon}>🏆</Text>
              <Text style={styles.completedTitle}>Workout Completed Today!</Text>
              <Text style={styles.completedDesc}>
                Phenomenal effort! Today's exercises have been logged. Rest, recover, and hit the split again tomorrow. ⚡
              </Text>
              <Button title="Return to Dashboard" onPress={() => switchView('home')} style={styles.restBtn} />
            </View>
          ) : !w.started ? (
            <View>
              <Text style={styles.splitFocus}>Focus: {w.focus}</Text>
              <View style={styles.exerciseList}>
                {w.exercises.map((ex) => (
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
            </View>
          ) : (
            <View>
              {/* Gym active tracking */}
              {/* Progress metrics */}
              <Card style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Sets Completion Progress</Text>
                  <Text style={styles.progressValue}>
                    {w.exercises.reduce((acc, ex) => acc + ex.completedSets, 0)} / {w.exercises.reduce((acc, ex) => acc + ex.sets, 0)} sets
                  </Text>
                </View>
                <ProgressBar progress={w.exercises.reduce((acc, ex) => acc + ex.completedSets, 0) / w.exercises.reduce((acc, ex) => acc + ex.sets, 0)} category="gym" />
              </Card>

              <Text style={styles.sectionTitle}>ACTIVE WORKOUT CHECKLIST</Text>
              <View style={styles.exerciseList}>
                {w.exercises.map((ex, exIndex) => {
                  const isFinished = ex.completedSets >= ex.sets;
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
                    </Card>
                  );
                })}
              </View>

              {w.exercises.reduce((acc, ex) => acc + ex.completedSets, 0) === w.exercises.reduce((acc, ex) => acc + ex.sets, 0) ? (
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
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // 3. Calisthenics & Home Workout View
  const pool = type === 'calisthenics' ? (state.calisthenicsExercises || []) : (state.homeWorkoutExercises || []);
  const levelPool = pool.filter(ex => ex.level === currentLevel);

  const handleAddExercise = () => {
    if (newExName.trim()) {
      addCustomExercise(newExName.trim(), newExMuscles);
      setNewExName('');
      setAddModalVisible(false);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...levelPool];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    reorderExercises(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === levelPool.length - 1) return;
    const reordered = [...levelPool];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    reorderExercises(reordered);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Level Progression Premium Header */}
        <Card style={styles.levelCard}>
          <View style={styles.levelCardTop}>
            <View style={[styles.levelBadge, { backgroundColor: levelColor + '15', borderColor: levelColor }]}>
              <Text style={[styles.levelBadgeText, { color: levelColor }]}>{levelName.toUpperCase()}</Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => selectWorkoutType(null)} 
              style={styles.changeSplitBtnSmall}
            >
              <Text style={styles.changeSplitTextSmall}>Switch Split</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.levelProgressTitle}>{type === 'calisthenics' ? 'Calisthenics Progression' : 'Home Workout Progression'}</Text>
          
          <View style={styles.levelDaysRow}>
            <View>
              <Text style={styles.levelDaysVal}>{days}</Text>
              <Text style={styles.levelDaysLabel}>Sessions Completed</Text>
            </View>
            {daysToNext > 0 ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.levelDaysVal}>{daysToNext}</Text>
                <Text style={styles.levelDaysLabel}>Sessions to Next Level</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.levelDaysVal, { color: '#ebd45b' }]}>MAX</Text>
                <Text style={styles.levelDaysLabel}>Elite Level Achieved</Text>
              </View>
            )}
          </View>

          {daysToNext > 0 && (
            <View style={{ marginTop: 12 }}>
              <ProgressBar progress={progressRatio} category="study" />
            </View>
          )}
        </Card>

        {/* Customization Toggle Row */}
        <View style={styles.modeToggleRow}>
          <Text style={styles.sectionHeaderTitle}>
            {customizing ? 'CUSTOMIZE PLAN POOL' : "TODAY'S WORKOUT SPLIT"}
          </Text>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => setCustomizing(!customizing)} 
            style={[styles.customToggleBtn, customizing && styles.customToggleBtnActive]}
          >
            <Text style={styles.customToggleBtnText}>
              {customizing ? "View Today's Workout" : '⚙️ Customize Pool'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Customize Plan Screen View */}
        {customizing ? (
          <View>
            <View style={styles.customOptionsCard}>
              <Text style={styles.customOptionsDesc}>
                Enable, disable, delete, or reorder default and custom exercises for the {levelName} level. Disabled exercises won't be randomly rotated into your daily workouts.
              </Text>
              <View style={styles.customControlsRow}>
                <Button 
                  title="Add Custom Exercise" 
                  onPress={() => setAddModalVisible(true)} 
                  style={{ flex: 1, height: 40 }}
                />
                <Button 
                  title="Reset to Defaults" 
                  onPress={resetExercisesToDefault} 
                  variant="outline"
                  style={{ flex: 1, height: 40 }}
                />
              </View>
            </View>

            <Text style={styles.sectionHeaderSub}>POOL EXERCISES ({levelPool.length})</Text>
            <View style={styles.exerciseList}>
              {levelPool.map((ex, index) => (
                <Card key={ex.id} style={styles.customExCard}>
                  <View style={styles.customExCardLeft}>
                    <View style={styles.reorderArrows}>
                      <TouchableOpacity onPress={() => handleMoveUp(index)} style={styles.arrowBtn} disabled={index === 0}>
                        <Text style={[styles.arrowText, index === 0 && styles.arrowDisabled]}>▲</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleMoveDown(index)} style={styles.arrowBtn} disabled={index === levelPool.length - 1}>
                        <Text style={[styles.arrowText, index === levelPool.length - 1 && styles.arrowDisabled]}>▼</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.customExDetails}>
                      <Text style={[styles.exName, !ex.enabled && styles.exNameDisabled]}>{ex.name}</Text>
                      <Text style={styles.exMuscles}>{ex.muscles} • {ex.reps}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.customExCardRight}>
                    <Switch
                      value={ex.enabled}
                      onValueChange={() => toggleExercise(ex.id)}
                      trackColor={{ false: '#24272c', true: levelColor }}
                      thumbColor={ex.enabled ? '#fff' : '#8892b0'}
                    />
                    
                    {ex.isCustom && (
                      <TouchableOpacity 
                        activeOpacity={0.8} 
                        onPress={() => removeExercise(ex.id)} 
                        style={styles.trashBtn}
                      >
                        <Text style={styles.trashBtnText}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ) : (
          /* Today's Workout View */
          <View>
            {!w || !w.exercises || w.exercises.length === 0 ? (
              <View style={styles.restCard}>
                <Text style={styles.restIcon}>🧘</Text>
                <Text style={styles.restTitle}>Recovery Split Active</Text>
                <Text style={styles.restDesc}>
                  Today is a dedicated rest day. Hydrate, stretch, focus on nutrition, and recover. ⚡
                </Text>
                <Button title="Go to Dashboard" onPress={() => switchView('home')} style={styles.restBtn} />
              </View>
            ) : w.completed || state.gymCompletedToday ? (
              <View style={styles.completedCard}>
                <Text style={styles.completedIcon}>🏆</Text>
                <Text style={styles.completedTitle}>Workout Completed Today!</Text>
                <Text style={styles.completedDesc}>
                  Phenomenal effort, Grinder! Today's exercises have been logged and claimed. Rest, recover, and hit the split again tomorrow. ⚡
                </Text>
                <Button title="Return to Dashboard" onPress={() => switchView('home')} style={styles.restBtn} />
              </View>
            ) : !w.started ? (
              <View>
                <Text style={styles.splitTitle}>{w.title}</Text>
                <Text style={styles.splitFocus}>Level Focus: {w.focus}</Text>
                
                <View style={styles.exerciseList}>
                  {w.exercises.map((ex) => (
                    <Card key={ex.id} style={styles.exCard}>
                      <View style={styles.exHead}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <Text style={styles.exName}>{ex.name}</Text>
                          <Text style={styles.exMuscles}>{ex.muscles}</Text>
                          {ex.desc && <Text style={styles.exDescTip}>{ex.desc}</Text>}
                        </View>
                        <View style={styles.exRight}>
                          <Text style={styles.exSets}>{ex.sets} sets</Text>
                          <Text style={styles.exReps}>{ex.reps}</Text>
                          
                          <TouchableOpacity 
                            activeOpacity={0.8} 
                            onPress={() => removeExercise(ex.id)} 
                            style={styles.trashBtnToday}
                          >
                            <Text style={styles.trashTextToday}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>

                <View style={styles.workoutFooterButtons}>
                  <Button
                    title={`🔥 Start Today's Workout`}
                    onPress={startWorkout}
                    style={styles.startBtn}
                  />
                  <Button 
                    title="Add Temporary Exercise" 
                    onPress={() => setAddModalVisible(true)} 
                    variant="outline"
                    style={styles.addTempBtn}
                  />
                </View>
              </View>
            ) : (
              /* Active Workout Tracking checklist */
              <View>
                <Text style={styles.splitTitle}>{w.title}</Text>
                <Text style={styles.splitFocus}>Level Focus: {w.focus}</Text>

                <Card style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Sets Completion Progress</Text>
                    <Text style={styles.progressValue}>
                      {w.exercises.reduce((acc, ex) => acc + ex.completedSets, 0)} / {w.exercises.reduce((acc, ex) => acc + ex.sets, 0)} sets
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={w.exercises.reduce((acc, ex) => acc + ex.completedSets, 0) / w.exercises.reduce((acc, ex) => acc + ex.sets, 0)} 
                    category="gym" 
                  />
                </Card>

                <Text style={styles.sectionTitle}>ACTIVE WORKOUT CHECKLIST</Text>
                <View style={styles.exerciseList}>
                  {w.exercises.map((ex, exIndex) => {
                    const isFinished = ex.completedSets >= ex.sets;
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
                        ]}
                      >
                        <View style={styles.exHeadActive}>
                          <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.exNameActive}>{ex.name}</Text>
                            <Text style={styles.exMusclesActive}>{ex.muscles} • {ex.reps}</Text>
                            {ex.desc && <Text style={styles.exDescTipActive}>{ex.desc}</Text>}
                          </View>
                          <Text style={styles.exSetsCount}>{ex.completedSets}/{ex.sets} sets</Text>
                        </View>

                        <View style={styles.setsWrapper}>
                          {setButtons}
                        </View>
                      </Card>
                    );
                  })}
                </View>

                {w.exercises.reduce((acc, ex) => acc + ex.completedSets, 0) === w.exercises.reduce((acc, ex) => acc + ex.sets, 0) ? (
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
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Add Custom Exercise Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Add Custom Exercise</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Text style={styles.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Exercise Name</Text>
              <TextInput
                style={styles.formInput}
                value={newExName}
                onChangeText={setNewExName}
                placeholder="e.g. Archer Push-ups"
                placeholderTextColor={Theme.colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Muscles</Text>
              <TextInput
                style={styles.formInput}
                value={newExMuscles}
                onChangeText={setNewExMuscles}
                placeholder="e.g. Chest, Shoulders"
                placeholderTextColor={Theme.colors.textSecondary}
              />
            </View>

            <View style={styles.modalButtons}>
              <Button 
                title="Cancel" 
                onPress={() => setAddModalVisible(false)} 
                variant="outline"
                style={styles.modalBtn}
              />
              <Button 
                title="Add Exercise" 
                onPress={handleAddExercise} 
                style={styles.modalBtn}
              />
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
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 110,
  },
  selectorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 24,
  },
  selectorSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.accentYellow,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  disciplineCardTouch: {
    width: '100%',
    marginBottom: 16,
  },
  disciplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  disciplineIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disciplineEmoji: {
    fontSize: 28,
  },
  disciplineDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  disciplineName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  disciplineDesc: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
  },
  gymTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(235, 212, 91, 0.08)',
    borderColor: Theme.colors.accentYellow,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  comingSoonText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: Theme.colors.accentYellow,
  },
  splitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeSplitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  changeSplitText: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  levelCard: {
    marginBottom: 24,
  },
  levelCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    borderWidth: 1.2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  changeSplitBtnSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  changeSplitTextSmall: {
    color: Theme.colors.textSecondary,
    fontSize: 9.5,
    fontWeight: '700',
  },
  levelProgressTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
  },
  levelDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelDaysVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  levelDaysLabel: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  modeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.2,
  },
  sectionHeaderSub: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  customToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  customToggleBtnActive: {
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.03)',
  },
  customToggleBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#fff',
  },
  customOptionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: Theme.borderRadius.md,
    padding: 14,
    marginBottom: 20,
  },
  customOptionsDesc: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 14,
  },
  customControlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  customExCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  customExCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reorderArrows: {
    flexDirection: 'column',
    marginRight: 10,
  },
  arrowBtn: {
    padding: 3,
  },
  arrowText: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
  },
  arrowDisabled: {
    opacity: 0.15,
  },
  customExDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  exNameDisabled: {
    opacity: 0.4,
    textDecorationLine: 'line-through',
  },
  customExCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trashBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 83, 80, 0.05)',
  },
  trashBtnText: {
    fontSize: 12,
  },
  trashBtnToday: {
    padding: 6,
    marginTop: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 83, 80, 0.05)',
    alignSelf: 'flex-end',
  },
  trashTextToday: {
    fontSize: 12,
  },
  exDescTip: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  exDescTipActive: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  workoutFooterButtons: {
    gap: 12,
    marginTop: 12,
  },
  addTempBtn: {
    height: 44,
  },
  // Reused styles from standard code
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
    marginBottom: 4,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
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
  formGroup: {
    marginBottom: 16,
    width: '100%',
  },
  formLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    height: 44,
    color: '#fff',
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
  },
});

export default WorkoutScreen;
