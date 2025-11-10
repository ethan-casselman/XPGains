import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Appbar, PaperProvider, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Svg, { Line } from 'react-native-svg';
import { getProgress, getWorkoutTree, completeWorkout } from './lib/api';

const screenWidth = Dimensions.get('window').width;
const bubbleSize = 120;

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
    const userLevel = progress?.level ?? 1;
    if (userLevel < (workout.levelRequired ?? 1)) return false;
    if (!workout.prerequisites || workout.prerequisites.length === 0) return true;
    return workout.prerequisites.every((req) =>
      progress?.completedWorkouts?.includes(req)
    );
  };

  const getBubbleColor = (workout) => {
    if (progress?.completedWorkouts?.includes(workout.id)) return '#15ff00ff'; // completed
    if (isUnlocked(workout)) return '#ffff00ff'; // unlocked
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
          <Text>Loading your workout tree...</Text>
        </View>
      </PaperProvider>
    );
  }

  // Group workouts by levelRequired
  const levels = {};
  workouts.forEach((w) => {
    if (!levels[w.levelRequired]) levels[w.levelRequired] = [];
    levels[w.levelRequired].push(w);
  });

  const levelKeys = Object.keys(levels).sort((a, b) => a - b);

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Progressive Workout Tree" titleStyle={styles.title} />
        </Appbar.Header>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.outerScroll}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.innerScroll}
          >
            <Text style={styles.levelText}>Level: {progress?.level ?? 1}</Text>

            {levelKeys.map((level) => (
              <View key={level} style={styles.levelRow}>
                {levels[level].map((workout, idx) => (
                  <View key={workout.id} style={styles.nodeContainer}>
                    {/* Connector lines */}
                    {workout.prerequisites?.map((reqId) => {
                      const parent = workouts.find((w) => w.id === reqId);
                      if (!parent) return null;
                      return (
                        <Svg
                          key={`${workout.id}-${reqId}`}
                          height="80"
                          width={screenWidth}
                          style={styles.lineSvg}
                        >
                          <Line
                            x1={bubbleSize / 2}
                            y1={0}
                            x2={bubbleSize / 2 + (idx * 80 - 40)}
                            y2={80}
                            stroke="#15ff00ff"
                            strokeWidth="3"
                          />
                        </Svg>
                      );
                    })}

                    {/* Bubble */}
                    <TouchableOpacity
                      style={[
                        styles.bubble,
                        { backgroundColor: getBubbleColor(workout) },
                      ]}
                      disabled={
                        !isUnlocked(workout) ||
                        progress?.completedWorkouts?.includes(workout.id)
                      }
                      onPress={() => handleWorkoutPress(workout)}
                    >
                      <Text style={styles.bubbleText}>{workout.name}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { backgroundColor: '#343434ff' },
  title: { color: '#15ff00ff', fontWeight: 'bold', fontSize: 22 },
  levelText: {
    color: '#15ff00ff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  outerScroll: {
    padding: 20,
  },
  innerScroll: {
    alignItems: 'center',
    paddingBottom: 120,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
  },
  nodeContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  bubble: {
    width: bubbleSize,
    height: bubbleSize,
    borderRadius: bubbleSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: { color: '#000', fontWeight: '700', textAlign: 'center' },
  lineSvg: {
    position: 'absolute',
    top: -60,
    left: 0,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
