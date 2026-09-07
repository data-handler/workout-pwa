// Placeholder default routine (push/pull/legs) built from the equipment on hand.
// Replace with your real three workouts any time from the Routines tab —
// once you send them over this file gets swapped for your actual split.
const DEFAULT_ROUTINES = [
  {
    id: 'routine-a',
    name: 'Workout A - Push',
    exercises: [
      { exerciseId: 'bb-bench-press', sets: 3, reps: 8 },
      { exerciseId: 'db-shoulder-press', sets: 3, reps: 10 },
      { exerciseId: 'lm-press', sets: 3, reps: 10 },
      { exerciseId: 'cb-tricep-pushdown', sets: 3, reps: 12 },
      { exerciseId: 'db-lateral-raise', sets: 3, reps: 12 },
      { exerciseId: 'ez-skull-crusher', sets: 3, reps: 10 },
    ],
  },
  {
    id: 'routine-b',
    name: 'Workout B - Pull',
    exercises: [
      { exerciseId: 'bb-bent-over-row', sets: 3, reps: 8 },
      { exerciseId: 'cb-lat-pulldown', sets: 3, reps: 10 },
      { exerciseId: 'cb-seated-row', sets: 3, reps: 10 },
      { exerciseId: 'cb-face-pull', sets: 3, reps: 15 },
      { exerciseId: 'ez-preacher-curl', sets: 3, reps: 10 },
      { exerciseId: 'db-hammer-curl', sets: 3, reps: 10 },
    ],
  },
  {
    id: 'routine-c',
    name: 'Workout C - Legs',
    exercises: [
      { exerciseId: 'bb-back-squat', sets: 3, reps: 8 },
      { exerciseId: 'db-romanian-deadlift', sets: 3, reps: 10 },
      { exerciseId: 'bw-step-up', sets: 3, reps: 10 },
      { exerciseId: 'lm-rdl', sets: 3, reps: 10 },
      { exerciseId: 'bw-calf-raise', sets: 3, reps: 20 },
      { exerciseId: 'lm-rotation', sets: 3, reps: 12 },
    ],
  },
];
