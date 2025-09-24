import React, { useEffect, useState } from 'react';
// 1. Import TouchableOpacity from react-native
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getEvents, getVolunteerHours } from '@/utils/storage';
import { Event, VolunteerHours } from '@/types';
import { Calendar, Clock, User, LogOut } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHours | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const eventsData = await getEvents();
      const hoursData = await getVolunteerHours();
      
      const upcoming = eventsData
        .filter(event => new Date(event.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      
      setEvents(upcoming);
      setVolunteerHours(hoursData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getRoleGreeting = () => {
    const roleGreetings = {
      Admin: "Welcome back, Admin!",
      Volunteer: "Ready to make a difference!",
      Parent: "Welcome to the parent portal!"
    };
    return roleGreetings[user?.role || 'Volunteer'];
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name}!</Text>
              <Text style={styles.roleGreeting}>{getRoleGreeting()}</Text>
            </View>
            {/* 2. Replace the custom Button with TouchableOpacity for the icon */}
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <LogOut size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {user?.role === 'Admin' && volunteerHours && (
            <Card style={styles.statsCard}>
              <Text style={styles.cardTitle}>Volunteer Hours Overview</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{volunteerHours.volunteered}</Text>
                  <Text style={styles.statLabel}>Volunteered</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{volunteerHours.remaining}</Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{volunteerHours.total}</Text>
                  <Text style={styles.statLabel}>Total Target</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(volunteerHours.volunteered / volunteerHours.total) * 100}%` }
                  ]} 
                />
              </View>
            </Card>
          )}

          <Card>
            <Text style={styles.cardTitle}>Upcoming Schedule</Text>
            {events.length > 0 ? (
              events.map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <View style={styles.eventInfo}>
                    <View style={styles.eventHeader}>
                      <Calendar size={16} color="#667EEA" />
                      <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetail}>
                        <User size={14} color="#718096" />
                        <Text style={styles.eventText}>{event.teacher}</Text>
                      </View>
                      <View style={styles.eventDetail}>
                        <Clock size={14} color="#718096" />
                        <Text style={styles.eventText}>{event.time}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noEvents}>No upcoming events</Text>
            )}
            
            <Button
              title="View Full Schedule"
              onPress={() => router.push('/(tabs)/schedule')}
              variant="secondary"
              style={styles.viewButton}
            />
          </Card>

          {user?.role !== 'Parent' && (
            <Card>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <Button
                  title="Open Chat"
                  onPress={() => router.push('/(tabs)/chat')}
                  style={styles.actionButton}
                />
                {user?.role === 'Admin' && (
                  <>
                    <Button
                      title="Admin Panel"
                      onPress={() => router.push('/(tabs)/admin')}
                      style={styles.actionButton}
                    />
                    <Button
                      title="Send Notifications"
                      onPress={() => router.push('/(tabs)/notifications')}
                      style={styles.actionButton}
                    />
                  </>
                )}
              </View>
            </Card>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  roleGreeting: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#E53E3E',
    padding: 12, // Adjusted padding for a circular feel
    borderRadius: 50, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
    width: 44, // Explicit width and height
    height: 44,
  },
  statsCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667EEA',
    borderRadius: 4,
  },
  eventItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
    marginLeft: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 6,
  },
  noEvents: {
    textAlign: 'center',
    color: '#718096',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  viewButton: {
    marginTop: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});