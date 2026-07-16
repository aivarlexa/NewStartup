import { BarChart3, FolderKanban, Users, UserCog } from "lucide-react";
import { clients, developers, notifications, projects, tasks } from "../../data/adminWorkspace";

const Dashboard = () => {
  const stats = [
    { label: "Total Clients", value: clients.length, icon: Users },
    { label: "Total Developers", value: developers.length, icon: UserCog },
    { label: "Total Projects", value: projects.length, icon: FolderKanban },
    { label: "Active Tasks", value: tasks.filter((task) => task.status !== "Completed").length, icon: BarChart3 },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <p>Varlexa Admin</p>
        <h1>Dashboard</h1>
        <span>A command center for clients, developers, projects, billing, and operations.</span>
      </div>
      <div className="admin-stat-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="admin-stat-card">
            <div>
              <div>
                <p>{label}</p>
                <h2>{value}</h2>
              </div>
              <Icon />
            </div>
          </div>
        ))}
      </div>
      <div className="admin-dashboard-grid">
        <div className="admin-panel">
          <h2>Project Snapshot</h2>
          <div className="admin-project-list">
            {projects.slice(0, 4).map((project) => (
              <div key={project.id} className="admin-project-progress">
                <div>
                  <span>{project.name}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="admin-progress-track">
                  <div style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-panel">
          <h2>Notifications</h2>
          <div className="admin-notification-list">
            {notifications.map((item) => <p key={item}>{item}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
