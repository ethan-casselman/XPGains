import { StyleSheet, ScrollView, View, Image } from 'react-native'
import React from 'react'
import { useState } from 'react';
import {Provider as PaperProvider, Button, Appbar, Card, Text, Dialog, Modal, Portal} from 'react-native-paper';
import xpGains from '../assets/img/XPGains_mascot.png';
import {router} from 'expo-router';

export default function Home() {

    const [menuVisible, setMenuVisible] = useState(false);
    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const [dialogVisible, setDialogVisible] = useState(false);
    const openSignOutDialog = () => setDialogVisible(true);
    const closeSignOutDialog = () => setDialogVisible(false);

    const handleSignOut = () => {
    closeSignOutDialog();
    router.replace('/'); 
};

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
            <Appbar.Action icon="menu" color="#ffffff" onPress={openMenu}/>
            <Appbar.Content title="XPGains" titleStyle={styles.title}/>
            <Appbar.Action icon="account-circle" color="#ffffff" onPress={openSignOutDialog} />
        </Appbar.Header>

        <Portal>
            <Modal visible={menuVisible} onDismiss={closeMenu} contentContainerStyle={styles.menuContainer}>
                <Text style={styles.menuTitle}>Menu</Text>
        
            <Button textColor = "#000000ff" mode="text" onPress={() => { closeMenu(); router.push('/home'); }}>
                Home
            </Button>
        
            <Button textColor="#000000ff" mode="text" onPress={() => { closeMenu(); openSignOutDialog(); }}>
                Sign Out
            </Button>

            <Button textColor = "#000000ff" mode="text" onPress={closeMenu}>
            Close Menu
            </Button>
            </Modal>
        </Portal>

        <Portal>
            <Dialog visible={dialogVisible} onDismiss={closeSignOutDialog}>
                <Dialog.Title>Sign Out</Dialog.Title>
                <Dialog.Content>
                    <Text>Are you sure you want to sign out?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                <Button onPress={closeSignOutDialog}>Cancel</Button>
                <Button onPress={handleSignOut}>Sign Out</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>


        <View style={styles.body}>
          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Progressive Workout Tree</Text>
              <Text style={styles.cardSubtitle}>
                Follow your fitness progression and unlock new workouts as you level up.
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/progressiveTree')}
                style={styles.button}
              >
                Open Workout Tree
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Custom Workout Scheduler</Text>
              <Text style={styles.cardSubtitle}>
                Create, customize, and track your personalized workout plans.
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/customSchedule')}
                style={styles.button}
              >
                Open Scheduler
              </Button>
            </Card.Content>
          </Card>

          <Image source={xpGains} style={styles.mascot} resizeMode="contain" />
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { backgroundColor: '#343434ff' },
  title: { color: '#15ff00ff', fontWeight: 'bold', fontSize: 22, textAlign: 'center' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  featureCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
  },
  cardTitle: { fontWeight: '700', fontSize: 20, textAlign: 'center', marginBottom: 8, color: '#000' },
  cardSubtitle: { fontSize: 16, textAlign: 'center', marginBottom: 12, color: '#000' },
  button: { alignSelf: 'center' },
  mascot: { width: '100%', height: 200, marginTop: 20 },

  menuContainer: {
      backgroundColor: '#fff',
      padding: 20,
      width: '70%',
      alignSelf: 'center',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    menuTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 10,
      textAlign: 'center',
      color: '#000000ff',
    },
});
