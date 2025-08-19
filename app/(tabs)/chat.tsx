import ChatMessage from '@/components/ChatMessage';
import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import api, { Message as ApiMessage, formatUrlForScan, isUrlScanRequest } from '@/services/api';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'url-scan' | 'emergency' | 'info';
}

const { width, height } = Dimensions.get('window');

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

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
  const [isRecording, setIsRecording] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(56);
  const [isPreparingRecording, setIsPreparingRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    checkApiConnection();

    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

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

  const startRecording = async () => {
    // Prevent multiple prepare/start calls
    if (isPreparingRecording || isRecording || recordingRef.current) return;
    setIsPreparingRecording(true);
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setIsPreparingRecording(false);
        Alert.alert('Permission Required', 'Please grant microphone permission to use voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start a single recording instance
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start voice recording. Please try again.');
    } finally {
      setIsPreparingRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (uri) {
        const transcriptionResult = await api.transcribeAudio(uri);
        if (transcriptionResult.success && transcriptionResult.text) {
          const newText = transcriptionResult.text.trim();
          if (newText) {
            setInputText(prev => prev ? `${prev} ${newText}` : newText);
          }
        } else {
          Alert.alert('Transcription Error', transcriptionResult.error || 'Failed to transcribe audio');
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Failed to process voice recording. Please try again.');
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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? AppColors.backgroundDark : AppColors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + headerHeight}
      >
        {/* Header */}
        <View 
          style={styles.header}
          onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        >
          <LinearGradient
            colors={isDark ? AppColors.gradients.dark as [string, string] : AppColors.gradients.primary as [string, string]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
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
                  <Text style={styles.headerButtonText}>1930</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleClearChat}
                >
                  <Text style={styles.headerButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Connection Status */}
        {!isConnected && (
          <View style={styles.connectionWarning}>
            <Text style={styles.connectionText}>
              ⚠️ Limited functionality - Check your connection
            </Text>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
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
            borderTopColor: isDark ? AppColors.card.borderDark : AppColors.card.border,
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 16,
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
              placeholder={isRecording ? 'Listening… speak now' : 'Ask me'}
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
            
            {/* Voice Input Button */}
            <TouchableOpacity
              style={[
                styles.micButton,
                { backgroundColor: isRecording ? AppColors.error : AppColors.textTertiary }
              ]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
              activeOpacity={0.8}
            >
              <View style={styles.micIndicator} />
            </TouchableOpacity>

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
                <Text style={styles.sendText}>Send</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  connectionWarning: {
    backgroundColor: AppColors.warning + '20',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.warning + '30',
  },
  connectionText: {
    fontSize: 13,
    color: AppColors.warning,
    fontWeight: '600',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 20,
    paddingBottom: 12,
  },
  typingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 16,
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
    padding: 16,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
    textAlignVertical: 'top',
    fontWeight: '400',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  micIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 2,
  },
  sendGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
});