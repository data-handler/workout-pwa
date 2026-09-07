const Views = (() => {
  const { esc, fmtDateLong, fmtDateShort, findLastSets, fmtSets, todayISO } = Util;

  // ---------- TODAY ----------
  function today() {
    const active = DB.getActive();
    if (active) return activeSession(active);

    const routines = DB.getRoutines();
    if (!App.ui.todaySelectedRoutine && routines[0]) App.ui.todaySelectedRoutine = routines[0].id;
    const sel = App.ui.todaySelectedRoutine;
    const selRoutine = routines.find((r) => r.id === sel);

    let preview;
    if (sel === 'custom' || (!selRoutine && routines.length === 0)) {
      preview = `<p>Blank workout — add exercises once you start.</p>`;
    } else if (selRoutine) {
      const exercises = DB.getExercises();
      preview = selRoutine.exercises.map((re) => {
        const ex = exercises.find((e) => e.id === re.exerciseId);
        return `<div class="history-ex"><span class="name">${esc(ex ? ex.name : 'Unknown exercise')}</span><span class="sets">${re.sets}×${re.reps}</span></div>`;
      }).join('') || '<p>No exercises in this routine yet — add some in the Routines tab.</p>';
    } else {
      preview = '';
    }

    return `
      <div class="topbar">
        <div><h1>Today</h1><div class="sub">${fmtDateLong(todayISO())}</div></div>
      </div>
      ${routines.length ? `
        <div class="routine-tabs">
          ${routines.map((r) => `<button class="routine-tab ${sel === r.id ? 'active' : ''}" data-action="select-routine" data-id="${r.id}">${esc(r.name)}</button>`).join('')}
          <button class="routine-tab ${sel === 'custom' ? 'active' : ''}" data-action="select-routine" data-id="custom">+ Custom</button>
        </div>
        <div class="card">${preview}</div>
        <button class="btn primary block" data-action="start-workout">Start Workout</button>
      ` : `
        <div class="empty">
          <p>No routines yet.</p>
          <button class="btn primary" data-action="goto-route" data-route="routines">Create a Routine</button>
        </div>
      `}
    `;
  }

  function activeSession(session) {
    const sessions = DB.getSessions();
    const blocks = session.exercises.map((ex, exi) => exerciseBlock(ex, exi, sessions, session.id)).join('');
    return `
      <div class="topbar row between">
        <div><h1>${esc(session.routineName)}</h1><div class="sub">${fmtDateLong(session.date)}</div></div>
        <button class="btn ghost sm" data-action="cancel-workout">Cancel</button>
      </div>
      ${blocks || '<p class="empty">No exercises yet — add one below.</p>'}
      <button class="add-set-btn" data-action="open-add-exercise-to-session">+ Add Exercise</button>
      <button class="btn primary block" style="margin-top:14px" data-action="finish-workout">Finish Workout</button>
    `;
  }

  function exerciseBlock(ex, exi, sessions, excludeId) {
    const last = findLastSets(ex.exerciseId, sessions, excludeId);
    const setsHtml = ex.sets.map((st, si) => `
      <div class="set-row">
        <div class="set-idx">${si + 1}</div>
        <input inputmode="decimal" type="number" step="0.5" placeholder="kg" value="${st.weight ?? ''}" data-bind="set-weight" data-exi="${exi}" data-si="${si}">
        <input inputmode="numeric" type="number" step="1" placeholder="reps" value="${st.reps ?? ''}" data-bind="set-reps" data-exi="${exi}" data-si="${si}">
        <button class="set-done ${st.done ? 'on' : ''}" data-action="toggle-set-done" data-exi="${exi}" data-si="${si}">✓</button>
        <button class="set-del" data-action="delete-set" data-exi="${exi}" data-si="${si}">✕</button>
      </div>
    `).join('');

    return `
      <div class="exercise-block">
        <div class="ex-head">
          <div>
            <div class="ex-name">${esc(ex.name)}</div>
            <div class="ex-last">${last ? `Last (${fmtDateShort(last.date)}): ${fmtSets(last.sets)}` : 'No previous data'}</div>
          </div>
          <button class="swipe-del" data-action="remove-exercise-from-session" data-exi="${exi}">✕</button>
        </div>
        <div class="set-row header"><div></div><div>kg</div><div>reps</div><div>done</div><div></div></div>
        ${setsHtml}
        <button class="add-set-btn" data-action="add-set" data-exi="${exi}">+ Add set</button>
      </div>
    `;
  }

  // ---------- HISTORY ----------
  function history() {
    const sessions = [...DB.getSessions()].sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''));
    if (!sessions.length) {
      return `
        <div class="topbar"><h1>History</h1></div>
        <div class="empty"><p>No workouts logged yet. Finish a workout and it'll show up here.</p></div>
      `;
    }
    return `
      <div class="topbar"><div><h1>History</h1><div class="sub">${sessions.length} workout${sessions.length === 1 ? '' : 's'} logged</div></div></div>
      ${sessions.map((s) => {
        const expanded = App.ui.historyExpanded.has(s.id);
        return `
        <div class="card history-day">
          <div class="row between" data-action="toggle-history" data-id="${s.id}" style="cursor:pointer">
            <div>
              <div class="date">${esc(s.routineName)}</div>
              <div class="sub" style="margin:0">${fmtDateLong(s.date)}</div>
            </div>
            <button class="swipe-del" data-action="delete-session" data-id="${s.id}">✕</button>
          </div>
          ${expanded ? `<div style="margin-top:10px">${s.exercises.map((ex) => `
            <div class="history-ex"><span class="name">${esc(ex.name)}</span><span class="sets">${fmtSets(ex.sets)}</span></div>
          `).join('') || '<p style="margin:6px 0 0">No exercises recorded.</p>'}</div>` : ''}
        </div>`;
      }).join('')}
    `;
  }

  // ---------- ROUTINES ----------
  function routines() {
    const list = DB.getRoutines();
    const exercises = DB.getExercises();
    return `
      <div class="topbar row between">
        <h1>Routines</h1>
        <button class="btn sm primary" data-action="add-routine">+ New</button>
      </div>
      ${list.length ? list.map((r) => routineCard(r, exercises)).join('') : '<div class="empty"><p>No routines yet — create one to get started.</p></div>'}
    `;
  }

  function routineCard(r, exercises) {
    const items = r.exercises.map((re, i) => {
      const ex = exercises.find((e) => e.id === re.exerciseId);
      return `
        <div class="ex-list-item">
          <div class="info">
            <div class="name">${ex ? esc(ex.name) : 'Unknown exercise'}</div>
            <div class="tag">${ex ? esc(ex.equipment) : ''}</div>
          </div>
          <div class="row" style="align-items:center;gap:4px">
            <input type="number" style="width:42px;padding:6px 4px" value="${re.sets}" data-bind="routine-ex-sets" data-rid="${r.id}" data-i="${i}">
            <span class="sub" style="margin:0 2px">×</span>
            <input type="number" style="width:42px;padding:6px 4px" value="${re.reps}" data-bind="routine-ex-reps" data-rid="${r.id}" data-i="${i}">
            <button class="drag-handle" data-action="move-ex-up" data-rid="${r.id}" data-i="${i}">↑</button>
            <button class="drag-handle" data-action="move-ex-down" data-rid="${r.id}" data-i="${i}">↓</button>
            <button class="swipe-del" data-action="remove-ex-from-routine" data-rid="${r.id}" data-i="${i}">✕</button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="card">
        <div class="row between" style="margin-bottom:4px">
          <input class="grow" style="font-weight:700;background:transparent;border:none;padding:6px 0;font-size:1.05rem" value="${esc(r.name)}" data-bind="routine-name" data-rid="${r.id}">
          <button class="swipe-del" data-action="delete-routine" data-rid="${r.id}">✕</button>
        </div>
        ${items || '<p style="margin-top:4px">No exercises yet.</p>'}
        <button class="add-set-btn" data-action="open-add-exercise-to-routine" data-rid="${r.id}">+ Add Exercise</button>
      </div>
    `;
  }

  // ---------- EXERCISES ----------
  function exercisesView() {
    const all = DB.getExercises();
    const filter = App.ui.exerciseFilter;
    const filtered = filter === 'All' ? all : all.filter((e) => e.equipment === filter);
    return `
      <div class="topbar row between">
        <h1>Exercises</h1>
        <button class="btn sm primary" data-action="add-exercise">+ New</button>
      </div>
      <div class="chip-select">
        ${['All', ...EQUIPMENT_TYPES].map((t) => `<button class="chip ${filter === t ? 'on' : ''}" data-action="filter-exercises" data-filter="${t}">${t}</button>`).join('')}
      </div>
      <div class="card tight">
        ${filtered.length ? filtered.map((ex) => `
          <div class="ex-list-item">
            <div class="info" style="cursor:pointer" data-action="edit-exercise" data-id="${ex.id}">
              <div class="name">${esc(ex.name)}</div>
              <div class="tag">${esc(ex.equipment)} · default ${ex.sets}×${ex.reps}</div>
            </div>
            <button class="swipe-del" data-action="delete-exercise" data-id="${ex.id}">✕</button>
          </div>
        `).join('') : '<p style="padding:8px 0">No exercises in this category.</p>'}
      </div>
    `;
  }

  // ---------- SETTINGS ----------
  function settings() {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    return `
      <div class="topbar"><h1>Settings</h1></div>
      <div class="card">
        <h2>Install</h2>
        ${isStandalone ? '<p>Already installed on this device.</p>' : isIOS
          ? '<p>Open the Share menu (square with an arrow) and tap "Add to Home Screen".</p>'
          : '<p>Install this app to your home screen for quick, full-screen access.</p><button class="btn primary block" id="install-btn" data-action="install-app" hidden>Install App</button>'}
      </div>
      <div class="card">
        <h2>Backup</h2>
        <p>Everything is stored only on this device (localStorage). Export a backup now and then in case you clear browser data or switch phones.</p>
        <div class="row">
          <button class="btn grow" data-action="export-data">Export JSON</button>
          <button class="btn grow" data-action="import-data">Import JSON</button>
        </div>
        <input type="file" id="import-file" accept="application/json" hidden>
      </div>
      <div class="card">
        <h2>Reset</h2>
        <p>Erase all routines, exercises, and workout history, and restore the built-in defaults.</p>
        <button class="btn danger block" data-action="wipe-data">Erase All Data</button>
      </div>
      <div class="card tight"><p style="margin:0;font-size:.75rem">Workout Log — local-only PWA, no account, no server.</p></div>
    `;
  }

  // ---------- MODALS ----------
  function modal() {
    const m = App.ui.modal;
    if (!m) return '';
    let body = '';
    if (m.type === 'exercise-picker') body = exercisePickerModal(m);
    else if (m.type === 'routine-form') body = routineFormModal(m);
    else if (m.type === 'exercise-form') body = exerciseFormModal(m);
    return `<div class="modal-backdrop" data-action="close-modal-backdrop">${body}</div>`;
  }

  function exercisePickerModal(m) {
    const all = DB.getExercises();
    const filter = m.filter || 'All';
    const list = filter === 'All' ? all : all.filter((e) => e.equipment === filter);
    return `
      <div class="modal" data-stop="1">
        <h2>Add Exercise</h2>
        <div class="chip-select">
          ${['All', ...EQUIPMENT_TYPES].map((t) => `<button class="chip ${filter === t ? 'on' : ''}" data-action="filter-modal-exercises" data-filter="${t}">${t}</button>`).join('')}
        </div>
        <div style="max-height:50vh;overflow-y:auto">
          ${list.map((ex) => `
            <div class="ex-list-item" style="cursor:pointer" data-action="pick-exercise" data-id="${ex.id}">
              <div class="info"><div class="name">${esc(ex.name)}</div><div class="tag">${esc(ex.equipment)}</div></div>
            </div>
          `).join('') || '<p>No exercises in this category.</p>'}
        </div>
        <button class="btn ghost block" style="margin-top:10px" data-action="close-modal">Cancel</button>
      </div>
    `;
  }

  function routineFormModal(m) {
    return `
      <div class="modal" data-stop="1">
        <h2>New Routine</h2>
        <div class="field">
          <label>Name</label>
          <input data-bind="modal-name" value="${esc(m.draft.name)}" placeholder="e.g. Workout D - Arms">
        </div>
        <div class="row">
          <button class="btn ghost grow" data-action="close-modal">Cancel</button>
          <button class="btn primary grow" data-action="save-routine-form">Save</button>
        </div>
      </div>
    `;
  }

  function exerciseFormModal(m) {
    return `
      <div class="modal" data-stop="1">
        <h2>${m.editingId ? 'Edit Exercise' : 'New Exercise'}</h2>
        <div class="field">
          <label>Name</label>
          <input data-bind="modal-name" value="${esc(m.draft.name)}" placeholder="e.g. Cable Chest Press">
        </div>
        <div class="field">
          <label>Equipment</label>
          <div class="chip-select">
            ${EQUIPMENT_TYPES.map((t) => `<button class="chip ${m.draft.equipment === t ? 'on' : ''}" data-action="modal-set-equipment" data-value="${t}">${t}</button>`).join('')}
          </div>
        </div>
        <div class="row">
          <div class="field grow">
            <label>Default sets</label>
            <input type="number" data-bind="modal-sets" value="${m.draft.sets}">
          </div>
          <div class="field grow">
            <label>Default reps</label>
            <input type="number" data-bind="modal-reps" value="${m.draft.reps}">
          </div>
        </div>
        <div class="row">
          <button class="btn ghost grow" data-action="close-modal">Cancel</button>
          <button class="btn primary grow" data-action="save-exercise-form">Save</button>
        </div>
      </div>
    `;
  }

  return { today, history, routines, exercisesView, settings, modal };
})();
