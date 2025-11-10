// GroupDetailScreen.tsx - Updated to use dynamic data
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Share,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import { GroupsStackScreenProps } from '../../types/navigation.types';
import { Ionicons } from '@expo/vector-icons';
import { StudyGroup } from './GroupsScreen'; // Import the StudyGroup interface

const { width } = Dimensions.get('window');

interface Member {
  id: string;
  name: string;
  role: 'admin' | 'moderator' | 'member';
  avatar: string;
  joinedDate: Date;
  lastActive: Date;
}

interface Activity {
  id: string;
  type: 'joined' | 'message' | 'file' | 'event';
  user: string;
  description: string;
  timestamp: Date;
}

const GroupDetailScreen = ({ navigation, route }: GroupsStackScreenProps<'GroupDetail'>) => {
  const { colors } = useTheme();
  const { groupId, groupData: passedGroupData } = route.params;
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [refreshing, setRefreshing] = useState(false);
  const headerHeight = useRef(new Animated.Value(200)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Use the passed group data or fetch based on groupId
  const [groupData, setGroupData] = useState<StudyGroup>(
    passedGroupData || {
      id: groupId,
      name: 'Loading...',
      category: 'GENERAL',
      description: 'Loading group details...',
      memberCount: 0,
      maxMembers: 50,
      isPublic: true,
      createdAt: new Date(),
      lastActivity: new Date(),
      admin: { id: '1', name: 'Admin', avatar: '👤' },
      tags: [],
      rules: [],
      nextSession: new Date(),
      totalSessions: 0,
      completedSessions: 0,
    }
  );

  // Generate members based on the group
  const [members] = useState<Member[]>(() => {
    const membersList: Member[] = [
      {
        id: groupData.admin.id,
        name: groupData.admin.name,
        role: 'admin',
        avatar: groupData.admin.avatar,
        joinedDate: groupData.createdAt,
        lastActive: new Date(),
      },
    ];

    // Add moderators based on group category
    if (groupData.category === 'NRB') {
      membersList.push({
        id: '2',
        name: 'Sita Pandey',
        role: 'moderator',
        avatar: '👩',
        joinedDate: new Date('2024-01-20'),
        lastActive: new Date(Date.now() - 3600000),
      });
    } else if (groupData.category === 'NTC') {
      membersList.push({
        id: '2',
        name: 'Ram Thapa',
        role: 'moderator',
        avatar: '👨',
        joinedDate: new Date('2024-01-25'),
        lastActive: new Date(Date.now() - 1800000),
      });
    }

    // Add some regular members
    for (let i = 3; i <= Math.min(5, groupData.memberCount); i++) {
      membersList.push({
        id: String(i),
        name: `Member ${i}`,
        role: 'member',
        avatar: i % 2 === 0 ? '👨' : '👩',
        joinedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      });
    }

    return membersList;
  });

  // Generate activities based on the group
  const [activities] = useState<Activity[]>(() => {
    const activityList: Activity[] = [];
    const activityTypes = ['joined', 'message', 'file', 'event'];
    
    for (let i = 0; i < 5; i++) {
      activityList.push({
        id: String(i + 1),
        type: activityTypes[Math.floor(Math.random() * activityTypes.length)] as any,
        user: members[Math.floor(Math.random() * Math.min(members.length, 3))].name,
        description: i === 0 ? 'joined the group' : 
                    i === 1 ? 'posted a new announcement' :
                    i === 2 ? 'shared study materials' :
                    i === 3 ? 'scheduled a study session' :
                    'updated group information',
        timestamp: new Date(Date.now() - (i + 1) * 3600000),
      });
    }

    return activityList;
  });

  useEffect(() => {
    // If no group data was passed, you could fetch it here based on groupId
    if (!passedGroupData) {
      // fetchGroupData(groupId);
    }
  }, [groupId, passedGroupData]);

  useEffect(() => {
    Animated.timing(headerHeight, {
      toValue: 200,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleJoinGroup = () => {
    Alert.alert(
      'Join Group',
      `Do you want to join "${groupData.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: () => {
            setIsMember(true);
            Alert.alert('Success', 'Welcome to the group!');
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setIsMember(false);
            Alert.alert('Success', 'You have left the group');
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join "${groupData.name}" on PSC Study App! ${groupData.description}`,
        title: groupData.name,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'joined': return 'person-add';
      case 'message': return 'chatbubble';
      case 'file': return 'document';
      case 'event': return 'calendar';
      default: return 'ellipse';
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Rest of the component remains the same but uses the dynamic groupData...
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {groupData.name}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            { 
              backgroundColor: colors.primary + '10',
              height: headerHeight,
            }
          ]}
        >
          <View style={styles.heroContent}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.categoryText}>{groupData.category}</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {groupData.memberCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Members
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {groupData.totalSessions || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Sessions
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {Math.round((groupData.memberCount / groupData.maxMembers) * 100)}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Full
                </Text>
              </View>
            </View>

            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${(groupData.memberCount / groupData.maxMembers) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {isMember ? (
            <View style={styles.memberActions}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('GroupChat', {
                  groupId: groupData.id,
                  groupName: groupData.name
                })}
              >
                <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Open Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={handleLeaveGroup}
              >
                <Ionicons name="exit-outline" size={20} color={colors.error} />
                <Text style={[styles.secondaryButtonText, { color: colors.error }]}>
                  Leave
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: colors.primary }]}
              onPress={handleJoinGroup}
            >
              <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>Join Group</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          {['about', 'members', 'activity'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.primary : colors.textSecondary },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && (
                <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content - now uses dynamic data */}
        <View style={styles.tabContent}>
          {activeTab === 'about' && (
            <View>
              {/* Description */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  📝 Description
                </Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  {groupData.description}
                </Text>
              </View>

              {/* Tags */}
              {groupData.tags && groupData.tags.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    🏷️ Tags
                  </Text>
                  <View style={styles.tagsContainer}>
                    {groupData.tags.map((tag, index) => (
                      <View
                        key={index}
                        style={[styles.tag, { backgroundColor: colors.primary + '15' }]}
                      >
                        <Text style={[styles.tagText, { color: colors.primary }]}>
                          #{tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Rules */}
              {groupData.rules && groupData.rules.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    📋 Group Rules
                  </Text>
                  {groupData.rules.map((rule, index) => (
                    <View key={index} style={styles.ruleItem}>
                      <Text style={[styles.ruleBullet, { color: colors.primary }]}>
                        {index + 1}.
                      </Text>
                      <Text style={[styles.ruleText, { color: colors.textSecondary }]}>
                        {rule}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Next Session */}
              {groupData.nextSession && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    📅 Next Session
                  </Text>
                  <View style={[styles.sessionCard, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="calendar" size={32} color={colors.primary} />
                    <View style={styles.sessionInfo}>
                      <Text style={[styles.sessionDate, { color: colors.text }]}>
                        {groupData.nextSession.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                      <Text style={[styles.sessionTime, { color: colors.textSecondary }]}>
                        {groupData.nextSession.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.reminderButton, { backgroundColor: colors.primary }]}
                    >
                      <Ionicons name="notifications-outline" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'members' && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                👥 Members ({members.length})
              </Text>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberItem}
                  activeOpacity={0.7}
                >
                  <View style={[styles.memberAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberHeader}>
                      <Text style={[styles.memberName, { color: colors.text }]}>
                        {member.name}
                      </Text>
                      {member.role !== 'member' && (
                        <View
                          style={[
                            styles.roleBadge,
                            { backgroundColor: member.role === 'admin' ? colors.primary : colors.warning },
                          ]}
                        >
                          <Text style={styles.roleText}>
                            {member.role.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.memberStatus, { color: colors.textSecondary }]}>
                      Active {getTimeAgo(member.lastActive)}
                    </Text>
                  </View>
                  {member.id !== groupData.admin.id && (
                    <TouchableOpacity style={styles.messageButton}>
                      <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'activity' && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                📊 Recent Activity
              </Text>
              {activities.map((activity, index) => (
                <View
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    index === activities.length - 1 && styles.lastActivityItem,
                  ]}
                >
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <Ionicons
                      name={getActivityIcon(activity.type) as any}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityText, { color: colors.text }]}>
                      <Text style={{ fontWeight: typography.fontWeight.semibold }}>
                        {activity.user}
                      </Text>{' '}
                      {activity.description}
                    </Text>
                    <Text style={[styles.activityTime, { color: colors.textTertiary }]}>
                      {getTimeAgo(activity.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginHorizontal: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs / 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    width: width - spacing.lg * 4,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  actionSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  memberActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
  },
  tabContent: {
    padding: spacing.lg,
  },
  card: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * 1.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  ruleBullet: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginRight: spacing.sm,
  },
  ruleText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * 1.4,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  sessionTime: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs / 2,
  },
  reminderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: typography.fontSize.xl,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  memberStatus: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs / 2,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
  },
  messageButton: {
    padding: spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  activityTime: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs / 2,
  },
});

export default GroupDetailScreen;