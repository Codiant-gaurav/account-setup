import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearUserData } from '../../slices/AuthenticationSlice';
import { clearUserDataFromKeychain, clearSession } from '../../services/keychainService';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const userData = useAppSelector(state => state.authentication.userData);
  const styles = useMemo(() => getStyles(insets), [insets]);

  const handleLogout = async () => {
    try {
      // Clear Redux state
      dispatch(clearUserData());

      // Clear session
      await clearSession();

      // Clear keychain data (optional - you may want to keep credentials)
      await clearUserDataFromKeychain();

      // Navigate to Login screen
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome</Text>

        {userData ? (
          <View style={styles.userInfoContainer}>
            <Text style={styles.sectionTitle}>User Information</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{userData.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>First Name:</Text>
              <Text style={styles.value}>{userData.firstName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Last Name:</Text>
              <Text style={styles.value}>{userData.lastName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone Number:</Text>
              <Text style={styles.value}>{userData.phoneNumber}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No user data available</Text>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      backgroundColor: '#ffffff',
    },
    scrollContent: {
      flexGrow: 1,
    },
    contentContainer: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: '#000000',
      marginBottom: 32,
      textAlign: 'center',
    },
    userInfoContainer: {
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      padding: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#000000',
      marginBottom: 20,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#666666',
      marginRight: 8,
      minWidth: 120,
    },
    value: {
      fontSize: 16,
      color: '#000000',
      flex: 1,
    },
    noDataText: {
      fontSize: 16,
      color: '#666666',
      textAlign: 'center',
      marginTop: 40,
    },
    logoutButton: {
      backgroundColor: '#ff3b30',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 24,
    },
    logoutButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default HomeScreen;
