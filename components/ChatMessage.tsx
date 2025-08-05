import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'url-scan' | 'emergency' | 'info';
}

interface ChatMessageProps {
  message: Message;
  onAction?: (action: string) => void;
  showActions?: boolean;
}

const { width } = Dimensions.get('window');

export default function ChatMessage({ 
  message, 
  onAction, 
  showActions = false 
}: ChatMessageProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isUser = message.sender === 'user';
  const isUrlScan = message.type === 'url-scan';
  const isEmergency = message.type === 'emergency';
  const isInfo = message.type === 'info';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
    });
  };

  const renderFormattedContent = () => {
    const content = message.content;
    
    // Split content by markdown patterns
    const parts = content.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|`.*?`)/g);
    
    return parts.map((part, index) => {
      // Bold text
      if (part.startsWith('**') && part.endsWith('**')) {
        const text = part.slice(2, -2);
        return (
          <Text key={index} style={[styles.messageText, styles.boldText, { color: getTextColor() }]}>
            {text}
          </Text>
        );
      }
      
      // Links
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [, linkText, url] = linkMatch;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleLinkPress(url)}
            style={styles.linkContainer}
          >
            <Text style={[styles.linkText, { color: isUser ? 'rgba(255,255,255,0.9)' : AppColors.primary }]}>
              {linkText}
            </Text>
            <Ionicons 
              name="open-outline" 
              size={12} 
              color={isUser ? 'rgba(255,255,255,0.9)' : AppColors.primary} 
            />
          </TouchableOpacity>
        );
      }
      
      // Code text
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <Text key={index} style={[styles.codeText, { 
            backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : (isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'),
            color: getTextColor()
          }]}>
            {code}
          </Text>
        );
      }
      
      // Regular text
      return (
        <Text key={index} style={[styles.messageText, { color: getTextColor() }]}>
          {part}
        </Text>
      );
    });
  };

  const getTextColor = () => {
    if (isUser) return 'white';
    return isDark ? AppColors.textPrimaryDark : AppColors.textPrimary;
  };

  const getBubbleStyle = () => {
    if (isUser) {
      return [styles.messageBubble, styles.userBubble];
    }
    
    const botBubbleStyle = [
      styles.messageBubble, 
      styles.botBubble,
      { 
        backgroundColor: isDark ? AppColors.chat.botBubbleDark : AppColors.chat.botBubble,
        borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border 
      }
    ];
    
    if (isUrlScan) {
      botBubbleStyle.push({ 
        backgroundColor: AppColors.success + '15',
        borderColor: AppColors.success + '40' 
      });
    } else if (isEmergency) {
      botBubbleStyle.push({ 
        backgroundColor: AppColors.emergency + '15',
        borderColor: AppColors.emergency + '40' 
      });
    } else if (isInfo) {
      botBubbleStyle.push({ 
        backgroundColor: AppColors.info + '15',
        borderColor: AppColors.info + '40' 
      });
    }
    
    return botBubbleStyle;
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.botContainer
    ]}>
      {/* Avatar */}
     

      {/* Message Content */}
      <View style={[
        getBubbleStyle(),
        { maxWidth: width * 0.8 }
      ]}>
        {isUser ? (
          <LinearGradient
            colors={AppColors.gradients.primary as [string, string]}
            style={styles.userGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.messageContent}>
              {renderFormattedContent()}
            </View>
            <Text style={styles.userTimestamp}>
              {formatTime(message.timestamp)}
            </Text>
          </LinearGradient>
        ) : (
          <>
            <View style={styles.messageContent}>
              {renderFormattedContent()}
            </View>
            <Text style={[styles.botTimestamp, { color: AppColors.textTertiary }]}>
              {formatTime(message.timestamp)}
            </Text>
          </>
        )}
      </View>

      {/* User Avatar */}
      {isUser && (
        <View style={[styles.avatar, styles.userAvatar]}>
          <Ionicons name="person" size={16} color={AppColors.primary} />
        </View>
      )}

      {/* Quick Actions for first bot message */}
      {showActions && !isUser && (
        <View style={styles.actionsContainer}>
          <Text style={[styles.actionsTitle, { color: AppColors.textSecondary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: AppColors.success + '15',
                borderColor: AppColors.success + '30'
              }]}
              onPress={() => onAction?.('check')}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={16} color={AppColors.success} />
              <Text style={[styles.actionButtonText, { color: AppColors.success }]}>
                URL Safety
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: AppColors.warning + '15',
                borderColor: AppColors.warning + '30'
              }]}
              onPress={() => onAction?.('tips')}
              activeOpacity={0.8}
            >
              <Ionicons name="bulb" size={16} color={AppColors.warning} />
              <Text style={[styles.actionButtonText, { color: AppColors.warning }]}>
                Security Tips
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: AppColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatar: {
    overflow: 'hidden',
  },
  messageBubble: {
    borderRadius: 20,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userBubble: {
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
  botBubble: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    padding: 16,
  },
  userGradient: {
    padding: 16,
  },
  messageContent: {
    marginBottom: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  boldText: {
    fontWeight: '700',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  userTimestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    fontWeight: '500',
  },
  botTimestamp: {
    fontSize: 11,
    textAlign: 'left',
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 12,
    marginLeft: 52,
    marginRight: 20,
  },
  actionsTitle: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});