// app/(tabs)/chat.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { Chat, MessageType, defaultTheme } from '@flyerhq/react-native-chat-ui';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { Send, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const insets = useSafeAreaInsets();

  const chatUser = {
    id: user?.id || 'default',
    firstName: user?.name || 'User',
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          const uiMsg = toUIMessage(newMsg);
          setMessages((prev) => [uiMsg, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toUIMessage = (msg: any): MessageType.Text => {
    return {
      author: {
        id: msg.user_id,
        firstName: msg.sender_name || 'Unknown User',
      },
      createdAt: new Date(msg.created_at).getTime(),
      id: msg.id,
      text: msg.text,
      type: 'text',
      metadata: {
        role: msg.sender_role || 'User',
      },
    };
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, text, user_id, created_at, sender_name, sender_role')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      Alert.alert('Error', 'Failed to load messages');
      return;
    }

    const uiMessages = data.map(toUIMessage);
    setMessages(uiMessages);
  };

  const handleSendPress = async (message: MessageType.PartialText) => {
    if (!user?.id || !user?.name || !user?.role) return;

    const tempId = uuidv4();
    const tempMessage: MessageType.Text = {
      author: {
        id: user.id,
        firstName: user.name,
      },
      createdAt: Date.now(),
      id: tempId,
      text: message.text,
      type: 'text',
      metadata: {
        role: user.role,
      },
    };

    setMessages((prev) => [tempMessage, ...prev]);

    const { error } = await supabase
      .from('messages')
      .insert({
        id: tempId,
        text: message.text,
        user_id: user.id,
        sender_name: user.name,
        sender_role: user.role,
      });

    if (error) {
      Alert.alert('Error', 'Failed to send');
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  if (!user) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* GRADIENT HEADER */}
        <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
          <MessageCircle size={28} color="#FFF" />
          <Text style={styles.headerTitle}>Community Chat</Text>
        </LinearGradient>

        {/* CHAT TAKES FULL SPACE + HANDLES KEYBOARD */}
        <Chat
          messages={messages}
          onSendPress={handleSendPress}
          user={chatUser}
          theme={customTheme}
          showUserNames={false}
          showUserAvatars={false}
          contentContainerStyle={styles.chatContent} // ← KEEPS INPUT AT BOTTOM
          style={{ flex: 1 }} // ← FULL HEIGHT
          renderUserName={(message: MessageType.Any) => {
            if (message.author.id === chatUser.id) return null;
            const role = (message as any).metadata?.role || 'User';
            return (
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{message.author.firstName}</Text>
                <Text style={styles.roleBadge}>@{role}</Text>
              </View>
            );
          }}
          renderBubble={(props) => {
            const isAuthor = props.isAuthor;
            const role = (props.message as any).metadata?.role || 'User';

            return (
              <View style={[styles.messageWrapper, isAuthor && styles.authorWrapper]}>
                {!isAuthor && (
                  <View style={styles.nameContainer}>
                    <Text style={styles.userName}>{props.message.author.firstName}</Text>
                    <Text style={styles.roleBadge}>@{role}</Text>
                  </View>
                )}
                <View style={[styles.bubble, isAuthor && styles.authorBubble]}>
                  <Text style={[styles.messageText, isAuthor && styles.authorText]}>
                    {props.message.text}
                  </Text>
                </View>
              </View>
            );
          }}
          renderSendButton={(text: string) => (
            <TouchableOpacity
              style={[styles.sendButton, !text.trim() && styles.disabledButton]}
              disabled={!text.trim()}
              onPress={() => {
                if (text.trim()) {
                  handleSendPress({ id: uuidv4(), text: text.trim(), type: 'text' });
                }
              }}
            >
              <Send size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

// --- THEME ---
const customTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: '#F8FAFC',
    primary: '#667EEA',
    inputText: '#000000',
    inputBackground: '#FFFFFF',
    authorMessageBackground: '#667EEA',
    authorMessageText: '#FFFFFF',
    receivedMessageBackground: '#E2E8F0',
    receivedMessageText: '#000000',
  },
  fonts: {
    ...defaultTheme.fonts,
    body1: { fontSize: 16, fontWeight: '700' },
    body2: { fontSize: 14, fontWeight: '600' },
  },
  borders: {
    ...defaultTheme.borders,
    inputBorderRadius: 28,
    messageBorderRadius: 20,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  chatContent: {
    flexGrow: 1,
    paddingBottom: 20, // ← SPACE FOR INPUT
  },
  messageWrapper: {
    marginVertical: 6,
    marginHorizontal: 12,
    alignItems: 'flex-start',
  },
  authorWrapper: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    backgroundColor: '#E2E8F0',
  },
  authorBubble: {
    backgroundColor: '#667EEA',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  authorText: {
    color: '#FFFFFF',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
    marginLeft: 6,
  },
  sendButton: {
    backgroundColor: '#667EEA',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
});