import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card, } from 'react-native-paper';
import { router } from 'expo-router';

const signIn = () => {

    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //Stuff for the future
    const handleSubmit = () => {
    if (isCreatingAccount) {
      console.log('Creating account with:', email, password);
      // create account logic here
    } else {
      console.log('Signing in with:', email, password);
      // sign in logic here
    }

    router.push('/');
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

                <Button mode = "contained" onPress = {handleSubmit} style = {styles.button}>
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