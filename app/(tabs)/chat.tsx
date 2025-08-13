import ChatMessage from '@/components/ChatMessage';
import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import api, { Message as ApiMessage, formatUrlForScan, isUrlScanRequest } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'url-scan' | 'emergency' | 'info';
}

interface QuickAction {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bgColor: string;
}

const { width, height } = Dimensions.get('window');

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm CyberSaathi, your AI-powered cybersecurity assistant. I'm here to help you stay safe online.\n\nI can assist you with:\n• **Reporting cyber crimes**\n• **Checking website safety**\n• **Providing security tips**\n• **Emergency cyber help**\n\nHow can I help protect you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'info',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const quickActions: QuickAction[] = [
    {
      id: "report",
      icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
      label: "Report Crime",
      color: AppColors.error,
      bgColor: AppColors.error + '15'
    },

    {
      id: "tips",
      icon: 'bulb' as keyof typeof Ionicons.glyphMap,
      label: "Security Tips",
      color: AppColors.warning,
      bgColor: AppColors.warning + '15'
    },
    {
      id: "help",
      icon: 'help-circle' as keyof typeof Ionicons.glyphMap,
      label: "Emergency",
      color: AppColors.emergency,
      bgColor: AppColors.emergency + '15'
    },
  ];

  useEffect(() => {
    checkApiConnection();

    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  // Keyboard event listeners for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardHeight(0);
      });

      return () => {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
      };
    }
  }, []);

  const checkApiConnection = async () => {
    try {
      await api.getHealth();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      console.error('API Connection failed:', error);
    }
  };

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const convertMessagesToApiFormat = (messages: Message[]): ApiMessage[] => {
    return messages
      .filter(msg => msg.content.trim() !== '')
      .map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' as const : 'user' as const,
        content: msg.content
      }));
  };

  const scanUrl = async (url: string) => {
    try {
      const scanningMessage: Message = {
        id: generateUniqueId(),
        content: `🔍 **Scanning URL**: ${url}\n\n⏳ Analyzing website for potential threats...\nThis may take up to 30 seconds.`,
        sender: "bot",
        timestamp: new Date(),
        type: 'info',
      };
      setMessages(prev => [...prev, scanningMessage]);

      const scanResult = await api.scanUrl(url);

      if (scanResult.success && scanResult.result) {
        const result = scanResult.result;

        let emoji = "❓";
        let riskDescription = "";

        switch (result.riskLevel) {
          case 'dangerous':
            emoji = "🚨";
            riskDescription = "This URL has been flagged as dangerous!";
            break;
          case 'suspicious':
            emoji = "⚠️";
            riskDescription = "This URL appears suspicious. Exercise caution.";
            break;
          case 'safe':
            emoji = "✅";
            riskDescription = "This URL appears to be safe.";
            break;
          default:
            emoji = "❓";
            riskDescription = "Unable to determine risk level.";
        }

        const scanResultMessage = `${emoji} **Security Scan Results**

🔗 **URL**: ${url}
🛡️ **Risk Level**: ${result.riskLevel.toUpperCase()}
📊 **Assessment**: ${riskDescription}

**Detection Details**:
• Malicious: ${result.details.malicious}
• Suspicious: ${result.details.suspicious}
• Safe: ${result.details.harmless}
• Unrated: ${result.details.undetected}

⏱️ **Scan Time**: ${new Date(result.scanTime).toLocaleTimeString()}

${result.riskLevel === "dangerous"
            ? "\n🚨 **WARNING**: Do not visit this website! It may contain malware or be used for phishing."
            : result.riskLevel === "suspicious"
              ? "\n⚠️ **CAUTION**: Be very careful if you choose to visit this website."
              : "\n✅ **RECOMMENDATION**: While this URL appears safe, always be cautious with personal information."}`;

        const resultMessage: Message = {
          id: generateUniqueId(),
          content: scanResultMessage,
          sender: "bot",
          timestamp: new Date(),
          type: 'url-scan',
        };

        setMessages(prev => [...prev, resultMessage]);
      } else {
        throw new Error(scanResult.error || "Failed to scan URL");
      }
    } catch (error: any) {
      console.error("URL Scan Error:", error);
      const errorMessage: Message = {
        id: generateUniqueId(),
        content: `⚠️ **Scan Error**: ${error.message || "Failed to scan URL"}\n\nPlease ensure:\n• The URL is valid and accessible\n• You have an internet connection\n• Try again in a few moments`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuickAction = async (action: string) => {
    const userMessage: Message = {
      id: generateUniqueId(),
      content: action,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);

    try {
      const conversationHistory = convertMessagesToApiFormat([...messages, userMessage]);
      const response = await api.sendChatMessage(conversationHistory);

      if (response.success) {
        const botMessage: Message = {
          id: generateUniqueId(),
          content: response.response,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(response.error || "Failed to get response");
      }
    } catch (error: any) {
      console.error("Quick Action Error:", error);
      const errorMessage: Message = {
        id: generateUniqueId(),
        content: "⚠️ I'm having trouble responding right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: generateUniqueId(),
      content: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    // Check if the message is about URL scanning
    if (isUrlScanRequest(currentInput)) {
      const url = formatUrlForScan(currentInput);

      if (url) {
        await scanUrl(url);
      } else {
        const botResponse: Message = {
          id: generateUniqueId(),
          content: `⚠️ **No valid URL found**\n\nPlease provide a URL starting with http:// or https://\n\n**Example:**\n\`scan url https://example.com\``,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
      }
      setIsTyping(false);
      return;
    }

    // Continue with AI API call for other messages
    try {
      const conversationHistory = convertMessagesToApiFormat([...messages, userMessage]);

      const messagesForAPI: ApiMessage[] = [
        {
          role: "system" as const,
          content: "You are CyberSaathi, an official cybersecurity assistant for Indian users. Provide helpful, accurate information about cybersecurity, cyber crimes, and digital safety. Keep responses concise but informative. Always prioritize user safety and direct them to appropriate authorities when needed."
        },
        ...conversationHistory
      ];

      const response = await api.sendChatMessage(messagesForAPI);

      if (response.success) {
        const botMessage: Message = {
          id: generateUniqueId(),
          content: response.response,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(response.error || "Failed to get response");
      }

    } catch (error: any) {
      console.error("Chat API Error:", error);
      const errorMessage: Message = {
        id: generateUniqueId(),
        content: "⚠️ I'm experiencing technical difficulties. Please try again or contact our emergency helpline at **1930** for immediate assistance.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Call',
      'Do you want to call the National Cyber Crime Helpline (1930)?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL('tel:1930') },
      ]
    );
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear the chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([{
              id: '1',
              content: "Hello! I'm CyberSaathi, your AI-powered cybersecurity assistant. How can I help you stay safe online today?",
              sender: 'bot',
              timestamp: new Date(),
              type: 'info',
            }]);
          }
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : StatusBar.currentHeight || 0}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? AppColors.backgroundDark : AppColors.background }]}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        {/* Header */}
        <LinearGradient
          colors={isDark ? AppColors.gradients.dark as [string, string] : AppColors.gradients.primary as [string, string]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.botAvatar}>
                <Ionicons name="shield-checkmark" size={20} color="white" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>CyberSaathi</Text>
                <Text style={styles.headerSubtitle}>
                  {isConnected ? "🟢 Online" : "🔴 Offline"}
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleEmergencyCall}
              >
                <Ionicons name="call" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleClearChat}
              >
                <Ionicons name="refresh" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Connection Status */}
        {!isConnected && (
          <View style={styles.connectionWarning}>
            <Ionicons name="warning" size={16} color={AppColors.warning} />
            <Text style={styles.connectionText}>
              Limited functionality - Check your connection
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={[
          styles.quickActionsContainer,
          {
            backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surface,
            borderBottomColor: isDark ? AppColors.card.borderDark : AppColors.card.border
          }
        ]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContent}
          >
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionButton,
                  {
                    backgroundColor: action.bgColor,
                    borderColor: action.color + "40"
                  }
                ]}
                onPress={() => handleQuickAction(action.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={16} color="white" />
                </View>
                <Text style={[styles.quickActionText, { color: action.color }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              onAction={handleQuickAction}
              showActions={index === 0}
            />
          ))}

          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={[
                styles.typingBubble,
                {
                  backgroundColor: isDark ? AppColors.chat.botBubbleDark : AppColors.chat.botBubble,
                  borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border
                }
              ]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { backgroundColor: AppColors.primary }]} />
                  <View style={[styles.typingDot, { backgroundColor: AppColors.primary }]} />
                  <View style={[styles.typingDot, { backgroundColor: AppColors.primary }]} />
                </View>
                <Text style={[styles.typingText, { color: AppColors.textSecondary }]}>
                  CyberSaathi is typing...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surface,
            borderTopColor: isDark ? AppColors.card.borderDark : AppColors.card.border
          }
        ]}>
          <View style={[
            styles.inputWrapper,
            {
              backgroundColor: isDark ? AppColors.chat.inputBackgroundDark : AppColors.chat.inputBackground,
              borderColor: isDark ? AppColors.chat.inputBorderDark : AppColors.chat.inputBorder
            }
          ]}>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary
                }
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me"
              placeholderTextColor={AppColors.textTertiary}
              multiline
              maxLength={1000}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              returnKeyType="send"
              autoCapitalize="sentences"
              autoCorrect
              spellCheck
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  !inputText.trim()
                    ? [AppColors.button.disabled, AppColors.button.disabled]
                    : AppColors.gradients.primary as [string, string]
                }
                style={styles.sendGradient}
              >
                <Ionicons name="send" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );





}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingBottom: 8,
    paddingHorizontal: 10,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botAvatar: {
    width: 50,
    height: 30,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 8,
    marginLeft: 8,
  },
  headerText: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.warning + '20',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.warning + '30',
  },
  connectionText: {
    fontSize: 13,
    color: AppColors.warning,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionsContent: {
    paddingHorizontal: 10,
    gap: 10,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 8,
    minWidth: 120,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 15,
    height: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 20,
    flexGrow: 1,
  },

  // Updated typing indicator
  typingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
    alignItems: 'flex-end',
  },

  typingBubble: {
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    maxWidth: width * 0.75,
    marginLeft: 48, // Account for avatar space
    marginRight: 60,
  },

  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 4,
  },

  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.7,
  },

  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  inputContainer: {
    borderTopWidth: 1,
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 20, // Apply marginBottom on Android too
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },
  

  inputWrapper: {
    flexDirection: 'row',
    gap: 6,
    borderRadius: 28,
    padding: 2,
    borderWidth: 1,
    marginBottom: 30,
  
    // Shadow for iOS
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  
    // Elevation for Android
    elevation: 3,
  
    // Optional: Improve platform consistency
    backgroundColor: AppColors.chat.inputBackground, // fallback if dynamic background isn't passed in
  },
  

  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlignVertical: 'top',
    fontWeight: '400',

  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  sendGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },

  inputFooter: {
    marginTop: 8,
    alignItems: 'center',
  },

  inputFooterText: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});