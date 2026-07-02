import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://127.0.0.1:8000/api"

const MOTIVATIONAL_QUOTES = [
  "Your tasks won't complete themselves.",
  "One task at a time. You've got this.",
  "Focus is the new superpower.",
  "Done is better than perfect.",
  "Small progress is still progress.",
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function formatDueDate(dateStr) {
  if (!dateStr) return "no date set"
  const d = new Date(dateStr)
  const dateOptions = { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }
  const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }
  return `${d.toLocaleDateString("en-IN", dateOptions)}, ${d.toLocaleTimeString("en-IN", timeOptions)}`
}

function getCountdown(dateStr) {
  if (!dateStr) return null
  const due = new Date(dateStr)
  const now = new Date()
  const diffMs = due - now

  if (diffMs <= 0) return { text: "Overdue", expired: true }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return { text: `${days}d ${hours}h left`, expired: false }
  if (hours > 0) return { text: `${hours}h ${minutes}m left`, expired: false }
  if (minutes > 0) return { text: `${minutes}m ${seconds}s left`, expired: false }
  return { text: `${seconds}s left`, expired: false }
}

function WelcomeScreen({ tasks, onEnter }) {
  const pending = tasks.filter(t => !t.is_completed)
  const completed = tasks.filter(t => t.is_completed)
  const dueToday = pending.filter(t => t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString())
  const total = tasks.length
  const progress = total === 0 ? 0 : Math.round((completed.length / total) * 100)
  const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length]

  return (
    <div style={{
      minHeight: "100vh", background: "#fafaf9", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: 40, position: "relative", overflow: "hidden"
    }}>
      {/* Background circles */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "#1a1a1a", opacity: 0.03, top: -200, right: -150, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "#1a1a1a", opacity: 0.03, bottom: -100, left: -80, pointerEvents: "none" }} />

      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, animation: "fadeIn 0.6s ease both" }}>
        <div style={{ width: 42, height: 42, background: "#1a1a1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 700, animation: "pulse 2s ease infinite" }}>T</div>
        <span style={{ fontSize: 22, fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.02em" }}>TaskFlow AI</span>
      </div>

      {/* Quote */}
      <h1 style={{ fontSize: 28, fontWeight: 600, color: "#1a1a1a", textAlign: "center", maxWidth: 420, lineHeight: 1.35, marginBottom: 10, animation: "fadeUp 0.7s ease 0.2s both" }}>
        {quote}
      </h1>
      <p style={{ fontSize: 15, color: "#71717a", textAlign: "center", marginBottom: 36, animation: "fadeUp 0.7s ease 0.35s both" }}>
        {getGreeting()}, User — let's get things done today.
      </p>

      {/* Stat pills */}
      <div style={{ display: "flex", gap: 12, marginBottom: 36, animation: "fadeUp 0.7s ease 0.5s both" }}>
        {[
          { num: pending.length, label: "Pending", color: "#1a1a1a", borderColor: "#e5e5e3" },
          { num: dueToday.length, label: "Due today", color: "#dc2626", borderColor: "#ffd6d3" },
          { num: completed.length, label: "Completed", color: "#15803d", borderColor: "#bbf7d0" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", border: `0.5px solid ${s.borderColor}`, borderRadius: 8, padding: "16px 24px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: s.color, marginBottom: 3 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: 340, animation: "fadeUp 0.7s ease 0.65s both", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "#71717a" }}>Today's progress</span>
          <strong style={{ fontSize: 12, color: "#1a1a1a" }}>{completed.length} of {total} done</strong>
        </div>
        <div style={{ height: 6, background: "#f0f0ef", borderRadius: 10, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "#1a1a1a", borderRadius: 10,
            width: `${progress}%`, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)"
          }} />
        </div>
      </div>

      {/* Enter button */}
      <button onClick={onEnter} style={{
        height: 46, padding: "0 36px", background: "#1a1a1a", color: "white", border: "none",
        borderRadius: 6, fontSize: 15, fontWeight: 500, cursor: "pointer",
        fontFamily: "inherit", letterSpacing: "0.01em", animation: "fadeUp 0.7s ease 0.8s both"
      }}>
        Let's go →
      </button>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }
      `}</style>
    </div>
  )
}

function MainApp({ tasks, setTasks }) {
  const [input, setInput] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [, forceTick] = useState(0)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const interval = setInterval(() => forceTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    const res = await axios.get(`${API}/tasks/`)
    setTasks(res.data)
  }

  const handleParse = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    try {
      await axios.post(`${API}/tasks/parse/`, { text: input })
      setInput("")
      await fetchTasks()
      showToast("Task added successfully", "success")
    } catch (e) {
      showToast("Failed to add task", "error")
    }
    setLoading(false)
  }

  const handleSummary = async () => {
    setSummaryLoading(true)
    const res = await axios.get(`${API}/tasks/summary/`)
    setSummary(res.data.summary)
    setSummaryLoading(false)
  }

  const toggleComplete = async (task) => {
    await axios.patch(`${API}/tasks/${task.id}/`, { is_completed: !task.is_completed })
    fetchTasks()
    showToast(task.is_completed ? "Task marked as pending" : "Task completed", "success")
  }

  const deleteTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}/`)
    fetchTasks()
    showToast("Task deleted", "error")
  }

  const priorityMeta = (p) => {
    if (p === "high") return { label: "High", color: "#dc2626", bg: "#fff1f0", border: "#ffd6d3" }
    if (p === "medium") return { label: "Medium", color: "#b45309", bg: "#fffbeb", border: "#fde68a" }
    return { label: "Low", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }
  }

  const pending = tasks.filter(t => !t.is_completed)
  const completed = tasks.filter(t => t.is_completed)
  const dueToday = pending.filter(t => formatDueDate(t.due_date) === new Date().toISOString().split("T")[0])
  const total = tasks.length
  const progress = total === 0 ? 0 : Math.round((completed.length / total) * 100)

  const filtered = filter === "high" ? pending.filter(t => t.priority === "high")
    : filter === "medium" ? pending.filter(t => t.priority === "medium")
    : filter === "low" ? pending.filter(t => t.priority === "low")
    : pending

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Topbar */}
      <header style={{ background: "white", borderBottom: "0.5px solid #e5e5e3", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "#1a1a1a", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>T</div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", letterSpacing: "-0.01em" }}>TaskFlow AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, color: "#71717a" }}>{pending.length} pending · {completed.length} completed</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a1a1a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>S</div>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex" }}>

        {/* Sidebar */}
        <aside style={{ width: 220, background: "white", borderRight: "0.5px solid #e5e5e3", padding: "20px 14px", flexShrink: 0 }}>

          {/* Greeting */}
          <div style={{ background: "#fafaf9", border: "0.5px solid #e5e5e3", borderRadius: 8, padding: "14px 16px", marginBottom: 18 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 3 }}>{getGreeting()}, User</p>
            <p style={{ fontSize: 12, color: "#71717a" }}>
              {pending.length === 0 ? "All caught up!" : `${pending.length} task${pending.length > 1 ? "s" : ""} remaining`}
            </p>
            {/* Mini progress */}
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#71717a" }}>Progress</span>
                <span style={{ fontSize: 11, color: "#1a1a1a", fontWeight: 500 }}>{progress}%</span>
              </div>
              <div style={{ height: 4, background: "#f0f0ef", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "#1a1a1a", borderRadius: 10, transition: "width 0.6s ease" }} />
              </div>
            </div>
          </div>

          <p style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, paddingLeft: 6 }}>Views</p>
          {[
            { key: "all", label: "All tasks", count: pending.length },
            { key: "high", label: "High priority", count: pending.filter(t => t.priority === "high").length },
            { key: "medium", label: "Medium priority", count: pending.filter(t => t.priority === "medium").length },
            { key: "low", label: "Low priority", count: pending.filter(t => t.priority === "low").length },
          ].map(v => (
            <div key={v.key} onClick={() => setFilter(v.key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 8px", borderRadius: 5, cursor: "pointer", marginBottom: 2, background: filter === v.key ? "#f5f5f4" : "transparent" }}>
              <span style={{ fontSize: 13, color: filter === v.key ? "#1a1a1a" : "#52525b", fontWeight: filter === v.key ? 500 : 400 }}>{v.label}</span>
              {v.count > 0 && <span style={{ fontSize: 11, color: "#71717a", background: "#f5f5f4", border: "0.5px solid #e5e5e3", borderRadius: 10, padding: "1px 7px" }}>{v.count}</span>}
            </div>
          ))}

          <div style={{ height: "0.5px", background: "#e5e5e3", margin: "12px 0" }} />
          <p style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, paddingLeft: 6 }}>Done</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 8px", borderRadius: 5 }}>
            <span style={{ fontSize: 13, color: "#52525b" }}>Completed</span>
            {completed.length > 0 && <span style={{ fontSize: 11, color: "#15803d", background: "#f0fdf4", border: "0.5px solid #bbf7d0", borderRadius: 10, padding: "1px 7px" }}>{completed.length}</span>}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { num: pending.length, label: "Pending tasks", color: "#1a1a1a", borderColor: "#e5e5e3" },
              { num: dueToday.length, label: "Due today", color: dueToday.length > 0 ? "#dc2626" : "#1a1a1a", borderColor: dueToday.length > 0 ? "#ffd6d3" : "#e5e5e3", sub: dueToday.length > 0 ? "Needs attention" : null },
              { num: completed.length, label: "Completed", color: "#15803d", borderColor: completed.length > 0 ? "#bbf7d0" : "#e5e5e3" },
            ].map(s => (
              <div key={s.label} style={{ background: "white", border: `0.5px solid ${s.borderColor}`, borderRadius: 8, padding: "18px 20px" }}>
                <div style={{ fontSize: 30, fontWeight: 600, color: s.color, marginBottom: 4 }}>{s.num}</div>
                <div style={{ fontSize: 13, color: "#71717a" }}>{s.label}</div>
                {s.sub && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* Input card */}
          <div style={{ background: "white", border: "0.5px solid #e5e5e3", borderRadius: 8, padding: "18px 22px" }}>
            <p style={{ fontSize: 12, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Add task in natural language</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleParse()}
                placeholder="e.g. finish DSA assignment by tomorrow, it's urgent"
                style={{ flex: 1, height: 44, padding: "0 14px", border: "0.5px solid #a1a1aa", borderRadius: 6, fontSize: 14, color: "#1a1a1a", background: "#fafaf9", outline: "none", fontFamily: "inherit" }}
              />
              <button onClick={handleParse} disabled={loading} style={{ height: 44, padding: "0 22px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {loading ? "Adding…" : "Add task"}
              </button>
              <button onClick={handleSummary} disabled={summaryLoading} style={{ height: 44, padding: "0 18px", background: "white", color: "#525252", border: "0.5px solid #a1a1aa", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {summaryLoading ? "Loading…" : "AI summary"}
              </button>
            </div>
          </div>

          {/* AI Summary */}
          {summary && (
            <div style={{ background: "white", border: "0.5px solid #e5e5e3", borderLeft: "3px solid #1a1a1a", borderRadius: "0 6px 6px 0", padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", marginTop: 2 }}>AI</span>
              <p style={{ fontSize: 14, color: "#525252", lineHeight: 1.65 }}>{summary}</p>
            </div>
          )}

          {/* Pending tasks */}
          {filtered.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                {filter === "all" ? "Pending" : `${filter} priority`} · {filtered.length}
              </p>
              {filtered.map(task => {
                const p = priorityMeta(task.priority)
                return (
                  <div key={task.id} style={{ background: "white", border: "0.5px solid #e5e5e3", borderRadius: 7, padding: "14px 18px", marginBottom: 6, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a", margin: 0 }}>{task.title}</p>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: p.bg, color: p.color, border: `0.5px solid ${p.border}`, fontWeight: 500, flexShrink: 0 }}>{p.label}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#71717a", margin: "0 0 8px" }}>{task.description}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontSize: 12, color: "#a1a1aa", margin: 0 }}>Due {formatDueDate(task.due_date)}</p>
                      {task.due_date && (() => {
                        const c = getCountdown(task.due_date)
                        return (
                          <span style={{
                            fontSize: 11, padding: "2px 8px", borderRadius: 3, fontWeight: 500,
                            background: c.expired ? "#fff1f0" : "#f5f5f4",
                            color: c.expired ? "#dc2626" : "#52525b",
                            border: `0.5px solid ${c.expired ? "#ffd6d3" : "#e5e5e3"}`
                          }}>
                            {c.text}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => toggleComplete(task)} style={{ height: 32, padding: "0 14px", fontSize: 13, color: "#525252", background: "white", border: "0.5px solid #e5e5e3", borderRadius: 5, cursor: "pointer", fontFamily: "inherit" }}>Mark done</button>
                      <button onClick={() => deleteTask(task.id)} style={{ width: 32, height: 32, fontSize: 15, color: "#a1a1aa", background: "white", border: "0.5px solid #e5e5e3", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filtered.length === 0 && pending.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#a1a1aa" }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>✓</p>
              <p style={{ fontSize: 14, marginBottom: 4, color: "#71717a", fontWeight: 500 }}>All done for today</p>
              <p style={{ fontSize: 13, color: "#a1a1aa" }}>Add a new task above to keep going</p>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && filter === "all" && (
            <div>
              <div style={{ height: "0.5px", background: "#e5e5e3", margin: "4px 0 14px" }} />
              <p style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Completed · {completed.length}</p>
              {completed.map(task => (
                <div key={task.id} style={{ background: "white", border: "0.5px solid #f5f5f4", borderRadius: 7, padding: "12px 18px", marginBottom: 5, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.5 }}>
                  <div>
                    <p style={{ fontSize: 14, color: "#71717a", textDecoration: "line-through", margin: "0 0 3px" }}>{task.title}</p>
                    <p style={{ fontSize: 12, color: "#a1a1aa", margin: 0 }}>Due {formatDueDate(task.due_date) || "no date"}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggleComplete(task)} style={{ height: 30, padding: "0 12px", fontSize: 12, color: "#15803d", background: "#f0fdf4", border: "0.5px solid #bbf7d0", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}>✓ Done</button>
                    <button onClick={() => deleteTask(task.id)} style={{ width: 30, height: 30, fontSize: 15, color: "#a1a1aa", background: "white", border: "0.5px solid #e5e5e3", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "0.5px solid #e5e5e3", padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white" }}>
        <span style={{ fontSize: 12, color: "#a1a1aa" }}>© 2026 Suresh · TaskFlow AI</span>
        <span style={{ fontSize: 12, color: "#a1a1aa" }}>Built with Django, React and Groq LLaMA 3.3</span>
      </footer>

       {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 1000,
          background: toast.type === "success" ? "#1a1a1a" : "#dc2626",
          color: "white", padding: "12px 18px", borderRadius: 8,
          fontSize: 13, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          animation: "slideIn 0.3s ease both", display: "flex", alignItems: "center", gap: 8
        }}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
    

export default function App() {
  const [tasks, setTasks] = useState([])
  const [showWelcome, setShowWelcome] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    axios.get(`${API}/tasks/`).then(res => {
      setTasks(res.data)
      setLoaded(true)
    })
    const timer = setTimeout(() => setShowWelcome(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#fafaf9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, background: "#1a1a1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: 700, margin: "0 auto 12px" }}>T</div>
        <p style={{ fontSize: 13, color: "#71717a" }}>Loading…</p>
      </div>
    </div>
  )

  if (showWelcome) return <WelcomeScreen tasks={tasks} onEnter={() => setShowWelcome(false)} />

  return <MainApp tasks={tasks} setTasks={setTasks} />
}