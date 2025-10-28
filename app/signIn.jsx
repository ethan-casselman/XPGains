import { StyleSheet, View } from 'react-native'
import React from 'react'
import React, {useState} from 'react';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import {router} from 'expo-router'

const signIn = () => {

    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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