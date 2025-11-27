import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from 'react-native';
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

const workoutMedia = {
  'torsotwists': require('../assets/img/torsotwists.gif'),
  'armcircles': require('../assets/img/arm-circles.gif'),
  'burpees': require('../assets/img/burpees.gif'),
  'highknees': require('../assets/img/high-knees.gif'),
  'jumpingjacks': require('../assets/img/jumping-jacks.gif'),
  'lunges': require('../assets/img/lunges.gif'),
  'mountainclimbers': require('../assets/img/mountain-climbers.gif'),
  'plank': require('../assets/img/plank.gif'),
  'pullups': require('../assets/img/pull-ups.gif'),
  'pushups': require('../assets/img/push-up.gif'),
  'situps': require('../assets/img/sit-ups.gif'),
  'squats': require('../assets/img/squats.gif'),
};

function parseISODateLocal(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
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

  const [timerMinutes, setTimerMinutes] = useState("");
  const [timerSeconds, setTimerSeconds] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);

  const [isTiming, setIsTiming] = useState(false);
  const timerRef = useRef(null);

  async function loadWeek(email, weekStartISO) {
    try {
      const json = await getWeekSchedule(email, weekStartISO);
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

  function getWeekArray() {
    const start = parseISODateLocal(weekStart);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  // ---------------- TIMER LOGIC ----------------
  function toggleTimer() {
    if (timeLeft === 0) return;

    const min = parseInt(timerMinutes) || 0;
    const sec = parseInt(timerSeconds) || 0;

    const total = timeLeft !== null ? timeLeft : min * 60 + sec;
    if (total <= 0) return;

    // START
    if (!isTiming) {
      setTimeLeft(total);
      setIsTiming(true);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setIsTiming(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      return;
    }

    // PAUSE
    setIsTiming(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                      <View
                        style={{
                          marginTop: 8,
                          flexDirection: "row",
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        {items.map((it) => (
                          <TouchableOpacity
                            key={it.workoutId}
                            style={styles.pill}
                            onPress={() => {
                              const wid =
                                it.workoutId ||
                                it.workoutID ||
                                it.workout?.id;

                              const fullWorkout = workouts.find(w => w.id === wid);
                              if (!fullWorkout) return;

                              setSelectedWorkoutForView({
                                ...fullWorkout,
                                date: dateISO,
                              });
                            }}
                          >
                            <Text numberOfLines={1} style={styles.pillText}>
                              {it.workout?.name ?? it.workoutId}
                            </Text>
                          </TouchableOpacity>
                        ))}
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
            <Modal
              visible={!!selectedWorkoutForView}
              onDismiss={() => {
                setSelectedWorkoutForView(null);
                setIsTiming(false);
                setTimeLeft(null);
                setTimerMinutes("");
                setTimerSeconds("");
                if (timerRef.current) clearInterval(timerRef.current);
              }}
              contentContainerStyle={styles.modal}
            >
              {selectedWorkoutForView && (
                <>
                  {workoutMedia[selectedWorkoutForView.id] ? (
                    <Image
                      source={workoutMedia[selectedWorkoutForView.id]}
                      style={{ width: "100%", height: 180, borderRadius: 10, marginBottom: 12 }}
                      resizeMode="contain"
                    />
                  ) : selectedWorkoutForView.gifUrl ? (
                    <Image
                      source={{ uri: selectedWorkoutForView.gifUrl }}
                      style={{ width: "100%", height: 180, borderRadius: 10, marginBottom: 12 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ color: "#888", marginBottom: 12 }}>
                      No preview available
                    </Text>
                  )}

                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "#fff", marginBottom: 12, fontSize: 14 }}>
                      {selectedWorkoutForView.description ||
                        "Follow proper form and use controlled motion."}
                    </Text>
                  </View>

                  {/* ------------ TIMER UI ------------ */}
                  <View style={{ marginBottom: 16, alignItems: "center" }}>
                    <Text style={{ color: "#15ff00ff", fontWeight: "700", marginBottom: 8 }}>
                      Set Workout Timer
                    </Text>

                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="Min"
                        placeholderTextColor="#666"
                        value={timerMinutes}
                        onChangeText={(v) => {
                          setTimerMinutes(v);
                          setIsTiming(false);
                          setTimeLeft(null);
                          if (timerRef.current) clearInterval(timerRef.current);
                        }}
                        style={styles.timerInput}
                      />

                      <TextInput
                        keyboardType="numeric"
                        placeholder="Sec"
                        placeholderTextColor="#666"
                        value={timerSeconds}
                        onChangeText={(v) => {
                          setTimerSeconds(v);
                          setIsTiming(false);
                          setTimeLeft(null);
                          if (timerRef.current) clearInterval(timerRef.current);
                        }}
                        style={styles.timerInput}
                      />
                    </View>

                    {/* DONE (close keyboard) */}
                    <Button
                      mode="text"
                      onPress={Keyboard.dismiss}
                      textColor="#15ff00ff"
                      style={{ marginBottom: 8 }}
                    >
                      Close Keyboard
                    </Button>

                    {/* Start/Pause button */}
                    <Button
                      mode="contained"
                      onPress={toggleTimer}
                      style={{ backgroundColor: "#15ff00ff" }}
                    >
                      {isTiming ? "Pause Timer" : "Start Timer"}
                    </Button>

                    {timeLeft !== null && (
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 22,
                          marginTop: 10,
                          alignSelf: "center",
                        }}
                      >
                        {timeLeft === 0
                          ? "Workout Completed!"
                          : `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
                      </Text>
                    )}
                  </View>

                  <Button
                    mode="contained"
                    style={{ marginBottom: 10 }}
                    onPress={async () => {
                      await handleRemoveFromDate(selectedWorkoutForView.date, selectedWorkoutForView.id);
                      setSelectedWorkoutForView(null);
                    }}
                  >
                    Remove from Day
                  </Button>

                  <Button onPress={() => setSelectedWorkoutForView(null)}>Close</Button>
                </>
              )}
            </Modal>
          </Portal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

//
// Styles
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
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 3,
    minWidth: 45,
  },
  dayLabel: { color: "#aaa", fontSize: 12 },
  dayNum: { color: "#fff", fontWeight: "700" },
  noWorkout: { color: "#666", fontSize: 11, marginTop: 6 },
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

  pill: {
    backgroundColor: "#1f1f1f",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    margin: 2,
    maxWidth: "90%",
  },

  pillText: {
    color: "#15ff00ff",
    fontSize: 10,
    textAlign: "center",
  },

  timerInput: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 8,
    borderRadius: 8,
    width: 70,
    marginRight: 8,
    textAlign: "center",
  },
});
