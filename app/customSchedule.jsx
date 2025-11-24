import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Appbar, Text, Button, Card, Portal, Modal, Avatar, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getWorkoutTree, getProgress } from './lib/api'; 
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';

// helper to format YYYY-MM-DD
const isoDate = (d) => d.toISOString().slice(0, 10);

export default function CustomSchedule() {
  const [weekStart, setWeekStart] = useState(() => {
    // default to Monday of current week
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return isoDate(start);
  });

  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState(null);
  const [schedule, setSchedule] = useState([]); // items for the week
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [selectedWorkoutForView, setSelectedWorkoutForView] = useState(null);

  useEffect(() => {
    async function boot() {
      const email = await AsyncStorage.getItem('userEmail');
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

  async function loadWeek(email, weekStartISO) {
    try {
      const res = await fetch(`http://YOUR_SERVER_HOST/api/schedule/${encodeURIComponent(email)}?weekStart=${weekStartISO}`);
      const json = await res.json();
      setSchedule(json.items || []);
    } catch (err) {
      console.error('Failed to load schedule', err);
    }
  }

  function getWeekArray() {
    const start = new Date(weekStart + 'T00:00:00Z');
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      arr.push(d);
    }
    return arr;
  }

  function itemsForDate(dateISO) {
    return schedule.filter((s) => s.date === dateISO);
  }

  async function handleAddToDate(dateISO, workoutId) {
    try {
      const body = { email: userEmail, date: dateISO, workoutId };
      await fetch('http://YOUR_SERVER_HOST/api/schedule/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await loadWeek(userEmail, weekStart);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoveFromDate(dateISO, workoutId) {
    try {
      const body = { email: userEmail, date: dateISO, workoutId };
      await fetch('http://YOUR_SERVER_HOST/api/schedule/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
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
        <Button compact onPress={() => setWeekStart(isoDate(subWeeks(new Date(weekStart + 'T00:00:00Z'), 1)))}>Prev</Button>
        <Text style={styles.weekLabel}>{format(new Date(weekStart + 'T00:00:00Z'), 'MMM d')} - {format(addDays(new Date(weekStart + 'T00:00:00Z'), 6), 'MMM d')}</Text>
        <Button compact onPress={() => setWeekStart(isoDate(addWeeks(new Date(weekStart + 'T00:00:00Z'), 1)))}>Next</Button>
      </View>

      <ScrollView contentContainerStyle={styles.weekContainer}>
        <View style={styles.weekRow}>
          {week.map((d) => {
            const dateISO = isoDate(d);
            const items = itemsForDate(dateISO);
            return (
              <TouchableOpacity
                key={dateISO}
                style={styles.dayCard}
                onPress={() => { setSelectedDate(dateISO); setDayModalVisible(true); }}
              >
                <Text style={styles.dayLabel}>{format(d, 'EEE')}</Text>
                <Text style={styles.dayNum}>{format(d, 'd')}</Text>

                {items.length === 0 ? (
                  <Text style={styles.noWorkout}>No workouts</Text>
                ) : (
                  <View style={{ marginTop: 8 }}>
                    {items.map((it) => (
                      <Card key={it.workoutId} style={styles.scheduledCard}>
                        <Card.Content>
                          <Text numberOfLines={1}>{it.workout?.name ?? it.workoutId}</Text>
                        </Card.Content>
                        <Card.Actions>
                          <Button onPress={() => setSelectedWorkoutForView(it.workout)}>View</Button>
                          <Button onPress={() => handleRemoveFromDate(dateISO, it.workoutId)}>Remove</Button>
                        </Card.Actions>
                      </Card>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tips list */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for structuring an effective workout week</Text>
          <List.Section>
            <List.Item title="1. Alternate hard & easy days" description="After a challenging lower-body day, follow with an upper-body or active recovery day." />
            <List.Item title="2. Prioritize compound movements" description="Place compound or skill-based workouts earlier in the week when you're fresh." />
            <List.Item title="3. Rest is part of the plan" description="Include at least one rest or active recovery day each week." />
            <List.Item title="4. Volume & intensity cycles" description="Adjust repetitions / time per week to avoid overtraining." />
            <List.Item title="5. Track and adapt" description="Use your completed workouts to change next week’s plan." />
          </List.Section>
        </View>
      </ScrollView>

      {/* Day Modal: add workouts */}
      <Portal>
        <Modal visible={dayModalVisible} onDismiss={() => setDayModalVisible(false)} contentContainerStyle={styles.modal}>
          <Text style={{ marginBottom: 10, fontWeight: '700' }}>Add workout to {selectedDate}</Text>

          <FlatList
            data={workouts}
            keyExtractor={(w) => w.id}
            renderItem={({ item }) => {
              const unlocked = !item.prerequisites || item.prerequisites.length === 0 ||
                item.prerequisites.every((r) => progress?.completedWorkouts?.includes(r));
              return (
                <List.Item
                  title={item.name}
                  description={item.description || `Level ${item.levelRequired}`}
                  right={() => (
                    <Button mode="contained" onPress={() => handleAddToDate(selectedDate, item.id)} disabled={!unlocked}>
                      Add
                    </Button>
                  )}
                />
              );
            }}
            style={{ maxHeight: 300 }}
          />

          <Button onPress={() => setDayModalVisible(false)} style={{ marginTop: 12 }}>Close</Button>
        </Modal>
      </Portal>

      {/* Workout view modal */}
      <Portal>
        <Modal visible={!!selectedWorkoutForView} onDismiss={() => setSelectedWorkoutForView(null)} contentContainerStyle={styles.modal}>
          {selectedWorkoutForView && (
            <>
              <Text style={{ fontWeight: '700', fontSize: 18 }}>{selectedWorkoutForView.name}</Text>
              <Text style={{ marginTop: 8 }}>{selectedWorkoutForView.description}</Text>
              <Button onPress={() => setSelectedWorkoutForView(null)} style={{ marginTop: 12 }}>Close</Button>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { backgroundColor: '#343434ff' },
  title: { color: '#15ff00ff' },
  levelText: { color: '#15ff00ff', marginRight: 12 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  weekLabel: { color: '#fff', fontWeight: '600' },
  weekContainer: { paddingHorizontal: 12, paddingBottom: 80 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCard: { backgroundColor: '#111', padding: 10, borderRadius: 10, width: '13%', alignItems: 'center', marginHorizontal: 2 },
  dayLabel: { color: '#aaa', fontSize: 12 },
  dayNum: { color: '#fff', fontWeight: '700' },
  noWorkout: { color: '#666', fontSize: 11, marginTop: 6 },
  scheduledCard: { marginVertical: 6, backgroundColor: '#222' },
  tipsContainer: { marginTop: 20, backgroundColor: '#111', borderRadius: 10, padding: 12 },
  tipsTitle: { color: '#15ff00ff', fontWeight: '700', marginBottom: 8 },
  modal: { backgroundColor: '#111', padding: 16, margin: 20, borderRadius: 10 },
});
