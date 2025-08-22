import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions 
} from 'react-native';
import SimpleMobileFaceApp from './src/components/SimpleMobileFaceApp';
import { useLanguage } from './src/hooks/useLanguage';

const { width } = Dimensions.get('window');

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const { language, isRTL, changeLanguage, t, getTextAlign, getFlexDirection } = useLanguage();

  const screens = [
    { id: 'home', name: t('home'), icon: '🏠' },
    { id: 'faceapp', name: t('faceApp'), icon: '🎭' },
    { id: '3d', name: t('modeling3D'), icon: '📐' },
    { id: 'consultation', name: t('consultation'), icon: '🏥' },
  ];

  const renderHomeScreen = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header with Language Toggle */}
      <View style={styles.header}>
        <View style={[styles.languageToggle, { flexDirection: getFlexDirection() }]}>
          <TouchableOpacity
            style={[styles.langButton, language === 'ar' && styles.activeLangButton]}
            onPress={() => changeLanguage('ar')}
          >
            <Text style={[styles.langText, language === 'ar' && styles.activeLangText]}>
              {t('arabic')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langButton, language === 'en' && styles.activeLangButton]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={[styles.langText, language === 'en' && styles.activeLangText]}>
              {t('english')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.title, { textAlign: getTextAlign() }]}>
          🎭 {t('appTitle')}
        </Text>
        <Text style={[styles.subtitle, { textAlign: getTextAlign() }]}>
          {t('appSubtitle')}
        </Text>
        <Text style={[styles.version, { textAlign: getTextAlign() }]}>
          {t('mobileVersion')}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={[styles.statsSection, { flexDirection: getFlexDirection() }]}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>98.3%</Text>
          <Text style={[styles.statLabel, { textAlign: getTextAlign() }]}>
            {t('accuracy')}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>68+</Text>
          <Text style={[styles.statLabel, { textAlign: getTextAlign() }]}>
            {t('landmarks')}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1000+</Text>
          <Text style={[styles.statLabel, { textAlign: getTextAlign() }]}>
            {t('happyUsers')}
          </Text>
        </View>
      </View>

      {/* Main Features */}
      <View style={styles.featuresSection}>
        <Text style={[styles.sectionTitle, { textAlign: getTextAlign() }]}>
          {t('mainFeatures')}
        </Text>
        
        <TouchableOpacity 
          style={[styles.featureCard, { backgroundColor: '#ec4899' }]}
          onPress={() => setActiveScreen('faceapp')}
        >
          <Text style={styles.featureIcon}>💄</Text>
          <Text style={[styles.featureTitle, { textAlign: getTextAlign() }]}>
            {t('faceEditingStudio')}
          </Text>
          <Text style={[styles.featureDescription, { textAlign: getTextAlign() }]}>
            {t('faceEditingDesc')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.featureCard, { backgroundColor: '#3b82f6' }]}
          onPress={() => setActiveScreen('3d')}
        >
          <Text style={styles.featureIcon}>🎭</Text>
          <Text style={[styles.featureTitle, { textAlign: getTextAlign() }]}>
            {t('modeling3DTitle')}
          </Text>
          <Text style={[styles.featureDescription, { textAlign: getTextAlign() }]}>
            {t('modeling3DDesc')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.featureCard, { backgroundColor: '#10b981' }]}
          onPress={() => setActiveScreen('consultation')}
        >
          <Text style={styles.featureIcon}>🏥</Text>
          <Text style={[styles.featureTitle, { textAlign: getTextAlign() }]}>
            {t('medicalConsultation')}
          </Text>
          <Text style={[styles.featureDescription, { textAlign: getTextAlign() }]}>
            {t('medicalConsultationDesc')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Technology Info */}
      <View style={styles.techSection}>
        <Text style={[styles.sectionTitle, { textAlign: getTextAlign() }]}>
          {t('technologies')}
        </Text>
        <View style={styles.techGrid}>
          <View style={styles.techCard}>
            <Text style={styles.techIcon}>🧠</Text>
            <Text style={[styles.techName, { textAlign: getTextAlign() }]}>
              {t('artificialIntelligence')}
            </Text>
          </View>
          <View style={styles.techCard}>
            <Text style={styles.techIcon}>🔒</Text>
            <Text style={[styles.techName, { textAlign: getTextAlign() }]}>
              {t('hipaaEncryption')}
            </Text>
          </View>
          <View style={styles.techCard}>
            <Text style={styles.techIcon}>☁️</Text>
            <Text style={[styles.techName, { textAlign: getTextAlign() }]}>
              {t('cloudComputing')}
            </Text>
          </View>
          <View style={styles.techCard}>
            <Text style={styles.techIcon}>⚡</Text>
            <Text style={[styles.techName, { textAlign: getTextAlign() }]}>
              {t('realtimeProcessing')}
            </Text>
          </View>
        </View>
      </View>

      {/* Server Status */}
      <View style={styles.statusSection}>
        <Text style={[styles.statusTitle, { textAlign: getTextAlign() }]}>
          {t('connectionStatus')}
        </Text>
        <View style={[styles.statusCard, { flexDirection: getFlexDirection() }]}>
          <View style={styles.statusIndicator} />
          <Text style={[styles.statusText, { textAlign: getTextAlign() }]}>
            {t('connectedToServer')}
          </Text>
        </View>
        <Text style={[styles.statusNote, { textAlign: getTextAlign() }]}>
          {t('serverNote')}
        </Text>
      </View>
    </ScrollView>
  );

  const renderConsultationScreen = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonIcon}>🏥</Text>
        <Text style={[styles.comingSoonTitle, { textAlign: getTextAlign() }]}>
          {t('comingSoonTitle')}
        </Text>
        <Text style={[styles.comingSoonText, { textAlign: getTextAlign() }]}>
          {t('comingSoonDesc')}
        </Text>
        <View style={styles.comingSoonFeatures}>
          <Text style={[styles.comingSoonFeature, { textAlign: getTextAlign() }]}>
            {t('encryptedMessages')}
          </Text>
          <Text style={[styles.comingSoonFeature, { textAlign: getTextAlign() }]}>
            {t('videoCallsHD')}
          </Text>
          <Text style={[styles.comingSoonFeature, { textAlign: getTextAlign() }]}>
            {t('secureFileSharing')}
          </Text>
          <Text style={[styles.comingSoonFeature, { textAlign: getTextAlign() }]}>
            {t('autoScheduling')}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setActiveScreen('home')}
        >
          <Text style={styles.backButtonText}>
            {t('backToHome')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderCurrentScreen = () => {
    switch (activeScreen) {
      case 'faceapp':
        return <SimpleMobileFaceApp 
          serverUrl="https://your-app.replit.app" 
          language={language}
          isRTL={isRTL}
          t={t}
          getTextAlign={getTextAlign}
          getFlexDirection={getFlexDirection}
        />;
      case '3d':
        return renderConsultationScreen(); // Same as consultation for now
      case 'consultation':
        return renderConsultationScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#1f2937" />
      
      {renderCurrentScreen()}
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {screens.map((screen) => (
          <TouchableOpacity
            key={screen.id}
            style={[
              styles.navItem,
              activeScreen === screen.id && styles.activeNavItem
            ]}
            onPress={() => setActiveScreen(screen.id)}
          >
            <Text style={[
              styles.navIcon,
              activeScreen === screen.id && styles.activeNavIcon
            ]}>
              {screen.icon}
            </Text>
            <Text style={[
              styles.navText,
              activeScreen === screen.id && styles.activeNavText
            ]}>
              {screen.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#1f2937',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 5,
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 60) / 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  techSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  techCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 55) / 2,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  techIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  techName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  statusSection: {
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  statusNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  comingSoonFeatures: {
    alignItems: 'center',
    marginBottom: 40,
  },
  comingSoonFeature: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeNavIcon: {
    fontSize: 22,
  },
  navText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  languageToggle: {
    alignSelf: 'flex-end',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 5,
  },
  langButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginHorizontal: 2,
  },
  activeLangButton: {
    backgroundColor: '#ffffff',
  },
  langText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  activeLangText: {
    color: '#1f2937',
  },
});
