// Lógica pura de tareas: sin DOM ni localStorage, fácil de probar.

export const FILTERS = ['all', 'pending', 'done'];

let counter = 0;
const newId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function createTask(text) {
  const clean = String(text ?? '').trim();
  if (!clean) throw new Error('La tarea no puede estar vacía');
  return { id: newId(), text: clean, done: false, createdAt: Date.now() };
}

export function addTask(tasks, text) {
  return [createTask(text), ...tasks];
}

export function toggleTask(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function removeTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

export function clearDone(tasks) {
  return tasks.filter((t) => !t.done);
}

export function filterTasks(tasks, filter = 'all') {
  if (filter === 'pending') return tasks.filter((t) => !t.done);
  if (filter === 'done') return tasks.filter((t) => t.done);
  return tasks;
}

export function getStats(tasks) {
  const done = tasks.filter((t) => t.done).length;
  return { total: tasks.length, done, pending: tasks.length - done };
}
