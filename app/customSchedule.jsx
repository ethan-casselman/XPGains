import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Appbar, Text, Button, Card, Portal, Modal, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  getProgress,
  getWorkoutTree,
  getWeekSchedule,
  addToSchedule,
  removeFromSchedule,
} from './lib/api';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';

//
// DATE HELPERS — CORRECT LOCAL, NO UTC DRIFT
//
function parseISODateLocal(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d); // LOCAL midnight
}

function isoDateLocal(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CustomSchedule() {
  const [weekStart, setWeekStart] = useState(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return isoDateLocal(start);
  });

  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [selectedWorkoutForView, setSelectedWorkoutForView] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  async function loadWeek(email, weekStartISO) {
    try {
      const json = await getWeekSchedule(email, weekStartISO);
      console.log("Loaded schedule:", json.items);
      setSchedule(json.items || []);
    } catch (err) {
      console.error("Failed to load schedule:", err);
    }
  }

  useEffect(() => {
    async function boot() {
      const email = await AsyncStorage.getItem("userEmail");
      setUserEmail(email);
      if (!email) return;

      const [p, w] = await Promise.all([getProgress(email), getWorkoutTree()]);
      setProgress(p);
      setWorkouts(w);

      await loadWeek(email, weekStart);
    }
    boot();
  }, []);

  useEffect(() => {
    if (userEmail) loadWeek(userEmail, weekStart);
  }, [weekStart]);

  //
  // Build week based on local date
  //
  function getWeekArray() {
    const start = parseISODateLocal(weekStart);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  //
  // FIXED: READ MONGOOSE SUBDOCS PROPERLY
  //
  function itemsForDate(dateISO) {
    return schedule.filter((s) => {
      const d = s.date ?? s._doc?.date;
      return d === dateISO;
    });
  }

  async function handleAddToDate(dateISO, workoutId) {
    try {
      await addToSchedule(userEmail, dateISO, workoutId);
      await loadWeek(userEmail, weekStart);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoveFromDate(dateISO, workoutId) {
    try {
      await removeFromSchedule(userEmail, dateISO, workoutId);
      await loadWeek(userEmail, weekStart);
    } catch (err) {
      console.error(err);
    }
  }

  const week = getWeekArray();

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Weekly Scheduler" titleStyle={styles.title} />
        <Text style={styles.levelText}>Lvl {progress?.level ?? 1}</Text>
      </Appbar.Header>

      <View style={styles.controls}>
        <Button
          compact
          onPress={() => {
            const newStart = subWeeks(parseISODateLocal(weekStart), 1);
            setWeekStart(isoDateLocal(newStart));
          }}
        >
          Prev
        </Button>

        <Text style={styles.weekLabel}>
          {format(parseISODateLocal(weekStart), "MMM d")} -{" "}
          {format(addDays(parseISODateLocal(weekStart), 6), "MMM d")}
        </Text>

        <Button
          compact
          onPress={() => {
            const newStart = addWeeks(parseISODateLocal(weekStart), 1);
            setWeekStart(isoDateLocal(newStart));
          }}
        >
          Next
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.weekContainer}>
        <View style={styles.weekRow}>
          {week.map((d) => {
            const dateISO = isoDateLocal(d);
            const items = itemsForDate(dateISO);

            return (
              <TouchableOpacity
                key={dateISO}
                style={styles.dayCard}
                onPress={() => {
                  setSelectedDate(dateISO);
                  setDayModalVisible(true);
                }}
              >
                <Text style={styles.dayLabel}>{format(d, "EEE")}</Text>
                <Text style={styles.dayNum}>{format(d, "d")}</Text>

                {items.length === 0 ? (
                  <Text style={styles.noWorkout}>No workouts</Text>
                ) : (
                  <View style={{ marginTop: 8 }}>
                    {items.map((it) => {
                      const workoutId = it.workoutId ?? it._doc?.workoutId;
                      const date = it.date ?? it._doc?.date;

                      return (
                        <Card key={workoutId} style={styles.scheduledCard}>
                          <Card.Content>
                            <Text numberOfLines={1}>
                              {it.workout?.name ?? workoutId}
                            </Text>
                          </Card.Content>
                          <Card.Actions>
                            <Button onPress={() => setSelectedWorkoutForView(it.workout)}>
                              View
                            </Button>
                            <Button
                              onPress={() => handleRemoveFromDate(date, workoutId)}
                            >
                              Remove
                            </Button>
                          </Card.Actions>
                        </Card>
                      );
                    })}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for an Effective Workout Week</Text>
          <List.Section>
            <List.Item title="1. Alternate hard & easy days" description="Follow intense days with lighter sessions." />
            <List.Item title="2. Prioritize compound lifts" description="Place high-skill exercises early in the week." />
            <List.Item title="3. Plan rest intentionally" description="At least one rest day per week." />
            <List.Item title="4. Avoid overtraining" description="Adjust if sore or fatigued." />
            <List.Item title="5. Track & adapt" description="Use completed workouts to plan ahead." />
          </List.Section>
        </View>
      </ScrollView>

      {/* Add workout modal */}
      <Portal>
        <Modal visible={dayModalVisible} onDismiss={() => setDayModalVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={{ marginBottom: 10, fontWeight: "700" }}>
            Add workout to {selectedDate}
          </Text>

          <FlatList
            data={workouts}
            keyExtractor={(w) => w.id}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => {
              const completed = progress?.completedWorkouts?.includes(item.id);

              return (
                <List.Item
                  title={item.name}
                  description={item.description}
                  right={() =>
                    completed ? (
                      <Button mode="contained" onPress={() => handleAddToDate(selectedDate, item.id)}>
                        Add
                      </Button>
                    ) : (
                      <View style={styles.lockContainer}>
                        <MaterialCommunityIcons name="lock" size={22} color="#888" />
                        <Text style={{ color: "#888", marginLeft: 4 }}>Locked</Text>
                      </View>
                    )
                  }
                />
              );
            }}
          />

          <Button onPress={() => setDayModalVisible(false)} style={{ marginTop: 12 }}>
            Close
          </Button>
        </Modal>
      </Portal>

      {/* View workout modal */}
      <Portal>
        <Modal visible={!!selectedWorkoutForView} onDismiss={() => setSelectedWorkoutForView(null)} contentContainerStyle={styles.modal}>
          {selectedWorkoutForView && (
            <>
              <Text style={{ fontWeight: "700", fontSize: 18 }}>
                {selectedWorkoutForView.name}
              </Text>
              <Text style={{ marginTop: 8 }}>{selectedWorkoutForView.description}</Text>

              <Button onPress={() => setSelectedWorkoutForView(null)} style={{ marginTop: 12 }}>
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

//
// Styles (unchanged)
//
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { backgroundColor: "#343434ff" },
  title: { color: "#15ff00ff" },
  levelText: { color: "#15ff00ff", marginRight: 12 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  weekLabel: { color: "#fff", fontWeight: "600" },
  weekContainer: { paddingHorizontal: 12, paddingBottom: 80 },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCard: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 10,
    width: "13%",
    alignItems: "center",
    marginHorizontal: 2,
  },
  dayLabel: { color: "#aaa", fontSize: 12 },
  dayNum: { color: "#fff", fontWeight: "700" },
  noWorkout: { color: "#666", fontSize: 11, marginTop: 6 },
  scheduledCard: { marginVertical: 6, backgroundColor: "#222" },
  tipsContainer: { marginTop: 20, backgroundColor: "#111", borderRadius: 10, padding: 12 },
  tipsTitle: { color: "#15ff00ff", fontWeight: "700", marginBottom: 8 },
  modal: { backgroundColor: "#111", padding: 16, margin: 20, borderRadius: 10 },
  lockContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#222",
  },
});
