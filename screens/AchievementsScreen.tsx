import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { ACHIEVEMENT_DEFINITIONS, AchievementDefinition } from '../constants/achievements';
import { getAsset } from '../constants/assetsMap';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';
import { getRankDetails } from '../context/AppContext';

export const AchievementsScreen: React.FC = () => {
  const { state, switchView } = useApp();
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [filter, setFilter] = useState<'all' | 'workout' | 'study' | 'sleep' | 'water' | 'special'>('all');
  const [selectedAch, setSelectedAch] = useState<AchievementDefinition | null>(null);
  const [showRanksModal, setShowRanksModal] = useState(false);

  const ALL_RANKS = [
    { name: 'Iron I', xp: 0, badge: 'badges/bronze.png' },
    { name: 'Iron II', xp: 1500, badge: 'badges/bronze.png' },
    { name: 'Bronze I', xp: 3000, badge: 'badges/bronze.png' },
    { name: 'Bronze II', xp: 3500, badge: 'badges/bronze.png' },
    { name: 'Silver', xp: 5000, badge: 'badges/silver.png' },
    { name: 'Gold', xp: 8000, badge: 'badges/gold.png' },
    { name: 'Diamond', xp: 16000, badge: 'badges/dimond.png' },
    { name: 'Master', xp: 30000, badge: 'badges/master.png' },
    { name: 'Supreme', xp: 50000, badge: 'badges/supreme.png' },
    { name: 'Ultra Supreme', xp: 100000, badge: 'badges/ultrasupreme.png' },
  ];

  const categories: ('all' | 'workout' | 'study' | 'sleep' | 'water' | 'special')[] = [
    'all', 'workout', 'study', 'sleep', 'water', 'special'
  ];

  const getCategoryLabel = (cat: string) => {
    return cat.toUpperCase();
  };

  const handleQuestAction = (category: string) => {
    switch (category) {
      case 'workout':
        switchView('workout');
        break;
      case 'study':
      case 'sleep':
      case 'water':
        switchView('home');
        break;
      default:
        switchView('home');
    }
  };

  const filtered = ACHIEVEMENT_DEFINITIONS.filter(
    (def) => filter === 'all' || def.category === filter
  );

  let unlockedCount = 0;
  ACHIEVEMENT_DEFINITIONS.forEach((def) => {
    if (state.achievements[def.id]?.unlocked) unlockedCount++;
  });

  // Dynamic Rank Details calculation
  const currentRankDetails = getRankDetails(state.totalXP);
  const nextRankDetails = getRankDetails(currentRankDetails.maxXp);
  const lockedRankDetails = getRankDetails(nextRankDetails.maxXp);

  // Calculations for Current Rank card
  const minXp = currentRankDetails.minXp;
  const maxXp = currentRankDetails.maxXp;
  const rankRange = maxXp - minXp;
  const rankProgressXp = state.totalXP - minXp;
  const progressRatio = rankRange > 0 ? Math.min(1, Math.max(0, rankProgressXp / rankRange)) : 1;
  const xpNeeded = maxXp - state.totalXP;
  const pctToNext = Math.min(100, Math.round((state.totalXP / maxXp) * 100));

  // Render original 54 achievements view
  if (showAllAchievements) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Back to Rank & Rewards dashboard */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowAllAchievements(false)}
            style={styles.backLinkRow}
          >
            <Text style={styles.backLinkText}>← Back to Rank & Rewards</Text>
          </TouchableOpacity>

          <Text style={styles.tag}>QUEST MILESTONES</Text>
          <Text style={styles.title}>Quest Achievements</Text>

          {/* Global Progress Card */}
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Quest Completion Progress</Text>
              <Text style={styles.progressValue}>
                {unlockedCount} / 54 completed ({Math.round((unlockedCount / 54) * 100)}%)
              </Text>
            </View>
            <ProgressBar progress={unlockedCount / 54} category="rank" />
          </Card>

          {/* Category Filter Pills (horizontal scroll) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersWrapper}
            contentContainerStyle={styles.filtersContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setFilter(cat)}
                style={[styles.filterPill, filter === cat && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, filter === cat && styles.filterPillTextActive]}>
                  {getCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quest Grid */}
          <View style={styles.grid}>
            {filtered.map((def) => {
              const ach = state.achievements[def.id] || { current: 0, target: def.target, unlocked: false };
              const isUnlocked = ach.unlocked;
              const progress = ach.target > 0 ? ach.current / ach.target : 0;
              const isActionable = ['workout', 'study', 'sleep', 'water'].includes(def.category);
              const showGoBtn = !isUnlocked && isActionable;

              return (
                <TouchableOpacity
                  key={def.id}
                  activeOpacity={0.9}
                  onPress={() => setSelectedAch(def)}
                  style={[styles.achCard, isUnlocked && styles.achCardUnlocked]}
                >
                  <View style={styles.achLeft}>
                    <View style={[styles.iconWrapper, isUnlocked && styles.iconWrapperUnlocked]}>
                      <Image
                        source={getAsset(def.img)}
                        style={[styles.icon, !isUnlocked && styles.iconLocked] as any}
                      />
                      {isUnlocked ? (
                        <View style={[styles.badgeOverlay, styles.badgeOverlayGold]}>
                          <Text style={styles.badgeIcon}>★</Text>
                        </View>
                      ) : (
                        <View style={[styles.badgeOverlay, styles.badgeOverlayLock]}>
                          <Text style={styles.badgeIconLock}>🔒</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.xpTag}>+{def.xp} XP</Text>
                  </View>

                  <View style={styles.achRight}>
                    <Text style={styles.achName} numberOfLines={1}>
                      {def.name}
                    </Text>
                    <Text style={styles.achDesc} numberOfLines={2}>
                      {def.description}
                    </Text>
                    {def.target > 1 && (
                      <View style={styles.progRow}>
                        <Text style={styles.progText}>
                          {ach.current} / {def.target} completed
                        </Text>
                      </View>
                    )}
                  </View>

                  {showGoBtn && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.goBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleQuestAction(def.category);
                      }}
                    >
                      <Text style={styles.goBtnText}>Go</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Quest Detailed Dialog popup */}
        {selectedAch && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <Card style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Quest Detailed Milestone</Text>
                  <TouchableOpacity onPress={() => setSelectedAch(null)}>
                    <Text style={styles.closeBtn}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.detailBox}>
                  <Image
                    source={getAsset(selectedAch.img)}
                    style={[
                      styles.detailIcon,
                      !state.achievements[selectedAch.id]?.unlocked && styles.iconLocked,
                    ] as any}
                  />
                  
                  <Text style={styles.detailXpTag}>
                    +{selectedAch.xp} XP AWARDED
                  </Text>

                  <Text style={styles.detailName}>{selectedAch.name}</Text>
                  <Text style={styles.detailCategory}>{selectedAch.category.toUpperCase()}</Text>
                  <Text style={styles.detailDesc}>{selectedAch.description}</Text>

                  {/* Progress bar */}
                  <View style={styles.detailProgBox}>
                    <View style={styles.detailProgTextRow}>
                      <Text style={styles.detailProgLabel}>Quest Targets Progress</Text>
                      <Text style={styles.detailProgVal}>
                        {state.achievements[selectedAch.id]?.current ?? 0} / {selectedAch.target}
                      </Text>
                    </View>
                    <ProgressBar
                      progress={
                        selectedAch.target > 0
                          ? (state.achievements[selectedAch.id]?.current ?? 0) / selectedAch.target
                          : 0
                      }
                      category="rank"
                    />
                  </View>

                  {state.achievements[selectedAch.id]?.unlocked ? (
                    <Button
                      title="Milestone Completed & Claimed 🏆"
                      onPress={() => setSelectedAch(null)}
                      variant="outline"
                      style={styles.detailCloseBtn}
                      textStyle={{ color: Theme.colors.accentGreen }}
                    />
                  ) : (
                    <Button
                      title="Track Quest Target 🔥"
                      onPress={() => {
                        setSelectedAch(null);
                        handleQuestAction(selectedAch.category);
                      }}
                      style={styles.detailCloseBtn}
                    />
                  )}
                </View>
              </Card>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // Render Redesigned Rank & Rewards dashboard
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        {/* Achievements Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTitles}>
            <Text style={styles.headerSubtitle}>Achievements</Text>
            <Text style={styles.headerTitle}>Rank & Rewards</Text>
          </View>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setShowRanksModal(true)}
            style={styles.rankBadgeClean}
          >
            <Image source={getAsset(currentRankDetails.badge)} style={styles.rankBadgeIconClean} resizeMode="contain" />
            <Text style={styles.rankBadgeTextClean}>{currentRankDetails.name}</Text>
          </TouchableOpacity>
        </View>

        {/* Current Rank Card */}
        <Card style={styles.rankCardPremium}>
          <View style={styles.rankCardTop}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => setShowRanksModal(true)}
              style={styles.rankLeftInfo}
            >
              <View style={styles.shieldWrapper}>
                <Image source={getAsset(currentRankDetails.badge)} style={styles.rankCardBadgeImg} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankCardSub}>Current Rank (Tap to view all) ⚙️</Text>
                <Text style={styles.rankCardTitle}>{currentRankDetails.name}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.xpBadgePill}>
              <Text style={styles.xpBadgeText}>{state.totalXP.toLocaleString()} XP</Text>
            </View>
          </View>

          <View style={styles.climbContainer}>
            <View style={styles.climbLeft}>
              <Text style={styles.climbLabel}>XP needed to climb</Text>
              <Text style={styles.climbValue}>{xpNeeded.toLocaleString()} XP</Text>
            </View>
            <View style={styles.climbRight}>
              <Text style={styles.climbRightLabel}>Next Rank</Text>
              <Text style={styles.climbRightValue}>{currentRankDetails.next}</Text>
            </View>
          </View>

          {/* Standard ProgressBar component to fix overflow bug */}
          <ProgressBar progress={progressRatio} category="rank" style={{ marginVertical: 14 }} />

          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterLeft}>
              {state.totalXP.toLocaleString()} / {maxXp.toLocaleString()} XP
            </Text>
            <Text style={styles.progressFooterRight}>
              {Math.round(progressRatio * 100)}% to next rank
            </Text>
          </View>
        </Card>

        {/* EXP Tasks Section */}
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.sectionTitleText}>Discipline EXP Tasks</Text>
          <Text style={styles.sectionSubtitleText}>Complete active quests to claim XP discipline points</Text>
        </View>
        
        <Card style={styles.expTasksCard}>
          <View style={styles.expTasksList}>
            {[
              { text: "Complete Today's Workout Split", xp: 150, category: 'workout', desc: "Finish all checklist exercises in your current hypertrophy routine split." },
              { text: "Log 8/8 Glasses of Water", xp: 50, category: 'water', desc: "Stay hydrated throughout the day to meet your physical hydration threshold." },
              { text: "Complete 4.0 Hours of Study", xp: 100, category: 'study', desc: "Log active study blocks to boost cognitive focus and learning discipline." },
              { text: "Log 8.0 Hours of Night Sleep", xp: 80, category: 'sleep', desc: "Record restorative night sleep duration to maximize muscle rebuilding." },
              { text: "Complete a physique scan", xp: 150, category: 'special', desc: "Simulate a physique rating compute to claim scanning EXP bonus." },
            ].map((task, idx) => (
              <View key={idx} style={[styles.expTaskItem, idx === 4 && { borderBottomWidth: 0 }]}>
                <View style={styles.expTaskLeft}>
                  <View style={styles.expTaskIconCircle}>
                    {task.category === 'workout' && <Text style={{ fontSize: 16 }}>🏋️</Text>}
                    {task.category === 'water' && <Text style={{ fontSize: 16 }}>💧</Text>}
                    {task.category === 'study' && <Text style={{ fontSize: 16 }}>📚</Text>}
                    {task.category === 'sleep' && <Text style={{ fontSize: 16 }}>🌙</Text>}
                    {task.category === 'special' && <Text style={{ fontSize: 16 }}>🔍</Text>}
                  </View>
                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <Text style={styles.expTaskName}>{task.text}</Text>
                    <Text style={styles.expTaskDesc}>{task.desc}</Text>
                  </View>
                </View>
                <View style={styles.expTaskRight}>
                  <Text style={styles.expTaskXP}>+{task.xp} XP</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      handleQuestAction(task.category === 'special' ? 'home' : task.category);
                    }}
                    style={styles.expTaskGoBtn}
                  >
                    <Text style={styles.expTaskGoBtnText}>GO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Card>
        
        <View style={{ height: 28 }} />

        {/* Achievement Progress Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitleText}>Achievement Progress</Text>
            <Text style={styles.sectionSubtitleText}>Unlock badges by staying locked in</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowAllAchievements(true)}
            style={styles.viewAllBtn}
          >
            <Svg viewBox="0 0 24 24" width="13" height="13" color="#fff" style={styles.viewAllIcon}>
              <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Grid 2x2 of Featured Badges */}
        <View style={styles.badgeGridContainer}>
          <View style={styles.badgeGridRow}>
            {/* 7-Day Streak */}
            <Card style={styles.badgeCard}>
              <View style={styles.badgeCardHeader}>
                <View style={styles.badgeIconCircle}>
                  <Svg viewBox="0 0 24 24" width="16" height="16" color="#ff7043">
                    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={[styles.cardStatusBadge, state.streak >= 7 && styles.cardStatusBadgeCompleted]}>
                  <Text style={styles.cardStatusBadgeText}>
                    {state.streak >= 7 ? '100%' : 'New'}
                  </Text>
                </View>
              </View>
              <Text style={styles.badgeCardTitle}>7-Day Streak</Text>
              <Text style={styles.badgeCardDesc}>Keep your lock-in alive for a week.</Text>
              
              <View style={styles.badgeCardFooter}>
                <View style={styles.cardProgressBg}>
                  <View style={[styles.cardProgressFill, { width: `${Math.min(100, (state.streak / 7) * 100)}%` }]} />
                </View>
                <Text style={styles.badgeCardProgressLabel}>
                  {state.streak >= 7 ? 'Completed' : `${state.streak} days done`}
                </Text>
              </View>
            </Card>

            {/* Gym Beast */}
            <Card style={styles.badgeCard}>
              <View style={styles.badgeCardHeader}>
                <View style={styles.badgeIconCircle}>
                  <Svg viewBox="0 0 24 24" width="16" height="16" color="#ff7043">
                    <Path d="M6.5 6.5h1m10 0h1M4 9h3v6H4zm13 0h3v6h-3zM7 12h10m-8-5v10m6-10v10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={[styles.cardStatusBadge, state.workoutCount >= 20 && styles.cardStatusBadgeCompleted]}>
                  <Text style={styles.cardStatusBadgeText}>
                    {Math.min(20, state.workoutCount)}/20
                  </Text>
                </View>
              </View>
              <Text style={styles.badgeCardTitle}>Gym Beast</Text>
              <Text style={styles.badgeCardDesc}>Finish 20 workouts to earn this badge.</Text>
              
              <View style={styles.badgeCardFooter}>
                <View style={styles.cardProgressBg}>
                  <View style={[styles.cardProgressFill, { width: `${Math.min(100, (state.workoutCount / 20) * 100)}%` }]} />
                </View>
                <Text style={styles.badgeCardProgressLabel}>
                  {state.workoutCount} workouts done
                </Text>
              </View>
            </Card>
          </View>

          <View style={styles.badgeGridRow}>
            {/* Hydration King */}
            <Card style={styles.badgeCard}>
              <View style={styles.badgeCardHeader}>
                <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.08)', borderColor: 'rgba(56, 189, 248, 0.25)' }]}>
                  <Svg viewBox="0 0 24 24" width="16" height="16" color="#38bdf8">
                    <Path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={[styles.cardStatusBadge, { backgroundColor: 'rgba(56, 189, 248, 0.08)' }, state.waterStreak >= 10 && styles.cardStatusBadgeCompleted]}>
                  <Text style={[styles.cardStatusBadgeText, { color: '#38bdf8' }]}>
                    {Math.min(10, state.waterStreak || 0)}/10
                  </Text>
                </View>
              </View>
              <Text style={styles.badgeCardTitle}>Hydration King</Text>
              <Text style={styles.badgeCardDesc}>Hit your water goal for 10 days.</Text>
              
              <View style={styles.badgeCardFooter}>
                <View style={styles.cardProgressBg}>
                  <View style={[styles.cardProgressFill, { backgroundColor: '#38bdf8', width: `${Math.min(100, ((state.waterStreak || 0) / 10) * 100)}%` }]} />
                </View>
                <Text style={styles.badgeCardProgressLabel}>
                  {state.waterStreak || 0} days completed
                </Text>
              </View>
            </Card>

            {/* Study Focus */}
            <Card style={styles.badgeCard}>
              <View style={styles.badgeCardHeader}>
                <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(167, 243, 208, 0.08)', borderColor: 'rgba(167, 243, 208, 0.25)' }]}>
                  <Svg viewBox="0 0 24 24" width="16" height="16" color="#a7f3d0">
                    <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={[styles.cardStatusBadge, { backgroundColor: 'rgba(167, 243, 208, 0.08)' }, state.studySessionsCount >= 7 && styles.cardStatusBadgeCompleted]}>
                  <Text style={[styles.cardStatusBadgeText, { color: '#a7f3d0' }]}>
                    {Math.min(7, state.studySessionsCount)}/7
                  </Text>
                </View>
              </View>
              <Text style={styles.badgeCardTitle}>Study Focus</Text>
              <Text style={styles.badgeCardDesc}>Complete 7 focused study sessions.</Text>
              
              <View style={styles.badgeCardFooter}>
                <View style={styles.cardProgressBg}>
                  <View style={[styles.cardProgressFill, { backgroundColor: '#a7f3d0', width: `${Math.min(100, (state.studySessionsCount / 7) * 100)}%` }]} />
                </View>
                <Text style={styles.badgeCardProgressLabel}>
                  {state.studySessionsCount} sessions done
                </Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Rank Ladder card */}
        <Card style={styles.ladderCard}>
          <View style={styles.ladderHeaderRow}>
            <View>
              <Text style={styles.ladderTitleText}>Rank Ladder</Text>
              <Text style={styles.ladderSubtitleText}>Climb by staying consistent every day</Text>
            </View>
            <Svg viewBox="0 0 24 24" width="18" height="18" color="#ff7043">
              <Path d="M18 15l-6-6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>

          <View style={styles.ladderRowsContainer}>
            {/* Row 1: Current Rank (Iron II) */}
            <View style={styles.ladderRow}>
              <View style={styles.ladderRowLeft}>
                <View style={styles.ladderIconCircleActive}>
                  <Svg viewBox="0 0 24 24" width="14" height="14" color="#ff7043">
                    <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <Circle cx="12" cy="12" r="3" fill="currentColor" />
                  </Svg>
                </View>
                <View style={styles.ladderDetailsActive}>
                  <Text style={styles.ladderRankNameActive}>{currentRankDetails.name}</Text>
                  <View style={styles.ladderProgressBg}>
                    <View style={[styles.ladderProgressFill, { width: `${progressRatio * 100}%` }]} />
                  </View>
                </View>
              </View>
              <Text style={styles.ladderRowStatusText}>Current</Text>
            </View>

            {/* Row 2: Next Rank (Bronze I) */}
            <View style={styles.ladderRow}>
              <View style={styles.ladderRowLeft}>
                <View style={styles.ladderIconCircle}>
                  <Svg viewBox="0 0 24 24" width="14" height="14" color="#8892b0">
                    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={styles.ladderDetails}>
                  <Text style={styles.ladderRankName}>{currentRankDetails.next}</Text>
                  <Text style={styles.ladderRankSub}>Next rank</Text>
                </View>
              </View>
              <Text style={styles.ladderRowXPChange}>+{xpNeeded.toLocaleString()} XP</Text>
            </View>

            {/* Row 3: Locked Rank (Bronze II) */}
            <View style={styles.ladderRow}>
              <View style={styles.ladderRowLeft}>
                <View style={styles.ladderIconCircle}>
                  <Svg viewBox="0 0 24 24" width="14" height="14" color="#8892b0">
                    <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6V9m12 0h1.5a2.5 2.5 0 0 0 0-5H18V9M8 22h8m-4-7v7m4-13a4 4 0 0 1-8 0V3h8v6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={styles.ladderDetails}>
                  <Text style={styles.ladderRankName}>{nextRankDetails.next}</Text>
                  <Text style={styles.ladderRankSub}>{nextRankDetails.maxXp.toLocaleString()} XP</Text>
                </View>
              </View>
              <Text style={styles.ladderRowStatusText}>Locked</Text>
            </View>
          </View>
        </Card>

      {/* Ranks Ladder Modal */}
      <Modal visible={showRanksModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Grind Level Ranks</Text>
              <TouchableOpacity onPress={() => setShowRanksModal(false)}>
                <Text style={styles.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.ranksModalList} showsVerticalScrollIndicator={false}>
              {ALL_RANKS.map((rk, index) => {
                const isCurrent = currentRankDetails.name.toLowerCase() === rk.name.toLowerCase();
                const isUnlocked = state.totalXP >= rk.xp;
                return (
                  <View 
                    key={rk.name} 
                    style={[
                      styles.rankModalRow, 
                      isCurrent && styles.rankModalRowCurrent,
                      !isUnlocked && styles.rankModalRowLocked
                    ]}
                  >
                    <View style={styles.rankModalRowLeft}>
                      <Image source={getAsset(rk.badge)} style={styles.rankModalBadge} resizeMode="contain" />
                      <View>
                        <Text style={[styles.rankModalName, isCurrent && { color: Theme.colors.accentOrange }]}>
                          {rk.name.toUpperCase()}
                        </Text>
                        <Text style={styles.rankModalXp}>
                          {rk.xp === 0 ? 'Base Level' : `Requires ${rk.xp.toLocaleString()} XP`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rankModalRowRight}>
                      {isCurrent ? (
                        <View style={styles.currentBadgePill}>
                          <Text style={styles.currentBadgeText}>ACTIVE</Text>
                        </View>
                      ) : isUnlocked ? (
                        <Text style={styles.unlockedIconText}>✓ Unlocked</Text>
                      ) : (
                        <Text style={styles.lockedIconText}>🔒 Locked</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <Button title="Back to Dashboard" onPress={() => setShowRanksModal(false)} style={{ marginTop: 16 }} />
          </Card>
        </View>
      </Modal>

      </ScrollView>
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
  backLinkRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Theme.colors.accentYellow,
    letterSpacing: 0.5,
  },
  tag: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.accentYellow,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: 20,
  },
  progressCard: {
    marginBottom: 20,
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
  filtersWrapper: {
    marginBottom: 24,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filtersContainer: {
    gap: 8,
    paddingRight: 40,
  },
  filterPill: {
    backgroundColor: Theme.colors.bgCard,
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterPillActive: {
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.04)',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  filterPillTextActive: {
    color: '#fff',
  },
  grid: {
    gap: 12,
  },
  achCard: {
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achCardUnlocked: {
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  achLeft: {
    alignItems: 'center',
    marginRight: 14,
  },
  iconWrapper: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: '#050607',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    position: 'relative',
    marginBottom: 6,
  },
  iconWrapperUnlocked: {
    borderColor: Theme.colors.accentYellow,
  },
  icon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  iconLocked: {
    opacity: 0.25,
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    height: 15,
    width: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeOverlayGold: {
    backgroundColor: Theme.colors.accentYellow,
  },
  badgeOverlayLock: {
    backgroundColor: Theme.colors.border,
  },
  badgeIcon: {
    fontSize: 9,
    color: '#000',
    fontWeight: '900',
  },
  badgeIconLock: {
    fontSize: 8,
  },
  xpTag: {
    fontSize: 9,
    color: Theme.colors.accentYellow,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  achRight: {
    flex: 1,
    justifyContent: 'center',
  },
  achName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  achDesc: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
  },
  progRow: {
    marginTop: 6,
  },
  progText: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  goBtn: {
    backgroundColor: 'rgba(235, 212, 91, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(235, 212, 91, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginLeft: 10,
  },
  goBtnText: {
    color: Theme.colors.accentYellow,
    fontWeight: '800',
    fontSize: 11,
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
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
  },
  closeBtn: {
    fontSize: 24,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  detailBox: {
    alignItems: 'center',
    width: '100%',
  },
  detailIcon: {
    height: 72,
    width: 72,
    resizeMode: 'contain',
    marginBottom: 14,
  },
  detailXpTag: {
    fontSize: 11.5,
    fontWeight: '900',
    color: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(235, 212, 91, 0.2)',
    marginBottom: 16,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  detailCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  detailDesc: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  detailProgBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 24,
  },
  detailProgTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailProgLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  detailProgVal: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#fff',
  },
  detailCloseBtn: {
    width: '100%',
  },

  // Premium Achievements Styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitles: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 112, 67, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 112, 67, 0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  rankBadgeText: {
    fontSize: 11.5,
    color: '#fff',
    fontWeight: '800',
  },
  rankCardPremium: {
    padding: 20,
    backgroundColor: '#1b1c21',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    marginBottom: 28,
  },
  rankCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  rankLeftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  shieldWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 112, 67, 0.06)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 112, 67, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankCardSub: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  rankCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginTop: 2,
  },
  xpBadgePill: {
    backgroundColor: '#050607',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 112, 67, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  xpBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '800',
  },
  climbContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  climbLeft: {
    flex: 1,
  },
  climbLabel: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  climbValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ff7043',
  },
  climbRight: {
    alignItems: 'flex-end',
  },
  climbRightLabel: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  climbRightValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#fff',
  },
  progressBarWrapper: {
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff7043',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressFooterLeft: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  progressFooterRight: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  sectionSubtitleText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4e00',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  viewAllIcon: {
    marginTop: 0.5,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '800',
  },
  badgeGridContainer: {
    gap: 12,
    marginBottom: 28,
  },
  badgeGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    padding: 14,
    backgroundColor: '#1b1c21',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    justifyContent: 'space-between',
    minHeight: 150,
  },
  badgeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 112, 67, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 112, 67, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStatusBadge: {
    backgroundColor: 'rgba(255, 112, 67, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  cardStatusBadgeCompleted: {
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
  },
  cardStatusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ff7043',
  },
  badgeCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 3,
  },
  badgeCardDesc: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    lineHeight: 14,
    marginBottom: 12,
  },
  badgeCardFooter: {
    gap: 6,
  },
  cardProgressBg: {
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    backgroundColor: '#ff7043',
    borderRadius: 2,
  },
  badgeCardProgressLabel: {
    fontSize: 9,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  ladderCard: {
    padding: 18,
    backgroundColor: '#1b1c21',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
  },
  ladderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    paddingBottom: 12,
  },
  ladderTitleText: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#fff',
  },
  ladderSubtitleText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  ladderRowsContainer: {
    gap: 12,
  },
  ladderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  ladderRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  ladderIconCircleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 112, 67, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 112, 67, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ladderIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ladderDetailsActive: {
    flex: 1,
    gap: 6,
    paddingRight: 16,
  },
  ladderDetails: {
    flex: 1,
  },
  ladderRankNameActive: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#fff',
  },
  ladderRankName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  ladderRankSub: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  ladderProgressBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  ladderProgressFill: {
    height: '100%',
    backgroundColor: '#ff7043',
    borderRadius: 2,
  },
  ladderRowStatusText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  ladderRowXPChange: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ff7043',
  },
  rankCardBadgeImg: {
    width: 32,
    height: 32,
  },
  expTasksCard: {
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  expTasksList: {
    width: '100%',
  },
  expTaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  expTaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  expTaskIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 112, 67, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 112, 67, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expTaskName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#fff',
  },
  expTaskDesc: {
    fontSize: 10.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  expTaskRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  expTaskXP: {
    fontSize: 12,
    fontWeight: '900',
    color: Theme.colors.accentYellow,
  },
  expTaskGoBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  expTaskGoBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  ranksModalList: {
    maxHeight: 380,
    marginVertical: 8,
  },
  rankModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  rankModalRowCurrent: {
    backgroundColor: 'rgba(255, 112, 67, 0.04)',
    borderColor: 'rgba(255, 112, 67, 0.2)',
  },
  rankModalRowLocked: {
    opacity: 0.65,
  },
  rankModalRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankModalBadge: {
    width: 28,
    height: 28,
  },
  rankModalName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  rankModalXp: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  rankModalRowRight: {
    alignItems: 'flex-end',
  },
  currentBadgePill: {
    backgroundColor: Theme.colors.accentOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
  },
  unlockedIconText: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.accentGreen,
  },
  lockedIconText: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
  },
  rankBadgeClean: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadgeIconClean: {
    width: 26,
    height: 26,
    marginRight: 6,
  },
  rankBadgeTextClean: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '900',
  },
});

export default AchievementsScreen;
