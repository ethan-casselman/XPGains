import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Appbar, PaperProvider, ActivityIndicator, Modal, Portal, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getProgress, getWorkoutTree, completeWorkout } from './lib/api';

export default function ProgressiveTree() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [workouts, setWorkouts] = useState([]);

  // Modal state
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [timer, setTimer] = useState(30);
  const [isTiming, setIsTiming] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (!email) return;

        const [progressData, workoutData] = await Promise.all([
          getProgress(email),
          getWorkoutTree(),
        ]);

        setProgress(progressData);
        setWorkouts(workoutData);
      } catch (err) {
        console.error('Error loading tree:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isUnlocked = (workout) => {
    if (!workout.prerequisites || workout.prerequisites.length === 0) return true;
    return workout.prerequisites.every((req) =>
      progress?.completedWorkouts?.includes(req)
    );
  };

  const getBubbleColor = (workout) => {
    if (progress?.completedWorkouts?.includes(workout.id)) return '#15ff00ff'; // green
    if (isUnlocked(workout)) return '#ffff00ff'; // yellow
    return '#555'; // locked
  };

  const handleWorkoutPress = (workout) => {
    setSelectedWorkout(workout);
    setTimer(30);
    setIsTiming(false);
  };

  const handleCompleteWorkout = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const updated = await completeWorkout(email, selectedWorkout.id);
      setProgress(updated);
      setSelectedWorkout(null);
    } catch (err) {
      alert('Error completing workout: ' + err.message);
    }
  };

  // Countdown timer logic
  useEffect(() => {
    let interval;
    if (isTiming && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    if (timer === 0 && isTiming) setIsTiming(false);
    return () => clearInterval(interval);
  }, [isTiming, timer]);

  if (loading) {
    return (
      <PaperProvider>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>Loading your workout tree...</Text>
        </View>
      </PaperProvider>
    );
  }

  const renderBubble = (workout) => (
    <TouchableOpacity
      key={workout.id}
      style={[styles.bubble, { backgroundColor: getBubbleColor(workout) }]}
      disabled={!isUnlocked(workout)}
      onPress={() => handleWorkoutPress(workout)}
    >
      <Text style={styles.bubbleText}>{workout.name}</Text>
    </TouchableOpacity>
  );

  const getWorkoutById = (id) => workouts.find((w) => w.id === id);

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Progressive Workout Tree" titleStyle={styles.title} />
          <Text style={styles.levelText}>Lvl {progress?.level ?? 1}</Text>
        </Appbar.Header>

        {/* Scrollable tree layout (unchanged) */}
        <ScrollView contentContainerStyle={styles.treeContainer}>
          {/* Level 1 */}
          <View style={styles.multiRow}>
            {getWorkoutById('dynamicstretch') && renderBubble(getWorkoutById('dynamicstretch'))}
            {getWorkoutById('armcircles') && renderBubble(getWorkoutById('armcircles'))}
            {getWorkoutById('highknees') && renderBubble(getWorkoutById('highknees'))}
          </View>

          {/* Level 2 */}
          <View style={styles.singleRow}>
            {getWorkoutById('pushups') && renderBubble(getWorkoutById('pushups'))}
          </View>

          {/* Level 3 */}
          <View style={styles.multiRow}>
            {getWorkoutById('squats') && renderBubble(getWorkoutById('squats'))}
            {getWorkoutById('plank') && renderBubble(getWorkoutById('plank'))}
          </View>

          {/* Level 4 – reordered layout */}
          <View style={styles.multiRow}>
            {getWorkoutById('jumpingjacks') && renderBubble(getWorkoutById('jumpingjacks'))}
            {getWorkoutById('situps') && renderBubble(getWorkoutById('situps'))}
            {getWorkoutById('mountainclimbers') && renderBubble(getWorkoutById('mountainclimbers'))}
            {getWorkoutById('lunges') && renderBubble(getWorkoutById('lunges'))}
          </View>

          {/* Level 5 */}
          <View style={styles.multiRow}>
            {getWorkoutById('burpees') && renderBubble(getWorkoutById('burpees'))}
            {getWorkoutById('pullups') && renderBubble(getWorkoutById('pullups'))}
          </View>
        </ScrollView>

        {/* Workout Modal */}
        <Portal>
          <Modal
            visible={!!selectedWorkout}
            onDismiss={() => setSelectedWorkout(null)}
            contentContainerStyle={styles.modalContainer}
          >
            {selectedWorkout && (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
                <Image
                  source={{
                    uri:
                      selectedWorkout.gifUrl ||
                      'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif',
                  }}
                  style={styles.workoutGif}
                />
                <Text style={styles.modalText}>
                  {selectedWorkout.description ||
                    'Follow proper form and breathing. Focus on smooth, controlled motion.'}
                </Text>

                <Text style={styles.timerText}>
                  {timer > 0 ? `Time Left: ${timer}s` : 'Time Complete!'}
                </Text>

                {!isTiming && timer > 0 && (
                  <Button
                    mode="contained"
                    onPress={() => setIsTiming(true)}
                    style={styles.startButton}
                  >
                    Start Timer
                  </Button>
                )}

                <Button
                  mode="contained"
                  onPress={handleCompleteWorkout}
                  disabled={timer > 0}
                  style={[
                    styles.completeButton,
                    { opacity: timer > 0 ? 0.5 : 1 },
                  ]}
                >
                  Mark as Complete
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => setSelectedWorkout(null)}
                  style={styles.exitButton}
                >
                  Exit
                </Button>
              </View>
            )}
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { backgroundColor: '#343434ff', alignItems: 'center' },
  title: { color: '#15ff00ff', fontWeight: 'bold', fontSize: 20 },
  levelText: { color: '#15ff00ff', marginRight: 15, fontWeight: '600' },

  treeContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 80,
  },

  multiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    flexWrap: 'wrap', // ✅ allow wrapping on small screens
  },
  singleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },

  bubble: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginHorizontal: 6,
    marginVertical: 6,
    minWidth: 120,
    maxWidth: 160, // ✅ responsive sizing
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },

  modalContainer: {
    backgroundColor: '#111',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    color: '#15ff00ff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  workoutGif: {
    width: 250,
    height: 180,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 15,
  },
  timerText: {
    color: '#15ff00ff',
    fontSize: 18,
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#15ff00ff',
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#008000',
    marginBottom: 10,
  },
  exitButton: {
    borderColor: '#aaa',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

