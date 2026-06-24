import Header from "@/app/components/Header";
import { useUser } from "@clerk/clerk-expo";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import userApi from "../../server/services/userApi";

export default function Profile() {
  const { user } = useUser();
  const [linkedIn, setLinkedIn] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [firstName, setFirstName] = useState<string>(user?.firstName ?? "");
  const [lastName, setLastName] = useState<string>(user?.lastName ?? "");
  const [education, setEducation] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<string>("");
  const [resumeUri, setResumeUri] = useState<string>("");
  const [resumeName, setResumeName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const userName =
    user?.firstName ||
    user?.emailAddresses[0].emailAddress.split("@")[0] ||
    "User";

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      // Load existing profile data
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingProfile(true);
      const result = await userApi.getUserByClerkId(user.id);
      
      if (result.success && result.user) {
        const userData = result.user;
        setFirstName(userData.firstName ?? user.firstName ?? "");
        setLastName(userData.lastName ?? user.lastName ?? "");
        setCurrentRole(userData.currentRole ?? "");
        setEducation(userData.education ?? "");
        setLinkedIn(userData.linkedinUrl ?? "");
        setJobDesc(userData.jobDescription ?? "");
        setResumeUri(userData.resume ?? "");
        if (userData.resume) {
          // Extract filename from URI or use a default name
          const filename = userData.resume.split('/').pop() || 'resume.pdf';
          setResumeName(filename);
        }
        console.log("Profile loaded successfully:", userData);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleResumeUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size && file.size > maxSize) {
          Alert.alert("File too large", "Please select a PDF file smaller than 10MB");
          return;
        }

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setResumeUri(`data:application/pdf;base64,${base64}`);
        setResumeName(file.name);
        Alert.alert("Success", "Resume uploaded successfully! Remember to save your profile.");
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to upload resume. Please try again.");
    }
  };

  const handleSubmit = () => {
    if (loading) return; // Prevent multiple submissions
    
    const payload = {
      firstName,
      lastName,
      email: user?.emailAddresses?.[0]?.emailAddress ?? "",
      currentRole,
      education,
      linkedIn,
      jobDesc,
      resumeUri,
      updatedAt: new Date().toISOString(),
    };

    saveProfile(payload);
  };

  const saveProfile = async (payload: Record<string, any>) => {
    try {
      if (!user?.id) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      setLoading(true);
      const updateData = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        currentRole: payload.currentRole,
        education: payload.education,
        linkedinUrl: payload.linkedIn,
        jobDescription: payload.jobDesc,
        resume: payload.resumeUri || null,
      };

      const result = await userApi.updateUser(user.id, updateData);
      console.log("Update result:", result);

      if (!result.success) {
        Alert.alert("Error", "Failed to save profile: " + result.message);
        return;
      }

      Alert.alert("Success", "Profile saved successfully ✅");
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Network error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      {loadingProfile ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {/* Welcome Title */}
          <Text style={styles.welcome}>Welcome {userName}</Text>
          <Text style={styles.subTitle}>Edit Your Profile</Text>

          {/* Resume Upload */}
          <Text style={styles.label}>Upload your Resume (PDF, max 10kB)</Text>
          <TouchableOpacity style={styles.dropZone} onPress={handleResumeUpload}>
            <Image
              source={{
                uri: resumeUri 
                  ? "https://cdn-icons-png.flaticon.com/512/337/337946.png" 
                  : "https://cdn-icons-png.flaticon.com/512/2838/2838912.png",
              }}
              style={styles.icon}
            />
            <Text style={styles.dropText}>
              {resumeName ? `📄 ${resumeName}` : "Tap to upload PDF"}
            </Text>
            {resumeUri && (
              <Text style={styles.uploadedText}>✅ Resume uploaded</Text>
            )}
          </TouchableOpacity>

        {/* First & Last Name */}
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Email (read-only) */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#f5f5f5" }]}
          value={user?.emailAddresses?.[0]?.emailAddress ?? ""}
          editable={false}
        />

        {/* Current Role */}
        <Text style={styles.label}>Current Role</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Software Engineer"
          value={currentRole}
          onChangeText={setCurrentRole}
        />

        {/* Education */}
        <Text style={styles.label}>Education</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. B.Tech, Computer Science"
          value={education}
          onChangeText={setEducation}
        />

        {/* LinkedIn Input */}
        <Text style={styles.label}>Enter your LinkedIn URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://linkedin.com/in/username"
          value={linkedIn}
          onChangeText={setLinkedIn}
        />

        {/* Job Description Input */}
        <Text style={styles.label}>Enter Job Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Paste job description here..."
          value={jobDesc}
          onChangeText={setJobDesc}
          multiline
        />

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              {resumeUri || firstName || currentRole ? "Update Profile" : "Save Profile"}
            </Text>
          )}
        </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 12,
  },
  dropZone: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#999",
    borderRadius: 8,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 6,
  },
  dropText: {
    color: "#333",
    fontSize: 14,
    textAlign: "center",
  },
  uploadedText: {
    color: "#4CAF50",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  submitBtnDisabled: {
    backgroundColor: "#ccc",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});