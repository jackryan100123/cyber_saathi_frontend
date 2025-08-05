import Button from '@/components/Button';
import Card from '@/components/Card';
import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const features = [
    {
      icon: 'alert-circle',
      title: 'Report Cyber Crime',
      description: 'File complaints and report suspicious activities instantly',
      color: AppColors.error,
      url: 'https://cybercrime.gov.in/Webform/Accept.aspx',
    },
    {
      icon: 'phone-portrait',
      title: 'Block Stolen Phone',
      description: 'Report and block stolen devices through CEIR portal',
      color: AppColors.info,
      url: 'https://www.ceir.gov.in/Request/CeirUserBlockRequestDirect.jsp',
    },
    {
      icon: 'call',
      title: 'TAFCOP Check',
      description: 'Verify mobile connections registered in your name',
      color: AppColors.secondary,
      url: 'https://tafcop.sancharsaathi.gov.in/telecomUser/',
    },
  ];

  const quickActions = [
    { id: "report", icon: 'alert-circle', label: "Report", color: AppColors.error },
    { id: "check", icon: 'shield-checkmark', label: "Scan URL", color: AppColors.success },
    { id: "tips", icon: 'bulb', label: "Tips", color: AppColors.warning },
    { id: "help", icon: 'help-circle', label: "Help", color: AppColors.emergency },
  ];

  const handleQuickAction = (action: string) => {
    router.push('/chat');
  };

  const handleFeaturePress = (action: string) => {
    router.push('/chat');
  };

  const handleEmergencyCall = () => {
    Linking.openURL('tel:1930').catch(err => {
      console.error('Failed to open dialer:', err);
    });
  };

  const handleStartChat = () => {
    router.push('/chat');
  };

  const openExternalLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
    });
  };

  return (
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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
              />
              <View style={styles.logoGlow} />
            </View>
            <View style={styles.titleSection}>
              <Text style={styles.appTitle}>CyberSaathi</Text>
              <Text style={styles.appSubtitle}>Your Cybersecurity Companion</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.emergencyHeaderButton}
              onPress={handleEmergencyCall}
            >
              <Ionicons name="warning" size={16} color={AppColors.emergency} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <Card variant="glass" style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={[styles.heroTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
              Stay Safe in the{'\n'}
              <Text style={{ color: AppColors.primary }}>Digital World</Text>
            </Text>
            
            <Text style={[styles.heroDescription, { color: AppColors.textSecondary }]}>
              AI-powered cybersecurity assistance, real-time threat detection, and expert guidance to protect you online.
            </Text>
            
            <View style={styles.heroFeatures}>
              <View style={styles.heroFeature}>
                <Ionicons name="shield-checkmark" size={16} color={AppColors.success} />
                <Text style={[styles.heroFeatureText, { color: AppColors.textSecondary }]}>
                  24/7 Protection
                </Text>
              </View>
              <View style={styles.heroFeature}>
                <Ionicons name="flash" size={16} color={AppColors.warning} />
                <Text style={[styles.heroFeatureText, { color: AppColors.textSecondary }]}>
                  Instant Response
                </Text>
              </View>
              <View style={styles.heroFeature}>
                <Ionicons name="people" size={16} color={AppColors.info} />
                <Text style={[styles.heroFeatureText, { color: AppColors.textSecondary }]}>
                  Expert Support
                </Text>
              </View>
            </View>
            
            <Button
              title="Start Secure Chat"
              onPress={handleStartChat}
              variant="primary"
              size="large"
              icon="chatbubble-ellipses"
              iconPosition="left"
              fullWidth
            />
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
            Quick Actions
          </Text>
          <Text style={[styles.sectionSubtitle, { color: AppColors.textSecondary }]}>
            Get instant help with common cybersecurity tasks
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <Card
                key={action.id}
                variant="default"
                style={styles.quickActionCard}
                onPress={() => handleQuickAction(action.id)}
                elevation={2}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickActionTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
                  {action.label}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
            Cybersecurity Services
          </Text>
          <Text style={[styles.sectionSubtitle, { color: AppColors.textSecondary }]}>
            Comprehensive protection and guidance for all your digital security needs
          </Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => {
              // Responsive width: 2 columns on wide screens, 1 on small
              const isWide = width > 500;
              const cardWidth = isWide ? (width - 52) / 2 : width - 40;
              return (
                <Card
                key={index}
                variant="feature"
                style={{
                  ...styles.featureCard,
                  width: cardWidth,
                  marginRight: (isWide && index % 2 === 0) ? 12 : 0,
                  marginBottom: 18,
                  borderRadius: 18,
                  elevation: 3,
                  backgroundColor: isDark
                    ? AppColors.card?.backgroundDark || '#23272f'
                    : `${feature.color}10`, // subtle tint of the feature color in light mode
                }}
                onPress={() => openExternalLink(feature.url)}
              >
                <View style={styles.featureCardContent}>
                  <View style={styles.featureIconWrapper}>
                    <View style={[styles.featureIcon, { backgroundColor: `${feature.color}22` }]}> 
                      <Ionicons name={feature.icon as any} size={36} color={feature.color} />
                    </View>
                  </View>
                  <Text style={[styles.featureTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary, textAlign: 'center' }]}> 
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDescription, { color: AppColors.textSecondary, textAlign: 'center', marginBottom: 8 }]}> 
                    {feature.description}
                  </Text>
                  <View style={styles.featureArrow}>
                    <Ionicons name="arrow-forward" size={18} color={feature.color} />
                  </View>
                </View>
              </Card>
              );
            })}
          </View>
        </View>

        {/* Emergency Contact */}
        <Card variant="emergency" style={styles.emergencyCard} elevation={6}>
          <View style={styles.emergencyContent}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="warning" size={36} color="white" />
            </View>
            <Text style={styles.emergencyTitle}>Emergency Helpline</Text>
            <Text style={styles.emergencyNumber}>1930</Text>
            <Text style={styles.emergencyDescription}>
              National Cyber Crime Helpline{'\n'}Available 24/7 for immediate assistance
            </Text>
            <Button
              title="Call Emergency Helpline"
              onPress={handleEmergencyCall}
              variant="outline"
              size="medium"
              icon="call"
              iconPosition="left"
              style={styles.emergencyButton}
              textStyle={styles.emergencyButtonText}
            />
          </View>
        </Card>

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    position: 'relative',
    marginRight: 12,
    marginTop: 6, // add top margin to bring logo down
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  logoGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: -1,
  },
  titleSection: {
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    
    color: 'white',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emergencyHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  heroCard: {
    marginBottom: 32,
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  heroDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  heroFeatures: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 28,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroFeatureText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 64) / 2,
    alignItems: 'center',
    padding: 20,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -6,
  },
  featureCard: {
    padding: 20,
    minHeight: 180,
    position: 'relative',
    borderRadius: 18,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  featureIconWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  featureDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  featureArrow: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emergencyCard: {
    marginBottom: 32,
  },
  emergencyContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emergencyIcon: {
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  emergencyNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
    letterSpacing: 2,
  },
  emergencyDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emergencyButton: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  emergencyButtonText: {
    color: AppColors.emergency,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});