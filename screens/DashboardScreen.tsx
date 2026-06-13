import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { getAsset } from '../constants/assetsMap';

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
  } = useApp();

  const isRestDay = !state.workout || !state.workout.exercises || state.workout.exercises.length === 0;
  const gymStatus = isRestDay ? 'Rest Day' : 'Active';

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
    if (xp < 3000) return 'badges/bronze.png';
    if (xp < 8000) return 'badges/silver.png';
    if (xp < 16000) return 'badges/gold.png';
    if (xp < 30000) return 'badges/dimond.png';
    if (xp < 50000) return 'badges/master.png';
    if (xp < 100000) return 'badges/supreme.png';
    return 'badges/ultrasupreme.png';
  };

  const getRankName = (xp: number) => {
    if (xp < 3000) return 'BRONZE 1 GRINDER';
    if (xp < 8000) return 'SILVER GRINDER';
    if (xp < 16000) return 'GOLD GRINDER';
    if (xp < 30000) return 'DIAMOND GRINDER';
    if (xp < 50000) return 'MASTER GRINDER';
    if (xp < 100000) return 'SUPREME GRINDER';
    return 'ULTRA SUPREME GRINDER';
  };

  const getNextRankXp = (xp: number) => {
    if (xp < 3000) return 3000;
    if (xp < 8000) return 8000;
    if (xp < 16000) return 16000;
    if (xp < 30000) return 30000;
    if (xp < 50000) return 50000;
    return 100000;
  };

  const nextRankTarget = getNextRankXp(state.totalXP);
  const xpPercent = Math.min(1, state.totalXP / nextRankTarget);

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

      {/* Streak Fire Card */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => switchView('profile')}
        style={styles.streakTouch}
      >
        <Card variant="orange" style={styles.streakCard}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.streakText}>{state.streak} DAY ACTIVE STREAK</Text>
        </Card>
      </TouchableOpacity>

      {/* Level / Rank summary Card */}
      <Card style={styles.rankCard}>
        <View style={styles.rankHeader}>
          <Text style={styles.rankTitle}>{getRankName(state.totalXP)}</Text>
          <Text style={styles.rankValue}>{state.totalXP.toLocaleString()} XP</Text>
        </View>
        <ProgressBar progress={xpPercent} category="rank" style={styles.rankBar} />
        <Text style={styles.rankSub}>
          {state.totalXP >= 100000 
            ? 'MAX RANK ATTAINED' 
            : `${(nextRankTarget - state.totalXP).toLocaleString()} XP to next rank`
          }
        </Text>
      </Card>

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
          onPress={() => {
            if (gymStatus !== 'Rest Day' && state.gymDuration < 45) {
              switchView('workout');
            }
          }}
        >
          <Card variant={state.gymCompletedToday ? 'green' : 'default'} style={styles.habitCard}>
            <View style={styles.habitHead}>
              <Text style={styles.habitName}>WorkoutSplit</Text>
              <Text style={styles.arrow}>🏋️</Text>
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
  streakTouch: {
    width: '100%',
    marginBottom: 16,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
  },
  fireEmoji: {
    fontSize: 20,
  },
  streakText: {
    color: Theme.colors.accentOrange,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rankCard: {
    marginBottom: 24,
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rankTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  rankValue: {
    color: Theme.colors.accentYellow,
    fontWeight: '900',
    fontSize: 13,
  },
  rankBar: {
    marginBottom: 8,
  },
  rankSub: {
    fontSize: 10.5,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
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
});
export default DashboardScreen;
