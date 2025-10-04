import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  visible: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ visible, onClose }) => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m UrbanShield Assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const colors = Colors[isDark ? 'dark' : 'light'];

  // Rule-based responses
  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();

    // Greeting patterns
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return 'Hello! Welcome to UrbanShield. I\'m here to help you with incident reporting, safety tips, and general assistance. What would you like to know?';
    }

    // Help patterns
    if (message.includes('help') || message.includes('what can you do')) {
      return 'I can help you with:\n• Reporting incidents (crime, fire, accidents, etc.)\n• Safety tips and emergency procedures\n• Understanding UrbanShield features\n• General questions about the app\n\nWhat specific help do you need?';
    }

    // Incident reporting patterns
    if (message.includes('report') || message.includes('incident') || message.includes('emergency')) {
      return 'To report an incident:\n1. Tap the "+" button on the main screen\n2. Select the incident type (Crime, Fire, Accident, etc.)\n3. Add a description and location\n4. Take a photo if possible\n5. Submit the report\n\nIs there a specific type of incident you need to report?';
    }

    // Crime-related patterns
    if (message.includes('crime') || message.includes('theft') || message.includes('robbery')) {
      return 'For crime incidents:\n• Stay safe and call emergency services (911) immediately\n• Use UrbanShield to report the incident with details\n• Include location, time, and description\n• Take photos if it\'s safe to do so\n• Don\'t put yourself in danger for evidence\n\nDo you need to report a crime right now?';
    }

    // Fire-related patterns
    if (message.includes('fire') || message.includes('burning') || message.includes('smoke')) {
      return 'For fire emergencies:\n• Call 911 immediately\n• Evacuate the area if safe to do so\n• Use UrbanShield to alert others in the vicinity\n• Include location and severity level\n• Don\'t try to fight the fire yourself\n\nIs this an active fire emergency?';
    }

    // Accident patterns
    if (message.includes('accident') || message.includes('crash') || message.includes('collision')) {
      return 'For accidents:\n• Call 911 for medical emergencies\n• Report traffic accidents to local police\n• Use UrbanShield to document the scene\n• Include photos and location details\n• Check for injuries before taking photos\n\nAre you reporting a traffic accident?';
    }

    // Natural disaster patterns
    if (message.includes('flood') || message.includes('earthquake') || message.includes('landslide')) {
      return 'For natural disasters:\n• Call 911 for immediate danger\n• Use UrbanShield to report and track the situation\n• Include severity level and affected areas\n• Share updates as conditions change\n• Follow official evacuation orders\n\nWhat type of natural disaster are you reporting?';
    }

    // Safety tips patterns
    if (message.includes('safety') || message.includes('tip') || message.includes('prevent')) {
      return 'Safety Tips:\n• Always be aware of your surroundings\n• Keep emergency contacts handy\n• Report suspicious activities immediately\n• Use well-lit areas at night\n• Trust your instincts\n• Keep your phone charged\n\nIs there a specific safety concern you have?';
    }

    // App features patterns
    if (message.includes('feature') || message.includes('how to') || message.includes('use')) {
      return 'UrbanShield Features:\n• Incident Reporting: Report various types of incidents\n• Live Updates: Get real-time incident updates\n• Map View: See incidents in your area\n• Profile: Manage your account settings\n• Notifications: Stay informed about nearby incidents\n\nWhich feature would you like to learn more about?';
    }

    // Emergency contact patterns
    if (message.includes('contact') || message.includes('phone') || message.includes('number')) {
      return 'Emergency Contacts:\n• 911 - Emergency Services\n• Local Police: Check your area\'s non-emergency number\n• Fire Department: Usually 911\n• Medical Emergency: 911\n\nFor non-emergency incidents, use UrbanShield to report them.';
    }

    // Thank you patterns
    if (message.includes('thank') || message.includes('thanks')) {
      return 'You\'re welcome! I\'m here to help keep you safe. Is there anything else you need assistance with?';
    }

    // Goodbye patterns
    if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
      return 'Goodbye! Stay safe and remember to use UrbanShield to report any incidents. Take care!';
    }

    // Default response for unrecognized patterns
    return 'I understand you\'re asking about "' + userMessage + '". I can help you with incident reporting, safety tips, or general UrbanShield questions. Could you rephrase your question or ask about something specific?';
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: message.isUser ? colors.primary : colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: message.isUser ? '#fff' : colors.text,
            },
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            {
              color: message.isUser ? 'rgba(255,255,255,0.7)' : colors.secondary,
            },
          ]}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="chatbubble" size={20} color="#fff" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                UrbanShield Assistant
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
                {isTyping ? 'Typing...' : 'Online'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isTyping && (
            <View style={[styles.messageContainer, styles.botMessage]}>
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { backgroundColor: colors.secondary }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.secondary }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.secondary }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Type your message..."
            placeholderTextColor={colors.secondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? colors.primary : colors.border,
              },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    opacity: 0.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatBot;

