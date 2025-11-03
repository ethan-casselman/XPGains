import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Appbar, ActivityIndicator, PaperProvider } from 'react-native-paper';
import Svg, { Line } from 'react-native-svg';
import { router } from 'expo-router';
import { getProgress, completeWorkout } from './lib/api';

export default function ProgressiveTree() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Mock workouts
        const mockWorkouts = [
          { id: 'warmup1', name: 'Warm-Up 1', levelRequired: 1, prerequisites: [] },
          { id: 'pushups', name: 'Push-Ups', levelRequired: 1, prerequisites: ['warmup1'] },
          { id: 'squats', name: 'Squats', levelRequired: 2, prerequisites: ['pushups'] },
          { id: 'plank', name: 'Plank', levelRequired: 2, prerequisites: ['pushups'] },
          { id: 'burpees', name: 'Burpees', levelRequired: 3, prerequisites: ['squats', 'plank'] },
        ];
        setWorkouts(mockWorkouts);

        // Temporary mock progress
        const mockProgress = {
          level: 2,
          completedWorkouts: ['warmup1', 'pushups'],
        };
        setProgress(mockProgress);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <PaperProvider>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Loading your workout tree...</Text>
        </View>
      </PaperProvider>
    );
  }

  const getBubbleColor = (workout) => {
    if (progress.completedWorkouts.includes(workout.id)) return '#15ff00ff'; // completed = green
    if (workout.levelRequired <= progress.level) return '#ffff00ff'; // unlocked = yellow
    return '#555'; // locked = grey
  };

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
      {workouts.map((workout) => (
        <TouchableOpacity
          key={workout.id}
          style={[styles.bubble, { backgroundColor: getBubbleColor(workout) }]}
          disabled={workout.levelRequired > progress.level}
          onPress={() => alert(`${workout.name} tapped!`)}
        >
          <Text style={styles.bubbleText}>{workout.name}</Text>
        </TouchableOpacity>
      ))}
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
    paddingTop: 10,
    paddingBottom: 80,
    backgroundColor: '#000',
  },
  bubble: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },
  bubbleText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});


