// The starter's data: a small task list saved in the browser. Kept apart from the screens (and free of
// React) so it is easy to test and easy to swap for a real database or API later.
export type Task = { id: string; title: string; done: boolean; createdAt: number; doneAt?: number }
export type Filter = 'all' | 'open' | 'done'

const KEY = 'studio-starter:tasks'

export const sampleTasks = (now = Date.now()): Task[] => [
  { id: 't1', title: 'Read the README and run the app', done: true, createdAt: now - 3_600_000, doneAt: now - 1_800_000 },
  { id: 't2', title: 'Build the first screen from design/pages/', done: false, createdAt: now - 1_200_000 },
  { id: 't3', title: 'Replace this task list with your own data', done: false, createdAt: now - 600_000 },
]

export function addTask(tasks: Task[], title: string, now = Date.now()): Task[] {
  const clean = title.trim()
  if (!clean) return tasks
  return [{ id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 7)}`, title: clean, done: false, createdAt: now }, ...tasks]
}

export function toggleTask(tasks: Task[], id: string, now = Date.now()): Task[] {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: t.done ? undefined : now } : t))
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id)
}

export function filterTasks(tasks: Task[], filter: Filter): Task[] {
  return filter === 'all' ? tasks : tasks.filter((t) => (filter === 'done' ? t.done : !t.done))
}

export function stats(tasks: Task[], now = Date.now()) {
  const startOfDay = new Date(now).setHours(0, 0, 0, 0)
  return {
    open: tasks.filter((t) => !t.done).length,
    doneToday: tasks.filter((t) => t.done && (t.doneAt ?? 0) >= startOfDay).length,
    total: tasks.length,
  }
}

export function loadTasks(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): Task[] {
  try {
    const raw = storage?.getItem(KEY)
    return raw ? (JSON.parse(raw) as Task[]) : sampleTasks()
  } catch {
    return sampleTasks()
  }
}

export function saveTasks(tasks: Task[], storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(KEY, JSON.stringify(tasks))
  } catch {
    // Private browsing or full storage: keep working without saving.
  }
}
