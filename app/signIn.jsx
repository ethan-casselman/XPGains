import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card, PaperProvider, Appbar } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';  // added for saving email
import { login, register } from './lib/api'; 

const SignIn = () => {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isCreatingAccount) {
        // Create new account
        await register({ email, password });
      } else {
        // Log in existing user
        await login({ email, password });
      }

      // Save the email locally for future API calls
      await AsyncStorage.setItem('userEmail', email);

      // Navigate to home on success
      router.replace('/home');
    } catch (e) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>
              {isCreatingAccount ? 'Create Your Account' : 'Welcome Back!'}
            </Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />

            {!!error && <Text style={{ color: 'red', marginTop: 4 }}>{error}</Text>}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              {isCreatingAccount ? 'Create Account' : 'Sign In'}
            </Button>

            <Button
              onPress={() => setIsCreatingAccount(!isCreatingAccount)}
              style={styles.switchButton}
            >
              {isCreatingAccount
                ? 'Already have an account? Sign In!'
                : 'Need an account? Create One!'}
            </Button>

            <Button onPress={() => router.back()} style={styles.backButton}>
              Back Home
            </Button>
          </Card.Content>
        </Card>
      </View>
    </PaperProvider>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#343434ff',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 16,
    color: '#000000ff',
  },
  input: {
    marginVertical: 6,
  },
  button: {
    marginTop: 10,
  },
  switchButton: {
    marginTop: 12,
  },
  backButton: {
    marginTop: 8,
  },
});
