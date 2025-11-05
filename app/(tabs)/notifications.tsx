// app/(tabs)/notifications.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { Parent } from '@/types';
import { Send, Users, CircleCheck, MessageSquare } from 'lucide-react-native';
import sendSMS from '@/utils/sendSMS';
import { v4 as uuidv4 } from 'uuid';

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
      console.log('Fetching parents with user:', { id: user?.id, role: user?.role });
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, hasconsent, children')
        .eq('role', 'parent');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw Supabase data:', data);

      const formattedParents: Parent[] = data?.map((p: any) => ({
        id: p.id,
        name: p.full_name || 'Unknown',
        phone: p.phone || '+919999999999',
        email: p.full_name ? `${p.full_name.toLowerCase().replace(' ', '.')}@example.com` : 'unknown@example.com',
        hasConsent: p.hasconsent ?? false,
        children: p.children || [],
      })) || [];

      console.log('Formatted parents:', formattedParents);

      setParents(formattedParents);
      if (formattedParents.length === 0) {
        Alert.alert('Info', 'No parents found. Add parents in Supabase or signup as a parent.');
      }
    } catch (error: any) {
      console.error('Error loading parents:', error);
      Alert.alert('Error', `Failed to load parents: ${error.message}`);
    }
  };

  const handleSendNotification = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields');
      return;
    }

    const consentedParents = parents.filter(p => p.hasConsent && p.phone);
    
    if (consentedParents.length === 0) {
      Alert.alert('No Recipients', 'No parents with consent and valid phone numbers');
      return;
    }

    Alert.alert(
      'Send Notification',
      `Send to ${consentedParents.length} parent(s)?\n\nSMS + In-App Message`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => sendNotification(consentedParents) },
      ]
    );
  };

  const sendNotification = async (recipients: Parent[]) => {
    setIsSending(true);
    
    try {
      const smsPromises = [];
      let failedSMS = 0;

      const smsBody = `${subject}: ${message.substring(0, 100)} — NGO Team`;
      console.log('SMS Body:', smsBody);
      console.log('Sending to:', recipients.map(p => p.phone));

      for (const parent of recipients) {
        if (parent.phone) {
          console.log(`Attempting SMS to ${parent.phone}`);
          smsPromises.push(
            sendSMS(parent.phone, smsBody)
              .then(() => {
                console.log(`SMS to ${parent.phone} sent successfully`);
                return { success: true, parent: parent.name };
              })
              .catch((err) => {
                console.error(`SMS to ${parent.phone} failed:`, err.message);
                failedSMS++;
                return { success: false, parent: parent.name, error: err.message };
              })
          );
        }
      }

      const smsResults = await Promise.all(smsPromises);

      const chatMsgId = uuidv4();
      const chatMessage = {
        id: chatMsgId,
        text: `**📢 ${subject}**\n\n${message}\n\n*— NGO Team*`,
        user_id: user?.id,
        sender_name: 'System',
        sender_role: 'Admin',
        created_at: new Date().toISOString(),
      };

      const { error: chatError } = await supabase
        .from('messages')
        .insert(chatMessage);

      if (chatError) {
        console.error('In-app message failed:', chatError);
      }

      const successfulSMS = smsResults.filter(r => r.success).length;
      const totalSMS = recipients.length;

      let alertMsg = `✅ **Success!**\n\n`;
      alertMsg += `📱 SMS: ${successfulSMS}/${totalSMS} sent\n`;
      alertMsg += `💬 In-App: Posted to chat\n\n`;
      
      if (failedSMS > 0) {
        alertMsg += `⚠️ ${failedSMS} SMS failed (check console)`;
        console.log('Failed SMS:', smsResults.filter(r => !r.success));
      }

      Alert.alert('Notification Sent', alertMsg, [
        { text: 'OK', onPress: () => { setMessage(''); setSubject(''); } }
      ]);
    } catch (error: any) {
      console.error('Notification error:', error.message);
      Alert.alert('Error', error.message || 'Failed to send. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickMessage = (type: string) => {
    switch (type) {
      case 'reminder':
        setSubject('Class Reminder');
        setMessage('Reminder: Tomorrow\'s class at 10 AM. Be on time!');
        break;
      case 'event':
        setSubject('Event Alert');
        setMessage('Join our event this Saturday! Check schedule.');
        break;
      case 'update':
        setSubject('Program Update');
        setMessage('Important program updates. Please review.');
        break;
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.accessDenied}>
            <Text style={styles.accessDeniedText}>Access Denied</Text>
            <Text style={styles.accessDeniedSubtext}>This page is only for admins.</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const consentedParents = parents.filter(p => p.hasConsent && p.phone);
  const totalParents = parents.length;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Send Notifications</Text>

          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Users size={24} color="#667EEA" />
                <Text style={styles.statNumber}>{totalParents}</Text>
                <Text style={styles.statLabel}>Total Parents</Text>
              </View>
              <View style={styles.stat}>
                <CircleCheck size={24} color="#48BB78" />
                <Text style={styles.statNumber}>{consentedParents.length}</Text>
                <Text style={styles.statLabel}>With Consent</Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Quick Templates</Text>
            <View style={styles.templateButtons}>
              <Button title="Class Reminder" onPress={() => handleQuickMessage('reminder')} variant="secondary" style={styles.templateButton} />
              <Button title="Event Alert" onPress={() => handleQuickMessage('event')} variant="secondary" style={styles.templateButton} />
              <Button title="Update" onPress={() => handleQuickMessage('update')} variant="secondary" style={styles.templateButton} />
            </View>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Compose Message</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Enter subject..." placeholderTextColor="#A0AEC0" />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.recipientInfo}>
              <MessageSquare size={16} color="#667EEA" />
              <Text style={styles.recipientText}>
                SMS + In-App to {consentedParents.length} parent(s)
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
                    <Text style={styles.parentContact}>{parent.phone || 'No phone'} • {parent.email || 'No email'}</Text>
                    <Text style={styles.parentChildren}>Children: {parent.children.join(', ') || 'None'}</Text>
                  </View>
                  <View style={[styles.consentStatus, parent.hasConsent ? styles.consentYes : styles.consentNo]}>
                    <Text style={[styles.consentText, parent.hasConsent ? styles.consentYesText : styles.consentNoText]}>
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
  container: { flex: 1 },
  scrollContainer: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2D3748', marginBottom: 24 },
  accessDenied: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  accessDeniedText: { fontSize: 24, fontWeight: 'bold', color: '#E53E3E', marginBottom: 8 },
  accessDeniedSubtext: { fontSize: 16, color: '#718096', textAlign: 'center' },
  statsCard: { marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', marginTop: 8 },
  statLabel: { fontSize: 14, color: '#718096' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginBottom: 16 },
  templateButtons: { gap: 8 },
  templateButton: { marginBottom: 4 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#F7FAFC' },
  textArea: { height: 120, textAlignVertical: 'top' },
  recipientInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 12, backgroundColor: '#EBF8FF', borderRadius: 8 },
  recipientText: { fontSize: 14, color: '#667EEA', marginLeft: 8, flex: 1 },
  sendButton: { marginTop: 8 },
  parentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  parentInfo: { flex: 1 },
  parentName: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 4 },
  parentContact: { fontSize: 14, color: '#718096', marginBottom: 4 },
  parentChildren: { fontSize: 12, color: '#A0AEC0' },
  consentStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 12 },
  consentYes: { backgroundColor: '#C6F6D5' },
  consentNo: { backgroundColor: '#FED7D7' },
  consentText: { fontSize: 12, fontWeight: '600' },
  consentYesText: { color: '#22543D' },
  consentNoText: { color: '#742A2A' },
  noParents: { textAlign: 'center', color: '#718096', fontStyle: 'italic', paddingVertical: 20 },
});