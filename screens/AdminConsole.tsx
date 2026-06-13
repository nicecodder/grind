import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { Theme } from '../components/Theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { adminApi, AdminStats, AdminUser } from '../services/adminApi';
import { supabase } from '../services/supabase';

export const AdminConsole: React.FC = () => {
  const { showToast } = useApp();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal controls
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [seasonModalVisible, setSeasonModalVisible] = useState(false);

  // Form states for edits
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editSub, setEditSub] = useState('free');
  const [editXP, setEditXP] = useState('0');
  const [editStreak, setEditStreak] = useState('0');

  // Async action flags
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [seasonLoading, setSeasonLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) {
        throw new Error('You must be authenticated to access the Admin Console.');
      }
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(token),
        adminApi.getUsers(token),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to retrieve console registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter users list when query or data changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.username?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.id?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setEditUsername(user.username || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'user');
    setEditSub(user.subscription_plan || 'free');
    setEditXP(String(user.xp || 0));
    setEditStreak(String(user.streak || 0));
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;
    if (!editUsername.trim() || !editEmail.trim()) {
      showToast('Validation Error', 'Username and Email are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error('Session expired. Please log in again.');

      await adminApi.editUser(token, selectedUser.id, {
        username: editUsername.trim(),
        email: editEmail.trim(),
        role: editRole,
        subscription_plan: editSub,
        xp: parseInt(editXP) || 0,
        streak: parseInt(editStreak) || 0,
      });

      showToast('User Updated', `Successfully updated profile details for ${editUsername}.`, 'success');
      setEditModalVisible(false);
      loadData();
    } catch (err: any) {
      showToast('Edit Failed', err.message || 'Error updating user.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error('Session expired.');

      await adminApi.deleteUser(token, selectedUser.id);
      showToast('User Deleted', `Account for ${selectedUser.username} has been permanently deleted.`, 'success');
      setDeleteModalVisible(false);
      loadData();
    } catch (err: any) {
      showToast('Delete Failed', err.message || 'Error deleting account.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSeasonReset = async () => {
    setSeasonLoading(true);
    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error('Session expired.');

      await adminApi.startNewSeason(token);
      showToast('New Season Started! 🏆', 'All user streaks and counters are archived. Season counter bumped.', 'success');
      setSeasonModalVisible(false);
      loadData();
    } catch (err: any) {
      showToast('Season Rollback Failed', err.message || 'Error triggering reset.', 'error');
    } finally {
      setSeasonLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.accentYellow} />
        <Text style={styles.loadingText}>Loading Admin Control Console...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ADMIN CONSOLE</Text>
          <Text style={styles.headerSubtitle}>Manage users, adjust metrics, and roll seasons.</Text>
        </View>

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry Loading" onPress={loadData} variant="outline" style={styles.retryBtn} />
          </Card>
        )}

        {/* Stats Metrics Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <Card style={styles.statBox}>
                <Text style={styles.statLabel}>Total Grinders</Text>
                <Text style={styles.statVal}>{stats.totalUsers}</Text>
              </Card>
              <Card style={styles.statBox}>
                <Text style={styles.statLabel}>Premium Ratio</Text>
                <Text style={styles.statVal}>
                  {stats.totalUsers > 0
                    ? `${Math.round(((stats.proUsers + stats.eliteUsers) / stats.totalUsers) * 100)}%`
                    : '0%'}
                </Text>
              </Card>
            </View>

            <View style={styles.statsRow}>
              <Card style={styles.statBox}>
                <Text style={styles.statLabel}>Pro / Elite tiers</Text>
                <Text style={styles.statVal}>
                  {stats.proUsers} <Text style={{ fontSize: 13, color: Theme.colors.textSecondary }}>/</Text> {stats.eliteUsers}
                </Text>
              </Card>
              <Card style={styles.statBox}>
                <Text style={styles.statLabel}>Cumulative XP</Text>
                <Text style={styles.statVal}>{stats.totalXP.toLocaleString()}</Text>
              </Card>
            </View>
          </View>
        )}

        {/* Season Reset Action Card */}
        <Card variant="glow" style={styles.seasonCard}>
          <View style={styles.seasonInfo}>
            <Text style={styles.seasonTitle}>Archival Operations</Text>
            <Text style={styles.seasonDesc}>
              Triggering a new season archives current stats, increments the season counters, and resets active XP/streaks to base levels.
            </Text>
          </View>
          <Button
            title="Start New Season"
            onPress={() => setSeasonModalVisible(true)}
            variant="danger"
            style={styles.seasonBtn}
          />
        </Card>

        {/* User Search Registry */}
        <Text style={styles.sectionTitle}>USERS REGISTRY ({filteredUsers.length})</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by username, email or ID..."
          placeholderTextColor={Theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <Text style={styles.noResults}>No matching grinders found.</Text>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} style={styles.userCard}>
              <View style={styles.userInfoRow}>
                <View style={styles.userHeaderInfo}>
                  <Text style={styles.usernameText}>{user.username || 'Anonymous Athlete'}</Text>
                  <Text style={styles.emailText}>{user.email}</Text>
                </View>
                <View style={styles.badgeRow}>
                  <Text
                    style={[
                      styles.roleTag,
                      user.role === 'admin' ? styles.roleAdmin : styles.roleUser,
                    ]}
                  >
                    {user.role.toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.subTag,
                      user.subscription_plan === 'pro' && styles.subPro,
                      user.subscription_plan === 'elite' && styles.subElite,
                    ]}
                  >
                    {user.subscription_plan.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.userStatsRow}>
                <View style={styles.userStatMini}>
                  <Text style={styles.miniLabel}>XP Score</Text>
                  <Text style={styles.miniVal}>{user.xp?.toLocaleString() || 0} XP</Text>
                </View>
                <View style={styles.userStatMini}>
                  <Text style={styles.miniLabel}>Streak</Text>
                  <Text style={styles.miniVal}>{user.streak || 0} days 🔥</Text>
                </View>
                <View style={styles.userStatMini}>
                  <Text style={styles.miniLabel}>Registered</Text>
                  <Text style={styles.miniVal}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionBtnRow}>
                <Button
                  title="Modify Profile"
                  onPress={() => openEditModal(user)}
                  variant="outline"
                  style={styles.editCardBtn}
                />
                <Button
                  title="Delete User"
                  onPress={() => openDeleteModal(user)}
                  variant="danger"
                  style={styles.deleteCardBtn}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Edit User Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Modify Grinder Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Username</Text>
                <TextInput
                  style={styles.formInput}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="Username"
                  placeholderTextColor={Theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <TextInput
                  style={styles.formInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Email"
                  placeholderTextColor={Theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Account Role</Text>
                <View style={styles.radioRow}>
                  {['user', 'admin'].map((role) => (
                    <TouchableOpacity
                      key={role}
                      activeOpacity={0.8}
                      onPress={() => setEditRole(role)}
                      style={[styles.radioBtn, editRole === role && styles.radioBtnActive]}
                    >
                      <Text style={[styles.radioBtnText, editRole === role && styles.radioBtnTextActive]}>
                        {role.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Subscription Tier</Text>
                <View style={styles.radioRow}>
                  {['free', 'pro', 'elite'].map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      activeOpacity={0.8}
                      onPress={() => setEditSub(tier)}
                      style={[styles.radioBtn, editSub === tier && styles.radioBtnActive]}
                    >
                      <Text style={[styles.radioBtnText, editSub === tier && styles.radioBtnTextActive]}>
                        {tier.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formRowFields}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>XP Points</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editXP}
                    onChangeText={setEditXP}
                    placeholder="e.g. 5000"
                    placeholderTextColor={Theme.colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Streaks (Days)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editStreak}
                    onChangeText={setEditStreak}
                    placeholder="e.g. 7"
                    placeholderTextColor={Theme.colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Button
                title={saving ? 'Saving Adjustments...' : 'Save Adjustments'}
                onPress={handleEditSave}
                loading={saving}
                style={styles.saveBtn}
              />
            </ScrollView>
          </Card>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Card style={[styles.modalCard, { maxHeight: 250 }]}>
            <Text style={styles.confirmHeader}>Delete Account</Text>
            <Text style={styles.confirmText}>
              Are you absolutely sure you want to delete the account for{' '}
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{selectedUser?.username}</Text>? This action is
              irreversible and will purge all tracking data from the databases.
            </Text>

            <View style={styles.confirmActions}>
              <Button
                title="Cancel"
                onPress={() => setDeleteModalVisible(false)}
                variant="outline"
                style={styles.confirmBtn}
              />
              <Button
                title={deleting ? 'Deleting...' : 'Delete User'}
                onPress={handleDeleteConfirm}
                variant="danger"
                loading={deleting}
                style={styles.confirmBtn}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Season Reset Confirmation Modal */}
      <Modal visible={seasonModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Card style={[styles.modalCard, { maxHeight: 270 }]}>
            <Text style={[styles.confirmHeader, { color: Theme.colors.accentOrange }]}>⚠️ CAUTION: Start New Season</Text>
            <Text style={styles.confirmText}>
              You are about to archive all current grinder streaks, steps counters, and logged metrics to lock in the
              leaderboards. This action resets all user XP and streaks. This is a severe global database modification.
            </Text>

            <View style={styles.confirmActions}>
              <Button
                title="Cancel Reset"
                onPress={() => setSeasonModalVisible(false)}
                variant="outline"
                style={styles.confirmBtn}
              />
              <Button
                title={seasonLoading ? 'Archiving...' : 'Start New Season'}
                onPress={handleSeasonReset}
                variant="danger"
                loading={seasonLoading}
                style={styles.confirmBtn}
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Theme.colors.bgApp,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  errorCard: {
    borderColor: '#ff5252',
    backgroundColor: 'rgba(255, 82, 82, 0.02)',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    height: 36,
  },
  statsContainer: {
    marginBottom: 20,
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statLabel: {
    fontSize: 10.5,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
    marginBottom: 6,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  seasonCard: {
    flexDirection: 'column',
    borderColor: Theme.colors.accentOrange,
    backgroundColor: 'rgba(255, 112, 67, 0.02)',
    marginBottom: 24,
    padding: 16,
    gap: 14,
  },
  seasonInfo: {
    flex: 1,
  },
  seasonTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Theme.colors.accentOrange,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  seasonDesc: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    lineHeight: 17,
  },
  seasonBtn: {
    width: '100%',
    height: 40,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  searchBar: {
    height: 44,
    backgroundColor: Theme.colors.bgCard,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    color: '#fff',
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
  noResults: {
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 20,
  },
  userCard: {
    marginBottom: 12,
    gap: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userHeaderInfo: {
    flex: 1,
    paddingRight: 10,
  },
  usernameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleTag: {
    fontSize: 8.5,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  roleAdmin: {
    backgroundColor: '#ff5252',
    color: '#fff',
  },
  roleUser: {
    backgroundColor: '#24272c',
    color: Theme.colors.textSecondary,
  },
  subTag: {
    fontSize: 8.5,
    fontWeight: '900',
    backgroundColor: '#24272c',
    color: Theme.colors.textSecondary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  subPro: {
    backgroundColor: Theme.colors.accentYellow,
    color: '#0b0c0e',
  },
  subElite: {
    backgroundColor: Theme.colors.accentOrange,
    color: '#0b0c0e',
  },
  userStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  userStatMini: {
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 9,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  miniVal: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#fff',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  editCardBtn: {
    flex: 1,
    height: 34,
  },
  deleteCardBtn: {
    flex: 1,
    height: 34,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
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
  formContainer: {
    gap: 16,
  },
  formField: {
    gap: 6,
  },
  formRowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
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
    fontSize: 13,
    fontWeight: '600',
  },
  radioRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
    padding: 4,
    gap: 4,
  },
  radioBtn: {
    flex: 1,
    height: 34,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioBtnActive: {
    backgroundColor: Theme.colors.bgCardHover,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  radioBtnText: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    fontWeight: '700',
  },
  radioBtnTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  saveBtn: {
    width: '100%',
    marginTop: 10,
  },
  confirmHeader: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ff5252',
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    height: 40,
  },
});
export default AdminConsole;
