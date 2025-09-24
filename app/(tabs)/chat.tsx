import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Chat, MessageType, defaultTheme, User } from '@flyerhq/react-native-chat-ui';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { getMessages, addMessage } from '@/utils/storage';
import { ChatMessage, User as AppUser } from '@/types';
import { Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Helper Functions ---
const toUIMessage = (msg: ChatMessage): MessageType.Text => ({
  author: {
    id: msg.user._id,
    firstName: msg.user.name,
    imageUrl: `https://i.pravatar.cc/300?u=${msg.user._id}`,
    role: msg.user.role, // Include role in author object
  },
  createdAt: new Date(msg.createdAt).getTime(),
  id: msg._id,
  text: msg.text,
  type: 'text',
});

const toStorageMessage = (msg: MessageType.Text, user: AppUser): ChatMessage => ({
  _id: msg.id,
  text: msg.text,
  createdAt: new Date(msg.createdAt!),
  user: {
    _id: user.id,
    name: user.name,
    role: user.role, // Include role in stored user data
  },
});

// --- UI Theme ---
const customTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: '#FFFFFF',
    primary: '#667EEA',
    secondary: '#E2E8F0',
    inputText: '#2D3748',
    inputBackground: '#F7FAFC',
  },
  fonts: {
    ...defaultTheme.fonts,
    body1: {
      ...defaultTheme.fonts.body1,
      fontSize: 16,
    },
  },
  borders: {
    ...defaultTheme.borders,
    inputBorderRadius: 24,
  },
  spacing: {
    ...defaultTheme.spacing,
    inputHorizontalPadding: 16,
  },
};

// --- Main Component ---
export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const insets = useSafeAreaInsets();

  const chatUser = {
    id: user?.id || 'default-user',
    firstName: user?.name,
    imageUrl: `https://i.pravatar.cc/300?u=${user?.id}`,
    role: user?.role || 'User', // Include role, default to 'User' if undefined
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const storedMessages = await getMessages();
      // Sort messages from newest to oldest (new messages at top)
      const sorted = storedMessages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMessages(sorted.map(toUIMessage));
    } catch (error) {
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const handleSendPress = async (message: MessageType.PartialText) => {
    if (!user) return;

    const textMessage: MessageType.Text = {
      author: chatUser,
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: 'text',
    };

    // Prepend new messages to place them at the top
    setMessages((currentMessages) => [textMessage, ...currentMessages]);

    const storageMessage = toStorageMessage(textMessage, user);
    await addMessage(storageMessage);
  };

  if (!user) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 20 : 20}
      >
        <Chat
          messages={messages}
          onSendPress={handleSendPress}
          user={chatUser}
          theme={customTheme}
          showUserNames={true} // Enable space for user names
          renderUserName={(author: User) => {
            // Don't show name and role for the current user's messages
            if (author.id === chatUser.id) return null;
            return (
              <Text style={styles.userName}>
                {author.firstName} ({author.role || 'User'})
              </Text>
            );
          }}
          renderSendButton={(text: string) => (
            <TouchableOpacity
              style={[styles.sendButton, !text.trim() && styles.disabledButton]}
              disabled={!text.trim()}
              onPress={() => {
                if (text.trim()) {
                  handleSendPress({
                    id: uuidv4(),
                    text: text.trim(),
                    type: 'text',
                  });
                }
              }}
            >
              <Send size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#667EEA',
    borderRadius: 50,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 4,
  },
  disabledButton: {
    backgroundColor: '#B0B8CC',
    opacity: 0.6,
  },
  userName: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    marginBottom: 4,
    marginLeft: 12,
  },
});