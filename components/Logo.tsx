import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Logo: React.FC = () => {
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>Akshar Paaul</Text>
      <Text style={styles.logoSubtext}>NGO Management</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    fontWeight: '500',
  },
});