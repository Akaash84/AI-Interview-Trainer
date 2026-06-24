import Header from '@/app/components/Header';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';

export default function InterviewAnalyzer() {
  const { width } = Dimensions.get('window');
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Interview Analyzer</Text>
          <View style={styles.chartsSection}>
            <View style={styles.chartContainer}>
              <View style={styles.chartShadow}>
                <View style={styles.circleChart}>
                  <Text style={styles.chartValue}>75%</Text>
                </View>
              </View>
              <Text style={styles.chartLabel}>Topics Covered</Text>
            </View>
            <View style={styles.chartContainer}>
              <View style={styles.chartShadow}>
                <View style={styles.barChart}>
                  <Text style={styles.chartValue}>8/10</Text>
                </View>
              </View>
              <Text style={styles.chartLabel}>Topic-wise Analysis</Text>
            </View>
            <View style={styles.chartContainer}>
              <View style={styles.chartShadow}>
                <View style={styles.lineChart}>
                  <Text style={styles.chartValue}>+15%</Text>
                </View>
              </View>
              <Text style={styles.chartLabel}>Progress</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brief Summary</Text>
            <View style={styles.summaryBox}>
              <Text style={styles.boxContent}>
                Overall your interview performance was good. You demonstrated strong technical knowledge and problem-solving skills. Some improvement needed in communication clarity and specific domain knowledge.
              </Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pros & Cons</Text>
            <View style={styles.prosConsBox}>
              <View style={styles.prosSection}>
                <Text style={styles.prosTitle}>Pros:</Text>
                <Text style={styles.prosCons}>• Strong technical knowledge</Text>
                <Text style={styles.prosCons}>• Good problem-solving approach</Text>
                <Text style={styles.prosCons}>• Well-prepared examples</Text>
              </View>
              <View style={styles.consSection}>
                <Text style={styles.consTitle}>Cons:</Text>
                <Text style={styles.prosCons}>• Could improve speaking clarity</Text>
                <Text style={styles.prosCons}>• Took too long on simple questions</Text>
                <Text style={styles.prosCons}>• Missing specific domain knowledge</Text>
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            <View style={styles.suggestionsBox}>
              <Text style={styles.suggestion}>1. Practice speaking more concisely</Text>
              <Text style={styles.suggestion}>2. Review fundamentals in [specific topic]</Text>
              <Text style={styles.suggestion}>3. Prepare more STAR method examples</Text>
              <Text style={styles.suggestion}>4. Work on time management during responses</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: '#1e3c72'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  content: {
    width: width > 500 ? 480 : '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    letterSpacing: 1,
    textShadowColor: '#2a5298',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  chartsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    shadowColor: '#2a5298',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chartContainer: {
    width: '32%',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 40,
    backgroundColor: 'transparent',
  },
  circleChart: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#ff512f', // orange shade
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe5db',
  },
  barChart: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: '#0F9D58',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f5ed',
    borderRadius: 16,
  },
  lineChart: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: '#ff512f', // orange shade
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe5db',
    borderRadius: 16,
  },
  chartValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff512f', // orange shade
  },
  chartLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    color: '#ff512f', // orange shade
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#ff512f', // orange shade
    letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  summaryBox: {
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    shadowColor: '#2a5298',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  boxContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1e3c72',
    fontWeight: '500',
  },
  prosConsBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    shadowColor: '#2a5298',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  prosSection: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#ddd',
    paddingRight: 10,
  },
  consSection: {
    flex: 1,
    paddingLeft: 10,
  },
  prosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F9D58',
    marginBottom: 8,
  },
  consTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DB4437',
    marginBottom: 8,
  },
  prosCons: {
    fontSize: 14,
    marginBottom: 5,
    color: '#1e3c72',
    fontWeight: '500',
  },
  suggestionsBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#2a5298',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestion: {
    fontSize: 14,
    marginBottom: 8,
    color: '#000',
    fontWeight: '700',
  },
});
