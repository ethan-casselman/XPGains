import { StyleSheet, ScrollView, View, Image } from 'react-native'
import React from 'react'
import {Provider as PaperProvider, Button, Appbar, Card, Text, Avatar} from 'react-native-paper';
import pushup from '../assets/img/pushup.gif';
import {router} from 'expo-router';

const Home = () => {
  const handleMenu = () => alert('Menu Pressed');
  const handlesSignIn = () => alert('Sign In Pressed');
  return (
    <PaperProvider>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.Action icon="menu" color="#ffffff" onPress={handleMenu}/>
          <Appbar.Content title="XPGains" titleStyle={styles.title}/>
          <Appbar.Action icon="account-circle" color="#ffffff" onPress={() => router.push('/signIn')} />
        </Appbar.Header>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.body}>
          <Card style ={styles.signInCard}>
            <Card.Title 
            title="Welcome to XPGains!"
            left={(props) => <Avatar.Icon {...props} icon="account"/>}
            titleStyle={{fontWeight: '700', marginVertical: '10', fontSize: '20', color: "#000000ff",}}
            />
            <Card.Content>
              <Text style={styles.signInSubtitle}>
              Track your progress and level up your fitness journey by signing in or creating
              your account.
              </Text>
            </Card.Content>
            <Card.Actions style={styles.center}>
              <Button mode="contained" onPress={() => router.push('/signIn')}
              >
                Sign In / Create Account
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Content style={styles.centeredCardContent}>
              <Text style={styles.featureCardTitle}>
              Embark On Your Workout Journey!
              </Text>
            <Text style={styles.featureCardSubtitle}>
            Start your workout journey in a fun and interactive way! Follow the path 
            to uncover new workouts to add to your workout sessions.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Content style={styles.centeredCardContent}>
              <Text style={styles.featureCardTitle}>
              Create Your Own Workout Adventure!
              </Text>
            <Text style={styles.featureCardSubtitle}>
            Use your unlocked workouts to create your own workout programs. Saved presets 
            allow you to plan out your session in advance and track your progress.
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Content style={styles.centeredCardContent}>
              <Text style={styles.featureCardTitle}>
              Level Up Your Gains!
              </Text>
              <Image
                source={pushup}
                style={styles.gif}
                resizeMode="contain"
              />
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
      backgroundColor: '#343434ff',
    },

    scrollArea: {
      flex: 1,
      backgroundColor: '#000000ff', 
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

    signInCard: {
      width: '95%',
      backgroundColor: '#ffffffff',
      marginVertical: 12,
    },

    signInSubtitle: {
      marginTop: 4,
      marginBottom: 8,
      flexWrap: 'wrap',
      lineHeight: 20,
      fontSize: 18,
      textAlign: 'center',
      color: '#000000ff',
    },

    featureCard: {
      width: '95%',
      marginVertical: 10,
      borderRadius: 12,
      backgroundColor: '#ffffffff',
      overflow: 'hidden',
      paddingVertical: 10,
    },

    centeredCardContent: {
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
    },

    featureCardTitle: {
      fontWeight: '700',
      fontSize: 21,
      color: '#000000ff',
      textAlign: 'center',
      marginBottom: 10,
    },

    featureCardSubtitle: {
      fontSize: 16,
      color: '#000000ff',
      textAlign: 'center',
      lineHeight: 20,
    },

    gif: {
      width: '100%',
      height: 180,
      borderRadius: 10,
    },

    center: {
      justifyContent: 'center',
    },
    
});