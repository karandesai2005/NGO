// app/(tabs)/schedule.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { Event, EventSignup } from '@/types';
import { Plus, Clock, User, MapPin, Users } from 'lucide-react-native';

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [signups, setSignups] = useState<EventSignup[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '',
    location: '',
    volunteers_needed: '1',
  });

  // Load + Realtime
  useEffect(() => {
    loadData();
    const eventChannel = supabase
      .channel('events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        handleEventChange(payload);
      })
      .subscribe();

    const signupChannel = supabase
      .channel('signups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_signups' }, () => {
        loadSignups();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(signupChannel);
    };
  }, []);

  const loadData = async () => {
    await Promise.all([loadEvents(), loadSignups()]);
  };

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      Alert.alert('Error', 'Failed to load events');
      return;
    }
    setEvents(data || []);
  };

  const loadSignups = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('event_signups')
      .select('*')
      .eq('volunteer_id', user.id);
    setSignups(data || []);
  };

  const handleEventChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setEvents(prev => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
    } else if (payload.eventType === 'DELETE') {
      setEvents(prev => prev.filter(e => e.id !== payload.old.id));
    }
  };

  const handleAddEvent = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (!newEvent.title.trim() || !newEvent.time.trim()) {
      Alert.alert('Error', 'Title and time required');
      return;
    }

    const eventData = {
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate,
      time: newEvent.time,
      location: newEvent.location,
      volunteers_needed: parseInt(newEvent.volunteers_needed) || 1,
      created_by: user?.id,
    };

    const { error } = await supabase.from('events').insert(eventData);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setShowAddModal(false);
      setNewEvent({ title: '', description: '', time: '', location: '', volunteers_needed: '1' });
    }
  };

  const handleSignup = async (eventId: string) => {
    const { error } = await supabase
      .from('event_signups')
      .insert({ event_id: eventId, volunteer_id: user?.id });

    if (error?.message.includes('duplicate')) {
      Alert.alert('Already signed up');
    } else if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'You are signed up!');
    }
  };

  const isSignedUp = (eventId: string) => signups.some(s => s.event_id === eventId);

  const getMarkedDates = () => {
    const marked: any = {};
    events.forEach(e => {
      marked[e.date] = { marked: true, dotColor: '#667EEA' };
    });
    if (selectedDate) marked[selectedDate] = { ...marked[selectedDate], selected: true, selectedColor: '#667EEA' };
    return marked;
  };

  const getEventsForDate = () => events.filter(e => e.date === selectedDate);
  const getUpcomingEvents = () => events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Volunteer Schedule</Text>
            {user?.role === 'Admin' && (
              <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          <Card style={styles.calendarCard}>
            <Calendar onDayPress={(d) => setSelectedDate(d.dateString)} markedDates={getMarkedDates()} />
          </Card>

          {selectedDate ? (
            <Card>
              <Text style={styles.sectionTitle}>
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              {getEventsForDate().map(event => (
                <View key={event.id} style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventRow}><Clock size={14} color="#667EEA" /><Text style={styles.eventText}>{event.time}</Text></View>
                  {event.location && <View style={styles.eventRow}><MapPin size={14} color="#718096" /><Text style={styles.eventText}>{event.location}</Text></View>}
                  <View style={styles.eventRow}><Users size={14} color="#718096" /><Text style={styles.eventText}>{event.volunteers_needed} needed</Text></View>

                  {user?.role === 'Volunteer' && !isSignedUp(event.id) && (
                    <Button title="Sign Up" onPress={() => handleSignup(event.id)} variant="primary" style={{ marginTop: 8 }} />
                  )}
                  {isSignedUp(event.id) && <Text style={styles.signedUp}>You're signed up!</Text>}
                </View>
              ))}
            </Card>
          ) : (
            <Card>
              <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
              {getUpcomingEvents().map(event => (
                <View key={event.id} style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString()}</Text>
                  <Text style={styles.eventText}>{event.time} • {event.volunteers_needed} volunteers</Text>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>

        {/* Add Event Modal */}
        <Modal visible={showAddModal} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Task</Text>
              <Button title="Cancel" onPress={() => setShowAddModal(false)} variant="secondary" />
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.selectedDateText}>Date: {new Date(selectedDate).toLocaleDateString()}</Text>
              <TextInput style={styles.input} placeholder="Title *" value={newEvent.title} onChangeText={t => setNewEvent(p => ({ ...p, title: t }))} />
              <TextInput style={styles.input} placeholder="Description" value={newEvent.description} onChangeText={t => setNewEvent(p => ({ ...p, description: t }))} />
              <TextInput style={styles.input} placeholder="Time (e.g. 2:00 PM) *" value={newEvent.time} onChangeText={t => setNewEvent(p => ({ ...p, time: t }))} />
              <TextInput style={styles.input} placeholder="Location" value={newEvent.location} onChangeText={t => setNewEvent(p => ({ ...p, location: t }))} />
              <TextInput style={styles.input} placeholder="Volunteers needed" value={newEvent.volunteers_needed} onChangeText={t => setNewEvent(p => ({ ...p, volunteers_needed: t }))} keyboardType="numeric" />
              <Button title="Create Task" onPress={handleAddEvent} style={{ marginTop: 16 }} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2D3748' },
  addButton: { backgroundColor: '#667EEA', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  calendarCard: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginBottom: 16 },
  eventCard: { backgroundColor: '#F7FAFC', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#667EEA' },
  eventTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748' },
  eventDate: { fontSize: 14, color: '#667EEA', fontWeight: '600', marginTop: 4 },
  eventText: { fontSize: 14, color: '#718096', marginLeft: 6 },
  eventRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  signedUp: { color: '#10B981', fontWeight: '600', marginTop: 8 },
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  modalContent: { padding: 24 },
  selectedDateText: { fontSize: 16, color: '#667EEA', fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: '#F7FAFC' },
});