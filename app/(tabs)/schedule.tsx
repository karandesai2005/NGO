import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Clock, User, Book } from 'lucide-react-native';
import { AuthContext } from '@/contexts/AuthContext';

interface Event {
  id: string;
  date: string;
  time: string;
  title: string;
  teacher: string;
  subject: string;
}

export default function ScheduleScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    teacher: '',
    subject: '',
    time: '',
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    try {
      const credentialsModule = require('../../credentials.json');
      setEvents(credentialsModule.events);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    events.forEach(event => {
      marked[event.date] = {
        marked: true,
        dotColor: '#8B5CF6',
      };
    });

    // Mark selected date
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#8B5CF6',
    };

    return marked;
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.teacher || !newEvent.time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      date: selectedDate,
      ...newEvent,
    };

    setEvents(prev => [...prev, event]);
    setNewEvent({ title: '', teacher: '', subject: '', time: '' });
    setShowAddModal(false);
    Alert.alert('Success', 'Event added successfully!');
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

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
            <Text style={styles.monthText}>September</Text>
            {user?.role === 'Admin' && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Calendar */}
          <View style={styles.calendarCard}>
            <Calendar
              current={selectedDate}
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              markedDates={getMarkedDates()}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#6B7280',
                selectedDayBackgroundColor: '#8B5CF6',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#8B5CF6',
                dayTextColor: '#1F2937',
                textDisabledColor: '#D1D5DB',
                dotColor: '#8B5CF6',
                selectedDotColor: '#ffffff',
                arrowColor: '#8B5CF6',
                monthTextColor: '#1F2937',
                indicatorColor: '#8B5CF6',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
            />
          </View>

          {/* Events for Selected Date */}
          <View style={styles.eventsCard}>
            <Text style={styles.eventsTitle}>
              Events for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>

            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <View style={styles.eventIcon}>
                    <Clock size={20} color="#8B5CF6" />
                  </View>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetail}>
                        <User size={16} color="#6B7280" />
                        <Text style={styles.eventDetailText}>{event.teacher}</Text>
                      </View>
                      {event.subject && (
                        <View style={styles.eventDetail}>
                          <Book size={16} color="#6B7280" />
                          <Text style={styles.eventDetailText}>{event.subject}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.eventTime}>
                    <Text style={styles.eventTimeText}>{event.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noEvents}>
                <Text style={styles.noEventsText}>No events scheduled for this date</Text>
              </View>
            )}
          </View>

          {/* Upcoming Shifts */}
          <View style={styles.shiftsCard}>
            <Text style={styles.shiftsTitle}>Upcoming Shifts</Text>
            {events.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.shiftItem}>
                <View style={styles.shiftContent}>
                  <Text style={styles.shiftTeacher}>{event.teacher}</Text>
                  <Text style={styles.shiftSubject}>{event.subject}</Text>
                </View>
                <Text style={styles.shiftTime}>{event.time}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Add Event Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Event Title</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.title}
                  onChangeText={(text) => setNewEvent(prev => ({...prev, title: text}))}
                  placeholder="e.g., Math Class"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Teacher Name</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.teacher}
                  onChangeText={(text) => setNewEvent(prev => ({...prev, teacher: text}))}
                  placeholder="e.g., John Doe"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.subject}
                  onChangeText={(text) => setNewEvent(prev => ({...prev, subject: text}))}
                  placeholder="e.g., Mathematics"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.time}
                  onChangeText={(text) => setNewEvent(prev => ({...prev, time: text}))}
                  placeholder="e.g., 12:00 PM"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddEvent}
                >
                  <Text style={styles.saveButtonText}>Add Event</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  eventsCard: {
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
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  eventIcon: {
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  eventTime: {
    alignItems: 'flex-end',
  },
  eventTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  noEvents: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  shiftContent: {
    flex: 1,
  },
  shiftTeacher: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  shiftSubject: {
    fontSize: 14,
    color: '#6B7280',
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});