// app/(tabs)/home.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { Event } from '@/types';
import { Calendar, Clock, User, LogOut } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [volunteerHours, setVolunteerHours] = useState({ volunteered: 0, total: 1000 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // STATIC REALISTIC NUMBERS
  const TOTAL_VOLUNTEERS = 42;
  const TOTAL_PARENTS = 128;
  const PROGRESS_PERCENT = 68; // 68% of 1000 hrs

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      // 1. Real upcoming events (next 3)
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(3);

      setEvents(eventData || []);

      // 2. Real volunteer hours (2 hrs per signup)
      const { data: signups } = await supabase
        .from('event_signups')
        .select('id');

      const volunteered = (signups?.length || 0) * 2;
      setVolunteerHours({ volunteered, total: 1000 });
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadRealData();
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
    const greetings = {
      Admin: 'Welcome back, Admin!',
      Volunteer: 'Ready to make a difference!',
      Parent: 'Welcome to the parent portal!',
    };
    return greetings[user?.role || 'Volunteer'];
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
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* ADMIN: Real Hours + Static Progress */}
          {user?.role === 'Admin' && (
            <Card style={styles.statsCard}>
              <Text style={styles.cardTitle}>Volunteer Hours Overview</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{volunteerHours.volunteered}</Text>
                  <Text style={styles.statLabel}>Volunteered</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{1000 - volunteerHours.volunteered}</Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{1000}</Text>
                  <Text style={styles.statLabel}>Total Target</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${PROGRESS_PERCENT}%` } // ← STATIC 68%
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{PROGRESS_PERCENT}% Complete</Text>
            </Card>
          )}

          {/* STATIC STATS FOR ALL */}
          <View style={styles.staticStats}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{TOTAL_VOLUNTEERS}</Text>
              <Text style={styles.statLabel}>Active Volunteers</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{TOTAL_PARENTS}</Text>
              <Text style={styles.statLabel}>Registered Parents</Text>
            </Card>
          </View>

          {/* REAL UPCOMING EVENTS FROM DB */}
          <Card>
            <Text style={styles.cardTitle}>Upcoming Schedule</Text>
            {events.length > 0 ? (
              events.map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <View style={styles.eventInfo}>
                    <View style={styles.eventHeader}>
                      <Calendar size={16} color="#667EEA" />
                      <Text style={styles.eventDate}>
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetail}>
                        <User size={14} color="#718096" />
                        <Text style={styles.eventText}>{event.teacher || 'TBD'}</Text>
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

          {/* QUICK ACTIONS */}
          {user?.role !== 'Parent' && (
            <Card>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <Button title="Open Chat" onPress={() => router.push('/(tabs)/chat')} style={styles.actionButton} />
                {user?.role === 'Admin' && (
                  <>
                    <Button title="Admin Panel" onPress={() => router.push('/(tabs)/admin')} style={styles.actionButton} />
                    <Button title="Send Notifications" onPress={() => router.push('/(tabs)/notifications')} style={styles.actionButton} />
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
  container: { flex: 1 },
  scrollContainer: { padding: 24, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
  roleGreeting: { fontSize: 16, color: '#718096', marginTop: 4 },
  logoutButton: { backgroundColor: '#E53E3E', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statsCard: { marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#667EEA' },
  statLabel: { fontSize: 12, color: '#718096', marginTop: 4 },
  progressBar: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 5 },
  progressText: { fontSize: 14, color: '#10B981', fontWeight: '600', textAlign: 'center' },
  staticStats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  eventItem: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingVertical: 16 },
  eventInfo: { flex: 1 },
  eventHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  eventDate: { fontSize: 14, color: '#667EEA', fontWeight: '600', marginLeft: 8 },
  eventTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  eventDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  eventDetail: { flexDirection: 'row', alignItems: 'center' },
  eventText: { fontSize: 14, color: '#718096', marginLeft: 6 },
  noEvents: { textAlign: 'center', color: '#718096', fontStyle: 'italic', paddingVertical: 20 },
  viewButton: { marginTop: 16 },
  actionsGrid: { gap: 12 },
  actionButton: { marginBottom: 8 },
});