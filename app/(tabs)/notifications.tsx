import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getParents } from '@/utils/storage';
import { Parent } from '@/types';
import { Send, Users, CircleCheck as CheckCircle, MessageSquare } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [parents, setParents] = useState<Parent[]>([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      Alert.alert('Access Denied', 'This screen is only available for admins.');
      return;
    }
    loadParents();
  }, [user]);

  const loadParents = async () => {
    try {
      const parentsData = await getParents();
      setParents(parentsData);
    } catch (error) {
      console.error('Error loading parents:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields');
      return;
    }

    const consentedParents = parents.filter(parent => parent.hasConsent);
    
    if (consentedParents.length === 0) {
      Alert.alert('No Recipients', 'No parents have given consent to receive notifications');
      return;
    }

    Alert.alert(
      'Send Notification',
      `Send notification to ${consentedParents.length} parent(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => sendNotification(consentedParents),
        },
      ]
    );
  };

  const sendNotification = async (recipients: Parent[]) => {
    setIsSending(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock console log output for demonstration
      console.log('=== BULK NOTIFICATION SENT ===');
      console.log('Subject:', subject);
      console.log('Message:', message);
      console.log('Recipients:');
      recipients.forEach(parent => {
        console.log(`- ${parent.name} (${parent.phone}, ${parent.email})`);
      });
      console.log('=== END NOTIFICATION LOG ===');
      
      Alert.alert(
        'Success',
        `Notification sent to ${recipients.length} parent(s)!\n\nCheck the console for detailed log.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setMessage('');
              setSubject('');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickMessage = (messageType: string) => {
    switch (messageType) {
      case 'reminder':
        setSubject('Class Reminder');
        setMessage('This is a reminder about tomorrow\'s class. Please ensure your child attends on time. Thank you!');
        break;
      case 'event':
        setSubject('Upcoming Event');
        setMessage('We have an exciting event coming up. Please check the schedule for more details. We look forward to seeing you there!');
        break;
      case 'update':
        setSubject('Important Update');
        setMessage('We have some important updates regarding our programs. Please read the attached information carefully.');
        break;
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

  const consentedParents = parents.filter(parent => parent.hasConsent);
  const totalParents = parents.length;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Send Notifications</Text>

          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Users size={24} color="#667EEA" />
                <Text style={styles.statNumber}>{totalParents}</Text>
                <Text style={styles.statLabel}>Total Parents</Text>
              </View>
              <View style={styles.stat}>
                <CheckCircle size={24} color="#48BB78" />
                <Text style={styles.statNumber}>{consentedParents.length}</Text>
                <Text style={styles.statLabel}>With Consent</Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Quick Message Templates</Text>
            <View style={styles.templateButtons}>
              <Button
                title="Class Reminder"
                onPress={() => handleQuickMessage('reminder')}
                variant="secondary"
                style={styles.templateButton}
              />
              <Button
                title="Event Notification"
                onPress={() => handleQuickMessage('event')}
                variant="secondary"
                style={styles.templateButton}
              />
              <Button
                title="Important Update"
                onPress={() => handleQuickMessage('update')}
                variant="secondary"
                style={styles.templateButton}
              />
            </View>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Compose Message</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter message subject..."
                placeholderTextColor="#A0AEC0"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message here..."
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.recipientInfo}>
              <MessageSquare size={16} color="#667EEA" />
              <Text style={styles.recipientText}>
                Will be sent to {consentedParents.length} parent(s) via SMS and Email
              </Text>
            </View>

            <Button
              title={isSending ? "Sending..." : "Send Notification"}
              onPress={handleSendNotification}
              disabled={isSending || !subject.trim() || !message.trim()}
              style={styles.sendButton}
            />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Parent List</Text>
            {parents.length > 0 ? (
              parents.map((parent) => (
                <View key={parent.id} style={styles.parentItem}>
                  <View style={styles.parentInfo}>
                    <Text style={styles.parentName}>{parent.name}</Text>
                    <Text style={styles.parentContact}>{parent.phone} • {parent.email}</Text>
                    <Text style={styles.parentChildren}>Children: {parent.children.join(', ')}</Text>
                  </View>
                  <View style={[
                    styles.consentStatus,
                    parent.hasConsent ? styles.consentYes : styles.consentNo
                  ]}>
                    <Text style={[
                      styles.consentText,
                      parent.hasConsent ? styles.consentYesText : styles.consentNoText
                    ]}>
                      {parent.hasConsent ? 'Consent Given' : 'No Consent'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noParents}>No parent contacts available</Text>
            )}
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
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#718096',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  templateButtons: {
    gap: 8,
  },
  templateButton: {
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 16,
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
  },
  recipientText: {
    fontSize: 14,
    color: '#667EEA',
    marginLeft: 8,
    flex: 1,
  },
  sendButton: {
    marginTop: 8,
  },
  parentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  parentInfo: {
    flex: 1,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  parentContact: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 2,
  },
  parentChildren: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  consentStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  consentYes: {
    backgroundColor: '#C6F6D5',
  },
  consentNo: {
    backgroundColor: '#FED7D7',
  },
  consentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  consentYesText: {
    color: '#22543D',
  },
  consentNoText: {
    color: '#742A2A',
  },
  noParents: {
    textAlign: 'center',
    color: '#718096',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});