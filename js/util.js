const Util = (() => {
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function todayISO() {
    const d = new Date();
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10);
  }

  function fmtDateLong(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function fmtDateShort(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  // Most recent completed session (excluding `excludeId`) containing exerciseId, and its sets.
  function findLastSets(exerciseId, sessions, excludeId) {
    const sorted = [...sessions].sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''));
    for (const s of sorted) {
      if (excludeId && s.id === excludeId) continue;
      const ex = s.exercises.find((e) => e.exerciseId === exerciseId);
      if (ex && ex.sets && ex.sets.some((st) => st.weight != null || st.reps != null)) {
        return { sets: ex.sets, date: s.date, difficulty: ex.difficulty || null };
      }
    }
    return null;
  }

  const DIFFICULTY_LABELS = { easy: 'Too Easy', good: 'Good', hard: 'Too Hard' };

  function heaviestSetWeight(sets) {
    return sets.reduce((max, s) => (s.weight != null && (max == null || s.weight > max) ? s.weight : max), null);
  }

  function snapDumbbell(weight, direction) {
    const idx = DUMBBELL_WEIGHTS.indexOf(weight);
    if (idx === -1) {
      // Off-list (e.g. old data or a manual edit) — jump to the nearest step, then move.
      let nearest = 0;
      DUMBBELL_WEIGHTS.forEach((w, i) => { if (Math.abs(w - weight) < Math.abs(DUMBBELL_WEIGHTS[nearest] - weight)) nearest = i; });
      return DUMBBELL_WEIGHTS[nearest];
    }
    const next = direction === 'up' ? Math.min(idx + 1, DUMBBELL_WEIGHTS.length - 1) : Math.max(idx - 1, 0);
    return DUMBBELL_WEIGHTS[next];
  }

  // Given an exercise's library entry and its last-logged performance, suggest
  // this session's starting weight/reps — nudged by how the last session felt.
  function computeNextTarget(ex, last, targetReps) {
    if (!last) return { weight: ex.startWeight ?? null, reps: targetReps };

    const progressByReps = ex.equipment === 'Bodyweight';
    const diff = last.difficulty;

    if (progressByReps) {
      const inc = ex.increment ?? 2;
      let reps = targetReps;
      if (diff === 'easy') reps = targetReps + inc;
      else if (diff === 'hard') reps = Math.max(1, targetReps - inc);
      return { weight: null, reps };
    }

    let weight = heaviestSetWeight(last.sets) ?? ex.startWeight ?? null;
    if (weight != null && diff === 'easy') {
      weight = ex.equipment === 'Dumbbell' ? snapDumbbell(weight, 'up') : Math.round((weight + (ex.increment ?? 2.5)) * 4) / 4;
    } else if (weight != null && diff === 'hard') {
      weight = ex.equipment === 'Dumbbell' ? snapDumbbell(weight, 'down') : Math.max(0, Math.round((weight - (ex.increment ?? 2.5)) * 4) / 4);
    }
    return { weight, reps: targetReps };
  }

  function fmtSets(sets) {
    if (!sets || !sets.length) return '—';
    return sets
      .filter((s) => s.weight != null || s.reps != null)
      .map((s) => `${s.weight != null ? s.weight : '–'}×${s.reps != null ? s.reps : '–'}`)
      .join(', ');
  }

  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, 2200);
  }

  return { esc, todayISO, fmtDateLong, fmtDateShort, findLastSets, fmtSets, toast, computeNextTarget, DIFFICULTY_LABELS };
})();
