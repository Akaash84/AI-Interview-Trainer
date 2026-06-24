import Header from '@/app/components/Header';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const About = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>About Us</Text>
          <Text style={styles.paragraph}>
            Welcome to <Text style={styles.highlight}>Interview Trainer</Text> – your AI-powered career coach.
          </Text>
          <Text style={styles.heading}>🎯 Our Mission</Text>
          <Text style={styles.paragraph}>
            We help job seekers build confidence, sharpen communication, and succeed in interviews through personalized practice and feedback.
          </Text>
          <Text style={styles.heading}>📌 What We Offer</Text>
          <View style={styles.listGroup}>
            <Text style={styles.list}>• AI-driven mock interviews</Text>
            <Text style={styles.list}>• Real-time performance feedback</Text>
            <Text style={styles.list}>• HR & technical question bank</Text>
            <Text style={styles.list}>• Progress tracking dashboard</Text>
            <Text style={styles.list}>• Career tips and resume guidance</Text>
          </View>
          <Text style={styles.heading}>🚀 Our Vision</Text>
          <Text style={styles.paragraph}>
            We aim to make interview preparation accessible, interactive, and effective for everyone.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(home)/contact')}
            accessibilityRole="button"
            accessibilityLabel="Go to contact page"
          >
            <Text style={styles.buttonText}>📩 Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default About;

// Updated styles with softer tones and modern aesthetic
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#555',
  },
  paragraph: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  listGroup: {
    marginLeft: 15,
    marginBottom: 8,
  },
  list: {
    fontSize: 15,
    color: '#555',
    marginBottom: 6,
  },
  highlight: {
    fontWeight: '700',
    color: '#007aff',
  },
  button: {
    marginTop: 25,
    backgroundColor: '#007aff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#007aff',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
