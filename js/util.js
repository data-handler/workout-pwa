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
        return { sets: ex.sets, date: s.date };
      }
    }
    return null;
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

  return { esc, todayISO, fmtDateLong, fmtDateShort, findLastSets, fmtSets, toast };
})();
