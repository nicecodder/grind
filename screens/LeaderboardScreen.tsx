import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { adminApi, AdminUser } from '../services/adminApi';
import { getAsset } from '../constants/assetsMap';
import { supabase } from '../services/supabase';

// Static bots configurations matching app.js
const STATIC_BOTS = [
  { name: 'mollitommy', xp: 55200, lvl: 150, plan: 'pro', badge: 'badges/ultrasupreme.png', handle: '@mollitommy', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'jefryjerry', xp: 35200, lvl: 120, plan: 'pro', badge: 'badges/master.png', handle: '@jefryjerry', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'kolitrurne', xp: 25200, lvl: 100, plan: 'pro', badge: 'badges/dimond.png', handle: '@kolitrurne', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Theresa Webb', xp: 18500, lvl: 100, plan: 'free', badge: 'badges/gold.png', handle: '@meraty', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Kathryn Murphy', xp: 15200, lvl: 50, plan: 'free', badge: 'badges/silver.png', handle: '@faueod', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Jane Cooper', xp: 12100, lvl: 25, plan: 'free', badge: 'badges/bronze.png', handle: '@jikolim', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Zyzz', xp: 15000, lvl: 19, badge: 'badges/gold.png', plan: 'elite', handle: '@zyzz', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'David Laid', xp: 16200, lvl: 22, badge: 'badges/gold.png', plan: 'pro', handle: '@davidlaid', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'C-Bum', xp: 13320, lvl: 16, badge: 'badges/silver.png', plan: 'free', handle: '@cbum', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Sam Sulek', xp: 13100, lvl: 15, badge: 'badges/silver.png', plan: 'free', handle: '@samsulek', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Arnold', xp: 11800, lvl: 13, badge: 'badges/silver.png', plan: 'free', handle: '@arnold', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Noel Deyzel', xp: 10400, lvl: 11, badge: 'badges/bronze.png', plan: 'free', handle: '@noeldeyzel', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Ronnie C', xp: 10150, lvl: 10, badge: 'badges/bronze.png', plan: 'free', handle: '@ronniec', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' },
  { name: 'Jeff Seid', xp: 8650, lvl: 8, badge: 'badges/bronze.png', plan: 'free', handle: '@jeffseid', avatarUrl: 'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png' },
  { name: 'Alex Eubank', xp: 7400, lvl: 5, badge: 'badges/bronze.png', plan: 'free', handle: '@alexeubank', avatarUrl: 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png' }
];

export interface LeaderboardPlayer {
  id?: string;
  name: string;
  xp: number;
  priorityXP?: number;
  lvl: number;
  badge: string;
  plan: 'free' | 'pro' | 'elite';
  handle: string;
  avatarUrl: string;
  isUser: boolean;
  isRealUser?: boolean;
}

export const LeaderboardScreen: React.FC = () => {
  const { state, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [competitors, setCompetitors] = useState<LeaderboardPlayer[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardPlayer | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [state.totalXP, state.subscriptionPlan, state.grinderName]);

  const fetchLeaderboardData = async () => {
    setLoadingList(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (session && state.isUserSignedIn) {
        // Fetch profiles registered from backend proxy via select join queries
        const { data: rows, error } = await supabase
          .from('profiles')
          .select('id, username, subscription_plan, user_states(state_json)')
          .neq('subscription_plan', 'free');

        if (error) throw error;

        const dbCompetitors: LeaderboardPlayer[] = [];
        rows?.forEach((row: any) => {
          const uState = row.user_states?.state_json || {};
          const totalXP = uState.totalXP || 0;
          
          let lvl = 10;
          let badge = 'badges/bronze.png';
          if (totalXP < 3000) { lvl = 10; badge = 'badges/bronze.png'; }
          else if (totalXP < 8000) { lvl = 20; badge = 'badges/silver.png'; }
          else if (totalXP < 16000) { lvl = 30; badge = 'badges/gold.png'; }
          else if (totalXP < 30000) { lvl = 40; badge = 'badges/dimond.png'; }
          else if (totalXP < 50000) { lvl = 50; badge = 'badges/master.png'; }
          else if (totalXP < 100000) { lvl = 60; badge = 'badges/supreme.png'; }
          else { lvl = 70; badge = 'badges/ultrasupreme.png'; }

          const priorityXP = row.subscription_plan === 'elite' ? totalXP + 1000 : totalXP;
          const isUser = row.username === state.grinderName;

          dbCompetitors.push({
            id: row.id,
            name: row.username,
            xp: totalXP,
            priorityXP,
            lvl,
            badge,
            plan: row.subscription_plan,
            handle: `@${row.username.toLowerCase().replace(/\s+/g, '')}`,
            avatarUrl: uState.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png',
            isUser,
            isRealUser: true,
          });
        });

        // Add static bots
        const botsList: LeaderboardPlayer[] = STATIC_BOTS.map((bot) => ({
          name: bot.name,
          xp: bot.xp,
          lvl: bot.lvl,
          badge: bot.badge,
          plan: bot.plan as any,
          handle: bot.handle,
          avatarUrl: bot.avatarUrl,
          isUser: false,
        }));

        // Merge, filter duplicates, and sort
        const userExistsInDb = dbCompetitors.some(p => p.isUser);
        if (!userExistsInDb && state.subscriptionPlan !== 'free') {
          // If user upgraded but sync hasn't occurred yet
          dbCompetitors.push({
            name: state.grinderName,
            xp: state.totalXP,
            lvl: Math.floor(state.totalXP / 400) + 1,
            badge: getBadgeSrc(state.totalXP),
            plan: state.subscriptionPlan,
            handle: `@${state.grinderName.toLowerCase().replace(/\s+/g, '')}`,
            avatarUrl: state.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png',
            isUser: true,
          });
        }

        const combined = [...dbCompetitors, ...botsList];
        
        // Remove duplicates if same handles exist
        const unique = combined.filter((v, i, a) => a.findIndex(t => (t.handle === v.handle)) === i);
        
        unique.sort((a, b) => {
          const aVal = a.priorityXP !== undefined ? a.priorityXP : a.xp;
          const bVal = b.priorityXP !== undefined ? b.priorityXP : b.xp;
          return bVal - aVal;
        });

        setCompetitors(unique);
      } else {
        // Offline / Unauthenticated flow: load local mock leaderboard
        generateMockOfflineLeaderboard();
      }
    } catch (err) {
      console.error('Failed to load online leaderboard, loading fallback:', err);
      generateMockOfflineLeaderboard();
    } finally {
      setLoadingList(false);
    }
  };

  const generateMockOfflineLeaderboard = () => {
    const list: LeaderboardPlayer[] = STATIC_BOTS.map((bot) => ({
      name: bot.name,
      xp: bot.xp,
      lvl: bot.lvl,
      badge: bot.badge,
      plan: bot.plan as any,
      handle: bot.handle,
      avatarUrl: bot.avatarUrl,
      isUser: false,
    }));

    // Inject user if they are ranked (Pro/Elite)
    if (state.subscriptionPlan !== 'free') {
      let lvl = 10;
      let badge = 'badges/bronze.png';
      if (state.totalXP < 3000) { lvl = 10; badge = 'badges/bronze.png'; }
      else if (state.totalXP < 8000) { lvl = 20; badge = 'badges/silver.png'; }
      else if (state.totalXP < 16000) { lvl = 30; badge = 'badges/gold.png'; }
      else if (state.totalXP < 30000) { lvl = 40; badge = 'badges/dimond.png'; }
      else if (state.totalXP < 50000) { lvl = 50; badge = 'badges/master.png'; }
      else if (state.totalXP < 100000) { lvl = 60; badge = 'badges/supreme.png'; }
      else { lvl = 70; badge = 'badges/ultrasupreme.png'; }

      const priorityXP = state.subscriptionPlan === 'elite' ? state.totalXP + 1000 : state.totalXP;
      
      list.push({
        name: state.grinderName,
        xp: state.totalXP,
        priorityXP,
        lvl,
        badge,
        plan: state.subscriptionPlan,
        handle: `@${state.grinderName.toLowerCase().replace(/\s+/g, '')}`,
        avatarUrl: state.avatarUrl || 'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png',
        isUser: true,
      });
    }

    list.sort((a, b) => {
      const aVal = a.priorityXP !== undefined ? a.priorityXP : a.xp;
      const bVal = b.priorityXP !== undefined ? b.priorityXP : b.xp;
      return bVal - aVal;
    });

    setCompetitors(list);
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

  // Perform search query filtering
  const filtered = competitors.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      p.handle.toLowerCase().includes(search.toLowerCase().trim()) ||
      p.plan.toLowerCase().includes(search.toLowerCase().trim())
  );

  const isFree = state.subscriptionPlan === 'free';
  const userRankIndex = competitors.findIndex((p) => p.isUser);
  const userRank = isFree ? 'Unranked' : userRankIndex + 1;

  // Podium players (Top 3)
  const first = competitors[0];
  const second = competitors[1];
  const third = competitors[2];

  // List users starting from index 3
  const remainderUsers = filtered.filter((_, idx) => {
    // If searching, show all matching rows
    if (search.trim() !== '') return true;
    return idx >= 3;
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.tag}>GLOBAL ARENA LEAGUE</Text>
        <Text style={styles.title}>Grinders Leaderboard</Text>

        {/* Global Player Standing Card */}
        <Card style={[styles.standingCard, isFree && styles.standingCardFree]}>
          <View style={styles.standingLeft}>
            <Image
              source={getAsset(isFree ? 'badges/bronze.png' : getBadgeSrc(state.totalXP))}
              style={[styles.standingBadge, isFree && { opacity: 0.4 }]}
            />
          </View>
          <View style={styles.standingRight}>
            <Text style={styles.standingRank}>
              {isFree ? 'GLOBAL STANDING: UNRANKED' : `GLOBAL ARENA RANK: #${userRank}`}
            </Text>
            <Text style={styles.standingText}>
              {isFree
                ? 'Only ranked members are listed on the leaderboard. Upgrade to Grind Pro or Elite to join the ranks!'
                : `Awesome work, Grinder! You are currently ranking in the global Top ${userRank}.`}
            </Text>
          </View>
        </Card>

        {/* 3D oblique Podium Column Layout (rendered only when not searching) */}
        {search.trim() === '' && competitors.length >= 3 && (
          <View style={styles.podiumContainer}>
            {/* 2nd Place Column (Left) */}
            {second && (
              <View style={styles.podiumCol}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedPlayer(second)}>
                  <View style={[styles.avatarWrapper, styles.avatarWrapperSilver]}>
                    <Image source={getAsset(second.avatarUrl)} style={styles.podiumAvatar} />
                    <Text style={styles.podiumOverlayBadge}>🥈</Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.podiumName}>{second.name}</Text>
                <View style={styles.podiumExpPill}>
                  <Text style={styles.podiumExpText}>{second.xp.toLocaleString()} XP</Text>
                </View>
                <View style={[styles.podiumBlock, styles.podiumBlockSilver]}>
                  <Text style={styles.podiumNumber}>2</Text>
                </View>
              </View>
            )}

            {/* 1st Place Column (Center) */}
            {first && (
              <View style={styles.podiumCol}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedPlayer(first)}>
                  <View style={[styles.avatarWrapper, styles.avatarWrapperGold]}>
                    <Image source={getAsset(first.avatarUrl)} style={styles.podiumAvatar} />
                    <Text style={styles.podiumOverlayBadge}>👑</Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.podiumName}>{first.name}</Text>
                <View style={[styles.podiumExpPill, styles.podiumExpPillGold]}>
                  <Text style={styles.podiumExpTextGold}>{first.xp.toLocaleString()} XP</Text>
                </View>
                <View style={[styles.podiumBlock, styles.podiumBlockGold]}>
                  <Text style={styles.podiumNumber}>1</Text>
                </View>
              </View>
            )}

            {/* 3rd Place Column (Right) */}
            {third && (
              <View style={styles.podiumCol}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedPlayer(third)}>
                  <View style={[styles.avatarWrapper, styles.avatarWrapperBronze]}>
                    <Image source={getAsset(third.avatarUrl)} style={styles.podiumAvatar} />
                    <Text style={styles.podiumOverlayBadge}>🥉</Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.podiumName}>{third.name}</Text>
                <View style={styles.podiumExpPill}>
                  <Text style={styles.podiumExpText}>{third.xp.toLocaleString()} XP</Text>
                </View>
                <View style={[styles.podiumBlock, styles.podiumBlockBronze]}>
                  <Text style={styles.podiumNumber}>3</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Search filter input */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Arena rankings..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Scroll list ranks 4+ */}
        <View style={styles.list}>
          {remainderUsers.map((player, idx) => {
            const displayRank = search.trim() !== '' ? idx + 1 : idx + 4;
            return (
              <TouchableOpacity
                key={player.handle}
                activeOpacity={0.85}
                onPress={() => setSelectedPlayer(player)}
                style={[styles.listItem, player.isUser && styles.listItemUser]}
              >
                <View style={styles.listItemLeft}>
                  <Text style={styles.listRank}>#{displayRank}</Text>
                  <View style={styles.avatarContainer}>
                    <Image source={getAsset(player.avatarUrl)} style={styles.listAvatar} />
                  </View>
                  <View style={styles.listDetails}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.listName, player.isUser && styles.listNameUser]}>
                        {player.name}
                      </Text>
                      {player.plan === 'elite' && <Text style={styles.eliteTag}>ELITE</Text>}
                      {player.plan === 'pro' && <Text style={styles.proTag}>PRO</Text>}
                    </View>
                    <Text style={styles.listHandle}>{player.handle}</Text>
                  </View>
                </View>

                <View style={styles.listRight}>
                  <Text style={styles.listXp}>{player.xp.toLocaleString()}</Text>
                  <Text style={styles.listXpUnit}>XP</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Competitor detailed statistics modal */}
      {selectedPlayer && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <Card style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Arena Profile Details</Text>
                <TouchableOpacity onPress={() => setSelectedPlayer(null)}>
                  <Text style={styles.closeBtn}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.profileBox}>
                <Image source={getAsset(selectedPlayer.avatarUrl)} style={styles.profileAvatar} />
                <Text style={styles.profileName}>{selectedPlayer.name}</Text>
                <Text style={styles.profileHandle}>{selectedPlayer.handle}</Text>
                
                <View style={styles.profileRow}>
                  <Text style={styles.profileTagLabel}>PLAN TIER:</Text>
                  <Text style={[styles.profileTagValue, selectedPlayer.plan === 'elite' && { color: Theme.colors.accentYellow }]}>
                    {selectedPlayer.plan.toUpperCase()} MEMBER
                  </Text>
                </View>

                <View style={styles.metrics}>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Discipline Score</Text>
                    <Text style={styles.metricVal}>{selectedPlayer.xp.toLocaleString()} XP</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Quest Level</Text>
                    <Text style={styles.metricVal}>Lvl {selectedPlayer.lvl}</Text>
                  </View>
                </View>

                <Button title="Close Profile view" onPress={() => setSelectedPlayer(null)} style={styles.closeProfileBtn} />
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
    color: Theme.colors.accentGreen,
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
  standingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderColor: Theme.colors.accentGreen,
    backgroundColor: 'rgba(0, 230, 118, 0.02)',
    marginBottom: 24,
  },
  standingCardFree: {
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.bgCard,
  },
  standingLeft: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  standingBadge: {
    height: 48,
    width: 48,
    resizeMode: 'contain',
  },
  standingRight: {
    flex: 1,
  },
  standingRank: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  standingText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 250,
    marginBottom: 28,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  podiumAvatar: {
    height: 54,
    width: 54,
    borderRadius: 27,
    borderWidth: 2,
  },
  avatarWrapperGold: {
    transform: [{ scale: 1.15 }],
    shadowColor: Theme.colors.accentYellow,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarWrapperSilver: {
    shadowColor: Theme.colors.accentCyan,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  avatarWrapperBronze: {
    shadowColor: Theme.colors.accentOrange,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  podiumOverlayBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    fontSize: 16,
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
    maxWidth: 80,
  },
  podiumExpPill: {
    backgroundColor: '#1b1c21',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 8,
  },
  podiumExpPillGold: {
    backgroundColor: Theme.colors.accentYellow,
    borderColor: Theme.colors.accentYellow,
  },
  podiumExpText: {
    fontSize: 9,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  podiumExpTextGold: {
    fontSize: 9,
    color: '#050607',
    fontWeight: '900',
  },
  podiumBlock: {
    width: 74,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumBlockGold: {
    height: 90,
    backgroundColor: '#1b1c21',
    borderTopWidth: 2,
    borderTopColor: Theme.colors.accentYellow,
  },
  podiumBlockSilver: {
    height: 65,
    backgroundColor: '#16181c',
    borderTopWidth: 2,
    borderTopColor: Theme.colors.accentCyan,
  },
  podiumBlockBronze: {
    height: 46,
    backgroundColor: '#121316',
    borderTopWidth: 2,
    borderTopColor: Theme.colors.accentOrange,
  },
  podiumNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.06)',
  },
  searchRow: {
    marginBottom: 16,
  },
  searchInput: {
    height: 44,
    backgroundColor: Theme.colors.bgCard,
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
  listItem: {
    backgroundColor: Theme.colors.bgCard,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemUser: {
    borderColor: Theme.colors.accentYellow,
    backgroundColor: 'rgba(235, 212, 91, 0.02)',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listRank: {
    fontSize: 13,
    fontWeight: '900',
    color: Theme.colors.textSecondary,
    width: 34,
  },
  avatarContainer: {
    marginRight: 10,
  },
  listAvatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  listDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#fff',
  },
  listNameUser: {
    color: Theme.colors.accentYellow,
    fontWeight: '900',
  },
  eliteTag: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000',
    backgroundColor: Theme.colors.accentYellow,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  proTag: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
    backgroundColor: Theme.colors.accentBlue,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  listHandle: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  listRight: {
    alignItems: 'flex-end',
  },
  listXp: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  listXpUnit: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    marginTop: 1,
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
  profileBox: {
    alignItems: 'center',
    width: '100%',
  },
  profileAvatar: {
    height: 90,
    width: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: Theme.colors.borderGlow,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 20,
  },
  profileTagLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  profileTagValue: {
    fontSize: 11,
    fontWeight: '900',
    color: Theme.colors.accentBlue,
  },
  metrics: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  metric: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 14,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  closeProfileBtn: {
    width: '100%',
  },
});
export default LeaderboardScreen;
