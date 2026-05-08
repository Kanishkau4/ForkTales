import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StoryLoader from './components/StoryLoarder'


function App() {
  return (
    <Router>
      <div className='app-container'>
        <header className='app-header'>
          <h1>ForkTails</h1>
        </header>
        <main className='app-main'>
          <Routes>
            <Route path="/story/:id" element={<StoryLoader />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
