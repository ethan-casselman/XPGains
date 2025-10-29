import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card, PaperProvider, Appbar } from 'react-native-paper';
import { router } from 'expo-router';
// Import the API helpers we wrote in app/lib/api.js.
// login: calls POST /api/login with { email, password } and returns JSON.
// register: calls POST /api/register with { email, password } and returns JSON.
import { login, register } from './lib/api';


const signIn = () => {

    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    //Stuff for the future
    // handleSubmit runs when the user taps the main button.
    // It clears any old error, shows a loading spinner, then calls the right API
    // based on whether we're creating an account or logging in.
    const handleSubmit = async () => {
      setError(''); // Remove any previous error message before we start.
      setLoading(true); // Show the loading state and disable the button.
      try {
        if (isCreatingAccount) {
          // When creating an account, call our register API helper.
          // This sends a POST to /api/register with the form values.
          await register({ email, password });
        } else {
          // Otherwise, call the login API helper to verify credentials.
          await login({ email, password });
        }
        router.replace('/'); // On success, navigate back to the home screen.
      } catch (e) {
        setError(e?.message || 'Something went wrong'); // Show a friendly error if the request fails.
      } finally {
        setLoading(false); // Always stop the loading spinner when we're done.
      }
    };
  
  return(
    <View style={styles.container}>
        <Card style={styles.card}>
            <Card.Content>
                <Text style={styles.title}>
                    {isCreatingAccount ? 'Create Your Account' : 'Welcome Back!'}
                </Text>

                <TextInput
                    label = "Email"
                    value = {email}
                    onChangeText = {setEmail}
                    autoCapitalize = 'none'
                    keyboardType = 'email-address'
                    style = {styles.input}
                />

                <TextInput
                    label = "Password"
                    value = {password}
                    onChangeText = {setPassword}
                    secureTextEntry
                    style = {styles.input}
                />

                {!!error && <Text style={{ color: 'red', marginTop: 4 }}>{error}</Text>}

                <Button mode = "contained" onPress = {handleSubmit} style = {styles.button} loading={loading} disabled={loading}>
                    {isCreatingAccount ? 'Create Account' : 'Sign In'}
                </Button>

                <Button
                    onPress={() => setIsCreatingAccount(!isCreatingAccount)}
                    style = {styles.switchButton}
                >
                    {isCreatingAccount ? 'Already have an Account? Sign In!' : "Need an account? Create One!"}
                </Button>

                <Button onPress={() => router.back()} style = {styles.backButton}>
                Back Home
                </Button>
            </Card.Content>
        </Card>
    </View>
  );
}

export default signIn

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
})
/*
How to expand this screen next:
1) Validate inputs before sending (e.g., ensure a valid email, min password length).
2) Persist auth state (e.g., save a token) and show the user's email on the home screen.
3) Improve error UI: map server codes (400/401/409) to clear, specific messages.
4) Add a "Show password" toggle and prevent multiple submissions with debouncing.
5) Extract the form into a reusable component if you add more auth screens later.
*/