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
import { clients, developers, projects, tasks, projectRequests, notifications, auditLogs } from "../../data/adminWorkspace";

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

const ActionButton = ({ children, tone = "primary" }) => (
  <button className={`admin-action-button admin-action-${tone}`} type="button">
    {children}
  </button>
);

const Stat = ({ label, value, icon: Icon }) => (
  <div className="admin-module-card admin-mini-stat">
    <div>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
    <Icon />
  </div>
);

export const ClientsPage = () => (
  <PageShell title="Clients Module" subtitle="View, add, edit, suspend, and manage account ownership." action={<ActionButton><Plus size={16} />Add Client</ActionButton>}>
    <div className="admin-card-grid three">
      {clients.map((client) => (
        <article key={client.id} className="admin-module-card">
          <div className="admin-card-top">
            <div>
              <h3>{client.name}</h3>
              <p>{client.contact} · {client.email}</p>
            </div>
            <Pill tone={client.status === "Active" ? "green" : "red"}>{client.status}</Pill>
          </div>
          <div className="admin-info-list">
            <p>Account manager: <b>{client.manager}</b></p>
            <p>Project history: {client.projects.join(", ")}</p>
            <p>Payments: {client.payments}</p>
            <p>Uploaded documents: {client.documents}</p>
          </div>
          <div className="admin-button-row">
            {["Edit", "Delete", "Suspend", "Documents"].map((action) => <ActionButton key={action} tone="ghost">{action}</ActionButton>)}
          </div>
        </article>
      ))}
    </div>
  </PageShell>
);

export const DevelopersPage = () => (
  <PageShell title="Developers Module" subtitle="Track skills, stack, workload, availability, and performance." action={<ActionButton><Plus size={16} />Add Developer</ActionButton>}>
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>{["Developer", "Skills", "Tech Stack", "Experience", "Workload", "Availability", "Performance", "Actions"].map((head) => <th key={head}>{head}</th>)}</tr>
        </thead>
        <tbody>
          {developers.map((developer) => (
            <tr key={developer.id}>
              <td><b>{developer.name}</b></td>
              <td>{developer.skills}</td>
              <td>{developer.stack}</td>
              <td>{developer.experience}</td>
              <td>{developer.workload}</td>
              <td><Pill tone={developer.availability === "Available" ? "green" : "amber"}>{developer.availability}</Pill></td>
              <td>{developer.performance}</td>
              <td><span className="admin-link-text">Edit · Remove</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </PageShell>
);

export const ProjectsPage = () => {
  const lanes = ["Planning", "Development", "Testing", "Completed"];
  return (
    <PageShell title="Projects Module" subtitle="Kanban pipeline, assignment modal, milestones, files, comments, meetings, and invoices." action={<ActionButton>Assign Project</ActionButton>}>
      <div className="admin-project-layout">
        <div className="admin-kanban-grid">
          {lanes.map((lane) => (
            <section key={lane} className="admin-kanban-lane">
              <h3>{lane}</h3>
              <div className="admin-kanban-stack">
                {projects.filter((project) => project.status === lane).map((project) => (
                  <article key={project.id} draggable className="admin-kanban-card">
                    <div className="admin-card-top compact">
                      <h4>{project.name}</h4>
                      <Pill tone={project.priority === "High" ? "red" : "cyan"}>{project.priority}</Pill>
                    </div>
                    <p>{project.client}</p>
                    <div className="admin-progress-track"><div style={{ width: `${project.progress}%` }} /></div>
                    <small>{project.progress}% · Lead {project.lead}</small>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="admin-module-card">
          <h3>Assign Project</h3>
          <div className="admin-form-grid">
            <label>Project<select><option>AI Chatbot</option></select></label>
            <label>Client<input value="ABC Pvt Ltd" readOnly /></label>
            <label>Priority<select><option>High</option></select></label>
            <label>Deadline<input value="20 Aug" readOnly /></label>
            <div>
              <p>Developers</p>
              <div className="admin-check-list">
                {developers.map((developer) => <label key={developer.id}><input type="checkbox" defaultChecked={["John", "Prachi"].includes(developer.name)} />{developer.name}</label>)}
              </div>
            </div>
            <label>Lead Developer<select><option>Prachi</option></select></label>
            <label>Estimated Hours<input value="180" readOnly /></label>
            <ActionButton>Save</ActionButton>
          </div>
        </aside>
      </div>
    </PageShell>
  );
};

export const ProjectRequestsPage = () => (
  <PageShell title="Project Requests" subtitle="Approve, reject, or assign new client project submissions.">
    <div className="admin-card-grid three">
      {projectRequests.map((request) => (
        <article key={request.service} className="admin-module-card">
          <Pill>{request.priority}</Pill>
          <h3>{request.service}</h3>
          <p className="admin-muted">{request.client}</p>
          <p className="admin-muted">Budget {request.budget} · Timeline {request.timeline}</p>
          <div className="admin-button-row">
            <ActionButton>Assign</ActionButton>
            <ActionButton tone="success">Approve</ActionButton>
            <ActionButton tone="danger">Reject</ActionButton>
          </div>
        </article>
      ))}
    </div>
  </PageShell>
);

export const TasksPage = () => (
  <PageShell title="Task Management" subtitle="Each project owns tasks with assignee, due date, priority, and status.">
    <div className="admin-card-grid two">
      {tasks.map((task) => (
        <article key={task.title} className="admin-module-card">
          <h3>{task.title}</h3>
          <p className="admin-muted">{task.project}</p>
          <div className="admin-detail-grid">
            <p>Assigned To<br /><b>{task.assignedTo}</b></p>
            <p>Due Date<br /><b>{task.dueDate}</b></p>
            <p>Priority<br /><Pill tone={task.priority === "High" ? "red" : "cyan"}>{task.priority}</Pill></p>
            <p>Status<br /><b>{task.status}</b></p>
          </div>
        </article>
      ))}
    </div>
  </PageShell>
);

export const CalendarPage = () => (
  <PageShell title="Calendar" subtitle="Deadlines, meetings, deployments, sprints, and leave in one operating view.">
    <div className="admin-card-grid five">
      {["Deadlines", "Meetings", "Deployments", "Sprints", "Leave"].map((item, index) => (
        <article key={item} className="admin-module-card icon-card">
          <CalendarDays />
          <h3>{item}</h3>
          <p className="admin-muted">{index + 2} scheduled</p>
        </article>
      ))}
    </div>
  </PageShell>
);

export const ReportsPage = () => (
  <PageShell title="Reports" subtitle="Charts for delivery, revenue, productivity, satisfaction, growth, and success rate.">
    <div className="admin-card-grid three">
      <Stat label="Projects Completed" value="24" icon={CheckCircle2} />
      <Stat label="Revenue" value="₹18.6L" icon={BarChart3} />
      <Stat label="Success Rate" value="92%" icon={ShieldCheck} />
    </div>
    <div className="admin-module-card">
      <div className="admin-chart-bars">
        {["Revenue", "Productivity", "Satisfaction", "Growth", "Delivery", "Quality"].map((label, index) => (
          <div key={label}>
            <span style={{ height: `${45 + index * 8}%` }} />
            <p>{label}</p>
          </div>
        ))}
      </div>
    </div>
  </PageShell>
);

const BellIcon = ({ index }) => [<Clock />, <FileArchive />, <CalendarDays />, <FileText />, <MessageSquare />][index];

export const NotificationsPage = () => (
  <PageShell title="Notifications" subtitle="Operational alerts that keep admin attention sharp.">
    <div className="admin-list-stack">
      {notifications.map((item, index) => (
        <article key={item} className="admin-list-item">
          <BellIcon index={index} />
          <span>{item}</span>
        </article>
      ))}
    </div>
  </PageShell>
);

export const MessagesPage = () => (
  <PageShell title="Messaging" subtitle="Admin ↔ Client, Admin ↔ Developer, and group project chat.">
    <div className="admin-card-grid three">
      {["Admin ↔ Client", "Admin ↔ Developer", "Group Project Chat"].map((title) => (
        <article key={title} className="admin-module-card icon-card">
          <MessageSquare />
          <h3>{title}</h3>
          <p className="admin-muted">Threaded chat with file attachments and project context.</p>
        </article>
      ))}
    </div>
  </PageShell>
);

export const InvoicesPage = () => (
  <PageShell title="Invoice Management" subtitle="Generate invoices, track GST, payment status, and PDF downloads.">
    <div className="admin-card-grid three">
      {projects.slice(0, 3).map((project) => (
        <article key={project.id} className="admin-module-card">
          <h3>Invoice · {project.client}</h3>
          <p className="admin-muted">{project.name}</p>
          <strong className="admin-price">{project.budget}</strong>
          <p className="admin-muted">GST included · {project.invoices}</p>
          <ActionButton tone="ghost">Download PDF</ActionButton>
        </article>
      ))}
    </div>
  </PageShell>
);

export const FileManagerPage = () => (
  <PageShell title="File Manager" subtitle="Requirements, contracts, designs, PDFs, invoices, images, and version history.">
    <div className="admin-card-grid four">
      {["Requirements", "Contracts", "Designs", "PDF", "Invoices", "Images", "Version History"].map((folder) => (
        <article key={folder} className="admin-module-card icon-card">
          <FileArchive />
          <h3>{folder}</h3>
          <p className="admin-muted">Secure project storage</p>
        </article>
      ))}
    </div>
  </PageShell>
);

export const SettingsPage = () => (
  <PageShell title="Roles & Audit Logs" subtitle="Permission based access for Super Admin, Admin, PM, Developer, and Client.">
    <div className="admin-card-grid two">
      <article className="admin-module-card">
        <h3>Roles</h3>
        <div className="admin-button-row">
          {["Super Admin", "Admin", "Project Manager", "Developer", "Client"].map((role) => <Pill key={role} tone="slate">{role}</Pill>)}
        </div>
      </article>
      <article className="admin-module-card">
        <h3>Audit Logs</h3>
        <div className="admin-list-stack compact">
          {auditLogs.map((log) => (
            <p key={log} className="admin-audit-row"><UserCheck size={16} />{log}</p>
          ))}
        </div>
      </article>
    </div>
  </PageShell>
);
