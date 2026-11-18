import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, Search, CheckCircle2, Clock3, ListTodo, AlertCircle, Pencil,
  Trash2, X, CalendarDays, Filter, RefreshCw, ClipboardList
} from "lucide-react";
import { taskApi } from "./api";

const emptyForm = {
  title: "", description: "", status: "Pending", priority: "Medium",
  category: "General", dueDate: ""
};

function formatDate(value) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        search,
        status: statusFilter === "All" ? "" : statusFilter,
        priority: priorityFilter === "All" ? "" : priorityFilter
      };
      const result = await taskApi.getAll(params);
      setTasks(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "Pending").length,
    progress: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length
  }), [tasks]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditingId(task._id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "Pending",
      priority: task.priority || "Medium",
      category: task.category || "General",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""
    });
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, title: form.title.trim(), dueDate: form.dueDate || null };
      if (editingId) {
        await taskApi.update(editingId, payload);
        setNotice("Task updated successfully.");
      } else {
        await taskApi.create(payload);
        setNotice("Task created successfully.");
      }
      setModalOpen(false);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      await taskApi.remove(task._id);
      setNotice("Task deleted successfully.");
      await loadTasks();
    } catch (err) { setError(err.message); }
  }

  async function changeStatus(task, status) {
    try {
      await taskApi.update(task._id, { status });
      setNotice("Task status updated.");
      await loadTasks();
    } catch (err) { setError(err.message); }
  }

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><ListTodo size={22} /></span><span>TaskFlow</span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active"><ClipboardList size={18} /> All tasks</div>
        <div className="side-note">
          <div className="note-icon"><CheckCircle2 size={18} /></div>
          <strong>Stay on track</strong>
          <p>Small steps every day lead to big results.</p>
        </div>
        <div className="sidebar-footer"><span className="online-dot" /> Workspace ready</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><div className="eyebrow">YOUR WORKSPACE</div><h1>Task overview</h1></div>
          <button className="primary-btn" onClick={openCreate}><Plus size={18} /> Add new task</button>
        </header>

        <section className="welcome-row">
          <div><h2>Make today productive.</h2><p>Organise your work, focus on priorities, and get things done.</p></div>
          <div className="today-pill"><CalendarDays size={16} /> {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}</div>
        </section>

        <section className="stats-grid">
          <StatCard icon={<ListTodo />} label="Total tasks" value={stats.total} tone="violet" />
          <StatCard icon={<Clock3 />} label="Pending" value={stats.pending} tone="amber" />
          <StatCard icon={<RefreshCw />} label="In progress" value={stats.progress} tone="blue" />
          <StatCard icon={<CheckCircle2 />} label="Completed" value={stats.completed} tone="green" />
        </section>

        <section className="tasks-panel">
          <div className="panel-heading"><div><h2>My tasks</h2><p>Manage and track all your activities</p></div><span className="task-count">{tasks.length} shown</span></div>
          <div className="toolbar">
            <div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." /></div>
            <div className="filter-control"><Filter size={16} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All</option><option>Pending</option><option>In Progress</option><option>Completed</option></select></div>
            <select className="priority-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}><option value="All">All priorities</option><option>High</option><option>Medium</option><option>Low</option></select>
            <button className="icon-btn refresh-btn" title="Refresh tasks" onClick={loadTasks}><RefreshCw size={17} /></button>
          </div>

          {notice && <div className="notice"><CheckCircle2 size={16} /> {notice}</div>}
          {error && <div className="error-banner"><AlertCircle size={17} /> {error}<button onClick={() => setError("")}><X size={15} /></button></div>}

          {loading ? <div className="empty-state"><div className="spinner" />Loading tasks...</div> :
            tasks.length === 0 ? <div className="empty-state"><div className="empty-icon"><ClipboardList size={28} /></div><h3>No tasks found</h3><p>Create your first task or change the filters.</p><button className="secondary-btn" onClick={openCreate}><Plus size={16} /> Create a task</button></div> :
            <div className="task-list">
              {tasks.map((task) => <article className="task-card" key={task._id}>
                <div className="task-main">
                  <div className={`task-check ${task.status === "Completed" ? "checked" : ""}`} onClick={() => changeStatus(task, task.status === "Completed" ? "Pending" : "Completed")} role="button" tabIndex="0" aria-label="Toggle completed" onKeyDown={(e) => e.key === "Enter" && changeStatus(task, task.status === "Completed" ? "Pending" : "Completed")}>{task.status === "Completed" && <CheckCircle2 size={18} />}</div>
                  <div className="task-copy"><h3 className={task.status === "Completed" ? "task-done" : ""}>{task.title}</h3>{task.description && <p>{task.description}</p>}<div className="task-meta"><span className="category-tag">{task.category || "General"}</span><span><CalendarDays size={13} /> {formatDate(task.dueDate)}</span></div></div>
                </div>
                <div className="task-actions">
                  <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  <select className={`status-select ${task.status.toLowerCase().replace(" ", "-")}`} value={task.status} onChange={(e) => changeStatus(task, e.target.value)} aria-label="Task status"><option>Pending</option><option>In Progress</option><option>Completed</option></select>
                  <button className="icon-btn" title="Edit task" onClick={() => openEdit(task)}><Pencil size={16} /></button>
                  <button className="icon-btn delete-btn" title="Delete task" onClick={() => deleteTask(task)}><Trash2 size={16} /></button>
                </div>
              </article>)}
            </div>
          }
        </section>
        <footer className="footer">TaskFlow <span>·</span> AWT Mini Project <span>·</span> React, Express & MongoDB Atlas</footer>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModalOpen(false)}>
        <form className="task-modal" onSubmit={handleSubmit}>
          <div className="modal-heading"><div><div className="eyebrow">{editingId ? "UPDATE DETAILS" : "NEW ITEM"}</div><h2>{editingId ? "Edit task" : "Create a task"}</h2></div><button type="button" className="icon-btn" onClick={() => setModalOpen(false)}><X size={19} /></button></div>
          <label>Task title <span>*</span><input autoFocus required maxLength="100" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete project report" /></label>
          <label>Description<textarea rows="3" maxLength="1000" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add a few details..." /></label>
          <div className="form-grid">
            <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Pending</option><option>In Progress</option><option>Completed</option></select></label>
            <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label>
            <label>Category<input maxLength="40" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" /></label>
            <label>Due date<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
          </div>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-btn" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Create task"}</button></div>
        </form>
      </div>}
    </div>
  );
}

function StatCard({ icon, label, value, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong></div></div>;
}

export default App;
