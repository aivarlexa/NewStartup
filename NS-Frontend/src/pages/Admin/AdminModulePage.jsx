import { useEffect, useState, useRef, useMemo,useContext } from "react"; // 👈 Ensure useRef is here
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileArchive,
  FileText,
  MessageSquare,
  Plus,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import api, { getApiErrorMessage } from "../../services/api";
import { io } from 'socket.io-client';
import AuthContext from "../../context/AuthContext";
// --- REUSABLE STRUCTURAL SHELLS (DYNAMIC WORKSPACE EXTENSION) ---

export const PageShell = ({ title, subtitle, children, action, loading, error }) => (
  <section className="admin-module-page">
    <div className="admin-module-header">
      <div className="admin-page-heading">
        <p>Admin Console</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>
      {!loading && !error && action}
    </div>

    {/* Centralized Dynamic State Handling */}
    {loading ? (
      <div className="admin-module-card state-placeholder" style={{ padding: "3rem", textAlign: "center", color: "#888" }}>
        <div className="spinner" style={{ border: "3px solid #222", borderTop: "3px solid #3b82f6", borderRadius: "50%", width: "24px", height: "24px", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
        <p>Synchronizing operational datastream context...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    ) : error ? (
      <div className="admin-module-card error-placeholder" style={{ padding: "2rem", border: "1px solid #ef4444", borderRadius: "6px", background: "rgba(239, 68, 68, 0.05)", color: "#ef4444" }}>
        <h4>System Pipeline Fault</h4>
        <p style={{ fontSize: "0.9rem", marginTop: "4px", opacity: 0.9 }}>{error}</p>
      </div>
    ) : (
      children
    )}
  </section>
);

export const Pill = ({ children, tone = "cyan" }) => {
  // Map clear visual semantics to match active or suspended parameters smoothly
  const toneMap = {
    green: { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e", border: "1px solid rgba(34, 197, 94, 0.2)" },
    red: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" },
    amber: { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)" },
    cyan: { bg: "rgba(6, 182, 212, 0.1)", color: "#06b6d4", border: "1px solid rgba(6, 182, 212, 0.2)" },
    slate: { bg: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", border: "1px solid rgba(148, 163, 184, 0.2)" }
  };

  const currentStyle = toneMap[tone] || toneMap.cyan;

  return (
    <span
      className={`admin-pill admin-pill-${tone}`}
      style={{
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.72rem",
        fontWeight: "600",
        display: "inline-block",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        ...currentStyle
      }}
    >
      {children}
    </span>
  );
};

export const ActionButton = ({ children, tone = "primary", onClick, disabled }) => (
  <button
    className={`admin-action-button admin-action-${tone}`}
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease-in-out"
    }}
  >
    {children}
  </button>
);

export const Stat = ({ label, value, icon: Icon }) => (
  <div className="admin-module-card admin-mini-stat" style={{ transition: "transform 0.2s ease", cursor: "default" }}>
    <div>
      <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>{label}</p>
      <h3 style={{ margin: "4px 0 0 0", fontSize: "1.75rem", fontWeight: "700" }}>{value}</h3>
    </div>
    <Icon size={24} style={{ opacity: 0.8, color: "#3b82f6" }} />
  </div>
);

/// --- 1. CLIENTS MODULE (LIVE CRUDS WITH PROGRAMMATIC STATE SYNC) ---
// --- 1. CLIENTS MODULE (LIVE CRUDS WITH ADD FORM MODAL) ---
export const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    companyName: "",
    address: ""
  });

  // Modal & Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Required for standard account setup initialization
    companyName: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/clients");
      setClients(data.clients || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load clients."));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SUBMIT HANDLER: POST new client document registry entry
  const handleAddClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/clients", formData);
      if (data.success) {
        alert("Client workspace profile registered successfully.");
        // Dynamically insert the new card into the client state loop layout instantly
        setClients((prev) => [data.client, ...prev]);
        setShowAddModal(false);
        setFormData({ name: "", email: "", password: "", companyName: "", phone: "", address: "" });
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Could not register new client workspace profile."));
    }
  };

  const handleStatusChange = async (clientId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    const originalClientsState = [...clients];

    setClients(prev => prev.map(c => c._id === clientId ? { ...c, status: nextStatus } : c));

    try {
      const { data } = await api.patch(`/admin/clients/${clientId}/status`, { status: nextStatus });
      if (!data.success) throw new Error("Status validation rejected by engine.");
    } catch (err) {
      setClients(originalClientsState);
      alert(getApiErrorMessage(err, "Could not sync status alteration with server."));
    }
  };
 const handleEditSubmit = async () => {
  try {
    await api.put(`/admin/clients/${editForm._id}`, editForm);

    await fetchClients(); // Refresh from server

    setShowEditModal(false);
  } catch (err) {
    alert(getApiErrorMessage(err, "Unable to update client."));
  }
};

  const handleClientDeletion = async (clientId, clientName) => {
    if (!window.confirm(`Are you absolutely sure you want to completely remove ${clientName}?`)) return;
    try {
      const { data } = await api.delete(`/admin/clients/${clientId}`);
      if (data.success) {
        setClients(prev => prev.filter(c => c._id !== clientId));
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to successfully delete client profile entry."));
    }
  };

  if (loading) return <PageShell title="Clients Module"><p>Querying client matrix database...</p></PageShell>;
  if (error) return <PageShell title="Clients Module"><p className="chat-error-banner">{error}</p></PageShell>;

  return (
    <PageShell
      title="Clients Module"
      subtitle="View,  edit, suspend, and manage account ownership."
    // action={<ActionButton onClick={() => setShowAddModal(true)}><Plus size={16} />Add Client</ActionButton>}
    >
      {/* ADD CLIENT POPUP OVERLAY MODAL */}
      {/* {showAddModal && (
        <div className="admin-modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="admin-module-card" style={{ width: "450px", padding: "2rem", background: "#111", borderRadius: "8px", border: "1px solid #333" }}>
            <h2 style={{ marginBottom: "1rem" }}>Register New Client Account</h2>
            <form onSubmit={handleAddClientSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>Full Name <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: "100%", padding: "6px", background: "#222", border: "1px solid #444", color: "#fff" }} /></label>
              <label>Email Address <input required type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: "100%", padding: "6px", background: "#222", border: "1px solid #444", color: "#fff" }} /></label>
              <label>Initial Login Password <input required type="password" name="password" value={formData.password} onChange={handleInputChange} style={{ width: "100%", padding: "6px", background: "#222", border: "1px solid #444", color: "#fff" }} /></label>
              <label>Company Corporate Name <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} style={{ width: "100%", padding: "6px", background: "#222", border: "1px solid #444", color: "#fff" }} /></label>
              <label>Phone Number <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: "100%", padding: "6px", background: "#222", border: "1px solid #444", color: "#fff" }} /></label>
              <label>Office Location Address <input type="text" name="address" value={formData.address} onChange={handleInputChange} style={{ width: "100%", padding: "6px", background: "#222", border: "1px solid #444", color: "#fff" }} /></label>
              
              <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "flex-end" }}>
                <ActionButton tone="ghost" onClick={() => setShowAddModal(false)}>Cancel</ActionButton>
                <button type="submit" className="admin-action-button admin-action-primary">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )} */}
      {showEditModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#111",
        width: "400px",
        padding: "25px",
        borderRadius: "8px",
      }}
    >
      <h2>Edit Client</h2>

      <input
        type="text"
        placeholder="Name"
        value={editForm.name}
        onChange={(e) =>
          setEditForm({ ...editForm, name: e.target.value })
        }
      />

      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={editForm.email}
        onChange={(e) =>
          setEditForm({ ...editForm, email: e.target.value })
        }
      />

      <br /><br />

      <input
        type="text"
        placeholder="Contact Number"
        value={editForm.phone}
        onChange={(e) =>
          setEditForm({ ...editForm, phone: e.target.value })
        }
      />

      <br /><br />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <ActionButton
          tone="ghost"
          onClick={() => setShowEditModal(false)}
        >
          Cancel
        </ActionButton>

      <ActionButton onClick={handleEditSubmit}>
  Save
</ActionButton>
      </div>
    </div>
  </div>
)}

      <div className="admin-card-grid three">
        {clients.map((client) => (
          <article key={client._id} className="admin-module-card" style={{ border: "1px solid var(--border-color)", borderRadius: "6px" }}>
            <div className="admin-card-top">
              <div>
                <h3>{client.name}</h3>
                <p>{client.companyName || "Independent Corporate"} · {client.email}</p>
              </div>
              <Pill tone={client.status === "Active" ? "green" : "red"}>{client.status}</Pill>
            </div>

            <div className="admin-info-list">
              <p>Contact Phone: <b>{client.phone || "Not Verified"}</b></p>
              <p>Project History Count: {client.projectsCount || 0} active</p>
              <p>Office Location: {client.address || "Remote Context"}</p>
            </div>

            <div className="admin-button-row" style={{ marginTop: "1rem", display: "flex", gap: "8px" }}>
              <ActionButton
                tone="ghost"
                onClick={() => {
                  setEditForm({
                    _id: client._id,
                    name: client.name,
                    email: client.email,
                    phone: client.phone || "",
                  });

                  setShowEditModal(true);
                }}
              >
                Edit
              </ActionButton>
              <ActionButton tone="ghost" onClick={() => handleStatusChange(client._id, client.status)}>
                {client.status === "Active" ? "Suspend" : "Activate"}
              </ActionButton>
              <ActionButton tone="ghost" onClick={() => handleClientDeletion(client._id, client.name)}>
                Delete
              </ActionButton>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
};
// --- 2. DEVELOPERS WORKLOAD TABLE ---
export const DevelopersPage = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/developers")
      .then(({ data }) => setDevelopers(data.developers || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Developers Module" subtitle="Track skills, stack, workload, availability, and performance." action={<ActionButton><Plus size={16} />Add Developer</ActionButton>}>
      {loading ? <p>Loading engineers workspace registry...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>{["Developer", "Email", "Tech Stack", "Availability", "Actions"].map((head) => <th key={head}>{head}</th>)}</tr>
            </thead>
            <tbody>
              {developers.map((dev) => (
                <tr key={dev._id}>
                  <td><b>{dev.name}</b></td>
                  <td>{dev.email}</td>
                  <td>{dev.preferredTechnologies?.join(", ") || "General Stack"}</td>
                  <td>
                    <Pill tone={dev.availability === "Available" ? "green" : "amber"}>
                      {dev.availability || "Active"}
                    </Pill>
                  </td>
                  <td><span className="admin-link-text" style={{ cursor: "pointer", color: "#3b82f6" }}>Modify Workflow</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
};

// --- 3. PROJECTS PIPELINE MAPPING (KANBAN COMPONENT WITH MODERN DARK UX) ---
export const ProjectsPage = () => {
  const lanes = ["Planning", "Development", "Testing", "Completed"];
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar State Form
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [checkedDevs, setCheckedDevs] = useState([]);
  const [leadDev, setLeadDev] = useState("");

  useEffect(() => {
    fetchKanbanData();
  }, []);

  const fetchKanbanData = () => {
    Promise.all([api.get("/admin/projects"), api.get("/admin/developers")])
      .then(([{ data: projData }, { data: devData }]) => {
        const fetchedProjects = projData.projects || [];
        setProjects(fetchedProjects);
        setDevelopers(devData.developers || []);
        if (fetchedProjects.length > 0) {
          setSelectedProjectId(fetchedProjects[0]._id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // Pre-fill form values dynamically when switching the target project dropdown
  useEffect(() => {
    if (!selectedProjectId) return;
    const currentProj = projects.find(p => p._id === selectedProjectId);
    if (currentProj) {
      setCheckedDevs(currentProj.team || []);
      setLeadDev(currentProj.lead || "");
    }
  }, [selectedProjectId, projects]);

  const handleCheckboxToggle = (devId) => {
    setCheckedDevs(prev => prev.includes(devId) ? prev.filter(id => id !== devId) : [...prev, devId]);
  };

  // SAVE SUBMIT: Persist team assignment changes
  const executeProjectAssignment = async () => {
    if (!selectedProjectId) return;
    try {
      const { data } = await api.put(`/admin/projects/${selectedProjectId}/assign`, {
        team: checkedDevs,
        lead: leadDev
      });
      if (data.success) {
        setProjects(prev => prev.map(p => p._id === selectedProjectId ? { ...p, team: checkedDevs, lead: leadDev } : p));
        alert("Development team synchronized successfully.");
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Assignment update execution failed."));
    }
  };

  // DRAG AND DROP HANDLERS (DYNAMIC INTERACTIVE MOVING)
  const handleDragStart = (e, projectId) => {
    e.dataTransfer.setData("text/plain", projectId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetLane) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("text/plain");
    if (!projectId) return;

    // Optimistic UI update for immediate visual snap feedback
    const originalProjects = [...projects];
    setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: targetLane } : p));

    try {
      const { data } = await api.patch(`/admin/projects/${projectId}/status`, { status: targetLane });
      if (!data.success) throw new Error("Status validation rejected by engine.");
    } catch (err) {
      console.error(err);
      setProjects(originalProjects); // Revert layout grid if server drops out
      alert(getApiErrorMessage(err, "Failed to update project workflow lane."));
    }
  };

  if (loading) return <PageShell title="Projects Module"><p>Assembling active project kanban branches...</p></PageShell>;

  return (
    <PageShell title="Projects Module" subtitle="Kanban pipeline, assignment modal, milestones, files, comments, meetings, and invoices.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.75rem", alignItems: "start", marginTop: "1rem" }}>

        {/* KANBAN BOARD SYSTEM */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
          {lanes.map((lane) => (
            <section
              key={lane}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, lane)}
              style={{
                background: "#0d1117",
                border: "1px solid #21262d",
                borderRadius: "8px",
                padding: "1rem",
                minHeight: "650px",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid #21262d", paddingBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#c9d1d9", margin: 0 }}>{lane}</h3>
                <span style={{ fontSize: "0.75rem", background: "#21262d", color: "#8b949e", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                  {projects.filter(p => (p.status === "Open" && lane === "Planning" ? "Planning" : p.status || "Planning") === lane).length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", flexGrow: 1 }}>
                {projects
                  .filter((p) => {
                    const currentStatus = p.status || "Planning";
                    if (lane === "Planning") return currentStatus === "Planning" || currentStatus === "Open";
                    return currentStatus === lane;
                  })
                  .map((project) => (
                    <article
                      key={project._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, project._id)}
                      style={{
                        background: "#161b22",
                        border: "1px solid #30363d",
                        padding: "1rem",
                        borderRadius: "6px",
                        cursor: "grab",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.15)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.borderColor = "#58a6ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "#30363d";
                      }}
                    >
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "600", margin: "0 0 6px 0", color: "#f0f6fc", lineHeight: "1.4" }}>
                        {project.projectTitle || project.name}
                      </h4>
                      <p style={{ fontSize: "0.75rem", color: "#8b949e", margin: "0 0 12px 0" }}>
                        Client: <span style={{ color: "#c9d1d9" }}>{project.client?.name || "Independent"}</span>
                      </p>

                      {/* Smooth Progress Tracking Bar */}
                      <div style={{ background: "#21262d", height: "6px", borderRadius: "4px", margin: "8px 0", overflow: "hidden" }}>
                        <div style={{ width: `${project.progress || 15}%`, background: "#1f6feb", height: "100%", borderRadius: "4px" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                        <span style={{ fontSize: "0.75rem", color: "#8b949e" }}>Budget:</span>
                        <span style={{ fontSize: "0.8rem", color: "#58a6ff", fontWeight: "600" }}>{project.budget || "₹0"}</span>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>

        {/* SIDEBAR DYNAMIC WORKSPACE TEAM MANAGEMENT */}
        <aside style={{ background: "#0d1117", border: "1px solid #21262d", padding: "1.25rem", borderRadius: "8px", position: "sticky", top: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "600", color: "#f0f6fc", margin: "0 0 1rem 0" }}>Assign Workspace Team</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", color: "#8b949e" }}>
              Target Project Reference
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ width: "100%", padding: "8px", background: "#161b22", border: "1px solid #30363d", color: "#f0f6fc", borderRadius: "6px", outline: "none" }}
              >
                {projects.map(p => <option key={p._id} value={p._id}>{p.projectTitle || p.name}</option>)}
              </select>
            </label>

            <div>
              <p style={{ fontSize: "0.85rem", color: "#8b949e", margin: "0 0 6px 0" }}>Select Assigned Engineers</p>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #30363d", background: "#161b22", padding: "8px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {developers.map((dev) => (
                  <label key={dev._id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#c9d1d9", cursor: "pointer", padding: "4px", borderRadius: "4px" }}>
                    <input
                      type="checkbox"
                      checked={checkedDevs.includes(dev._id)}
                      onChange={() => handleCheckboxToggle(dev._id)}
                      style={{ cursor: "pointer" }}
                    />
                    {dev.name}
                  </label>
                ))}
              </div>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", color: "#8b949e" }}>
              Designated Project Lead
              <select
                value={leadDev}
                onChange={(e) => setLeadDev(e.target.value)}
                style={{ width: "100%", padding: "8px", background: "#161b22", border: "1px solid #30363d", color: "#f0f6fc", borderRadius: "6px", outline: "none" }}
              >
                <option value="">Choose Lead</option>
                {developers.filter(d => checkedDevs.includes(d._id)).map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </label>

            <ActionButton onClick={executeProjectAssignment} disabled={!selectedProjectId}>
              Save Structural Assignment
            </ActionButton>
          </div>
        </aside>

      </div>
    </PageShell>
  );
};

// --- 4. ANALYTICS & STATISTICAL REPORTS ---
export const ReportsPage = () => {
  const [metrics, setMetrics] = useState({ completed: 0, revenue: "₹0", rate: "0%" });

  useEffect(() => {
    api.get("/admin/analytics-summary")
      .then(({ data }) => setMetrics({
        completed: data.summary?.completedProjects || 0,
        revenue: data.summary?.totalRevenue || "₹0",
        rate: data.summary?.successRate || "100%"
      }))
      .catch(err => console.error(err));
  }, []);

  return (
    <PageShell title="Reports" subtitle="Charts for delivery, revenue, productivity, satisfaction, growth, and success rate.">
      <div className="admin-card-grid three">
        <Stat label="Projects Completed" value={metrics.completed} icon={CheckCircle2} />
        <Stat label="Total Realized Revenue" value={metrics.revenue} icon={BarChart3} />
        <Stat label="Success Accuracy Threshold" value={metrics.rate} icon={ShieldCheck} />
      </div>
      <div className="admin-module-card" style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
        <h3>Core Diagnostic Metrics Representation</h3>
        <div className="admin-chart-bars" style={{ display: "flex", gap: "20px", alignItems: "flex-end", height: "200px", paddingTop: "20px" }}>
          {["Revenue", "Productivity", "Satisfaction", "Growth"].map((label, index) => (
            <div key={label} style={{ flexGrow: 1, textAlign: "center" }}>
              <div style={{ height: `${60 + index * 10}%`, background: "#3b82f6", borderRadius: "4px 4px 0 0" }} />
              <p style={{ fontSize: "0.8rem", marginTop: "8px" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

// Placeholder bindings to keep routing indexes error-free during integration compilation step loops
// --- 5. PROJECT REQUESTS MODULE (LIVE CLIENT SUBMISSIONS) ---
// --- 5. PROJECT REQUESTS MODULE (LIVE CLIENT SUBMISSIONS) ---
export const ProjectRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjectRequests();
  }, []);

  const fetchProjectRequests = async () => {
    try {
      setLoading(true);
      // Fetches all incoming client marketplace submissions/requirements
      const { data } = await api.get("/admin/projects");

      // Filter out items that are pending admin validation or approval if needed,
      // or display all requirements submitted by clients.
      // Assumes new requests have a status like "Pending" or "Open"
      const clientSubmissions = data.projects || [];
      setRequests(clientSubmissions);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load client project submissions."));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (projectId, targetStatus) => {
    try {
      // Fires atomic patch step down onto your backend verification routers
      const { data } = await api.patch(`/admin/projects/${projectId}/status`, { status: targetStatus });
      if (data.success) {
        alert(`Project status successfully modified to ${targetStatus}.`);
        // Update state matrix locally
        setRequests(prev => prev.map(p => p._id === projectId ? { ...p, status: targetStatus } : p));
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update project request status."));
    }
  };

  if (loading) return <PageShell title="Project Requests"><p>Querying client submission channels...</p></PageShell>;
  if (error) return <PageShell title="Project Requests"><p className="chat-error-banner">{error}</p></PageShell>;

  return (
    <PageShell title="Project Requests" subtitle="Approve, reject, or track new client project requirements submissions.">
      {requests.length === 0 ? (
        <div className="admin-module-card" style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#888", fontStyle: "italic" }}>No custom client project requirements found in the tracking database.</p>
        </div>
      ) : (
        <div className="admin-card-grid three">
          {requests.map((request) => (
            <article key={request._id} className="admin-module-card" style={{ border: "1px solid var(--border-color)", borderRadius: "6px", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <Pill tone={
                  request.status === "Open" ? "green" :
                    request.status === "Pending" ? "amber" : "slate"
                }>
                  {request.status || "Pending Review"}
                </Pill>
              </div>

              <h3 style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>{request.projectTitle || request.name || "Untitled Requirement"}</h3>

              <div className="admin-info-list" style={{ margin: "1rem 0", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                <p>Client Owner: <b>{request.client?.name || "Unknown Corporate User"}</b></p>
                <p>Company Ref: <span>{request.client?.companyName || "N/A"}</span></p>
                <p>Budget Allotted: <b style={{ color: "#22c55e" }}>{request.budget || "Not Stated"}</b></p>
                {request.description && (
                  <p style={{ color: "#aaa", marginTop: "6px", fontSize: "0.8rem", lineBreak: "anywhere" }}>
                    <b>Brief:</b> {request.description.substring(0, 100)}{request.description.length > 100 ? "..." : ""}
                  </p>
                )}
              </div>

              <div className="admin-button-row" style={{ marginTop: "1rem", display: "flex", gap: "8px" }}>
                {request.status !== "Assigned" && request.status !== "Completed" && (
                  <>
                    <ActionButton tone="success" onClick={() => handleUpdateStatus(request._id, "Open")}>
                      Approve
                    </ActionButton>
                    <ActionButton tone="danger" onClick={() => handleUpdateStatus(request._id, "Rejected")}>
                      Reject
                    </ActionButton>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

// --- 6. TEAMS MODULE (ACTIVE PROJECT SQUADS) ---
export const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/projects")
      .then(({ data }) => {
        // Filter out projects that have an assigned team
        const activeProjects = data.projects || [];
        const projectsWithTeams = activeProjects.filter(
          (p) => p.team && p.team.length > 0
        );
        setTeams(projectsWithTeams);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load active team matrices.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      title="Teams Module"
      subtitle="View operational development squads allocated to approved client projects."
      loading={loading}
      error={error}
    >
      {teams.length === 0 ? (
        <div className="admin-module-card" style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "#888", fontStyle: "italic" }}>No active developer allocations found. Assign a team inside the Projects Module.</p>
        </div>
      ) : (
        <div className="admin-card-grid two" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem", marginTop: "1rem" }}>
          {teams.map((project) => (
            <article
              key={project._id}
              style={{
                background: "#0d1117",
                border: "1px solid #21262d",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.15)"
              }}
            >
              {/* Header Context Banner */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #21262d", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", color: "#f0f6fc", fontSize: "1.1rem" }}>
                    {project.projectTitle || project.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#8b949e" }}>
                    Client: <span style={{ color: "#c9d1d9" }}>{project.client?.name || "Independent"}</span>
                  </p>
                </div>
                <Pill tone="green">{project.status || "Development"}</Pill>
              </div>

              {/* Team Roster Grid Layout */}
              <div>
                <p style={{ fontSize: "0.85rem", color: "#8b949e", margin: "0 0 0.5rem 0" }}>Assembled Engineers:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {project.team.map((member) => {
                    // Check if member is populated as an object or fallback to ID string
                    const isLead = project.lead && (project.lead._id || project.lead) === (member._id || member);
                    const memberName = member.name || "Engineer Reference";

                    return (
                      <span
                        key={member._id || member}
                        style={{
                          background: isLead ? "rgba(31, 111, 235, 0.15)" : "#161b22",
                          color: isLead ? "#58a6ff" : "#c9d1d9",
                          border: isLead ? "1px solid #1f6feb" : "1px solid #30363d",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: isLead ? "600" : "normal"
                        }}
                      >
                        {memberName} {isLead && "👑 (Lead)"}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Progress Footnote */}
              <div style={{ marginTop: "1.25rem", paddingTop: "0.75rem", borderTop: "1px dashed #21262d", display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#8b949e" }}>
                <span>Sprint Progress: <b>{project.progress || 0}%</b></span>
                <span>Budget Allocation: <b style={{ color: "#58a6ff" }}>{project.budget || "TBD"}</b></span>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
};

// --- 7. MESSAGES MODULE (ADMIN INTER-ROLE SYSTEM COMMUNICATION) ---
export const MessagesPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all potential conversation targets (Clients & Developers)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const [{ data: clientData }, { data: devData }] = await Promise.all([
          api.get("/admin/clients"),
          api.get("/admin/developers")
        ]);

        const combined = [
          ...(clientData.clients || []).map(u => ({ ...u, type: "Client" })),
          ...(devData.developers || []).map(u => ({ ...u, type: "Developer" }))
        ];
        setUsers(combined);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to compile messaging directory roster."));
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch message thread whenever a target profile user is selected
  useEffect(() => {
    if (!selectedUser) return;
    const fetchChatThread = async () => {
      try {
        setLoadingChat(true);
        const { data } = await api.get(`/admin/messages/${selectedUser._id}`);
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Chat parsing failure:", err);
      } finally {
        setLoadingChat(false);
      }
    };
    fetchChatThread();
  }, [selectedUser]);

  // Submit messaging text context directly onto server routes
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const { data } = await api.post(`/admin/messages/${selectedUser._id}`, {
        text: newMessage
      });
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage("");
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to transmit text body payload structure."));
    }
  };


  return (
    <PageShell
      title="Messaging Board"
      subtitle="Secure communication pipeline routing matrix logs across active ecosystem user instances."
      loading={loadingUsers}
      error={error}
    >
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.25rem", height: "600px", marginTop: "1rem" }}>

        {/* LEFT DIRECTORY COLUMN */}
        <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: "8px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid #21262d" }}>
            <h3 style={{ fontSize: "0.9rem", color: "#c9d1d9", margin: 0 }}>Active Core Directories</h3>
          </div>
          <div style={{ flexGrow: 1, overflowY: "auto", padding: "0.5rem" }}>
            {users.map(u => (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                style={{
                  padding: "0.75rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: selectedUser?._id === u._id ? "#1f6feb" : "transparent",
                  color: selectedUser?._id === u._id ? "#fff" : "#c9d1d9",
                  marginBottom: "4px",
                  transition: "background 0.2s"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "0.85rem" }}>{u.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", opacity: 0.8, marginTop: "2px" }}>
                  <span>{u.companyName || "Independent"}</span>
                  <span style={{ color: selectedUser?._id === u._id ? "#fff" : u.type === "Client" ? "#a78bfa" : "#58a6ff" }}>
                    {u.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CONVERSATION PANE CONTAINER */}
        <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: "8px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {selectedUser ? (
            <>
              {/* Active Conversation Title Header */}
              <div style={{ padding: "1rem", borderBottom: "1px solid #21262d", background: "#161b22", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: 0, color: "#f0f6fc", fontSize: "0.95rem" }}>{selectedUser.name}</h4>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#8b949e" }}>{selectedUser.email}</p>
                </div>
                <Pill tone={selectedUser.type === "Client" ? "amber" : "cyan"}>{selectedUser.type}</Pill>
              </div>

              {/* Chat Messages Scrolling Context */}
              <div style={{ flexGrow: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "10px", background: "#090d13" }}>
                {loadingChat ? (
                  <p style={{ color: "#8b949e", fontStyle: "italic", textAlign: "center" }}>Loading communication logs...</p>
                ) : messages.length === 0 ? (
                  <p style={{ color: "#8b949e", fontStyle: "italic", textAlign: "center", marginTop: "2rem" }}>No structural message thread recorded. Start a new interaction line below.</p>
                ) : (
                  <>
                    {messages.map((m) => {
                      // Extract the raw sender ID string regardless of whether it's populated or an object ID
                      const senderIdStr = String(m.sender?._id || m.sender || "");
                      const targetUserIdStr = String(selectedUser?._id || selectedUser?.id || "");

                      // 👑 CORRECT CHECK: If the sender ID matches the active Client/Developer ID, it's incoming (left). 
                      // Otherwise, it was sent by You/Admin (right).
                      const isAdminSender = senderIdStr !== targetUserIdStr;

                      return (
                        <div
                          key={m._id || m.id || Math.random()}
                          style={{
                            alignSelf: isAdminSender ? "flex-end" : "flex-start",
                            background: isAdminSender ? "#1f6feb" : "#21262d",
                            color: "#f0f6fc",
                            padding: "8px 12px",
                            borderRadius: isAdminSender ? "12px 12px 0 12px" : "12px 12px 12px 0",
                            maxWidth: "65%",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            transition: "transform 0.2s ease"
                          }}
                        >
                          <p style={{ margin: 0, fontSize: "0.85rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</p>
                          <small style={{ fontSize: "0.65rem", display: "block", textAlign: "right", marginTop: "4px", opacity: 0.7 }}>
                            {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                          </small>
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Action Form Tray */}
              <form onSubmit={handleSendMessage} style={{ padding: "1rem", background: "#161b22", borderTop: "1px solid #21262d", display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Type an analytical response tracking line to ${selectedUser.name}...`}
                  style={{ flexGrow: 1, padding: "10px", background: "#0d1117", border: "1px solid #30363d", color: "#f0f6fc", borderRadius: "6px", outline: "none" }}
                />
                <button
                  type="submit"
                  className="admin-action-button admin-action-primary"
                  style={{ padding: "0 1.25rem", cursor: "pointer" }}
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", color: "#8b949e" }}>
              <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
              <p style={{ margin: 0, fontSize: "0.9rem" }}>Select a target workspace account instance context directory to initialize secure chat routing links.</p>
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
};

// --- 8. NOTIFICATIONS MODULE (ADMIN WORKSPACE ALERTS) ---
// --- 8. NOTIFICATIONS MODULE (ADMIN WORKSPACE ALERTS) ---
export const NotificationsPage = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const socketRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 1. Real-time Socket.io Listener for Admin Notifications
  useEffect(() => {
    if (!token) return undefined;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    
    // 👑 FIX 1: Use 'polling' first to stabilize initial handshake before upgrading to WebSockets
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    socketRef.current = socket;

    // Join Admin Role Socket Room
    socket.emit('room:join', 'role:Admin');

    // Listen for live admin notifications
    socket.on('notification:new', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    // 👑 FIX 2: Explicitly remove listeners before disconnecting to prevent memory leaks
    return () => {
      socket.off('notification:new');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/admin/notifications");
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to fetch workspace system alerts."));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    try {
      await api.patch(`/admin/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
      fetchNotifications();
    }
  };

  const handleClearNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try {
      await api.delete(`/admin/notifications/${id}`);
    } catch (err) {
      console.error("Failed to scrub alert document instance:", err);
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.post("/admin/notifications/mark-all-read");
    } catch (err) {
      console.error("Failed to bundle patch system alerts:", err);
      fetchNotifications();
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filter === "Unread") return !n.read;
      if (filter === "Read") return n.read;
      return true;
    });
  }, [notifications, filter]);

  return (
    <PageShell
      title="Notifications Updates"
      subtitle="Monitor ecosystem log telemetry, client submissions, and project lane updates live."
      loading={loading}
      error={error}
      action={
        notifications.some(n => !n.read) && (
          <ActionButton tone="ghost" onClick={handleMarkAllRead}>
            Mark All as Read
          </ActionButton>
        )
      }
    >
      <div style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: '8px', overflow: 'hidden', marginTop: "1rem" }}>
        
        {/* Controls and Filter Header Tab Matrix */}
        <div style={{ padding: "1rem", borderBottom: "1px solid #21262d", background: "#161b22", display: "flex", gap: "8px" }}>
          {["All", "Unread", "Read"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                background: filter === type ? "#1f6feb" : "#21262d",
                color: "#f0f6fc",
                border: "1px solid #30363d",
                padding: "6px 14px",
                borderRadius: "4px",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: "600",
                transition: "background 0.2s"
              }}
            >
              {type} ({type === "All" ? notifications.length : type === "Unread" ? notifications.filter(n => !n.read).length : notifications.filter(n => n.read).length})
            </button>
          ))}
        </div>

        {/* Dynamic Notification Row Lists */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#8b949e", fontStyle: "italic" }}>
              No real-time system tracking metrics found matching filter bounds.
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1rem",
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid #21262d",
                  background: notif.read ? "transparent" : "rgba(31, 111, 235, 0.03)",
                  transition: "background 0.2s",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {!notif.read && (
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1f6feb", display: "inline-block" }} />
                    )}
                    <strong style={{ color: "#f0f6fc", fontSize: "0.9rem" }}>{notif.title}</strong>
                    <Pill tone={
                      notif.type === "Project Updates" ? "cyan" : 
                      notif.type === "New Message" ? "green" : "amber"
                    }>
                      {notif.type || "System Log"}
                    </Pill>
                  </div>
                  <p style={{ margin: "4px 0 0 0", color: "#c9d1d9", fontSize: "0.85rem", opacity: notif.read ? 0.7 : 1 }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: "0.72rem", color: "#8b949e", display: "block", marginTop: "6px" }}>
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      style={{ background: "#161b22", border: "1px solid #30363d", color: "#58a6ff", padding: "4px 10px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleClearNotification(notif._id)}
                    style={{ background: "transparent", border: "none", color: "#f85149", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
};

export const TasksPage = () => <PageShell title="Task Management"><p>Task assignments mapping available...</p></PageShell>;
export const CalendarPage = () => <PageShell title="Calendar View"><p>Loading tracking timeline grid engine...</p></PageShell>;


export const InvoicesPage = () => <PageShell title="Invoices Management"><p>PDF compilation matrices active...</p></PageShell>;
export const FileManagerPage = () => <PageShell title="Secure File Manager"><p>S3 Bucket object key validation links online...</p></PageShell>;
export const SettingsPage = () => <PageShell title="Roles & Audit Security"><p>System authentication matrices operational...</p></PageShell>;