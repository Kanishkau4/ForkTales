import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StoryLoader from './components/StoryLoader'
import StoryGenerator from './components/StoryGenerator'
import UserDashboard from './components/UserDashboard'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<StoryGenerator />} />
            <Route path="/story/:id" element={<StoryLoader />} />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}


export default App
