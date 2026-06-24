import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';

const Contact = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmailLaunch = () => {
    const subject = encodeURIComponent('Interview Trainer Inquiry');
    const body = encodeURIComponent(`Hi,\n\nI would like to know more about...\n\nThanks,\n${name || ''}`);
    const mailto = `mailto:support@interviewtrainer.ai?subject=${subject}&body=${body}`;
    Linking.openURL(mailto).catch(() => Alert.alert('Error', 'Cannot open email client.'));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !msg.trim()) {
      Alert.alert('Missing info', 'Please fill all fields.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    try {
      setSubmitting(true);
      await new Promise(res => setTimeout(res, 900));
      Alert.alert('Sent', 'Your message has been submitted.');
      setName('');
      setEmail('');
      setMsg('');
    } catch {
      Alert.alert('Error', 'Could not send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.paragraph}>
            Have questions or feedback? Reach out and we will get back to you.
          </Text>

          <Text style={styles.sectionHeading}>Direct Support</Text>
          <TouchableOpacity
            onPress={handleEmailLaunch}
            style={styles.linkPill}
            accessibilityRole="button"
            accessibilityLabel="Send support email"
          >
            <Text style={styles.linkText}>support@interviewtrainer.ai</Text>
          </TouchableOpacity>

          <Text style={styles.sectionHeading}>Message Form</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#b0bcc7"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            accessibilityLabel="Name input"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#b0bcc7"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Email input"
            returnKeyType="next"
          />
            <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Message"
            placeholderTextColor="#b0bcc7"
            value={msg}
            onChangeText={setMsg}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            accessibilityLabel="Message input"
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Submit contact form"
          >
            <Text style={styles.buttonText}>
              {submitting ? 'Sending...' : 'Send Message'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.secondaryText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Contact;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#1e3c72',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 15.5,
    color: '#cfd9df',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
    marginBottom: 10,
  },
  linkPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff512f33',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 30,
    marginBottom: 24,
  },
  linkText: {
    color: '#ff8261',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  textArea: {
    minHeight: 130,
  },
  button: {
    marginTop: 6,
    backgroundColor: '#ff512f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#dd2476',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16.5,
    fontWeight: '600',
  },
  secondaryBtn: {
    marginTop: 18,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryText: {
    color: '#cfd9df',
    fontSize: 14.5,
  },
});