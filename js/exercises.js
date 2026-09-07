// Default exercise library, tailored to the home-gym equipment on hand:
// bench, 5kg + 10kg straight bars, 5kg preacher curl bar, 160kg of plates,
// dumbbells 1/3/5/10/15/20kg, cage pulley (high + low pulley), landmine,
// plywood box, step. Users can add/edit/remove exercises from the Exercises tab.
const DEFAULT_EXERCISES = [
  // Barbell
  { id: 'bb-bench-press', name: 'Barbell Bench Press', equipment: 'Barbell', sets: 3, reps: 8 },
  { id: 'bb-incline-bench-press', name: 'Barbell Incline Bench Press', equipment: 'Barbell', sets: 3, reps: 8 },
  { id: 'bb-overhead-press', name: 'Barbell Overhead Press', equipment: 'Barbell', sets: 3, reps: 8 },
  { id: 'bb-bent-over-row', name: 'Barbell Bent-Over Row', equipment: 'Barbell', sets: 3, reps: 8 },
  { id: 'bb-back-squat', name: 'Barbell Back Squat', equipment: 'Barbell', sets: 3, reps: 8 },
  { id: 'bb-deadlift', name: 'Barbell Deadlift', equipment: 'Barbell', sets: 3, reps: 5 },
  { id: 'bb-romanian-deadlift', name: 'Barbell Romanian Deadlift', equipment: 'Barbell', sets: 3, reps: 8 },
  { id: 'bb-hip-thrust', name: 'Barbell Hip Thrust', equipment: 'Barbell', sets: 3, reps: 10 },

  // Preacher curl / EZ bar
  { id: 'ez-preacher-curl', name: 'Preacher Curl (EZ Bar)', equipment: 'Barbell', sets: 3, reps: 10 },
  { id: 'ez-standing-curl', name: 'Standing EZ Bar Curl', equipment: 'Barbell', sets: 3, reps: 10 },
  { id: 'ez-skull-crusher', name: 'Skull Crusher (EZ Bar)', equipment: 'Barbell', sets: 3, reps: 10 },

  // Dumbbell
  { id: 'db-bench-press', name: 'Dumbbell Bench Press', equipment: 'Dumbbell', sets: 3, reps: 10 },
  { id: 'db-incline-press', name: 'Dumbbell Incline Press', equipment: 'Dumbbell', sets: 3, reps: 10 },
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', equipment: 'Dumbbell', sets: 3, reps: 10 },
  { id: 'db-lateral-raise', name: 'Dumbbell Lateral Raise', equipment: 'Dumbbell', sets: 3, reps: 12 },
  { id: 'db-front-raise', name: 'Dumbbell Front Raise', equipment: 'Dumbbell', sets: 3, reps: 12 },
  { id: 'db-row', name: 'Single-Arm Dumbbell Row', equipment: 'Dumbbell', sets: 3, reps: 10 },
  { id: 'db-fly', name: 'Dumbbell Fly', equipment: 'Dumbbell', sets: 3, reps: 12 },
  { id: 'db-shrug', name: 'Dumbbell Shrug', equipment: 'Dumbbell', sets: 3, reps: 12 },
  { id: 'db-romanian-deadlift', name: 'Dumbbell Romanian Deadlift', equipment: 'Dumbbell', sets: 3, reps: 10 },
  { id: 'db-lunge', name: 'Dumbbell Lunge', equipment: 'Dumbbell', sets: 3, reps: 10 },
  { id: 'db-bulgarian-split-squat', name: 'Dumbbell Bulgarian Split Squat', equipment: 'Dumbbell', sets: 3, reps: 10 },
  { id: 'db-curl', name: 'Dumbbell Curl', equipment: 'Dumbbell', sets: 3, reps: 10 },
  { id: 'db-hammer-curl', name: 'Dumbbell Hammer Curl', equipment: 'Dumbbell', sets: 3, reps: 10 },
  { id: 'db-overhead-tricep-ext', name: 'Dumbbell Overhead Tricep Extension', equipment: 'Dumbbell', sets: 3, reps: 12 },
  { id: 'db-calf-raise', name: 'Dumbbell Calf Raise (on Step)', equipment: 'Dumbbell', sets: 3, reps: 15 },

  // Cable / pulley (cage: high + low pulley)
  { id: 'cb-lat-pulldown', name: 'Lat Pulldown', equipment: 'Cable', sets: 3, reps: 10 },
  { id: 'cb-seated-row', name: 'Seated Cable Row', equipment: 'Cable', sets: 3, reps: 10 },
  { id: 'cb-face-pull', name: 'Cable Rope Face Pull', equipment: 'Cable', sets: 3, reps: 15 },
  { id: 'cb-tricep-pushdown', name: 'Cable Rope Tricep Pushdown', equipment: 'Cable', sets: 3, reps: 12 },
  { id: 'cb-overhead-rope-ext', name: 'Cable Overhead Rope Extension', equipment: 'Cable', sets: 3, reps: 12 },
  { id: 'cb-curl', name: 'Cable Curl', equipment: 'Cable', sets: 3, reps: 10 },
  { id: 'cb-rope-curl', name: 'Cable Rope Curl', equipment: 'Cable', sets: 3, reps: 10 },
  { id: 'cb-crossover', name: 'Cable Crossover', equipment: 'Cable', sets: 3, reps: 12 },
  { id: 'cb-crunch', name: 'Cable Crunch', equipment: 'Cable', sets: 3, reps: 15 },
  { id: 'cb-straight-arm-pulldown', name: 'Straight-Arm Pulldown', equipment: 'Cable', sets: 3, reps: 12 },

  // Landmine
  { id: 'lm-press', name: 'Landmine Press', equipment: 'Landmine', sets: 3, reps: 10 },
  { id: 'lm-squat', name: 'Landmine Squat', equipment: 'Landmine', sets: 3, reps: 10 },
  { id: 'lm-row', name: 'Landmine Row', equipment: 'Landmine', sets: 3, reps: 10 },
  { id: 'lm-rotation', name: 'Landmine Rotation', equipment: 'Landmine', sets: 3, reps: 12 },
  { id: 'lm-rdl', name: 'Landmine Romanian Deadlift', equipment: 'Landmine', sets: 3, reps: 10 },

  // Bodyweight / box / step
  { id: 'bw-push-up', name: 'Push-Up', equipment: 'Bodyweight', sets: 3, reps: 15 },
  { id: 'bw-plank', name: 'Plank (seconds)', equipment: 'Bodyweight', sets: 3, reps: 45 },
  { id: 'bw-step-up', name: 'Box Step-Up', equipment: 'Bodyweight', sets: 3, reps: 10 },
  { id: 'bw-box-squat', name: 'Box Squat', equipment: 'Bodyweight', sets: 3, reps: 10 },
  { id: 'bw-calf-raise', name: 'Calf Raise (on Step)', equipment: 'Bodyweight', sets: 3, reps: 20 },
];

const EQUIPMENT_TYPES = ['Barbell', 'Dumbbell', 'Cable', 'Landmine', 'Bodyweight'];

// The only weights this dumbbell exercises can actually use — auto-progression
// snaps to the next/previous value here instead of adding an arbitrary kg step.
const DUMBBELL_WEIGHTS = [1, 3, 5, 10, 15, 20];

// startWeight: prefilled the very first time an exercise is logged (before any
// history exists) — null means "leave it blank". increment: how much
// auto-progression moves weight (or reps, for Bodyweight moves) per step.
DEFAULT_EXERCISES.forEach((ex) => {
  if (ex.startWeight === undefined) ex.startWeight = null;
  if (ex.increment === undefined) ex.increment = ex.equipment === 'Bodyweight' ? 2 : 2.5;
});
