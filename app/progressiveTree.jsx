import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Appbar,
  PaperProvider,
  ActivityIndicator,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { getProgress, getWorkoutTree, completeWorkout } from "./lib/api";

const bubbleSize = 110;

export default function ProgressiveTree() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (!email) return;
        const [progressData, workoutData] = await Promise.all([
          getProgress(email),
          getWorkoutTree(),
        ]);
        setProgress(progressData);
        setWorkouts(workoutData);
      } catch (err) {
        console.error("Error loading tree:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isUnlocked = (w) => {
    const lvl = progress?.level ?? 1;
    if (lvl < (w.levelRequired ?? 1)) return false;
    if (!w.prerequisites || !w.prerequisites.length) return true;
    return w.prerequisites.every((r) =>
      progress?.completedWorkouts?.includes(r)
    );
  };

  const getColor = (w) => {
    if (progress?.completedWorkouts?.includes(w.id)) return "#15ff00ff"; // completed
    if (isUnlocked(w)) return "#ffff00ff"; // unlocked
    return "#555"; // locked
  };

  const handleWorkoutPress = async (w) => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      const updated = await completeWorkout(email, w.id);
      setProgress(updated);
      alert(`${w.name} completed!`);
    } catch (err) {
      alert("Error completing workout: " + err.message);
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

  const getWorkout = (name) =>
    workouts.find((w) => w.name.toLowerCase().includes(name.toLowerCase()));

  const warmUp = getWorkout("warm");
  const pushUps = getWorkout("push");
  const squats = getWorkout("squat");
  const planks = getWorkout("plank");
  const burpees = getWorkout("burpee");

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content
            title="Progressive Workout Tree"
            titleStyle={styles.title}
          />
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lvl {progress?.level ?? 1}</Text>
          </View>
        </Appbar.Header>

        <ScrollView contentContainerStyle={styles.treeContainer}>
          {/* Level 1 - Warm Up */}
          {warmUp && (
            <TouchableOpacity
              style={[styles.bubble, { backgroundColor: getColor(warmUp) }]}
              disabled={
                !isUnlocked(warmUp) ||
                progress?.completedWorkouts?.includes(warmUp.id)
              }
              onPress={() => handleWorkoutPress(warmUp)}
            >
              <Text style={styles.bubbleText}>{warmUp.name}</Text>
            </TouchableOpacity>
          )}

          {/* Level 2 - Push-Ups */}
          {pushUps && (
            <View style={styles.singleRow}>
              <TouchableOpacity
                style={[styles.bubble, { backgroundColor: getColor(pushUps) }]}
                disabled={
                  !isUnlocked(pushUps) ||
                  progress?.completedWorkouts?.includes(pushUps.id)
                }
                onPress={() => handleWorkoutPress(pushUps)}
              >
                <Text style={styles.bubbleText}>{pushUps.name}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Level 3 - Squats and Planks */}
          <View style={styles.doubleRow}>
            {squats && (
              <TouchableOpacity
                style={[styles.bubble, { backgroundColor: getColor(squats) }]}
                disabled={
                  !isUnlocked(squats) ||
                  progress?.completedWorkouts?.includes(squats.id)
                }
                onPress={() => handleWorkoutPress(squats)}
              >
                <Text style={styles.bubbleText}>{squats.name}</Text>
              </TouchableOpacity>
            )}
            {planks && (
              <TouchableOpacity
                style={[styles.bubble, { backgroundColor: getColor(planks) }]}
                disabled={
                  !isUnlocked(planks) ||
                  progress?.completedWorkouts?.includes(planks.id)
                }
                onPress={() => handleWorkoutPress(planks)}
              >
                <Text style={styles.bubbleText}>{planks.name}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Level 4 - Burpees */}
          {burpees && (
            <View style={styles.singleRow}>
              <TouchableOpacity
                style={[styles.bubble, { backgroundColor: getColor(burpees) }]}
                disabled={
                  !isUnlocked(burpees) ||
                  progress?.completedWorkouts?.includes(burpees.id)
                }
                onPress={() => handleWorkoutPress(burpees)}
              >
                <Text style={styles.bubbleText}>{burpees.name}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { backgroundColor: "#343434ff" },
  title: { color: "#15ff00ff", fontWeight: "bold", fontSize: 22 },
  levelBadge: {
    backgroundColor: "#15ff00ff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 10,
  },
  levelText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  treeContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  singleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 40,
  },
  doubleRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 40,
  },
  bubble: {
    width: bubbleSize,
    height: bubbleSize,
    borderRadius: bubbleSize / 2,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  bubbleText: {
    color: "#000",
    fontWeight: "700",
    textAlign: "center",
  },
});
