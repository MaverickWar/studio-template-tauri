import { invoke } from '@tauri-apps/api/core'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { projectName } from '../design/adapters/web/studio-theme'
import { CheckIcon, GearIcon, HomeIcon, PlusIcon, SparkIcon, TrashIcon } from './icons'
import { addTask, filterTasks, loadTasks, removeTask, sampleTasks, saveTasks, stats, toggleTask, type Filter, type Task } from './lib/tasks'

// A small, working app in the project's own look: an overview, a task list saved in the browser and a
// settings page. Replace the screens with the ones drawn in Universal App Studio (design/pages/).
type Page = 'overview' | 'tasks' | 'settings'
const PAGES: Array<{ id: Page; label: string; Icon: typeof HomeIcon }> = [
  { id: 'overview', label: 'Overview', Icon: HomeIcon },
  { id: 'tasks', label: 'Tasks', Icon: CheckIcon },
  { id: 'settings', label: 'Settings', Icon: GearIcon },
]
const pageFromHash = (): Page => (PAGES.find((p) => `#/${p.id}` === location.hash)?.id ?? 'overview')
const NAME_KEY = 'studio-starter:name'
const greeting = () => {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash)
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? '')

  useEffect(() => {
    const onHash = () => setPage(pageFromHash())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => saveTasks(tasks), [tasks])
  useEffect(() => localStorage.setItem(NAME_KEY, name), [name])
  useEffect(() => {
    document.title = `${PAGES.find((p) => p.id === page)!.label} · ${projectName}`
  }, [page])

  const open = tasks.filter((t) => !t.done).length
  const nav = PAGES.map(({ id, label, Icon }) => (
    <a key={id} href={`#/${id}`} aria-current={page === id ? 'page' : undefined}>
      <Icon />
      <span>{label}</span>
      {id === 'tasks' && open > 0 && <span className="count">{open}</span>}
    </a>
  ))

  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <aside className="sidebar">
        <a className="brand" href="#/overview"><span className="mark" aria-hidden="true">{projectName[0]}</span>{projectName}</a>
        <nav className="nav" aria-label="Main">{nav}</nav>
        <div className="foot muted">Everything here is saved in this browser. Swap it for your own data when you're ready.</div>
      </aside>
      <div>
        <header className="topbar"><a className="brand" href="#/overview"><span className="mark" aria-hidden="true">{projectName[0]}</span>{projectName}</a></header>
        <main className="main" id="main">
          {page === 'overview' && <Overview tasks={tasks} name={name} onToggle={(id) => setTasks((t) => toggleTask(t, id))} />}
          {page === 'tasks' && <Tasks tasks={tasks} setTasks={setTasks} />}
          {page === 'settings' && <Settings name={name} setName={setName} onReset={() => setTasks(sampleTasks())} />}
        </main>
      </div>
      <nav className="tabbar" aria-label="Main">{nav}</nav>
    </div>
  )
}

function Overview({ tasks, name, onToggle }: { tasks: Task[]; name: string; onToggle: (id: string) => void }) {
  const s = stats(tasks)
  const next = tasks.filter((t) => !t.done).slice(0, 4)
  const [hello] = useState(greeting)
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{hello}{name ? `, ${name}` : ''}</h1>
          <p className="muted">Here's where things stand today.</p>
        </div>
        <a className="btn btn-primary" href="#/tasks"><PlusIcon width={18} height={18} />New task</a>
      </div>
      <section className="stats" aria-label="Summary">
        <div className="card stat"><div className="label">Open</div><div className="big-number">{s.open}</div></div>
        <div className="card stat"><div className="label">Done today</div><div className="big-number">{s.doneToday}</div></div>
        <div className="card stat"><div className="label">All tasks</div><div className="big-number">{s.total}</div></div>
      </section>
      <div className="panels">
        <section className="card">
          <h2>Up next</h2>
          {next.length ? (
            <ul className="tasks">{next.map((t) => <TaskRow key={t.id} task={t} onToggle={onToggle} />)}</ul>
          ) : (
            <Empty title="All done" text="Nothing left to do. Enjoy it." />
          )}
        </section>
        <section className="card">
          <h2>Progress</h2>
          <div className="big-number">{s.total ? Math.round(((s.total - s.open) / s.total) * 100) : 0}%</div>
          <div className="meter" role="img" aria-label="Share of tasks done"><i style={{ width: `${s.total ? ((s.total - s.open) / s.total) * 100 : 0}%` }} /></div>
          <p className="muted" style={{ marginTop: 12 }}>{s.total - s.open} of {s.total} tasks done.</p>
        </section>
      </div>
    </>
  )
}

function Tasks({ tasks, setTasks }: { tasks: Task[]; setTasks: (f: (t: Task[]) => Task[]) => void }) {
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const shown = useMemo(() => filterTasks(tasks, filter), [tasks, filter])
  const add = (e: FormEvent) => {
    e.preventDefault()
    setTasks((t) => addTask(t, title))
    setTitle('')
  }
  return (
    <>
      <div className="page-head"><div><h1>Tasks</h1><p className="muted">Add what needs doing and tick it off.</p></div></div>
      <section className="card">
        <form className="add-row" onSubmit={add}>
          <label className="sr-only" htmlFor="new-task">New task</label>
          <input id="new-task" className="input" placeholder="What needs doing?" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button className="btn btn-primary" type="submit" disabled={!title.trim()}><PlusIcon width={18} height={18} />Add</button>
        </form>
        <div className="tabs" role="group" aria-label="Show">
          {(['all', 'open', 'done'] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f[0].toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        {shown.length ? (
          <ul className="tasks">
            {shown.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={(id) => setTasks((l) => toggleTask(l, id))} onRemove={(id) => setTasks((l) => removeTask(l, id))} />
            ))}
          </ul>
        ) : (
          <Empty title={filter === 'done' ? 'Nothing done yet' : 'No tasks here'} text={filter === 'done' ? 'Ticked tasks show up here.' : 'Add your first one above.'} />
        )}
      </section>
    </>
  )
}

function Settings({ name, setName, onReset }: { name: string; setName: (v: string) => void; onReset: () => void }) {
  return (
    <>
      <div className="page-head"><div><h1>Settings</h1><p className="muted">Saved in this browser as you type.</p></div></div>
      <section className="card settings">
        <div className="field">
          <label htmlFor="your-name">Your name</label>
          <input id="your-name" className="input" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shown on the overview" />
        </div>
        <div>
          <button className="btn btn-ghost" type="button" onClick={onReset}>Start again with the example tasks</button>
        </div>
      </section>
      <NativeCheck name={name} />
    </>
  )
}

function TaskRow({ task, onToggle, onRemove }: { task: Task; onToggle: (id: string) => void; onRemove?: (id: string) => void }) {
  return (
    <li className={`task${task.done ? ' done' : ''}`}>
      <label>
        <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} />
        <span>{task.title}</span>
      </label>
      {onRemove && (
        <button className="btn btn-quiet" type="button" onClick={() => onRemove(task.id)} aria-label={`Delete "${task.title}"`}><TrashIcon /></button>
      )}
    </li>
  )
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <span className="icon-tile"><SparkIcon /></span>
      <strong>{title}</strong>
      <p className="muted">{text}</p>
    </div>
  )
}

// Shows the bridge to the Rust side (src-tauri/src/lib.rs). Add your own commands there and call them
// with invoke(), the same way.
function NativeCheck({ name }: { name: string }) {
  const [reply, setReply] = useState('')
  const ask = () =>
    invoke<string>('greet', { name: name || 'there' })
      .then(setReply)
      .catch(() => setReply('This only works inside the desktop app (npm run tauri dev), not in a browser tab.'))
  return (
    <section className="card settings" style={{ marginTop: 16 }}>
      <div>
        <h2>Desktop side</h2>
        <p className="muted">Calls the Rust function greet() in src-tauri/src/lib.rs.</p>
      </div>
      <div><button className="btn btn-ghost" type="button" onClick={ask}>Say hello from Rust</button></div>
      {reply && <p role="status">{reply}</p>}
    </section>
  )
}
