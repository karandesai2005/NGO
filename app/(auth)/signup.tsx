import React, { useState } from 'react';
// 1. Imports updated
import { View, Text, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// 2. Import KeyboardAwareScrollView
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, addUser } from '@/utils/storage';
import { User } from '@/types';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Volunteer' | 'Admin' | 'Parent'>('Volunteer');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    setIsLoading(true);
    try {
      const users = await getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        Alert.alert('Error', 'User with this email already exists');
        setIsLoading(false); // Make sure to stop loading on validation error
        return;
      }
      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        password,
        name,
        role,
        createdAt: new Date().toISOString(),
      };
      await addUser(newUser);
      await login(newUser);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Signup failed. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* 3. Replaced the nested components with KeyboardAwareScrollView */}
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          resetScrollToCoords={{ x: 0, y: 0 }}
          scrollEnabled={true}
        >
          <Logo />
          
          <Card style={styles.signupCard}>
            <Text style={styles.welcomeText}>Join Akshar</Text>
            <Text style={styles.subtitleText}>Create your account</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#A0AEC0"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
            
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
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#A0AEC0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.roleLabel}>Role</Text>
              <View style={styles.roleSelector}>
                {(['Volunteer', 'Admin', 'Parent'] as const).map((roleOption) => (
                  <Button
                    key={roleOption}
                    title={roleOption}
                    onPress={() => setRole(roleOption)}
                    variant={role === roleOption ? 'primary' : 'secondary'}
                    style={styles.roleButton}
                  />
                ))}
              </View>
            </View>
            
            <Button
              title={isLoading ? "Creating Account..." : "Sign Up"}
              onPress={handleSignup}
              disabled={isLoading}
              style={styles.signupButton}
            />
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" style={styles.loginLink}>
                <Text style={styles.loginLinkText}>Login</Text>
              </Link>
            </View>
          </Card>
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
  signupCard: {
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
  roleLabel: {
    fontSize: 16,
    color: '#2D3748',
    marginBottom: 8,
    fontWeight: '600',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#718096',
    fontSize: 16,
  },
  loginLink: {
    marginLeft: 4,
  },
  loginLinkText: {
    color: '#667EEA',
    fontSize: 16,
    fontWeight: '600',
  },
});