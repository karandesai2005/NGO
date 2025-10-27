import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Users, MessageSquare, Bell } from 'lucide-react-native';
import { AuthContext } from '@/contexts/AuthContext';

interface Parent {
  id: string;
  name: string;
  phone: string;
  childName: string;
  consentGiven: boolean;
}

export default function NotificationsScreen() {
  const [message, setMessage] = useState('');
  const [parents] = useState<Parent[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      phone: '+91 9876543212',
      childName: 'Arjun Kumar',
      consentGiven: true,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      phone: '+91 9876543213',
      childName: 'Aarti Sharma',
      consentGiven: true,
    },
    {
      id: '3',
      name: 'Vikram Singh',
      phone: '+91 9876543214',
      childName: 'Rahul Singh',
      consentGiven: false,
    },
  ]);
  const [selectedParents, setSelectedParents] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  const { user } = useContext(AuthContext);

  const handleSelectParent = (parentId: string) => {
    const newSelected = new Set(selectedParents);
    if (newSelected.has(parentId)) {
      newSelected.delete(parentId);
    } else {
      newSelected.add(parentId);
    }
    setSelectedParents(newSelected);
    setSelectAll(newSelected.size === parents.filter(p => p.consentGiven).length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedParents(new Set());
    } else {
      const consentedParentIds = parents
        .filter(p => p.consentGiven)
        .map(p => p.id);
      setSelectedParents(new Set(consentedParentIds));
    }
    setSelectAll(!selectAll);
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message to send');
      return;
    }

    if (selectedParents.size === 0) {
      Alert.alert('Error', 'Please select at least one parent to send the message to');
      return;
    }

    const selectedParentsList = parents.filter(p => selectedParents.has(p.id));
    
    // Simulate sending messages (in a real app, this would call an API)
    console.log('Sending message to parents:');
    console.log('Message:', message);
    console.log('Recipients:', selectedParentsList.map(p => ({
      name: p.name,
      phone: p.phone,
      childName: p.childName,
    })));

    Alert.alert(
      'Message Sent!',
      `Your message has been sent to ${selectedParents.size} parent(s).`,
      [
        {
          text: 'OK',
          onPress: () => {
            setMessage('');
            setSelectedParents(new Set());
            setSelectAll(false);
          },
        },
      ]
    );
  };

  const consentedParents = parents.filter(p => p.consentGiven);

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
            <Bell size={24} color="#6B7280" />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Users size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{parents.length}</Text>
              <Text style={styles.statLabel}>Total Parents</Text>
            </View>
            <View style={styles.statItem}>
              <MessageSquare size={24} color="#10B981" />
              <Text style={styles.statNumber}>{consentedParents.length}</Text>
              <Text style={styles.statLabel}>With Consent</Text>
            </View>
            <View style={styles.statItem}>
              <Send size={24} color="#EF4444" />
              <Text style={styles.statNumber}>{selectedParents.size}</Text>
              <Text style={styles.statLabel}>Selected</Text>
            </View>
          </View>

          {/* Message Composer */}
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Compose Message</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message to parents here..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Parent Selection */}
          <View style={styles.selectionCard}>
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionTitle}>Select Recipients</Text>
              <View style={styles.selectAllContainer}>
                <Text style={styles.selectAllLabel}>Select All</Text>
                <Switch
                  value={selectAll}
                  onValueChange={handleSelectAll}
                  trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
                  thumbColor={selectAll ? '#8B5CF6' : '#F3F4F6'}
                />
              </View>
            </View>

            {parents.map((parent) => (
              <View key={parent.id} style={styles.parentItem}>
                <View style={styles.parentInfo}>
                  <Text style={styles.parentName}>{parent.name}</Text>
                  <Text style={styles.parentDetails}>
                    Child: {parent.childName} • {parent.phone}
                  </Text>
                  {!parent.consentGiven && (
                    <Text style={styles.noConsentText}>No consent given</Text>
                  )}
                </View>
                <Switch
                  value={selectedParents.has(parent.id)}
                  onValueChange={() => handleSelectParent(parent.id)}
                  disabled={!parent.consentGiven}
                  trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
                  thumbColor={selectedParents.has(parent.id) ? '#8B5CF6' : '#F3F4F6'}
                />
              </View>
            ))}
          </View>

          {/* Send Button */}
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!message.trim() || selectedParents.size === 0) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || selectedParents.size === 0}
          >
            <Send size={20} color="#ffffff" />
            <Text style={styles.sendButtonText}>
              Send Message ({selectedParents.size} recipients)
            </Text>
          </TouchableOpacity>

          {/* Recent Activity */}
          <View style={styles.activityCard}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Send size={16} color="#10B981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  Message sent to 5 parents about tomorrow's event
                </Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Users size={16} color="#8B5CF6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  New parent added: Meera Patel
                </Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MessageSquare size={16} color="#F59E0B" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  Consent received from 3 new parents
                </Text>
                <Text style={styles.activityTime}>3 days ago</Text>
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
  headerRight: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statItem: {
    alignItems: 'center',
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
  messageCard: {
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
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 120,
  },
  selectionCard: {
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
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllLabel: {
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
  },
  parentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  parentInfo: {
    flex: 1,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  parentDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  noConsentText: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
    marginTop: 2,
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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