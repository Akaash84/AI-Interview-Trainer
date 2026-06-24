import Header from '@/app/components/Header';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResumeAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const roles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'DevOps Engineer'];
  
  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Resume Analyzer</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload your Resume</Text>
          <TouchableOpacity 
            style={styles.fileButton}
            onPress={() => setSelectedFile('resume.pdf')}
          >
            <Text style={styles.buttonText}>
              {selectedFile ? selectedFile : 'Select File'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select your Desired Role</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text>{selectedRole || 'Select'}</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>
          
          {isDropdownOpen && (
            <View style={styles.dropdownOptions}>
              {roles.map((role, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedRole(role);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Job Description</Text>
          <TextInput
            style={styles.textArea}
            multiline={true}
            numberOfLines={5}
            placeholder="Paste job description here..."
            value={jobDescription}
            onChangeText={setJobDescription}
          />
        </View>

        <TouchableOpacity style={styles.analyzeButton}>
          <Text style={styles.analyzeButtonText}>Analyze Resume</Text>
        </TouchableOpacity>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis</Text>
          <View style={styles.analysisBox}>
            <Text style={styles.placeholderText}>Resume analysis will appear here...</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          <View style={styles.suggestionBox}>
            <Text style={styles.placeholderText}>Suggestions will appear here...</Text>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '500',
  },
  fileButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownOptions: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  textArea: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    height: 150,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    height: 150,
    justifyContent: 'center',
  },
  suggestionBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    height: 150,
    justifyContent: 'center',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#999',
  },
});
