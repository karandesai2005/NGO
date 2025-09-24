import React, { useState } from 'react';
// 1. Imports updated: KeyboardAvoidingView and ScrollView are removed
import { View, Text, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// 2. Import the new component
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers } from '@/utils/storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const users = await getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (user) {
        await login(user);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* 3. Replaced KeyboardAvoidingView and ScrollView with KeyboardAwareScrollView */}
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          resetScrollToCoords={{ x: 0, y: 0 }}
          scrollEnabled={true}
        >
          <Logo />
          
          <Card style={styles.loginCard}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to your account</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <Button
              title={isLoading ? "Signing In..." : "Login"}
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
            />
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" style={styles.signupLink}>
                <Text style={styles.signupLinkText}>Sign Up</Text>
              </Link>
            </View>
          </Card>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Demo Credentials:</Text>
            <Text style={styles.demoText}>Admin: admin@akshar.org / admin123</Text>
            <Text style={styles.demoText}>Volunteer: volunteer@akshar.org / volunteer123</Text>
            <Text style={styles.demoText}>Parent: parent@akshar.org / parent123</Text>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loginCard: {
    marginHorizontal: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F7FAFC',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#718096',
    fontSize: 16,
  },
  signupLink: {
    marginLeft: 4,
  },
  signupLinkText: {
    color: '#667EEA',
    fontSize: 16,
    fontWeight: '600',
  },
  demoCredentials: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 4,
    textAlign: 'center',
  },
});