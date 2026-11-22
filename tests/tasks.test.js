import { describe, it, expect } from 'vitest';
import {
  createTask, addTask, toggleTask, removeTask, clearDone, filterTasks, getStats,
} from '../src/tasks.js';

describe('createTask', () => {
  it('crea una tarea pendiente con el texto recortado', () => {
    const t = createTask('  Comprar pan  ');
    expect(t.text).toBe('Comprar pan');
    expect(t.done).toBe(false);
    expect(t.id).toBeTruthy();
  });

  it('rechaza texto vacío', () => {
    expect(() => createTask('   ')).toThrow();
    expect(() => createTask()).toThrow();
  });

  it('genera ids únicos', () => {
    expect(createTask('a').id).not.toBe(createTask('a').id);
  });
});

describe('operaciones sobre la lista', () => {
  const base = () => addTask(addTask([], 'Primera'), 'Segunda');

  it('addTask agrega al inicio sin mutar el arreglo original', () => {
    const original = [];
    const list = addTask(original, 'Hola');
    expect(original).toHaveLength(0);
    expect(list[0].text).toBe('Hola');
    expect(base().map((t) => t.text)).toEqual(['Segunda', 'Primera']);
  });

  it('toggleTask alterna el estado solo de la tarea indicada', () => {
    const list = base();
    const toggled = toggleTask(list, list[0].id);
    expect(toggled[0].done).toBe(true);
    expect(toggled[1].done).toBe(false);
    expect(toggleTask(toggled, list[0].id)[0].done).toBe(false);
  });

  it('removeTask elimina por id', () => {
    const list = base();
    const result = removeTask(list, list[0].id);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Primera');
  });

  it('clearDone elimina las completadas', () => {
    const list = base();
    expect(clearDone(toggleTask(list, list[0].id))).toHaveLength(1);
  });
});

describe('filterTasks y getStats', () => {
  let list = addTask(addTask(addTask([], 'A'), 'B'), 'C');
  list = toggleTask(list, list[1].id);

  it('filtra todas / pendientes / hechas', () => {
    expect(filterTasks(list, 'all')).toHaveLength(3);
    expect(filterTasks(list, 'pending')).toHaveLength(2);
    expect(filterTasks(list, 'done').map((t) => t.text)).toEqual(['B']);
  });

  it('un filtro desconocido devuelve todas', () => {
    expect(filterTasks(list, 'otro')).toHaveLength(3);
  });

  it('calcula estadísticas', () => {
    expect(getStats(list)).toEqual({ total: 3, done: 1, pending: 2 });
    expect(getStats([])).toEqual({ total: 0, done: 0, pending: 0 });
  });
});
