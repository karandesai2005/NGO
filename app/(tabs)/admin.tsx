import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getVolunteerHours, getEvents, getUsers } from '@/utils/storage';
import { VolunteerHours, Event, User } from '@/types';
import { Users, Clock, Calendar, TrendingUp } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function AdminScreen() {
  const { user } = useAuth();
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHours | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      Alert.alert('Access Denied', 'This screen is only available for admins.');
      return;
    }
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    try {
      const [hoursData, eventsData, usersData] = await Promise.all([
        getVolunteerHours(),
        getEvents(),
        getUsers()
      ]);
      
      setVolunteerHours(hoursData);
      setEvents(eventsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.accessDenied}>
            <Text style={styles.accessDeniedText}>Access Denied</Text>
            <Text style={styles.accessDeniedSubtext}>This page is only available for administrators.</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const pieChartData = volunteerHours ? [
    {
      name: 'Volunteered',
      population: volunteerHours.volunteered,
      color: '#667EEA',
      legendFontColor: '#2D3748',
      legendFontSize: 14,
    },
    {
      name: 'Remaining',
      population: volunteerHours.remaining,
      color: '#FFB6C1',
      legendFontColor: '#2D3748',
      legendFontSize: 14,
    },
  ] : [];

  const getUsersByRole = () => {
    const roleCount = { Admin: 0, Volunteer: 0, Parent: 0 };
    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    return roleCount;
  };

  const getUpcomingEvents = () => {
    return events.filter(event => new Date(event.date) >= new Date()).length;
  };

  const roleCount = getUsersByRole();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Admin Dashboard</Text>

          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Users size={24} color="#667EEA" />
                <Text style={styles.statNumber}>{users.length}</Text>
              </View>
              <Text style={styles.statLabel}>Total Users</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={24} color="#48BB78" />
                <Text style={styles.statNumber}>{getUpcomingEvents()}</Text>
              </View>
              <Text style={styles.statLabel}>Upcoming Events</Text>
            </Card>
          </View>

          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingUp size={24} color="#ED8936" />
                <Text style={styles.statNumber}>{roleCount.Volunteer}</Text>
              </View>
              <Text style={styles.statLabel}>Volunteers</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Users size={24} color="#9F7AEA" />
                <Text style={styles.statNumber}>{roleCount.Parent}</Text>
              </View>
              <Text style={styles.statLabel}>Parents</Text>
            </Card>
          </View>

          {volunteerHours && (
            <Card>
              <Text style={styles.cardTitle}>Volunteer Hours Distribution</Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  center={[10, 0]}
                  absolute
                />
              </View>
              <View style={styles.hoursStats}>
                <View style={styles.hoursStat}>
                  <Text style={styles.hoursNumber}>{volunteerHours.volunteered}</Text>
                  <Text style={styles.hoursLabel}>Hours Volunteered</Text>
                </View>
                <View style={styles.hoursStat}>
                  <Text style={styles.hoursNumber}>{volunteerHours.remaining}</Text>
                  <Text style={styles.hoursLabel}>Hours Remaining</Text>
                </View>
                <View style={styles.hoursStat}>
                  <Text style={styles.hoursNumber}>{Math.round((volunteerHours.volunteered / volunteerHours.total) * 100)}%</Text>
                  <Text style={styles.hoursLabel}>Progress</Text>
                </View>
              </View>
            </Card>
          )}

          <Card>
            <Text style={styles.cardTitle}>Team Updates</Text>
            <Text style={styles.updateText}>
              Keep track of volunteer activities and schedule upcoming events.
            </Text>
            <Button
              title="View Team Details"
              onPress={() => Alert.alert('Team Updates', 'This feature will show detailed team analytics and updates.')}
              style={styles.viewButton}
            />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>User Management</Text>
            <View style={styles.userRoles}>
              <View style={styles.userRole}>
                <Text style={styles.userRoleCount}>{roleCount.Admin}</Text>
                <Text style={styles.userRoleLabel}>Admins</Text>
              </View>
              <View style={styles.userRole}>
                <Text style={styles.userRoleCount}>{roleCount.Volunteer}</Text>
                <Text style={styles.userRoleLabel}>Volunteers</Text>
              </View>
              <View style={styles.userRole}>
                <Text style={styles.userRoleCount}>{roleCount.Parent}</Text>
                <Text style={styles.userRoleLabel}>Parents</Text>
              </View>
            </View>
            <Button
              title="Manage Users"
              onPress={() => Alert.alert('User Management', 'This feature will allow you to manage user roles and permissions.')}
              variant="secondary"
              style={styles.manageButton}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 24,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  hoursStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  hoursStat: {
    alignItems: 'center',
  },
  hoursNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  hoursLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  updateText: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 16,
    lineHeight: 24,
  },
  viewButton: {
    marginTop: 8,
  },
  userRoles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  userRole: {
    alignItems: 'center',
  },
  userRoleCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  userRoleLabel: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  manageButton: {
    marginTop: 8,
  },
});