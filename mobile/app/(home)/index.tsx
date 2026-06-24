import Header from '@/app/components/Header'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Link } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomePage() {
  const { user } = useUser()
  const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress.split('@')[0] || 'there';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Header />
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hello, {firstName}! 👋</Text>
          <Text style={styles.welcomeText}>Ready to Ace Your Next Interview?</Text>
          <Text style={styles.subtitle}>
            Practice with AI mock interviews, get personalized feedback, and improve your performance.
            Track your progress.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Link href="/(home)/resume" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <View style={[styles.iconContainer, { backgroundColor: '#e6f0ff' }]}>
                  <Ionicons name="document-text-outline" size={24} color="#4285F4" />
                </View>
                <Text style={styles.actionText}>Resume Analyzer</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(home)/interview" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <View style={[styles.iconContainer, { backgroundColor: '#e6f5ed' }]}>
                  <Ionicons name="mic-outline" size={24} color="#0F9D58" />
                </View>
                <Text style={styles.actionText}>Interview Practice</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(home)/after-interview" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <View style={[styles.iconContainer, { backgroundColor: '#faeae8' }]}>
                  <Ionicons name="stats-chart-outline" size={24} color="#DB4437" />
                </View>
                <Text style={styles.actionText}>View Results</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Key Benefits */}
        <Text style={styles.sectionTitle}>Key Benefits</Text>
        <View style={styles.cardsContainer}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.card}>
              <Ionicons name="person-outline" size={24} color="#4285F4" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Ultimate Mock Interview Practice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card}>
              <Ionicons name="time-outline" size={24} color="#4285F4" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Time-Specific Interview Scenarios</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.card}>
              <Ionicons name="chatbubble-outline" size={24} color="#4285F4" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Receive Tailored Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card}>
              <Ionicons name="code-slash-outline" size={24} color="#4285F4" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Domain-Specific Questions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How It Works */}
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          <Text style={styles.step}>1️⃣ Upload your resume or job description</Text>
          <Text style={styles.step}>2️⃣ Choose your interview mode</Text>
          <Text style={styles.step}>3️⃣ Practice & get feedback instantly</Text>
          <Text style={styles.step}>4️⃣ Sharpen skills with personalized tips</Text>
        </View>

        {/* Demo Section */}
        <TouchableOpacity style={styles.demoButton}>
          <Ionicons name="play" size={18} color="white" />
          <Text style={styles.demoButtonText}>Watch Demo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  backgroundColor: '#ffffff'
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
    color: '#333',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  cardsContainer: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  stepsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  step: {
    fontSize: 14,
    marginVertical: 8,
    color: '#333',
  },
  demoButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  demoButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
