const App = (() => {
  const ui = {
    route: 'today',
    todaySelectedRoutine: null,
    historyExpanded: new Set(),
    exerciseFilter: 'All',
    modal: null,
  };

  let deferredInstallPrompt = null;

  function seedIfNeeded() {
    if (DB.isSeeded()) return;
    DB.setExercises(DEFAULT_EXERCISES.map((e) => ({ ...e })));
    DB.setRoutines(DEFAULT_ROUTINES.map((r) => ({ ...r, exercises: r.exercises.map((e) => ({ ...e })) })));
    DB.setSessions([]);
    DB.setSeeded();
  }

  // Backfills fields added after initial release (startWeight/increment) onto
  // exercises already saved in someone's browser, without touching their edits.
  function migrateExercises() {
    const exercises = DB.getExercises();
    let changed = false;
    exercises.forEach((ex) => {
      if (ex.startWeight === undefined) { ex.startWeight = null; changed = true; }
      if (ex.increment === undefined) { ex.increment = ex.equipment === 'Bodyweight' ? 2 : 2.5; changed = true; }
    });
    if (changed) DB.setExercises(exercises);
  }

  function currentRoute() {
    const h = location.hash.replace('#/', '');
    return ['today', 'history', 'routines', 'exercises', 'settings'].includes(h) ? h : 'today';
  }

  function render() {
    const route = currentRoute();
    ui.route = route;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.route === route));

    let html = '';
    if (route === 'today') html = Views.today();
    else if (route === 'history') html = Views.history();
    else if (route === 'routines') html = Views.routines();
    else if (route === 'exercises') html = Views.exercisesView();
    else if (route === 'settings') html = Views.settings();

    html += Views.modal();
    document.getElementById('app').innerHTML = html;

    if (route === 'settings') {
      const installBtn = document.getElementById('install-btn');
      if (installBtn && deferredInstallPrompt) installBtn.hidden = false;
    }
  }

  function navigate(route) {
    location.hash = `#/${route}`;
  }

  // ---------- ACTIONS ----------
  function startWorkout(routineId) {
    const routines = DB.getRoutines();
    const exercises = DB.getExercises();
    const sessions = DB.getSessions();
    const routine = routines.find((r) => r.id === routineId);

    let sessionExercises = [];
    let routineName = 'Custom Workout';

    if (routine) {
      routineName = routine.name;
      sessionExercises = routine.exercises.map((re) => {
        const ex = exercises.find((e) => e.id === re.exerciseId);
        const last = Util.findLastSets(re.exerciseId, sessions);
        const target = Util.computeNextTarget(ex || {}, last, re.reps);
        const sets = [];
        for (let i = 0; i < re.sets; i++) sets.push({ weight: target.weight, reps: target.reps, done: false });
        return { exerciseId: re.exerciseId, name: ex ? ex.name : 'Unknown exercise', sets, difficulty: null };
      });
    }

    const session = {
      id: DB.uid('sess'),
      routineId: routine ? routine.id : null,
      routineName,
      date: Util.todayISO(),
      startedAt: new Date().toISOString(),
      exercises: sessionExercises,
    };
    DB.setActive(session);
  }

  function finishWorkout() {
    const active = DB.getActive();
    if (!active) return;
    active.finishedAt = new Date().toISOString();
    const sessions = DB.getSessions();
    sessions.unshift(active);
    DB.setSessions(sessions);
    DB.clearActive();
    Util.toast('Workout saved');
  }

  function addExerciseToSession(exerciseId) {
    const active = DB.getActive();
    if (!active) return;
    const ex = DB.getExercises().find((e) => e.id === exerciseId);
    if (!ex) return;
    const last = Util.findLastSets(exerciseId, DB.getSessions());
    const target = Util.computeNextTarget(ex, last, ex.reps);
    const sets = [];
    for (let i = 0; i < ex.sets; i++) sets.push({ weight: target.weight, reps: target.reps, done: false });
    active.exercises.push({ exerciseId: ex.id, name: ex.name, sets, difficulty: null });
    DB.setActive(active);
  }

  function addExerciseToRoutine(rid, exerciseId) {
    const routines = DB.getRoutines();
    const r = routines.find((r) => r.id === rid);
    const ex = DB.getExercises().find((e) => e.id === exerciseId);
    if (!r || !ex) return;
    r.exercises.push({ exerciseId: ex.id, sets: ex.sets, reps: ex.reps });
    DB.setRoutines(routines);
  }

  function isExerciseInUse(exerciseId) {
    return DB.getRoutines().some((r) => r.exercises.some((re) => re.exerciseId === exerciseId));
  }

  function exportData() {
    const data = DB.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-log-backup-${Util.todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        DB.importAll(data);
        Util.toast('Import complete');
        render();
      } catch (e) {
        alert('Could not read that file — is it a valid export?');
      }
    };
    reader.readAsText(file);
  }

  // ---------- EVENT DELEGATION ----------
  function onClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    if (action === 'close-modal-backdrop') {
      if (e.target.closest('[data-stop]')) return; // click originated inside the modal panel, ignore
      ui.modal = null;
      return render();
    }

    switch (action) {
      case 'goto-route':
        return navigate(el.dataset.route);

      case 'select-routine':
        ui.todaySelectedRoutine = el.dataset.id;
        return render();

      case 'start-workout':
        startWorkout(ui.todaySelectedRoutine);
        return render();

      case 'cancel-workout':
        if (confirm('Discard this workout? Nothing will be saved.')) {
          DB.clearActive();
          render();
        }
        return;

      case 'finish-workout':
        finishWorkout();
        return render();

      case 'remove-exercise-from-session': {
        const active = DB.getActive();
        active.exercises.splice(+el.dataset.exi, 1);
        DB.setActive(active);
        return render();
      }

      case 'add-set': {
        const active = DB.getActive();
        const ex = active.exercises[+el.dataset.exi];
        const prev = ex.sets[ex.sets.length - 1];
        ex.sets.push({ weight: prev ? prev.weight : null, reps: prev ? prev.reps : null, done: false });
        DB.setActive(active);
        return render();
      }

      case 'delete-set': {
        const active = DB.getActive();
        active.exercises[+el.dataset.exi].sets.splice(+el.dataset.si, 1);
        DB.setActive(active);
        return render();
      }

      case 'set-difficulty': {
        const active = DB.getActive();
        const exi = +el.dataset.exi;
        const cur = active.exercises[exi].difficulty;
        active.exercises[exi].difficulty = cur === el.dataset.value ? null : el.dataset.value;
        DB.setActive(active);
        return render();
      }

      case 'toggle-set-done': {
        const active = DB.getActive();
        const st = active.exercises[+el.dataset.exi].sets[+el.dataset.si];
        st.done = !st.done;
        DB.setActive(active);
        return render();
      }

      case 'open-add-exercise-to-session':
        ui.modal = { type: 'exercise-picker', target: 'session', filter: 'All' };
        return render();

      case 'toggle-history':
        ui.historyExpanded.has(el.dataset.id) ? ui.historyExpanded.delete(el.dataset.id) : ui.historyExpanded.add(el.dataset.id);
        return render();

      case 'delete-session':
        if (confirm('Delete this workout from history?')) {
          DB.setSessions(DB.getSessions().filter((s) => s.id !== el.dataset.id));
          render();
        }
        return;

      case 'add-routine':
        ui.modal = { type: 'routine-form', draft: { name: '' } };
        return render();

      case 'delete-routine':
        if (confirm('Delete this routine? Past workout history is kept.')) {
          DB.setRoutines(DB.getRoutines().filter((r) => r.id !== el.dataset.rid));
          if (ui.todaySelectedRoutine === el.dataset.rid) ui.todaySelectedRoutine = null;
          render();
        }
        return;

      case 'move-ex-up':
      case 'move-ex-down': {
        const routines = DB.getRoutines();
        const r = routines.find((r) => r.id === el.dataset.rid);
        const i = +el.dataset.i;
        const j = action === 'move-ex-up' ? i - 1 : i + 1;
        if (j < 0 || j >= r.exercises.length) return;
        [r.exercises[i], r.exercises[j]] = [r.exercises[j], r.exercises[i]];
        DB.setRoutines(routines);
        return render();
      }

      case 'remove-ex-from-routine': {
        const routines = DB.getRoutines();
        const r = routines.find((r) => r.id === el.dataset.rid);
        r.exercises.splice(+el.dataset.i, 1);
        DB.setRoutines(routines);
        return render();
      }

      case 'open-add-exercise-to-routine':
        ui.modal = { type: 'exercise-picker', target: 'routine', rid: el.dataset.rid, filter: 'All' };
        return render();

      case 'add-exercise':
        ui.modal = { type: 'exercise-form', draft: { name: '', equipment: 'Barbell', sets: 3, reps: 10, startWeight: null, increment: 2.5 } };
        return render();

      case 'edit-exercise': {
        const ex = DB.getExercises().find((e) => e.id === el.dataset.id);
        if (!ex) return;
        ui.modal = { type: 'exercise-form', editingId: ex.id, draft: { ...ex } };
        return render();
      }

      case 'delete-exercise':
        if (isExerciseInUse(el.dataset.id)) {
          alert('This exercise is used in a routine — remove it from the routine first.');
          return;
        }
        if (confirm('Delete this exercise?')) {
          DB.setExercises(DB.getExercises().filter((e) => e.id !== el.dataset.id));
          render();
        }
        return;

      case 'filter-exercises':
        ui.exerciseFilter = el.dataset.filter;
        return render();

      case 'install-app':
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          deferredInstallPrompt.userChoice.finally(() => { deferredInstallPrompt = null; render(); });
        }
        return;

      case 'export-data':
        exportData();
        return;

      case 'import-data':
        document.getElementById('import-file').click();
        return;

      case 'wipe-data':
        if (confirm('This permanently erases all routines, exercises, and workout history on this device. Continue?')) {
          DB.wipeAll();
          location.reload();
        }
        return;

      case 'close-modal':
        ui.modal = null;
        return render();

      case 'filter-modal-exercises':
        ui.modal.filter = el.dataset.filter;
        return render();

      case 'pick-exercise': {
        const id = el.dataset.id;
        if (ui.modal.target === 'session') addExerciseToSession(id);
        else if (ui.modal.target === 'routine') addExerciseToRoutine(ui.modal.rid, id);
        ui.modal = null;
        return render();
      }

      case 'save-routine-form': {
        const name = ui.modal.draft.name.trim() || 'Untitled Routine';
        const routines = DB.getRoutines();
        routines.push({ id: DB.uid('routine'), name, exercises: [] });
        DB.setRoutines(routines);
        ui.modal = null;
        return render();
      }

      case 'modal-set-equipment':
        ui.modal.draft.equipment = el.dataset.value;
        return render();

      case 'save-exercise-form': {
        const d = ui.modal.draft;
        const name = d.name.trim();
        if (!name) { alert('Please enter a name.'); return; }
        const exercises = DB.getExercises();
        const fields = { name, equipment: d.equipment, sets: d.sets || 3, reps: d.reps || 10, startWeight: d.startWeight, increment: d.increment || (d.equipment === 'Bodyweight' ? 2 : 2.5) };
        if (ui.modal.editingId) {
          const ex = exercises.find((e) => e.id === ui.modal.editingId);
          Object.assign(ex, fields);
        } else {
          exercises.push({ id: DB.uid('ex'), ...fields });
        }
        DB.setExercises(exercises);
        ui.modal = null;
        return render();
      }
    }
  }

  function onInput(e) {
    const el = e.target.closest('[data-bind]');
    if (!el) return;
    const bind = el.dataset.bind;

    switch (bind) {
      case 'set-weight':
      case 'set-reps': {
        const active = DB.getActive();
        if (!active) return;
        const exi = +el.dataset.exi, si = +el.dataset.si;
        const val = el.value === '' ? null : Number(el.value);
        active.exercises[exi].sets[si][bind === 'set-weight' ? 'weight' : 'reps'] = val;
        DB.setActive(active);
        return;
      }
      case 'routine-name': {
        const routines = DB.getRoutines();
        const r = routines.find((r) => r.id === el.dataset.rid);
        if (r) { r.name = el.value; DB.setRoutines(routines); }
        return;
      }
      case 'routine-ex-sets':
      case 'routine-ex-reps': {
        const routines = DB.getRoutines();
        const r = routines.find((r) => r.id === el.dataset.rid);
        if (r) {
          const i = +el.dataset.i;
          const val = Math.max(0, parseInt(el.value, 10) || 0);
          r.exercises[i][bind === 'routine-ex-sets' ? 'sets' : 'reps'] = val;
          DB.setRoutines(routines);
        }
        return;
      }
      case 'modal-name':
        ui.modal.draft.name = el.value;
        return;
      case 'modal-sets':
        ui.modal.draft.sets = parseInt(el.value, 10) || 0;
        return;
      case 'modal-reps':
        ui.modal.draft.reps = parseInt(el.value, 10) || 0;
        return;
      case 'modal-startweight':
        ui.modal.draft.startWeight = el.value === '' ? null : Number(el.value);
        return;
      case 'modal-increment':
        ui.modal.draft.increment = el.value === '' ? null : Number(el.value);
        return;
    }
  }

  function onChange(e) {
    if (e.target.id === 'import-file' && e.target.files[0]) {
      if (confirm('Importing will overwrite current data. Continue?')) {
        importData(e.target.files[0]);
      }
      e.target.value = '';
    }
  }

  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const btn = document.getElementById('install-btn');
      if (btn) btn.hidden = false;
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch((err) => console.error('SW registration failed', err));
      });
    }
  }

  function init() {
    seedIfNeeded();
    migrateExercises();
    document.getElementById('app').addEventListener('click', onClick);
    document.getElementById('app').addEventListener('input', onInput);
    document.getElementById('app').addEventListener('change', onChange);
    document.getElementById('tabbar').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (tab) navigate(tab.dataset.route);
    });
    window.addEventListener('hashchange', render);
    setupInstallPrompt();
    registerServiceWorker();
    if (!location.hash) location.hash = '#/today';
    render();
  }

  return { init, ui };
})();

document.addEventListener('DOMContentLoaded', App.init);
