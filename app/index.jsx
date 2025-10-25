import { StyleSheet, ScrollView, View, } from 'react-native'
import React from 'react'
import {Provider as PaperProvider, Button, Appbar, Card, Text, Avatar} from 'react-native-paper';

const Home = () => {
  const handleMenu = () => alert('Menu Pressed');
  const handlesSignIn = () => alert('Sign In Pressed');
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.Action icon="menu" onPress={handleMenu}/>
          <Appbar.Content title="XPGains" titleStyle={styles.title}/>
          <Appbar.Action icon="account-circle" onPress={handlesSignIn} />
        </Appbar.Header>

        <ScrollView contentContainerStyle={styles.body}>
          <Card style ={styles.signInCard}>
            <Card.Title 
            title="Welcome to XPGains!"
            left={(props) => <Avatar.Icon {...props} icon="account"/>}
            titleStyle={{fontWeight: '700'}}
            />
            <Card.Content>
              <Text style={styles.signInSubtitle}>
              Track your progress and level up your fitness journey by signing in or creating
              your account.
              </Text>
            </Card.Content>
            <Card.Actions style={styles.center}>
              <Button mode="contained" onPress={handlesSignIn}
              >
                Sign In / Create Account
              </Button>
            </Card.Actions>
          </Card>
        
        </ScrollView>
    </View>
    </PaperProvider>
  );
};

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
      backgroundColor: '#1e1e1e',
    },
    title: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 20,
      color: '#ffffff',
    },
    body: {
      padding: 16,
      alignItems: 'center',
    },
    signInCard: {
      width: '95%',
      marginVertical: 12,
    },
    featureCard: {
      width: '95%',
      marginVertical: 10,
    },
    center: {
      justifyContent: 'center',
    },
    signInSubtitle: {
    marginTop: 4,
    marginBottom: 8,
    flexWrap: 'wrap',
    lineHeight: 20,
},
    
});