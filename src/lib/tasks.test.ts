import { describe, expect, it } from 'vitest'
import { addTask, filterTasks, loadTasks, removeTask, saveTasks, stats, toggleTask, type Task } from './tasks'

const now = new Date('2026-11-13T12:00:00').getTime()

describe('tasks', () => {
  it('adds a trimmed task to the top and ignores blanks', () => {
    const one = addTask([], '  Call Sam  ', now)
    expect(one).toHaveLength(1)
    expect(one[0]).toMatchObject({ title: 'Call Sam', done: false })
    expect(addTask(one, '   ', now)).toBe(one)
  })

  it('ticks, unticks, removes and filters', () => {
    let list = addTask(addTask([], 'A', now), 'B', now)
    const id = list[0].id
    list = toggleTask(list, id, now)
    expect(filterTasks(list, 'done').map((t) => t.title)).toEqual(['B'])
    expect(filterTasks(list, 'open').map((t) => t.title)).toEqual(['A'])
    expect(stats(list, now)).toEqual({ open: 1, doneToday: 1, total: 2 })
    list = toggleTask(list, id, now)
    expect(list[0].doneAt).toBeUndefined()
    expect(removeTask(list, id)).toHaveLength(1)
  })

  it('saves and loads, and starts with examples when nothing is saved', () => {
    const store = new Map<string, string>()
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) }
    expect(loadTasks(storage).length).toBeGreaterThan(0)
    const list: Task[] = [{ id: 'x', title: 'Saved', done: false, createdAt: now }]
    saveTasks(list, storage)
    expect(loadTasks(storage)).toEqual(list)
  })
})
