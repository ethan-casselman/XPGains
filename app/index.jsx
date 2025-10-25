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
          <Appbar.Action icon="menu" color="#ffffff" onPress={handleMenu}/>
          <Appbar.Content title="XPGains" titleStyle={styles.title}/>
          <Appbar.Action icon="account-circle" color="#ffffff" onPress={handlesSignIn} />
        </Appbar.Header>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.body}>
          <Card style ={styles.signInCard}>
            <Card.Title 
            title="Welcome to XPGains!"
            left={(props) => <Avatar.Icon {...props} icon="account"/>}
            titleStyle={{fontWeight: '700', marginVertical: '5', fontSize: '20'}}
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

          <Card style={styles.featureCard}>
            <Card.Title title="Embark On Your Workout Journey!" 
            titleStyle={{fontWeight: '700', fontSize: '21', justifyContent: 'center',
              marginVertical: '10',
            }}
            />
            <Card.Content>
              <Text style={styles.featureCardSubtitle}>
                Start your workout journey in a fun and interactive way! Follow the path 
                to uncover new workouts to add to your workout sessions.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Title title="Create Your Own Workout Adventure" 
            titleStyle={{fontWeight: '700', fontSize: '19', justifyContent: 'center',
              marginVertical: '10'
            }}
            />
            <Card.Content>
              <Text style={styles.featureCardSubtitle}>
                Use your unlocked workouts to create your own workout programs. 
                Saved presets allow you to plan out your session in advance and track
                your progress.
              </Text>
            </Card.Content>
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
      backgroundColor: '#000000ff',
    },

    scrollArea: {
      flex: 1,
      backgroundColor: '#3b3b3bff', 
    },

    body: {
      padding: 16,
      alignItems: 'center',
      backgroundColor: '#000000', 
    },

    title: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 25,
      color: '#15ff00ff',
    },

    body: {
      padding: 16,
      alignItems: 'center',
    },

    signInCard: {
      width: '95%',
      marginVertical: 12,
    },

    signInSubtitle: {
      marginTop: 4,
      marginBottom: 8,
      flexWrap: 'wrap',
      lineHeight: 20,
      fontSize: 18,
      textAlign: 'center',
    },

    featureCard: {
      width: '95%',
      marginVertical: 15,
    },

    featureCardSubtitle: {
      fontSize: 18,
      textAlign: 'center',
    },

    center: {
      justifyContent: 'center',
    },
    
});