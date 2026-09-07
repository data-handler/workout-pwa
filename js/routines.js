// Default routine: your "Custom Home Gym Hypertrophy Plan" (3 workouts).
// The 2-Set Rule: set 1 lands ~1-2 reps shy of failure, set 2 goes to
// failure. Every rep gets a controlled ~3-second descent. Reps below are set
// to the low end of the plan's rep range as a starting target — the "How did
// this feel?" rating after each exercise nudges it (weight or reps) for next
// time, so it'll drift toward wherever it should sit.
const PLAN_NOTE = '2-Set Rule: set 1 ~1-2 reps shy of failure, set 2 to failure. 3-second controlled descent on every rep.';

const DEFAULT_ROUTINES = [
  {
    id: 'routine-a',
    name: 'Workout 1: Upper Body Focus',
    note: PLAN_NOTE,
    exercises: [
      { exerciseId: 'db-incline-press', sets: 2, reps: 8, note: '8-12 reps. Bench at ~30° incline — focus on the chest stretch.' },
      { exerciseId: 'cb-lat-pulldown', sets: 2, reps: 10, note: '10-12 reps, 45-55kg. Torso upright, drive elbows straight down.' },
      { exerciseId: 'lm-row', sets: 2, reps: 8, note: '8-10 reps, 30kg plate. Flat back, row to the hip.' },
      { exerciseId: 'db-lateral-raise', sets: 2, reps: 12, note: '12-15 reps, 5kg DBs. 3-second descent, no torso swing.' },
      { exerciseId: 'ez-standing-curl', sets: 2, reps: 10, note: '10-12 reps, ~15kg (5kg bar + 5kg plates/side). Elbows locked to your ribs.' },
    ],
  },
  {
    id: 'routine-b',
    name: 'Workout 2: Lower Body & Core Focus',
    note: PLAN_NOTE,
    exercises: [
      { exerciseId: 'lm-squat', sets: 2, reps: 10, note: '10-12 reps, 40kg. Cup the sleeve end at your chest — great for spinal decompression.' },
      { exerciseId: 'db-romanian-deadlift', sets: 2, reps: 10, note: '10-12 reps, 20kg DBs. Soft knees, push hips straight back.' },
      { exerciseId: 'bw-box-step-up', sets: 2, reps: 10, note: '10-12 reps, bodyweight or 5kg DBs. Drive through the front heel.' },
      { exerciseId: 'cb-woodchopper', sets: 2, reps: 12, note: '15-20kg. Rotate through the core, keep hips forward.' },
    ],
  },
  {
    id: 'routine-c',
    name: 'Workout 3: Full Body Hypertrophy',
    note: PLAN_NOTE,
    exercises: [
      { exerciseId: 'bb-floor-press', sets: 2, reps: 8, note: '8-10 reps, ~50kg total (10kg bar + 40kg). Floor stops elbows, saves the shoulders at the bottom.' },
      { exerciseId: 'cb-seated-row', sets: 2, reps: 10, note: '10-12 reps, 45-55kg. Squeeze shoulder blades fully at the back.' },
      { exerciseId: 'lm-reverse-lunge', sets: 2, reps: 10, note: '10 reps/leg, 15kg plate. Hold the bar end in the hand opposite your front leg.' },
      { exerciseId: 'cb-tricep-pushdown', sets: 2, reps: 12, note: '12-15 reps, 20-25kg. Rope attachment, flare fully at the bottom.' },
      { exerciseId: 'cb-face-pull', sets: 2, reps: 15, note: '15 reps, 10-15kg. Rope attachment, pull toward your ears.' },
    ],
  },
];
