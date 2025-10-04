import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface GuestHomeboardProps {
  onGetStarted: () => void;
}

export default function GuestHomeboard({ onGetStarted }: GuestHomeboardProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={[styles.logoContainer, { backgroundColor: colors.accent }]}>
          <Ionicons name="shield-checkmark" size={80} color={colors.primary} />
        </View>
        
        <Text style={[styles.appTitle, { color: colors.text }]}>
          UrbanShield
        </Text>
        
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Your Community Safety Partner
        </Text>
        
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Join thousands of community members working together to create safer neighborhoods for everyone.
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          How UrbanShield Works
        </Text>
        
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="eye" size={32} color={colors.background} />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Report Safety Issues
            </Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
              Quickly report safety concerns, maintenance issues, or suspicious activities in your area.
            </Text>
          </View>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.featureIcon, { backgroundColor: colors.success }]}>
            <Ionicons name="people" size={32} color={colors.background} />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Community Collaboration
            </Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
              Work together with neighbors, local businesses, and authorities to resolve issues faster.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: colors.warning }]}>
            <Ionicons name="trending-up" size={32} color={colors.background} />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Track Progress
            </Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
              Monitor the status of your reports and see real-time updates on community safety improvements.
            </Text>
          </View>
        </View>
      </View>

      {/* Community Benefits */}
      <View style={[styles.benefitsSection, { backgroundColor: colors.accent }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Supporting Our Community
        </Text>
        
        <View style={styles.benefitsGrid}>
          <View style={styles.benefitItem}>
            <Ionicons name="home" size={24} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Safer Homes
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="business" size={24} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Protected Businesses
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="school" size={24} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Safe Schools
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="walk" size={24} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Secure Streets
            </Text>
          </View>
        </View>
      </View>

      {/* Parent & Children Safety */}
      <View style={styles.parentSafetySection}>
        <View style={[styles.parentSafetyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.parentIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="heart" size={40} color={colors.background} />
          </View>
          
          <View style={styles.parentContent}>
            <Text style={[styles.parentTitle, { color: colors.text }]}>
              Safety for Parents & Children
            </Text>
            <Text style={[styles.parentDescription, { color: colors.textSecondary }]}>
              Create a safer environment for your family. Report playground hazards, school zone issues, 
              and neighborhood concerns that affect children's safety.
            </Text>
            
            <View style={styles.parentFeatures}>
              <View style={styles.parentFeature}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.parentFeatureText, { color: colors.text }]}>
                  School zone safety monitoring
                </Text>
              </View>
              
              <View style={styles.parentFeature}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.parentFeatureText, { color: colors.text }]}>
                  Playground hazard reporting
                </Text>
              </View>
              
              <View style={styles.parentFeature}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.parentFeatureText, { color: colors.text }]}>
                  Neighborhood watch integration
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Business Safety */}
      <View style={styles.businessSafetySection}>
        <View style={[styles.businessSafetyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.businessIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="storefront" size={40} color={colors.background} />
          </View>
          
          <View style={styles.businessContent}>
            <Text style={[styles.businessTitle, { color: colors.text }]}>
              Supporting Local Business Safety
            </Text>
            <Text style={[styles.businessDescription, { color: colors.textSecondary }]}>
              Help local businesses thrive in a safe environment. Report security concerns, 
              maintenance issues, and collaborate with business owners for safer commercial areas.
            </Text>
            
            <View style={styles.businessFeatures}>
              <View style={styles.businessFeature}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.businessFeatureText, { color: colors.text }]}>
                  Security incident reporting
                </Text>
              </View>
              
              <View style={styles.businessFeature}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.businessFeatureText, { color: colors.text }]}>
                  Infrastructure maintenance alerts
                </Text>
              </View>
              
              <View style={styles.businessFeature}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.businessFeatureText, { color: colors.text }]}>
                  Business district safety coordination
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Call to Action */}
      <View style={[styles.ctaSection, { backgroundColor: colors.primary }]}>
        <Text style={[styles.ctaTitle, { color: colors.background }]}>
          Ready to Make a Difference?
        </Text>
        
        <Text style={[styles.ctaDescription, { color: colors.background }]}>
          Join UrbanShield today and help create a safer community for everyone.
        </Text>
        
        <TouchableOpacity 
          style={[styles.getStartedButton, { backgroundColor: colors.background }]}
          onPress={onGetStarted}
        >
          <Text style={[styles.getStartedText, { color: colors.primary }]}>
            Get Started
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.background }]}>10K+</Text>
            <Text style={[styles.statLabel, { color: colors.background }]}>Active Users</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.background }]}>50K+</Text>
            <Text style={[styles.statLabel, { color: colors.background }]}>Issues Resolved</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.background }]}>95%</Text>
            <Text style={[styles.statLabel, { color: colors.background }]}>Satisfaction Rate</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefitsSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 32,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 20,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  parentSafetySection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  parentSafetyCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  parentIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  parentContent: {
    alignItems: 'center',
  },
  parentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  parentDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  parentFeatures: {
    width: '100%',
  },
  parentFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  parentFeatureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  businessSafetySection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  businessSafetyCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  businessIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  businessContent: {
    alignItems: 'center',
  },
  businessTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  businessDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  businessFeatures: {
    width: '100%',
  },
  businessFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessFeatureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 32,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 32,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
});

