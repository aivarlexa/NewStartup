import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import DashboardLayout from './components/dashboard/DashboardLayout'
import ClientDashboardLayout from './components/clientDashboard/ClientDashboardLayout'
import Navbar from './components/Navbar'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import AIAssistantPage from './pages/dashboard/AIAssistantPage'
import ClientChatPage from './pages/dashboard/ClientChatPage'
import DashboardOverview from './pages/dashboard/DashboardOverview'
import MeetingsPage from './pages/dashboard/MeetingsPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import ProjectDetailsPage from './pages/dashboard/ProjectDetailsPage'
import ProjectsPage from './pages/dashboard/ProjectsPage'
import TeamChatPage from './pages/dashboard/TeamChatPage'
import ClientChatWithDevelopersPage from './pages/clientDashboard/ClientChatWithDevelopersPage'
import ClientDashboardHome from './pages/clientDashboard/ClientDashboardHome'
import ClientMeetingsPage from './pages/clientDashboard/ClientMeetingsPage'
import ClientNotificationsPage from './pages/clientDashboard/ClientNotificationsPage'
import ClientProfilePage from './pages/clientDashboard/ClientProfilePage'
import ClientRequirementsPage from './pages/clientDashboard/ClientRequirementsPage'
import ClientSettingsPage from './pages/clientDashboard/ClientSettingsPage'
import HomePage from './pages/HomePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import SocialPage from './pages/SocialPage'
import { AuthProvider } from './context/AuthContext';
import DeveloperLoginPage from './pages/DeveloperLoginPage';
import ProtectedRoutes from './components/ProtectedRoutes';
import Services from './components/Services';
import AdminLayout from '../Layouts/adminLayout'
import AdminLogin from './pages/Admin/Login'
import Dashboard from './pages/Admin/Dashboard'
import {
  CalendarPage,
  ClientsPage,
  DevelopersPage,
  FileManagerPage,
  InvoicesPage,
  MessagesPage,
  NotificationsPage,
  ProjectRequestsPage,
  ProjectsPage as AdminProjectsPage,
  ReportsPage,
  SettingsPage,
  TasksPage,
  TeamsPage,
} from './pages/Admin/AdminModulePage'
import './App.css'

function LegacyDeveloperDashboardRedirect() {
  const location = useLocation()
  const nextPath = location.pathname.replace('/developer-dashboard', '/developer/dashboard')

  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />
}

function App() {
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/developer/dashboard') || location.pathname.startsWith('/client/dashboard') || location.pathname.startsWith('/developer-dashboard') || location.pathname.startsWith('/admin')
  const isLoginRoute = location.pathname === '/developer/login' || location.pathname === '/client/login' || location.pathname === '/developer-login' || location.pathname === '/admin/login'

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => {
        const targetElement = document.querySelector(location.hash)
        if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname, location.hash])

  return (
    <AuthProvider>
      <main className="app-shell">
        {!isDashboardRoute && !isLoginRoute && <Navbar />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path = "/services" element={< Services/>} />
          <Route path="/developer/login" element={<DeveloperLoginPage role="Developer" />} />
          <Route path="/developer/chat" element={< ClientChatPage/>} />
          <Route path="/client/login" element={<DeveloperLoginPage role="Client" />} />
          <Route path="/developer-login" element={<DeveloperLoginPage role="Developer" />} />
          <Route path="/developer-dashboard/*" element={<LegacyDeveloperDashboardRedirect />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/developer/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="project/:id" element={<ProjectDetailsPage />} />
              <Route path="team-chat" element={<TeamChatPage />} />
              <Route path="client-chat" element={<ClientChatPage />} />
              <Route path="meetings" element={<MeetingsPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<ProtectedRoutes role="Admin" />}>

            <Route element={<AdminLayout />}>

              <Route
                path="/admin/dashboard"
                element={<Dashboard />}
              />
              <Route path="/admin/clients" element={<ClientsPage />} />
              <Route path="/admin/developers" element={<DevelopersPage />} />
              <Route path="/admin/projects" element={<AdminProjectsPage />} />
              <Route path="/admin/project-requests" element={<ProjectRequestsPage />} />
              <Route path="/admin/teams" element={<TeamsPage />} />
              <Route path="/admin/tasks" element={<TasksPage />} />
              <Route path="/admin/calendar" element={<CalendarPage />} />
              <Route path="/admin/messages" element={<MessagesPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/invoices" element={<InvoicesPage />} />
              <Route path="/admin/ai-analytics" element={<ReportsPage />} />
              <Route path="/admin/files" element={<FileManagerPage />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />

            </Route>

          </Route>

          <Route element={<ProtectedRoutes role="Client" />}>
            <Route path="/client/dashboard" element={<ClientDashboardLayout />}>
              <Route index element={<ClientDashboardHome />} />
              <Route path="requirements" element={<ClientRequirementsPage />} />
              <Route path="chat" element={<ClientChatWithDevelopersPage />} />
              <Route path="meetings" element={<ClientMeetingsPage />} />
              <Route path="notifications" element={<ClientNotificationsPage />} />
              <Route path="profile" element={<ClientProfilePage />} />
              <Route path="settings" element={<ClientSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {!isDashboardRoute && !isLoginRoute && <Footer />}
      </main>
    </AuthProvider>
  )
}

export default App
