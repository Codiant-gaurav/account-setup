import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getStyles(insets), [insets]);
  return (
    <View style={styles.container}>
      <Text>LoginScreen</Text>
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
    },
  });

export default LoginScreen;
