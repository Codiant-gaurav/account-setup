import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../redux/hooks';
import { setUserData } from '../../slices/AuthenticationSlice';
import {
  getSession,
  getCredentialByEmail,
} from '../../services/keychainService';
import { Logo } from '../../assets/images';

const SplashScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const styles = getStyles(insets);

  const checkAuthenticationStatus = useCallback(async () => {
    try {
      // Check if active session exists
      const session = await getSession();

      if (session) {
        // Session exists - get user data from credentials
        const credential = await getCredentialByEmail(session.email);

        if (credential) {
          // Prepare user data for Redux (excluding password)
          const userData = {
            email: credential.email,
            firstName: credential.firstName,
            lastName: credential.lastName,
            phoneNumber: credential.phoneNumber,
          };

          // Populate Redux and navigate to Home
          dispatch(setUserData(userData));
          navigation.navigate('Home' as never);
        } else {
          // Session exists but credential not found - clear session and navigate to Login
          navigation.navigate('Login' as never);
        }
      } else {
        // No active session - navigate to Login
        navigation.navigate('Login' as never);
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      // On error, navigate to Login screen
      navigation.navigate('Login' as never);
    }
  }, [dispatch, navigation]);

  useEffect(() => {
    checkAuthenticationStatus();
  }, [checkAuthenticationStatus]);

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={Logo} />
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
    </View>
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: '#000000',
      marginBottom: 40,
    },
    image: { width: 250, height: 'auto', aspectRatio: 792 / 350 },
    loader: {
      marginTop: 20,
    },
  });

export default SplashScreen;
