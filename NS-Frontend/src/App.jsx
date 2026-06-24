import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import DashboardLayout from './components/dashboard/DashboardLayout'
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
import HomePage from './pages/HomePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import SocialPage from './pages/SocialPage'
import { AuthProvider } from './context/AuthContext';
import DeveloperLoginPage from './pages/DeveloperLoginPage';
import ProtectedRoutes from './components/ProtectedRoutes';
import './App.css'

function App() {
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/developer-dashboard')
  const isDeveloperLoginRoute = location.pathname === '/developer-login'

  useEffect(() => {
    if (location.hash) {
      window.requestAnimationFrame(() => {
        const targetElement = document.querySelector(location.hash)

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' })
        }
      })

      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname, location.hash])

  return (
    <AuthProvider>
      <main className="app-shell">
        {!isDashboardRoute && !isDeveloperLoginRoute && <Navbar />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/developer-login" element={<DeveloperLoginPage />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/developer-dashboard" element={<DashboardLayout />}>
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
        </Routes>
        {!isDashboardRoute && <Footer />}
      </main>
    </AuthProvider>
  )
}

export default App