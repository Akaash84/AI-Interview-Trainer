
//comment done by vinay kumar to raise pr

import { useAuth, useClerk, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const insets = useSafeAreaInsets();

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    if (profileDropdownVisible) setProfileDropdownVisible(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownVisible(!profileDropdownVisible);
    if (menuVisible) setMenuVisible(false);
  };

  const navigateTo = (screen: string) => {
    setMenuVisible(false);

    switch (screen) {
      case "home":
        router.push("/(home)");
        break;
      case "about":
        router.push("/(home)/about");
        break;
      case "resume":
        router.push("/(home)/resume");
        break;
      case "interview":
        router.push("/(home)/interview");
        break;
      case "usecases":
        router.push("/(home)/usecases");
        break;
      case "Profile":
        router.push("/(home)/profile");
        break;
      case "SignIn":
        router.push("/(auth)/sign-in");
        break;
      case "SignUp":
        router.push("/(auth)/sign-up");
        break;
      case "AfterInterview":
        router.push("/(home)/after-interview");
        break;
      default:
        router.push("/(home)");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Let Clerk handle navigation automatically
      setProfileDropdownVisible(false);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const getInitials = () => {
    if (!user) return "?";

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    } else if (user.firstName) {
      return user.firstName[0];
    } else {
      const email = user.emailAddresses[0]?.emailAddress || "";
      return email.charAt(0).toUpperCase();
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Interview Trainer</Text>

        <View style={styles.rightContainer}>
          {isSignedIn ? (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={toggleProfileDropdown}
            >
              <View style={styles.profileIcon}>
                <Text style={styles.profileInitials}>{getInitials()}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigateTo("SignIn")}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Main Menu Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={[styles.menuContainer, { top: insets.top + 60 }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo("home")}
              >
                <Ionicons
                  name="home-outline"
                  size={20}
                  color="#333"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo("resume")}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#333"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Resume Analyzer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo("about")}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#333"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo("usecases")}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color="#333"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Use Cases</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo("interview")}
              >
                <Ionicons
                  name="mic-outline"
                  size={20}
                  color="#333"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Interview Analyzer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigateTo("AfterInterview")}
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={20}
                  color="#333"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Interview Results</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Profile Dropdown Modal */}
        {isSignedIn && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={profileDropdownVisible}
            onRequestClose={() => setProfileDropdownVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setProfileDropdownVisible(false)}
            >
              <View style={[styles.profileDropdown, { top: insets.top + 60 }]}>
                <View style={styles.profileHeader}>
                  <View style={styles.profileIconLarge}>
                    <Text style={styles.profileInitialsLarge}>
                      {getInitials()}
                    </Text>
                  </View>
                  <Text style={styles.profileName}>
                    {user?.fullName || user?.emailAddresses[0]?.emailAddress}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.profileMenuItem}
                  onPress={() => {
                    setProfileDropdownVisible(false);
                    navigateTo("Profile");
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#333"
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuText}>My Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.profileMenuItem, styles.signOutMenuItem]}
                  onPress={handleSignOut}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color="#e53935"
                    style={styles.menuIcon}
                  />
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 8,
    // Add a subtle border for separation
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff512f',
    letterSpacing: 1,
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    marginRight: 16,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff512f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ff512f',
    borderRadius: 4,
  },
  signInText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuContainer: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 220,
    borderWidth: 1,
    borderColor: '#ff512f',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#1e3c72',
    fontWeight: '600',
  },
  profileDropdown: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 220,
    borderWidth: 1,
    borderColor: '#ff512f',
  },
  profileHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 16,
    alignItems: "center",
  },
  profileIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff512f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileInitialsLarge: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1e3c72',
  },
  profileMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  signOutMenuItem: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#ff512f',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Header;
