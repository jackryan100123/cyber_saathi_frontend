import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import api, { NewsArticle, handleApiError } from '@/services/api';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  category?: string;
}

export default function NewsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getNews();
      
      if (response.success) {
        setNews(response.articles);
      } else {
        setError(response.error || 'Failed to fetch news');
      }
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('News fetch error:', apiError);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  const handleNewsPress = (url: string) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Unable to open the news article');
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 140) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'government':
        return AppColors.info;
      case 'banking':
        return AppColors.success;
      case 'security':
        return AppColors.warning;
      default:
        return AppColors.primary;
    }
  };

  if (loading && news.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? AppColors.backgroundDark : AppColors.background }]}>
        <StatusBar 
          barStyle={isDark ? "light-content" : "dark-content"} 
          backgroundColor="transparent" 
          translucent 
        />
        
        {/* Header */}
        <LinearGradient
          colors={isDark ? AppColors.gradients.dark as [string, string] : AppColors.gradients.secondary as [string, string]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="newspaper" size={24} color="white" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Cyber News</Text>
                <Text style={styles.headerSubtitle}>Latest Updates</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons name="newspaper" size={48} color={AppColors.textSecondary} />
          </View>
          <Text style={[styles.loadingText, { color: AppColors.textSecondary }]}>
            Loading latest cybersecurity news...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? AppColors.backgroundDark : AppColors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Header */}
      <LinearGradient
        colors={isDark ? AppColors.gradients.dark as [string, string] : AppColors.gradients.secondary as [string, string]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="newspaper" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Cyber News</Text>
              <Text style={styles.headerSubtitle}>Latest Updates</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color="white" 
              style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color={AppColors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchNews} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.newsContainer}
        contentContainerStyle={styles.newsContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {news.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.newsCard, { 
              backgroundColor: isDark ? AppColors.card.backgroundDark : AppColors.card.background,
              borderColor: isDark ? AppColors.card.borderDark : AppColors.card.border 
            }]}
            onPress={() => handleNewsPress(item.url)}
            activeOpacity={0.8}
          >
            <View style={styles.newsHeader}>
              <View style={styles.sourceContainer}>
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
                <Text style={[styles.sourceText, { color: getCategoryColor(item.category) }]}>
                  {item.source}
                </Text>
                {item.category && (
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                    <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                      {item.category}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.dateText, { color: AppColors.textTertiary }]}>
                {formatDate(item.publishedAt)}
              </Text>
            </View>
            
            <Text style={[styles.newsTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
              {item.title}
            </Text>
            <Text style={[styles.newsDescription, { color: AppColors.textSecondary }]}>
              {truncateText(item.description)}
            </Text>
            
            <View style={styles.newsFooter}>
              <View style={styles.readMoreContainer}>
                <Ionicons name="open-outline" size={16} color={AppColors.primary} />
                <Text style={[styles.readMoreText, { color: AppColors.primary }]}>
                  Read full article
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
        
        {news.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="newspaper-outline" size={64} color={AppColors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary }]}>
              No News Available
            </Text>
            <Text style={[styles.emptyText, { color: AppColors.textSecondary }]}>
              We couldn't load the latest cybersecurity news at the moment. Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
              <LinearGradient
                colors={AppColors.gradients.primary as [string, string]}
                style={styles.retryGradient}
              >
                <Ionicons name="refresh" size={16} color="white" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
    color: 'white',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.error + '20',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: AppColors.error,
    flex: 1,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    color: AppColors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  newsContainer: {
    flex: 1,
  },
  newsContent: {
    padding: 16,
    paddingBottom: 100,
  },
  newsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: AppColors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  newsDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});