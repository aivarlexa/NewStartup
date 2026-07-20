import { BarChart3, FolderKanban, Users, UserCog, MessageSquareText } from "lucide-react"; 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
const Dashboard = () => {
  const navigate = useNavigate();
  const [recentClients, setRecentClients] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [dashboard, setDashboard] = useState({
    totalClients: 0,
    totalDevelopers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const stats = [
    {
      label: "Total Clients",
      value: dashboard.totalClients,
      path:"/admin/clients",
      icon: Users,
    },
    {
      label: "Total Developers",
      value: dashboard.totalDevelopers,
      path:"/admin/developers",
      icon: UserCog,
    },
    {
      label: "Total Projects",
      value: dashboard.totalProjects,
      path:"/admin/projects",
      icon: FolderKanban,
    },
    {
      label: "Active Projects",
      value: dashboard.activeProjects,
      path:"/admin/projects",
      icon: BarChart3,
    },
    {
      label:"Messages",
      value:dashboard.Messages,
      path:"/admin/messages",
      icon:MessageSquareText,
    },
      
  ];
  useEffect(() => {
    fetchDashboard();
  }, []);
  const fetchDashboard = async () => {
    try {
      const { data } = await api.get("/admin/dashboard");

      if (data.success) {
        setDashboard(data.stats);
        setRecentClients(data.recentClients);
        setRecentProjects(data.recentProjects);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <p>Varlexa Admin</p>
        <h1>Dashboard</h1>
        <span>A command center for clients, developers, projects, billing, and operations.</span>
      </div>
      <div className="admin-stat-grid">
        {stats.map(({ label, value, icon: Icon, path }) => (
          <div
            key={label}
            className="admin-stat-card"
            onClick={() => navigate(path)}
            style={{ cursor: "pointer" }}
          >
            <div className="admin-stat-card-icon">
              <Icon size={24} />
            </div>
            <div className="admin-stat-card-content">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-dashboard-grid">
        <div className="admin-panel">
          <h2>Project Snapshot</h2>
          <div className="admin-project-list">
           {recentProjects.map((project) => (
            <div key={project._id} className="admin-project-progress">
              <div>
                <span>{project.projectTitle}</span>
                <span>{project.progress || 0}%</span>
              </div>

              <div className="admin-progress-track">
                <div style={{ width: `${project.progress || 0}%` }} />
              </div>
            </div>
           ))}
          </div>
        </div>
        <div className="admin-panel">
          <h2>Recent Clients</h2>

          {recentClients.map((client) => (
            <div key={client._id} className="recent-client">
              <h4>{client.name}</h4>
              <p>{client.companyName}</p>
              <span>{client.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
