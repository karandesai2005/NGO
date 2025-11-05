// app/(auth)/signup.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { GradientBackground } from '@/components/GradientBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { User } from '@/types';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Volunteer' | 'Admin' | 'Parent'>('Volunteer');
  const [hasConsent, setHasConsent] = useState(false); // Consent toggle
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (role === 'Parent' && !phone.trim()) {
      Alert.alert('Error', 'Phone number is required for parents');
      return;
    }
    if (role === 'Parent' && !/^\+91[0-9]{10}$/.test(phone)) {
      Alert.alert('Error', 'Phone number must be in format +91xxxxxxxxxx');
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });
      if (error) throw error;
      if (!data.user) throw new Error('No user created');

      const roleLower = role.toLowerCase() as 'admin' | 'volunteer' | 'parent';
      const profileData = {
        id: data.user.id,
        role: roleLower,
        full_name: name,
        ...(role === 'Parent' && { phone, hasconsent: hasConsent }) // Use lowercase hasconsent
      };

      console.log('Saving profile to Supabase:', profileData); // Debug log

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' }); // ← UPSERT + CONFLICT ON ID

      if (profileError) throw new Error(`Profile save failed: ${profileError.message}`);

      const appUser: User = {
        id: data.user.id,
        email: email.toLowerCase(),
        name,
        role,
        createdAt: new Date().toISOString(),
      };
      await login(appUser);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Signup error:', err);
      Alert.alert('Error', err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Logo />
          <Card style={styles.signupCard}>
            <Text style={styles.welcomeText}>Join Akshar Paaul NGO</Text>
            <Text style={styles.subtitleText}>Create your account</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
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
              <Text style={styles.inputLabel}>Email</Text>
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
              <Text style={styles.inputLabel}>Password</Text>
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
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#A0AEC0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {role === 'Parent' && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91xxxxxxxxxx"
                    placeholderTextColor="#A0AEC0"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Allow SMS Notifications</Text>
                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleLabel}>
                      {hasConsent ? 'SMS Consent Given' : 'No SMS Consent'}
                    </Text>
                    <Switch
                      value={hasConsent}
                      onValueChange={setHasConsent}
                      trackColor={{ false: '#E2E8F0', true: '#667EEA' }}
                      thumbColor={hasConsent ? '#FFFFFF' : '# socA0AEC0'}
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.roleLabel}>Select Your Role</Text>
              <View style={styles.roleSelector}>
                {(['Volunteer', 'Admin', 'Parent'] as const).map((roleOption) => (
                  <TouchableOpacity
                    key={roleOption}
                    style={[
                      styles.roleButton,
                      role === roleOption && styles.roleButtonActive
                    ]}
                    onPress={() => setRole(roleOption)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      role === roleOption && styles.roleButtonTextActive
                    ]}>
                      {roleOption}
                    </Text>
                  </TouchableOpacity>
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
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  signupCard: { marginHorizontal: 8 },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#2D3748', textAlign: 'center', marginBottom: 8 },
  subtitleText: { fontSize: 16, color: '#718096', textAlign: 'center', marginBottom: 32 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 16, color: '#2D3748', marginBottom: 8, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#F7FAFC' },
  roleLabel: { fontSize: 16, color: '#2D3748', marginBottom: 12, fontWeight: '600' },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: {
    borderColor: '#667EEA',
    backgroundColor: '#667EEA',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  signupButton: { marginTop: 8, marginBottom: 24 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: '#718096', fontSize: 16 },
  loginLink: { marginLeft: 4 },
  loginLinkText: { color: '#667EEA', fontSize: 16, fontWeight: '600' },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleLabel: { fontSize: 16, color: '#2D3748' },
});