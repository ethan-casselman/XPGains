import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Appbar, PaperProvider, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getProgress, getWorkoutTree, completeWorkout } from './lib/api';

export default function ProgressiveTree() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [workouts, setWorkouts] = useState([]);

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
  // If no prerequisites, it’s always unlocked
  if (!workout.prerequisites || workout.prerequisites.length === 0) return true;

  // Otherwise, check if all prerequisites are completed
  return workout.prerequisites.every((req) =>
    progress?.completedWorkouts?.includes(req)
  );
};

const getBubbleColor = (workout) => {
  if (progress?.completedWorkouts?.includes(workout.id)) return '#15ff00ff'; // completed
  if (isUnlocked(workout)) return '#ffff00ff'; // unlocked by prereqs
  return '#555'; // locked
};


  const handleWorkoutPress = async (workout) => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const updated = await completeWorkout(email, workout.id);
      setProgress(updated);
      alert(`${workout.name} completed!`);
    } catch (err) {
      alert('Error completing workout: ' + err.message);
    }
  };

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

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Progressive Workout Tree" titleStyle={styles.title} />
        </Appbar.Header>

        <ScrollView
          contentContainerStyle={styles.treeContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* User Level Display */}
          <Text style={styles.levelText}>
            Level: {progress?.level ?? 1}
          </Text>

          {workouts.length === 0 ? (
            <Text style={{ color: '#fff', marginTop: 40 }}>No workouts found in database.</Text>
          ) : (
            workouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={[styles.bubble, { backgroundColor: getBubbleColor(workout) }]}
                disabled={
                !isUnlocked(workout) ||
                progress?.completedWorkouts?.includes(workout.id)
                }
                onPress={() => handleWorkoutPress(workout)}>
                <Text style={styles.bubbleText}>{workout.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#343434ff',
  },
  title: {
    color: '#15ff00ff',
    fontWeight: 'bold',
    fontSize: 22,
  },
  treeContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 80,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: '#15ff00ff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  bubble: {
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 50,
    marginVertical: 12,
    width: 220,
    alignItems: 'center',
  },
  bubbleText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
