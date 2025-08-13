import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import api, { Booklet as ApiBooklet } from '@/services/api';

interface Booklet extends ApiBooklet {
  description?: string;
  icon?: string;
}

interface ContactInfo {
  id: string;
  title: string;
  value: string;
  icon: string;
  action: 'call' | 'email' | 'website';
  description: string;
}

export default function MoreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [booklets, setBooklets] = useState<Booklet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getBooklets();
        const mapped: Booklet[] = res.booklets.map((b) => ({
          ...b,
          // Assign default icons based on name
          icon: (b.title.toLowerCase().includes('internet') || b.title.toLowerCase().includes('safety')) ? 'globe' :
                (b.title.toLowerCase().includes('women') || b.title.toLowerCase().includes('mahila')) ? 'shield-checkmark' :
                'document-text',
          description: b.title,
        }));
        setBooklets(mapped);
      } catch (e: any) {
        setError(e.message || 'Failed to load booklets');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const contactInfo: ContactInfo[] = [
    {
      id: '1',
      title: 'National Cyber Crime Helpline',
      value: '1930',
      icon: 'call',
      action: 'call',
      description: '24/7 emergency helpline for cyber crimes',
    },
    {
      id: '2',
      title: 'Chandigarh Cyber Cell',
      value: '0172-2749900',
      icon: 'phone-portrait',
      action: 'call',
      description: 'Local cyber crime investigation unit',
    },
    {
      id: '3',
      title: 'Email Support',
      value: 'cybercrime-chd@nic.in',
      icon: 'mail',
      action: 'email',
      description: 'Official email for cyber crime reports',
    },
    {
      id: '4',
      title: 'Cyber Crime Portal',
      value: 'cybercrime.gov.in',
      icon: 'globe',
      action: 'website',
      description: 'Official government cyber crime portal',
    },
  ];

  const handleContactAction = (contact: ContactInfo) => {
    switch (contact.action) {
      case 'call':
        Alert.alert(
          'Make Call',
          `Do you want to call ${contact.title}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Call', 
              onPress: () => Linking.openURL(`tel:${contact.value}`)
            },
          ]
        );
        break;
      case 'email':
        Linking.openURL(`mailto:${contact.value}`).catch(err => {
          Alert.alert('Error', 'Unable to open email client');
        });
        break;
      case 'website':
        Linking.openURL(`https://${contact.value}`).catch(err => {
          Alert.alert('Error', 'Unable to open website');
        });
        break;
    }
  };

  const handleDownloadBooklet = (booklet: Booklet) => {
    Alert.alert(
      'Download Booklet',
      `Download "${booklet.title}" (${booklet.size})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          onPress: () => {
            Linking.openURL(booklet.fileUrl).catch(err => {
              Alert.alert('Error', 'Failed to download the booklet. Please try again later.');
            });
          }
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Stay safe online with CyberSaathi! 🛡️\n\nYour AI-powered cybersecurity companion for:\n• Cyber crime reporting\n• Website safety checks\n• Security tips & guidance\n• Emergency assistance\n\nDownload now and protect yourself in the digital world!',
        title: 'CyberSaathi - Cybersecurity App',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate CyberSaathi', 
      'Help us improve by rating our app on the store!',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Rate Now', onPress: () => {
          // This would typically open the app store
          Alert.alert('Thank You!', 'Thank you for using CyberSaathi! Your feedback helps us improve.');
        }},
      ]
    );
  };

  const openPoliceStationLocation = async () => {
    const lat = 30.739204757628027;
    const lng = 76.77835647910382;
    const label = 'Chandigarh Cyber Police Station';
    const iosUrl = `http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(label)}`;
    const universalUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    const url = Platform.OS === 'ios' ? iosUrl : universalUrl;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open maps on this device.');
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
        colors={isDark ? AppColors.gradients.dark as [string, string] : AppColors.gradients.surface as [string, string]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: isDark ? "white" : AppColors.textPrimary }]}> 
              More Options
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Emergency Section */}
        <View style={styles.emergencySection}>
          <LinearGradient
            colors={AppColors.gradients.emergency as [string, string]}
            style={styles.emergencyCard}
          >
            <View style={styles.emergencyIcon}>
              <Ionicons name="warning" size={36} color="white" />
            </View>
            <Text style={styles.emergencyTitle}>Emergency Helpline</Text>
            <Text style={styles.emergencyNumber}>1930</Text>
            <Text style={styles.emergencyDescription}>
              National Cyber Crime Helpline{'\n'}Available 24/7 for immediate assistance
            </Text>
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={() => Linking.openURL('tel:1930')}
            >
              <View style={styles.emergencyButtonContent}>
                <Ionicons name="call" size={18} color={AppColors.emergency} />
                <Text style={styles.emergencyButtonText}>Call Emergency Helpline</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Booklets Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
            Cybersecurity Resources
          </Text>
          <Text style={[styles.sectionSubtitle, { color: AppColors.textSecondary }]}>
            Download official guides and enhance your cybersecurity knowledge
          </Text>
          
          {loading && (
            <View style={[styles.bookletCard, { 
              backgroundColor: isDark ? AppColors.card.backgroundDark : AppColors.card.background,
              borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border 
            }]}> 
              <Text style={{ color: AppColors.textSecondary }}>Loading booklets...</Text>
            </View>
          )}
          {!!error && (
            <View style={[styles.bookletCard, { 
              backgroundColor: isDark ? AppColors.card.backgroundDark : AppColors.card.background,
              borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border 
            }]}> 
              <Text style={{ color: AppColors.error }}>Failed to load booklets</Text>
            </View>
          )}
          {booklets.map((booklet) => (
            <TouchableOpacity
              key={booklet.id}
              style={[styles.bookletCard, { 
                backgroundColor: isDark ? AppColors.card.backgroundDark : AppColors.card.background,
                borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border 
              }]}
              onPress={() => handleDownloadBooklet(booklet)}
              activeOpacity={0.8}
            >
              <View style={styles.bookletIcon}>
                <LinearGradient
                  colors={AppColors.gradients.primary as [string, string]}
                  style={styles.bookletIconGradient}
                >
                  <Ionicons name={(booklet.icon || 'document-text') as any} size={24} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.bookletContent}>
                <Text style={[styles.bookletTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
                  {booklet.title}
                </Text>
                <Text style={[styles.bookletDescription, { color: AppColors.textSecondary }]}>
                  {booklet.description}
                </Text>
                <Text style={[styles.bookletSize, { color: AppColors.textTertiary }]}>
                  Size: {booklet.size}
                </Text>
              </View>
              <View style={styles.downloadIcon}>
                <Ionicons name="download" size={20} color={AppColors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Locate Cyber Police Station */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
            Locate Cyber Police Station
          </Text>
          <Text style={[styles.sectionSubtitle, { color: AppColors.textSecondary }]}>
            Chandigarh Cyber Police Station
          </Text>
          <TouchableOpacity
            style={[styles.actionCard, {
              backgroundColor: isDark ? AppColors.card.backgroundDark : AppColors.card.background,
              borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border
            }]}
            onPress={openPoliceStationLocation}
            activeOpacity={0.8}
          >
            <View style={styles.actionIcon}>
              <LinearGradient
                colors={AppColors.gradients.secondary as [string, string]}
                style={styles.actionIconGradient}
              >
                <Ionicons name="location" size={22} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
                Open in Maps
              </Text>
              <Text style={[styles.actionDescription, { color: AppColors.textSecondary }]}>
                30.739204757628027, 76.77835647910382
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={AppColors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
            Contact Authorities
          </Text>
          <Text style={[styles.sectionSubtitle, { color: AppColors.textSecondary }]}>
            Get in touch with cyber crime authorities and support teams
          </Text>
          
          {contactInfo.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={[styles.contactCard, { 
                backgroundColor: isDark ? AppColors.card.backgroundDark : AppColors.card.background,
                borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border 
              }]}
              onPress={() => handleContactAction(contact)}
              activeOpacity={0.8}
            >
              <View style={styles.contactIcon}>
                <LinearGradient
                  colors={AppColors.gradients.secondary as [string, string]}
                  style={styles.contactIconGradient}
                >
                  <Ionicons name={contact.icon as any} size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.contactContent}>
                <Text style={[styles.contactTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
                  {contact.title}
                </Text>
                <Text style={[styles.contactValue, { color: AppColors.primary }]}>
                  {contact.value}
                </Text>
                <Text style={[styles.contactDescription, { color: AppColors.textSecondary }]}>
                  {contact.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        

        {/* App Info */}
        <View style={[styles.appInfoSection, { 
          borderTopColor: isDark ? AppColors.card.borderDark : AppColors.card.border 
        }]}>
          <View style={styles.appInfoHeader}>
            <LinearGradient
              colors={AppColors.gradients.primary as [string, string]}
              style={styles.appLogo}
            >
              <Ionicons name="shield-checkmark" size={32} color="white" />
            </LinearGradient>
            <Text style={[styles.appInfoTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
              CyberSaathi
            </Text>
            <Text style={[styles.appInfoVersion, { color: AppColors.textTertiary }]}>
              Version 1.0.0
            </Text>
          </View>
          
          <Text style={[styles.appInfoDescription, { color: AppColors.textSecondary }]}>
            Your AI-powered cybersecurity companion designed to keep you safe in the digital world. 
            Built with advanced security features and expert guidance.
          </Text>
          
          <View style={styles.appInfoFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={16} color={AppColors.success} />
              <Text style={[styles.featureText, { color: AppColors.textSecondary }]}>
                AI-Powered Protection
              </Text>
            </View>
            {/* <View style={styles.featureItem}>
              <Ionicons name="flash" size={16} color={AppColors.warning} />
              <Text style={[styles.featureText, { color: AppColors.textSecondary }]}>
                Real-time Scanning
              </Text>
            </View> */}
            {/* <View style={styles.featureItem}>
              <Ionicons name="people" size={16} color={AppColors.info} />
              <Text style={[styles.featureText, { color: AppColors.textSecondary }]}>
                Expert Support
              </Text>
            </View> */}
          </View>
          
          <Text style={[styles.appInfoCopyright, { color: AppColors.textTertiary }]}>
            © 2025 Developed by CenCops{'\n'}
            Chandigarh Police 
          </Text>
        </View>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emergencySection: {
    marginBottom: 32,
  },
  emergencyCard: {
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: AppColors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emergencyIcon: {
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  emergencyNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
    letterSpacing: 2,
  },
  emergencyDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emergencyButton: {
    backgroundColor: 'white',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  emergencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyButtonText: {
    color: AppColors.emergency,
    fontSize: 16,
    fontWeight: '700',
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
  bookletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookletIcon: {
    marginRight: 16,
  },
  bookletIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookletContent: {
    flex: 1,
  },
  bookletTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  bookletDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  bookletSize: {
    fontSize: 11,
    fontWeight: '500',
  },
  downloadIcon: {
    marginLeft: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactIcon: {
    marginRight: 16,
  },
  contactIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  appInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopWidth: 1,
    marginTop: 16,
  },
  appInfoHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appInfoTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  appInfoVersion: {
    fontSize: 14,
    fontWeight: '500',
  },
  appInfoDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  appInfoFeatures: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
  },
  appInfoCopyright: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});