import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar,
  Eye,
  UserCheck,
  MessageSquare,
  BookOpen
} from 'lucide-react-native';
import { AuthContext } from '@/contexts/AuthContext';

const screenWidth = Dimensions.get('window').width;

interface VolunteerStats {
  totalHours: number;
  completedHours: number;
  remainingHours: number;
}

export default function DashboardScreen() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      const credentialsModule = require('../../credentials.json');
      setStats(credentialsModule.volunteerStats);
      setUpcomingEvents(credentialsModule.events.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const chartData = stats ? [
    {
      name: 'Completed',
      hours: stats.completedHours,
      color: '#8B5CF6',
      legendFontColor: '#6B7280',
      legendFontSize: 15,
    },
    {
      name: 'Remaining',
      hours: stats.remainingHours,
      color: '#FADADD',
      legendFontColor: '#6B7280',
      legendFontSize: 15,
    },
  ] : [];

  return (
    <LinearGradient
      colors={['#E8D8F5', '#FADADD', '#FFE4B5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <Text style={styles.logoSubtext}>AKSHAR</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.dashboardTitle}>Admin Dashboard</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Overview Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Active Volunteers</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={24} color="#10B981" />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Events This Week</Text>
            </View>
            <View style={styles.statCard}>
              <MessageSquare size={24} color="#EF4444" />
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Messages Sent</Text>
            </View>
          </View>

          {/* Volunteer Hours Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Hours Logged</Text>
            {stats && (
              <>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={chartData}
                    width={screenWidth - 80}
                    height={200}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="hours"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    center={[10, 0]}
                    absolute
                  />
                </View>
                <View style={styles.hoursStats}>
                  <View style={styles.hoursStat}>
                    <Text style={styles.hoursNumber}>{stats.completedHours}</Text>
                    <Text style={styles.hoursLabel}>Volunteered</Text>
                  </View>
                  <View style={styles.hoursStat}>
                    <Text style={styles.hoursNumber}>{stats.remainingHours}</Text>
                    <Text style={styles.hoursLabel}>Remaining</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Upcoming Shifts */}
          <View style={styles.shiftsCard}>
            <Text style={styles.shiftsTitle}>Upcoming Shifts</Text>
            {upcomingEvents.map((event, index) => (
              <View key={event.id || index} style={styles.shiftItem}>
                <View style={styles.shiftAvatar}>
                  <UserCheck size={16} color="#8B5CF6" />
                </View>
                <View style={styles.shiftContent}>
                  <Text style={styles.shiftName}>{event.teacher}</Text>
                  <Text style={styles.shiftRole}>{event.subject}</Text>
                </View>
                <Text style={styles.shiftTime}>{event.time}</Text>
              </View>
            ))}
          </View>

          {/* Team Updates */}
          <View style={styles.updatesCard}>
            <View style={styles.updatesHeader}>
              <Text style={styles.updatesTitle}>Team Updates</Text>
              <TouchableOpacity style={styles.viewButton}>
                <Eye size={16} color="#ffffff" />
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.updatesSubtitle}>New event added to the calendar.</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionItem}>
                <Calendar size={20} color="#8B5CF6" />
                <Text style={styles.actionText}>Add Event</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem}>
                <MessageSquare size={20} color="#10B981" />
                <Text style={styles.actionText}>Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem}>
                <Users size={20} color="#EF4444" />
                <Text style={styles.actionText}>Manage Volunteers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem}>
                <BookOpen size={20} color="#F59E0B" />
                <Text style={styles.actionText}>View Reports</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activityCard}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <UserCheck size={16} color="#10B981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  Archisha Yadav completed English class (2 hours)
                </Text>
                <Text style={styles.activityTime}>30 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Calendar size={16} color="#8B5CF6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  New math workshop scheduled for next week
                </Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MessageSquare size={16} color="#EF4444" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  Message sent to 8 parents about tomorrow's event
                </Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {},
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  hoursStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  hoursStat: {
    alignItems: 'center',
  },
  hoursNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  hoursLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  shiftsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  shiftsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  shiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  shiftAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shiftContent: {
    flex: 1,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  shiftRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  updatesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  updatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updatesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  updatesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 8,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});