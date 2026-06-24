import Header from '@/app/components/Header';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UseCases() {
  const handleCardPress = (cardTitle: string) => {
    console.log(`${cardTitle} card pressed`);
    // Navigation or action logic here
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Use Cases</Text>
        
        <View style={styles.cardsContainer}>
          <View style={styles.row}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleCardPress('For Schools')}
            >
              <Text style={styles.cardTitle}>For Schools</Text>
              <View style={styles.placeholder}>
                <Ionicons name="school-outline" size={40} color="#999" />
              </View>
              <Text style={styles.cardDescription}>
                Help students prepare for college and job interviews
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleCardPress('For API Integration')}
            >
              <Text style={styles.cardTitle}>For API Integration</Text>
              <View style={styles.placeholder}>
                <Ionicons name="code-slash-outline" size={40} color="#999" />
              </View>
              <Text style={styles.cardDescription}>
                Integrate our interview services into your platform
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.row}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleCardPress('For Colleges')}
            >
              <Text style={styles.cardTitle}>For Colleges</Text>
              <View style={styles.placeholder}>
                <Ionicons name="business-outline" size={40} color="#999" />
              </View>
              <Text style={styles.cardDescription}>
                Prepare graduates for job market success
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleCardPress('For Corporates')}
            >
              <Text style={styles.cardTitle}>For Corporates</Text>
              <View style={styles.placeholder}>
                <Ionicons name="briefcase-outline" size={40} color="#999" />
              </View>
              <Text style={styles.cardDescription}>
                Train employees and improve hiring processes
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleCardPress('For Job Seekers')}
            >
              <Text style={styles.cardTitle}>For Job Seekers</Text>
              <View style={styles.placeholder}>
                <Ionicons name="person-outline" size={40} color="#999" />
              </View>
              <Text style={styles.cardDescription}>
                Practice and improve your interview skills
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleCardPress('For Career Centers')}
            >
              <Text style={styles.cardTitle}>For Career Centers</Text>
              <View style={styles.placeholder}>
                <Ionicons name="navigate-outline" size={40} color="#999" />
              </View>
              <Text style={styles.cardDescription}>
                Offer advanced interview preparation tools
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  cardsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  placeholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  }
});
