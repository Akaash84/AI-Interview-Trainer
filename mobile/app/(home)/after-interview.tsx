// Ganesh-131 updated the view results page ui
```tsx
import Header from '@/app/components/Header';
import { useRouter } from 'expo-router';
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AfterInterview() {
  const router = useRouter();

  const handlePress = (action: string) => {
    switch (action) {
      case "Start Interview":
        router.push('/(home)/interview');
        break;
      case "Previous Insights":
        router.push('/(home)/insights');
        break;
      case "Check Recording":
        router.push('/(home)/recording');
        break;
      case "Analyze Resume":
        router.push('/(home)/resume');
        break;
      default:
        console.log(`${action} pressed`);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcome}>🚀 Welcome back, User 👋</Text>
        <Text style={styles.subText}>Your interview journey continues. Let’s make it count! 💯</Text>

        <View style={[styles.card, styles.highlightCard]}>
          <Text style={styles.cardTitle}>⚡ Last Interview Result</Text>
          <Text style={styles.cardText}>
            You scored <Text style={styles.score}>78/100</Text> in your React.js fundamentals interview.{"\n"}
            🌟 Strengths: <Text style={styles.strong}>Component Lifecycle, Hooks</Text>{"\n"}
            🔧 Improvements: <Text style={styles.weak}>State Management, Performance</Text>
          </Text>
        </View>

        <Text style={styles.sectionHeading}>🎯 Quick Actions</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#6a0dad" }]} onPress={() => handlePress("Start Interview")}>
            <Text style={styles.buttonText}>Start Interview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#007AFF" }]} onPress={() => handlePress("Previous Insights")}>
            <Text style={styles.buttonText}>Previous Insights</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#FF9500" }]} onPress={() => handlePress("Check Recording")}>
            <Text style={styles.buttonText}>Check Recording</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#34C759" }]} onPress={() => handlePress("Analyze Resume")}>
            <Text style={styles.buttonText}>Analyze Resume</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeading}>📊 Performance Summary</Text>
        <View style={styles.card}>
          <Text style={styles.summaryItem}>✅ Accuracy Rate: <Text style={styles.highlight}>75%</Text></Text>
          <Text style={styles.summaryItem}>⚠️ Weakest Areas: <Text style={styles.weak}>State Management, Context API</Text></Text>
          <Text style={styles.summaryItem}>📈 Avg. Score: <Text style={styles.highlight}>7.8/10</Text></Text>
        </View>

        <Text style={styles.sectionHeading}>🏅 Badges Earned</Text>
        <View style={styles.card}>
          <Text style={styles.badges}>⭐ ✅ 📘 🏆 🔥</Text>
        </View>

        <Text style={styles.sectionHeading}>🚀 Next Steps</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>• Practice React hooks interview questions</Text>
          <Text style={styles.cardText}>• Review state management patterns</Text>
          <Text style={styles.cardText}>• Schedule a mock interview on Redux</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  scrollContainer: { flex: 1, padding: 16 },
  
  welcome: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 10,
    color: "#333",
  },
  subText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },

  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
    color: "#222",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  highlightCard: {
    borderLeftWidth: 6,
    borderLeftColor: "#6a0dad",
  },

  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#333" },
  cardText: { fontSize: 14, color: "#444", marginBottom: 6, lineHeight: 20 },

  score: { fontWeight: "700", color: "#6a0dad" },
  strong: { fontWeight: "600", color: "#34C759" },
  weak: { fontWeight: "600", color: "#FF3B30" },
  highlight: { fontWeight: "700", color: "#007AFF" },

  summaryItem: { fontSize: 15, marginBottom: 6, color: "#333" },

  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    flexBasis: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  badges: {
    fontSize: 28,
    textAlign: "center",
  },
});
