import React, { useState, useEffect } from 'react';
// 1. Import TouchableOpacity from react-native
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getEvents, addEvent } from '@/utils/storage';
import { Event } from '@/types';
import { Plus, Clock, User, BookOpen } from 'lucide-react-native';

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    teacher: '',
    time: '',
    subject: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleAddEvent = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date first');
      return;
    }

    if (!newEvent.title.trim() || !newEvent.teacher.trim() || !newEvent.time.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const event: Event = {
        id: Date.now().toString(),
        date: selectedDate,
        title: newEvent.title,
        teacher: newEvent.teacher,
        time: newEvent.time,
        subject: newEvent.subject || newEvent.title,
      };

      await addEvent(event);
      setEvents(prev => [...prev, event]);
      setNewEvent({ title: '', teacher: '', time: '', subject: '' });
      setShowAddModal(false);
      Alert.alert('Success', 'Event added successfully!');
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    
    events.forEach(event => {
      marked[event.date] = {
        marked: true,
        dotColor: '#667EEA',
      };
    });

    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#667EEA',
      };
    }

    return marked;
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return events.filter(event => event.date === selectedDate);
  };

  const getAllUpcomingEvents = () => {
    return events
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Schedule</Text>
            {user?.role === 'Admin' && (
              // 2. Replace the custom Button with TouchableOpacity
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={styles.addButton}
              >
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <Card style={styles.calendarCard}>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={getMarkedDates()}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#2D3748',
                selectedDayBackgroundColor: '#667EEA',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#667EEA',
                dayTextColor: '#2D3748',
                textDisabledColor: '#A0AEC0',
                dotColor: '#667EEA',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#667EEA',
                monthTextColor: '#2D3748',
                indicatorColor: '#667EEA',
                textDayFontWeight: '600',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
            />
          </Card>

          {selectedDate ? (
            <Card>
              <Text style={styles.sectionTitle}>
                Events for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              {getSelectedDateEvents().length > 0 ? (
                getSelectedDateEvents().map((event) => (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <View style={styles.eventTime}>
                        <Clock size={14} color="#667EEA" />
                        <Text style={styles.eventTimeText}>{event.time}</Text>
                      </View>
                    </View>
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetail}>
                        <User size={16} color="#718096" />
                        <Text style={styles.eventDetailText}>{event.teacher}</Text>
                      </View>
                      <View style={styles.eventDetail}>
                        <BookOpen size={16} color="#718096" />
                        <Text style={styles.eventDetailText}>{event.subject}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noEvents}>No events scheduled for this date</Text>
              )}
            </Card>
          ) : (
            <Card>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              {getAllUpcomingEvents().length > 0 ? (
                getAllUpcomingEvents().map((event) => (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetail}>
                        <User size={16} color="#718096" />
                        <Text style={styles.eventDetailText}>{event.teacher}</Text>
                      </View>
                      <View style={styles.eventDetail}>
                        <Clock size={16} color="#718096" />
                        <Text style={styles.eventDetailText}>{event.time}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noEvents}>No upcoming events</Text>
              )}
            </Card>
          )}
        </ScrollView>

        {/* Add Event Modal */}
        <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowAddModal(false);
                  setNewEvent({ title: '', teacher: '', time: '', subject: '' });
                }}
                variant="secondary"
                style={styles.cancelButton}
              />
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.selectedDateText}>
                Date: {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Please select a date first'}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Event Title *</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.title}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
                  placeholder="e.g., English Class"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Teacher Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.teacher}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, teacher: text }))}
                  placeholder="e.g., Archisha Yadav"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Time *</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.time}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, time: text }))}
                  placeholder="e.g., 12:00 PM"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.subject}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, subject: text }))}
                  placeholder="e.g., English"
                />
              </View>

              <Button
                title="Add Event"
                onPress={handleAddEvent}
                style={styles.addEventButton}
              />
            </ScrollView>
          </SafeAreaView>
        </Modal>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  // 3. Adjusted styles for a circular icon button
  addButton: {
    backgroundColor: '#667EEA',
    width: 44,
    height: 44,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667EEA',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTimeText: {
    fontSize: 14,
    color: '#667EEA',
    marginLeft: 4,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  selectedDateText: {
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F7FAFC',
  },
  addEventButton: {
    marginTop: 24,
  },
});