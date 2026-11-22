import '@fontsource-variable/outfit';
import './style.css';
import { addTask, toggleTask, removeTask, filterTasks, getStats } from './tasks.js';
import { loadTasks, saveTasks } from './storage.js';
import { initTheme } from './theme.js';

const $ = (sel) => document.querySelector(sel);

const state = { tasks: loadTasks(), filter: 'all' };

const els = {
  form: $('#task-form'),
  input: $('#task-input'),
  list: $('#task-list'),
  empty: $('#empty'),
  counter: $('#counter'),
  bar: $('#progress-bar'),
  filters: document.querySelectorAll('[data-filter]'),
};

const EMPTY_MSG = {
  all: '✨ Nada por aquí. ¡Agrega tu primera tarea!',
  pending: '🎉 No tienes pendientes.',
  done: '💪 Aún no completas ninguna tarea.',
};

function update(tasks) {
  state.tasks = tasks;
  saveTasks(tasks);
  render();
}

function taskItem(task) {
  const li = document.createElement('li');
  li.className = `task${task.done ? ' done' : ''}`;
  li.dataset.id = task.id;
  li.innerHTML = `
    <button class="check" type="button" data-action="toggle" aria-label="Marcar como ${task.done ? 'pendiente' : 'hecha'}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
    </button>
    <span class="text"></span>
    <button class="delete" type="button" data-action="delete" aria-label="Eliminar tarea">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>`;
  li.querySelector('.text').textContent = task.text; // evita inyección de HTML
  return li;
}

function render() {
  const visible = filterTasks(state.tasks, state.filter);
  els.list.replaceChildren(...visible.map(taskItem));

  els.empty.hidden = visible.length > 0;
  els.empty.textContent = EMPTY_MSG[state.filter];

  const { total, done, pending } = getStats(state.tasks);
  els.counter.textContent = `${pending} pendiente${pending === 1 ? '' : 's'} · ${done}/${total}`;
  els.bar.style.width = total ? `${(done / total) * 100}%` : '0%';

  els.filters.forEach((btn) => {
    const active = btn.dataset.filter === state.filter;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active);
  });
}

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = els.input.value.trim();
  if (!text) return;
  update(addTask(state.tasks, text));
  els.input.value = '';
  els.input.focus();
});

els.list.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const li = btn.closest('.task');
  const id = li.dataset.id;

  if (btn.dataset.action === 'toggle') update(toggleTask(state.tasks, id));
  if (btn.dataset.action === 'delete') {
    li.classList.add('leaving');
    li.addEventListener('animationend', () => update(removeTask(state.tasks, id)), { once: true });
  }
});

els.filters.forEach((btn) =>
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    render();
  }),
);

// Fecha en el encabezado
$('#today').textContent = new Date().toLocaleDateString('es-MX', {
  weekday: 'long', day: 'numeric', month: 'long',
});

// Info de build en el pie de página
const env = import.meta.env;
$('#app-version').textContent = env.VITE_APP_VERSION || 'dev';
$('#app-commit').textContent = (env.VITE_COMMIT_SHA || 'dev').slice(0, 7);
$('#app-env').textContent = env.VITE_APP_ENV || 'dev';

initTheme($('#theme-toggle'));
render();

// Service worker (solo en build de producción)
if ('serviceWorker' in navigator && env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${env.BASE_URL}sw.js`).catch(console.error);
  });
}
