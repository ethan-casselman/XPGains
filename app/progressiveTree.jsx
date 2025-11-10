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

  const getWorkoutById = (id) => workouts.find((w) => w.id === id);

  const renderBubble = (w) => (
    <TouchableOpacity
      key={w.id}
      style={[styles.bubble, { backgroundColor: getColor(w) }]}
      disabled={
        !isUnlocked(w) || progress?.completedWorkouts?.includes(w.id)
      }
      onPress={() => handleWorkoutPress(w)}
    >
      <Text style={styles.bubbleText}>{w.name}</Text>
    </TouchableOpacity>
  );

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

  return (
    <PaperProvider>
      <View style={styles.container}>
        {/* Appbar with Level Display */}
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
          {/* Level 1 – Warm-Ups */}
          <View style={styles.multiRow}>
            {getWorkoutById("dynamicstretch") && renderBubble(getWorkoutById("dynamicstretch"))}
            {getWorkoutById("armcircles") && renderBubble(getWorkoutById("armcircles"))}
            {getWorkoutById("highknees") && renderBubble(getWorkoutById("highknees"))}
          </View>

          {/* Level 2 – Push-Ups */}
          <View style={styles.singleRow}>
            {getWorkoutById("pushups") && renderBubble(getWorkoutById("pushups"))}
          </View>

          {/* Level 3 – Squats and Planks */}
          <View style={styles.doubleRow}>
            {getWorkoutById("squats") && renderBubble(getWorkoutById("squats"))}
            {getWorkoutById("planks") && renderBubble(getWorkoutById("planks"))}
          </View>

          {/* Level 4 – Conditioning */}
          <View style={styles.multiRow}>
            {getWorkoutById("lunges") && renderBubble(getWorkoutById("lunges"))}
            {getWorkoutById("jumpingjacks") && renderBubble(getWorkoutById("jumpingjacks"))}
            {getWorkoutById("situps") && renderBubble(getWorkoutById("situps"))}
            {getWorkoutById("mountainclimbers") && renderBubble(getWorkoutById("mountainclimbers"))}
          </View>

          {/* Level 5 – Challenge */}
          <View style={styles.doubleRow}>
            {getWorkoutById("burpees") && renderBubble(getWorkoutById("burpees"))}
            {getWorkoutById("pullups") && renderBubble(getWorkoutById("pullups"))}
          </View>
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
  multiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    flexWrap: "wrap",
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
