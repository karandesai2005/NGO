import React, { useState, useContext, useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '@/contexts/AuthContext';

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    try {
      const credentialsModule = require('../../credentials.json');
      const chatMessages = credentialsModule.messages;
      
      // Transform messages to GiftedChat format
      const giftedChatMessages = chatMessages.map((msg: any) => ({
        _id: msg._id,
        text: msg.text,
        createdAt: new Date(msg.createdAt),
        user: {
          _id: msg.user._id === 'user' ? user?.id : msg.user._id,
          name: msg.user._id === 'user' ? user?.name : msg.user.name,
          avatar: undefined,
        },
      })).reverse();

      setMessages(giftedChatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const onSend = useCallback((messages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
  }, []);

  const currentUser: User = {
    _id: user?.id || '1',
    name: user?.name || 'User',
  };

  return (
    <LinearGradient
      colors={['#E8D8F5', '#FADADD', '#FFE4B5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.chatContainer}>
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={currentUser}
            renderAvatar={null}
            renderBubble={(props) => {
              const isCurrentUser = props.currentMessage?.user._id === currentUser._id;
              return (
                <View
                  style={[
                    styles.bubble,
                    isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
                  ]}
                >
                  <props.renderMessageText {...props} />
                </View>
              );
            }}
            renderMessageText={(props) => (
              <View style={styles.messageTextContainer}>
                <props.renderMessageText
                  {...props}
                  textStyle={[
                    styles.messageText,
                    props.currentMessage?.user._id === currentUser._id
                      ? styles.currentUserText
                      : styles.otherUserText,
                  ]}
                />
              </View>
            )}
            renderInputToolbar={(props) => (
              <View style={styles.inputToolbar}>
                <props.renderComposer
                  {...props}
                  textInputStyle={styles.textInput}
                  placeholderTextColor="#9CA3AF"
                />
                <props.renderSend {...props} />
              </View>
            )}
            renderSend={(props) => (
              <View style={styles.sendButton}>
                <props.renderSend
                  {...props}
                  textStyle={styles.sendButtonText}
                  label="Send"
                />
              </View>
            )}
            keyboardShouldPersistTaps="handled"
            inverted={true}
            placeholder="Type a message..."
          />
        </View>
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
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bubble: {
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    maxWidth: '80%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentUserBubble: {
    backgroundColor: '#FADADD',
    alignSelf: 'flex-end',
  },
  otherUserBubble: {
    backgroundColor: '#E8D8F5',
    alignSelf: 'flex-start',
  },
  messageTextContainer: {
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#5B21B6',
  },
  otherUserText: {
    color: '#6B46C1',
  },
  inputToolbar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderRadius: 25,
    marginHorizontal: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  textInput: {
    flex: 1,
    borderWidth: 0,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    color: '#1F2937',
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});