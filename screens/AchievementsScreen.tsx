import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { ACHIEVEMENT_DEFINITIONS, AchievementDefinition } from '../constants/achievements';
import { getAsset } from '../constants/assetsMap';

export const AchievementsScreen: React.FC = () => {
  const { state, switchView } = useApp();
  const [filter, setFilter] = useState<'all' | 'workout' | 'study' | 'sleep' | 'water' | 'special'>('all');
  const [selectedAch, setSelectedAch] = useState<AchievementDefinition | null>(null);

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
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
});
export default AchievementsScreen;
