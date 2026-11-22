const KEY = 'tasks';

export function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena, etc.)
  }
}
