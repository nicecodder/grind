import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useApp, getRankDetails } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { getAsset } from '../constants/assetsMap';
import Svg, { Path, Circle } from 'react-native-svg';

export const DashboardScreen: React.FC = () => {
  const {
    state,
    addWater,
    addStudyHours,
    saveSleepInput,
    simulateSteps,
    toggleWatchSync,
    toggleTask,
    addTask,
    deleteTask,
    switchView,
    competitors,
  } = useApp();

  const isRestDay = (state.workoutType === 'gym' || !state.workoutType) && (!state.workout || !state.workout.exercises || state.workout.exercises.length === 0);
  const gymStatus = isRestDay ? 'Rest Day' : 'Active';

  let splitName = 'WorkoutSplit';
  let splitEmoji = '🏋️';
  if (state.workoutType === 'calisthenics') {
    splitName = 'Calisthenics';
    splitEmoji = '🤸';
  } else if (state.workoutType === 'home') {
    splitName = 'Home Workout';
    splitEmoji = '🏠';
  }

  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [sleepVal, setSleepVal] = useState(8.0);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('other');

  // Format date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  const handleLogSleep = () => {
    saveSleepInput(sleepVal);
    setSleepModalVisible(false);
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(newTaskText.trim(), newTaskCategory);
      setNewTaskText('');
    }
  };

  const getBadgeSrc = (xp: number) => {
    return getRankDetails(xp).badge;
  };

  const getRankName = (xp: number) => {
    return getRankDetails(xp).name.toUpperCase() + ' GRINDER';
  };

  const currentRankDetails = getRankDetails(state.totalXP);
  const nextRankTarget = currentRankDetails.maxXp;
  const xpRange = currentRankDetails.maxXp - currentRankDetails.minXp;
  const xpPercent = xpRange > 0 ? Math.min(1, Math.max(0, (state.totalXP - currentRankDetails.minXp) / xpRange)) : 1;

  const getWeekdayCompletionStatus = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDay = new Date().getDay();
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1;

    return days.map((day, index) => {
      let isCompleted = false;
      if (index < todayIndex) {
        isCompleted = (todayIndex - index) < state.workoutStreak;
      } else if (index === todayIndex) {
        isCompleted = state.gymCompletedToday;
      }
      return { day, isCompleted };
    });
  };

  const weekdayStatus = getWeekdayCompletionStatus();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Date Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.date}>{dateStr}</Text>
          <Text style={styles.title}>LOCK IN TODAY</Text>
        </View>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => switchView('achievements')} 
          style={styles.badgeBtn}
        >
          <Image source={getAsset(getBadgeSrc(state.totalXP))} style={styles.badgeImg} />
        </TouchableOpacity>
      </View>

      {/* Unified Streak & XP Progress Card */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => switchView('profile')}
        style={styles.unifiedCardTouch}
      >
        <Card style={styles.unifiedCard}>
          <View style={styles.unifiedRow}>
            {/* Left Square Column (Streak Block) */}
            <View style={styles.streakSquare}>
              <View style={styles.fireGlowContainer}>
                <Svg viewBox="0 0 24 24" width="38" height="38" color={Theme.colors.accentOrange}>
                  <Path d="M12 2C11.5 4 10 5.5 8.5 7C7 8.5 6 10.5 6 13c0 3.3 2.7 6 6 6s6-2.7 6-6c0-2.5-1-4.5-2.5-6C14 5.5 12.5 4 12 2z" fill="currentColor"/>
                  <Path d="M12 7c-.3 1-.8 1.8-1.5 2.5C9.8 10.2 9 11.5 9 13c0 1.7 1.3 3 3 3s3-1.3 3-3c0-1.5-.8-2.8-1.5-3.5C12.8 8.8 12.3 8 12 7z" fill="#fff"/>
                </Svg>
              </View>
              <Text style={styles.streakDaysText}>{state.workoutStreak} days</Text>
              <Text style={styles.streakDaysSub}>Active streak</Text>
            </View>

            {/* Right Column (XP Progress & Weekday Tracker) */}
            <View style={styles.trackerColumn}>
              {/* XP Progress Label */}
              <View style={styles.xpRow}>
                <Text style={styles.xpTextVal}>
                  {state.totalXP.toLocaleString()}
                  <Text style={styles.xpTextTarget}> / {nextRankTarget.toLocaleString()}</Text>
                </Text>
              </View>

              {/* Glowing XP Progress Bar */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${xpPercent * 100}%` }]} />
              </View>

              {/* Weekday Tracker Pill */}
              <View style={styles.weekdayTracker}>
                {weekdayStatus.map((item, idx) => (
                  <View key={idx} style={styles.weekdayCol}>
                    {item.isCompleted ? (
                      <View style={styles.circleChecked}>
                        <Text style={styles.checkIconText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.circleEmpty} />
                    )}
                    <Text style={styles.weekdayLabel}>{item.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Habits Grid */}
      <Text style={styles.sectionTitle}>DAILY HABITS</Text>
      <View style={styles.grid}>
        {/* Water card */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.gridCol}
          onPress={() => addWater(1)}
        >
          <Card variant="water" style={styles.habitCard}>
            <View style={styles.habitHead}>
              <Text style={styles.habitName}>Water Intake</Text>
              <Text style={styles.arrow}>💧</Text>
            </View>
            <ProgressBar progress={state.waterCount / 8} category="water" />
            <Text style={styles.habitVal}>
              <Text style={styles.habitValHighlight}>{state.waterCount}</Text>
              <Text style={styles.habitValTotal}> / 8 glasses</Text>
            </Text>
            <Text style={styles.habitSub}>Tap to drink +10 XP</Text>
          </Card>
        </TouchableOpacity>

        {/* Workout split card */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.gridCol}
          onPress={() => switchView('workout')}
        >
          <Card variant={state.gymCompletedToday ? 'green' : 'default'} style={styles.habitCard}>
            <View style={styles.habitHead}>
              <Text style={styles.habitName}>{splitName}</Text>
              <Text style={styles.arrow}>{splitEmoji}</Text>
            </View>
            <ProgressBar progress={state.gymDuration / 45} category="gym" />
            <Text style={styles.habitVal}>
              <Text style={styles.habitValHighlight}>
                {gymStatus === 'Rest Day' ? 'Rest' : `${state.gymDuration}`}
              </Text>
              <Text style={styles.habitValTotal}>
                {gymStatus === 'Rest Day' ? ' Day' : ' / 45 mins'}
              </Text>
            </Text>
            <Text style={styles.habitSub}>
              {gymStatus === 'Rest Day' ? 'Recovery point credited' : 'Tap to start today\'s split'}
            </Text>
          </Card>
        </TouchableOpacity>

        {/* Study logging card */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.gridCol}
          onPress={() => addStudyHours(0.5)}
        >
          <Card variant={state.studyHours >= 4.0 ? 'purple' : 'default'} style={styles.habitCard}>
            <View style={styles.habitHead}>
              <Text style={styles.habitName}>Deep Study</Text>
              <Text style={styles.arrow}>📚</Text>
            </View>
            <ProgressBar progress={state.studyHours / 4} category="study" />
            <Text style={styles.habitVal}>
              <Text style={styles.habitValHighlight}>{state.studyHours.toFixed(1)}</Text>
              <Text style={styles.habitValTotal}> / 4.0 hrs</Text>
            </Text>
            <Text style={styles.habitSub}>Tap to study 30m +25 XP</Text>
          </Card>
        </TouchableOpacity>

        {/* Sleep logging card */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.gridCol}
          onPress={() => {
            const currentVal = state.sleepHours === '--' ? 8.0 : parseFloat(state.sleepHours.toString());
            setSleepVal(currentVal);
            setSleepModalVisible(true);
          }}
        >
          <Card variant={state.sleepHours !== '--' && parseFloat(state.sleepHours.toString()) >= 8.0 ? 'cyan' : 'default'} style={styles.habitCard}>
            <View style={styles.habitHead}>
              <Text style={styles.habitName}>Night Sleep</Text>
              <Text style={styles.arrow}>🌙</Text>
            </View>
            <ProgressBar progress={state.sleepHours === '--' ? 0 : parseFloat(state.sleepHours.toString()) / 8} category="sleep" />
            <Text style={styles.habitVal}>
              <Text style={styles.habitValHighlight}>{state.sleepHours}</Text>
              <Text style={styles.habitValTotal}>
                {state.sleepHours === '--' ? '' : ' / 8.0 hrs'}
              </Text>
            </Text>
            <Text style={styles.habitSub}>Tap to select sleep duration</Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Step Counter Simulator Card */}
      <Card style={styles.stepsCard}>
        <View style={styles.stepsHeader}>
          <View>
            <Text style={styles.stepsTitle}>Active Step Counter</Text>
            <Text style={styles.stepsValue}>{state.stepsCount.toLocaleString()} steps</Text>
          </View>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={toggleWatchSync}
            style={[styles.syncBadge, state.isSyncActive && styles.syncBadgeActive]}
          >
            <Text style={styles.syncBadgeText}>
              {state.isSyncActive ? 'Watch Live (Gyro)' : 'Watch Disconnected'}
            </Text>
          </TouchableOpacity>
        </View>
        <ProgressBar progress={state.stepsCount / 10000} category="steps" style={styles.stepsBar} />
        <View style={styles.stepsButtons}>
          <Button 
            title="🚶 Simulate +1000 Steps" 
            onPress={() => simulateSteps(1000)} 
            variant="outline"
            style={styles.simBtn}
          />
        </View>
      </Card>

      {/* Quest Checklist */}
      <Text style={styles.sectionTitle}>DAILY CHECKLIST</Text>
      <Card style={styles.checklistCard}>
        {state.tasks.map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => toggleTask(task.id, !task.completed)}
              style={styles.checkboxContainer}
            >
              <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
                {task.completed && <Text style={styles.checkIcon}>✓</Text>}
              </View>
              <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                {task.text}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.taskRight}>
              <Text style={styles.taskXp}>+{task.xp} XP</Text>
              {!task.isDefault && (
                <TouchableOpacity onPress={() => deleteTask(task.id)} style={styles.delBtn}>
                  <Text style={styles.delText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Add Custom Quest */}
        <View style={styles.addTaskForm}>
          <TextInput
            style={styles.taskInput}
            placeholder="Add a custom discipline quest..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={newTaskText}
            onChangeText={setNewTaskText}
          />
          <Button title="+" onPress={handleAddTask} variant="filled" style={styles.addBtn} />
        </View>
      </Card>

      {/* Leaderboard Card */}
      <Text style={styles.sectionTitle}>XP LEADERBOARD</Text>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => switchView('leaderboard')}
        style={styles.leaderboardTouch}
      >
        <Card style={styles.leaderboardCard}>
          <View style={styles.leaderboardHeader}>
            <View style={styles.leaderboardHeaderLeft}>
              <Text style={styles.trophyIcon}>🏆</Text>
              <Text style={styles.leaderboardTitle}>XP Leaderboard</Text>
            </View>
            <View style={styles.arenaTag}>
              <Text style={styles.arenaTagText}>WEEKLY ARENA</Text>
            </View>
          </View>
          <View style={styles.leaderboardContent}>
            {competitors && competitors.length > 0 ? (
              <View style={styles.compactList}>
                {competitors.slice(0, 10).map((player, idx) => (
                  <View key={player.handle || idx.toString()} style={styles.compactRow}>
                    <View style={styles.compactRowLeft}>
                      <Text style={styles.compactRank}>#{idx + 1}</Text>
                      <Image source={getAsset(player.avatarUrl)} style={styles.compactAvatar} />
                      <Text style={styles.compactName} numberOfLines={1}>{player.name}</Text>
                      {player.plan === 'elite' && <Text style={styles.compactEliteTag}>ELITE</Text>}
                      {player.plan === 'pro' && <Text style={styles.compactProTag}>PRO</Text>}
                    </View>
                    <Text style={styles.compactXp}>{player.xp.toLocaleString()} XP</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.leaderboardText}>
                Click to view global arena rankings, compare disciplines, and claim your place on the podium!
              </Text>
            )}
          </View>
        </Card>
      </TouchableOpacity>

      {/* Sleep Input Modal */}
      <Modal visible={sleepModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Night Sleep</Text>
            <Text style={styles.modalDesc}>How many hours of restorative sleep did you get?</Text>
            
            <View style={styles.sleepSelector}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSleepVal(prev => Math.max(4.0, prev - 0.5))}
                style={styles.adjustBtn}
              >
                <Text style={styles.adjustBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.sleepValText}>{sleepVal.toFixed(1)} hours</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSleepVal(prev => Math.min(12.0, prev + 0.5))}
                style={styles.adjustBtn}
              >
                <Text style={styles.adjustBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick select pills */}
            <View style={styles.quickPillRow}>
              {[6.0, 7.0, 8.0, 9.0].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  activeOpacity={0.8}
                  onPress={() => setSleepVal(hours)}
                  style={[styles.quickPill, sleepVal === hours && styles.quickPillActive]}
                >
                  <Text style={[styles.quickPillText, sleepVal === hours && styles.quickPillTextActive]}>
                    {hours.toFixed(0)}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button 
                title="Cancel" 
                onPress={() => setSleepModalVisible(false)} 
                variant="outline"
                style={styles.modalBtn}
              />
              <Button 
                title="Save Sleep log" 
                onPress={handleLogSleep} 
                variant="filled"
                style={styles.modalBtn}
              />
            </View>
          </Card>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  date: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  badgeBtn: {
    height: 48,
    width: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeImg: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  unifiedCardTouch: {
    width: '100%',
    marginBottom: 24,
  },
  unifiedCard: {
    backgroundColor: '#16181c',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
  },
  unifiedRow: {
    flexDirection: 'row',
    gap: 16,
  },
  streakSquare: {
    width: 104,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  fireGlowContainer: {
    shadowColor: Theme.colors.accentOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 8,
  },
  streakDaysText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  streakDaysSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  trackerColumn: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  xpTextVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  xpTextTarget: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  weekdayTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  weekdayCol: {
    alignItems: 'center',
    gap: 4,
  },
  circleChecked: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors.accentOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  circleEmpty: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  weekdayLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  gridCol: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  habitCard: {
    height: 164,
    justifyContent: 'space-between',
  },
  habitHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  arrow: {
    fontSize: 16,
  },
  habitVal: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  habitValHighlight: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  habitValTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  habitSub: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  stepsCard: {
    marginBottom: 24,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  stepsValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Theme.colors.accentYellow,
    marginTop: 2,
  },
  syncBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  syncBadgeActive: {
    borderColor: Theme.colors.accentGreen,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
  },
  syncBadgeText: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  stepsBar: {
    marginBottom: 12,
  },
  stepsButtons: {
    flexDirection: 'row',
  },
  simBtn: {
    flex: 1,
    height: 40,
  },
  checklistCard: {
    marginBottom: 20,
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxCompleted: {
    backgroundColor: Theme.colors.accentYellow,
    borderColor: Theme.colors.accentYellow,
  },
  checkIcon: {
    fontSize: 12,
    color: '#000',
    fontWeight: '900',
  },
  taskText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  taskTextCompleted: {
    color: Theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskXp: {
    color: Theme.colors.accentYellow,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: 'rgba(235, 212, 91, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  delBtn: {
    paddingHorizontal: 4,
  },
  delText: {
    fontSize: 18,
    color: Theme.colors.danger,
    fontWeight: '700',
  },
  addTaskForm: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  taskInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    height: 42,
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 12.5,
    fontWeight: '600',
  },
  addBtn: {
    width: 42,
    height: 42,
    paddingHorizontal: 0,
    borderRadius: Theme.borderRadius.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    marginBottom: 24,
    lineHeight: 18,
  },
  sleepValText: {
    fontSize: 26,
    fontWeight: '900',
    color: Theme.colors.accentCyan,
    textAlign: 'center',
    marginVertical: 4,
  },
  sleepSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  adjustBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustBtnText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '800',
  },
  quickPillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  quickPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  quickPillActive: {
    borderColor: Theme.colors.accentCyan,
    backgroundColor: 'rgba(0, 229, 255, 0.04)',
  },
  quickPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  quickPillTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
  },
  fireStreakImg: {
    width: 24,
    height: 24,
  },
  leaderboardTouch: {
    width: '100%',
    marginBottom: 20,
  },
  leaderboardCard: {
    padding: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leaderboardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trophyIcon: {
    fontSize: 16,
  },
  leaderboardTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  arenaTag: {
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderColor: 'rgba(0, 230, 118, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  arenaTagText: {
    color: Theme.colors.accentGreen,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  leaderboardContent: {
    marginTop: 6,
  },
  leaderboardText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  compactList: {
    gap: 4,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  compactRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  compactRank: {
    fontSize: 12,
    fontWeight: '900',
    color: Theme.colors.textSecondary,
    width: 28,
  },
  compactAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  compactName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#fff',
    maxWidth: 120,
  },
  compactEliteTag: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#000',
    backgroundColor: Theme.colors.accentYellow,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  compactProTag: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#fff',
    backgroundColor: Theme.colors.accentBlue,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  compactXp: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Theme.colors.accentYellow,
  },
});
export default DashboardScreen;
