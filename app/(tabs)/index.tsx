import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Calendar, MessageCircle, Users, TrendingUp } from 'lucide-react-native';
import { AuthContext } from '@/contexts/AuthContext';

interface Event {
  id: string;
  date: string;
  time: string;
  title: string;
  teacher: string;
  subject: string;
}

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = () => {
    try {
      const credentialsModule = require('../../credentials.json');
      const events = credentialsModule.events;
      
      // Filter events for next 3 days
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      const upcoming = events.filter((event: Event) => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= threeDaysFromNow;
      });
      
      setUpcomingEvents(upcoming.slice(0, 3));
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <LinearGradient
      colors={['#E8D8F5', '#FADADD', '#FFE4B5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>A</Text>
              </View>
              <Text style={styles.logoSubtext}>AKSHAR</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.greetingText}>{getGreeting()}, {user?.name}!</Text>
            <Text style={styles.roleText}>
              {user?.role === 'Admin' ? 'Administrator' : user?.role}
            </Text>
            <Text style={styles.motivationText}>
              {user?.role === 'Admin' 
                ? 'Manage and coordinate volunteer activities'
                : user?.role === 'Volunteer'
                ? 'Ready to make a difference today?'
                : 'Stay connected with your child\'s education'
              }
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Calendar size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.statNumber}>{upcomingEvents.length}</Text>
              <Text style={styles.statLabel}>Upcoming Events</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MessageCircle size={24} color="#EF4444" />
              </View>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>New Messages</Text>
            </View>

            {user?.role === 'Admin' && (
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Users size={24} color="#10B981" />
                </View>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Active Volunteers</Text>
              </View>
            )}
          </View>

          {/* Upcoming Events */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventDateContainer}>
                    <Text style={styles.eventDate}>
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                    <Text style={styles.eventTime}>{event.time}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTeacher}>{event.teacher}</Text>
                    <Text style={styles.eventSubject}>{event.subject}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>No upcoming events</Text>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Calendar size={20} color="#8B5CF6" />
                <Text style={styles.actionButtonText}>View Schedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={20} color="#EF4444" />
                <Text style={styles.actionButtonText}>Messages</Text>
              </TouchableOpacity>

              {user?.role === 'Admin' && (
                <TouchableOpacity style={styles.actionButton}>
                  <TrendingUp size={20} color="#10B981" />
                  <Text style={styles.actionButtonText}>Dashboard</Text>
                </TouchableOpacity>
              )}
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
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoSubtext: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  logoutButton: {
    padding: 8,
  },
  welcomeSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  statsContainer: {
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
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionCard: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  eventDateContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  eventTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  eventTeacher: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
  },
  eventSubject: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 8,
  },
});