// Minimal localStorage-backed store. No server, no sync.
const DB = (() => {
  const KEYS = {
    exercises: 'wlog.exercises.v1',
    routines: 'wlog.routines.v1',
    sessions: 'wlog.sessions.v1',
    active: 'wlog.active.v1',
    settings: 'wlog.settings.v1',
    seeded: 'wlog.seeded.v1',
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('DB read failed', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return (prefix ? prefix + '_' : '') + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  }

  return {
    KEYS, uid,
    getExercises: () => read(KEYS.exercises, []),
    setExercises: (v) => write(KEYS.exercises, v),

    getRoutines: () => read(KEYS.routines, []),
    setRoutines: (v) => write(KEYS.routines, v),

    getSessions: () => read(KEYS.sessions, []),
    setSessions: (v) => write(KEYS.sessions, v),

    getActive: () => read(KEYS.active, null),
    setActive: (v) => write(KEYS.active, v),
    clearActive: () => localStorage.removeItem(KEYS.active),

    getSettings: () => read(KEYS.settings, { unit: 'kg' }),
    setSettings: (v) => write(KEYS.settings, v),

    isSeeded: () => read(KEYS.seeded, false),
    setSeeded: () => write(KEYS.seeded, true),

    exportAll: () => ({
      exercises: read(KEYS.exercises, []),
      routines: read(KEYS.routines, []),
      sessions: read(KEYS.sessions, []),
      settings: read(KEYS.settings, { unit: 'kg' }),
      exportedAt: new Date().toISOString(),
      version: 1,
    }),

    importAll: (data) => {
      if (data.exercises) write(KEYS.exercises, data.exercises);
      if (data.routines) write(KEYS.routines, data.routines);
      if (data.sessions) write(KEYS.sessions, data.sessions);
      if (data.settings) write(KEYS.settings, data.settings);
    },

    wipeAll: () => {
      Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    },
  };
})();
