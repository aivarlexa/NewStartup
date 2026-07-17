import { useEffect, useState } from "react";
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

// --- REUSABLE STRUCTURAL SHELLS ---

const PageShell = ({ title, subtitle, children, action }) => (
  <section className="admin-module-page">
    <div className="admin-module-header">
      <div className="admin-page-heading">
        <p>Admin Console</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const Pill = ({ children, tone = "cyan" }) => (
  <span className={`admin-pill admin-pill-${tone}`}>{children}</span>
);

const ActionButton = ({ children, tone = "primary", onClick, disabled }) => (
  <button 
    className={`admin-action-button admin-action-${tone}`} 
    type="button" 
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const Stat = ({ label, value, icon: Icon }) => (
  <div className="admin-module-card admin-mini-stat">
    <div>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
    <Icon size={24} />
  </div>
);

// --- 1. CLIENTS MODULE (LIVE CRUDS) ---
export const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleStatusChange = async (clientId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      const { data } = await api.patch(`/admin/clients/${clientId}/status`, { status: nextStatus });
      if (data.success) {
        setClients(prev => prev.map(c => c._id === clientId ? { ...c, status: nextStatus } : c));
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Could not update status context."));
    }
  };

  if (loading) return <PageShell title="Clients Module"><p>Querying client matrix database...</p></PageShell>;
  if (error) return <PageShell title="Clients Module"><p className="chat-error-banner">{error}</p></PageShell>;

  return (
    <PageShell title="Clients Module" subtitle="View, add, edit, suspend, and manage account ownership." action={<ActionButton><Plus size={16} />Add Client</ActionButton>}>
      <div className="admin-card-grid three">
        {clients.map((client) => (
          <article key={client._id} className="admin-module-card">
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
            <div className="admin-button-row">
              <ActionButton tone="ghost">Edit</ActionButton>
              <ActionButton tone="ghost" onClick={() => handleStatusChange(client._id, client.status)}>
                {client.status === "Active" ? "Suspend" : "Activate"}
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

// --- 3. PROJECTS PIPELINE MAPPING (KANBAN + INTERACTIVE LIVE ASSIGNMENT) ---
export const ProjectsPage = () => {
  const lanes = ["Planning", "Development", "Testing", "Completed"];
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive Modal Assignment State Form
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [checkedDevs, setCheckedDevs] = useState([]);
  const [leadDev, setLeadDev] = useState("");

  useEffect(() => {
    Promise.all([api.get("/admin/projects"), api.get("/admin/developers")])
      .then(([{ data: projData }, { data: devData }]) => {
        setProjects(projData.projects || []);
        setDevelopers(devData.developers || []);
        if (projData.projects?.length > 0) {
          setSelectedProjectId(projData.projects[0]._id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckboxToggle = (devId) => {
    setCheckedDevs(prev => prev.includes(devId) ? prev.filter(id => id !== devId) : [...prev, devId]);
  };

  const executeProjectAssignment = async () => {
    if (!selectedProjectId) return;
    try {
      const { data } = await api.put(`/admin/projects/${selectedProjectId}/assign`, {
        team: checkedDevs,
        lead: leadDev
      });
      if (data.success) {
        alert("Development team synchronized successfully.");
        // Re-refresh layout state
        const updated = await api.get("/admin/projects");
        setProjects(updated.data.projects || []);
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Assignment update execution failed."));
    }
  };

  if (loading) return <PageShell title="Projects Module"><p>Assembling active project kanban branches...</p></PageShell>;

  return (
    <PageShell title="Projects Module" subtitle="Kanban pipeline, assignment modal, milestones, files, comments, meetings, and invoices.">
      <div className="admin-project-layout" style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "1.5rem" }}>
        
        <div className="admin-kanban-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {lanes.map((lane) => (
            <section key={lane} className="admin-kanban-lane">
              <h3 style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "0.5rem" }}>{lane}</h3>
              <div className="admin-kanban-stack" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                {projects.filter((p) => (p.status || "Planning") === lane).map((project) => (
                  <article key={project._id} className="admin-kanban-card" style={{ border: "1px solid var(--border-color)", padding: "10px", borderRadius: "6px" }}>
                    <h4>{project.projectTitle || project.name}</h4>
                    <p style={{ fontSize: "0.8rem", color: "#888" }}>Client ID: {project.client?.name || project.client}</p>
                    <div className="admin-progress-track" style={{ background: "#222", height: "6px", borderRadius: "3px", margin: "8px 0" }}>
                      <div style={{ width: `${project.progress || 10}%`, background: "#3b82f6", height: "100%", borderRadius: "3px" }} />
                    </div>
                    <small>Budget Allocation: {project.budget || "TBD"}</small>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* INTERACTIVE ASIDE DYNAMIC ASSIGNMENT CONTROL */}
        <aside className="admin-module-card" style={{ padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}>
          <h3>Assign Workspace Team</h3>
          <div className="admin-form-grid" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            <label>Target Project Reference
              <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} style={{ width: "100%", padding: "6px" }}>
                {projects.map(p => <option key={p._id} value={p._id}>{p.projectTitle || p.name}</option>)}
              </select>
            </label>

            <div>
              <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>Select Assigned Engineers</p>
              <div className="admin-check-list" style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #333", padding: "6px" }}>
                {developers.map((dev) => (
                  <label key={dev._id} style={{ display: "flex", alignItems: "center", gap: "6px", margin: "4px 0" }}>
                    <input 
                      type="checkbox" 
                      checked={checkedDevs.includes(dev._id)} 
                      onChange={() => handleCheckboxToggle(dev._id)} 
                    />
                    {dev.name}
                  </label>
                ))}
              </div>
            </div>

            <label>Designated Project Lead
              <select value={leadDev} onChange={(e) => setLeadDev(e.target.value)} style={{ width: "100%", padding: "6px" }}>
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
export const TasksPage = () => <PageShell title="Task Management"><p>Task assignments mapping available...</p></PageShell>;
export const CalendarPage = () => <PageShell title="Calendar View"><p>Loading tracking timeline grid engine...</p></PageShell>;
export const NotificationsPage = () => <PageShell title="Notifications Updates"><p>Live context alert parameters active...</p></PageShell>;
export const MessagesPage = () => <PageShell title="Messaging Board"><p>Secure context thread communication channels linked...</p></PageShell>;
export const InvoicesPage = () => <PageShell title="Invoices Management"><p>PDF compilation matrices active...</p></PageShell>;
export const FileManagerPage = () => <PageShell title="Secure File Manager"><p>S3 Bucket object key validation links online...</p></PageShell>;
export const SettingsPage = () => <PageShell title="Roles & Audit Security"><p>System authentication matrices operational...</p></PageShell>;