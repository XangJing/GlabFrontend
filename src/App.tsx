import { Routes, Route } from 'react-router-dom'
import AboutUs from './Pages/AboutUs'
import Discover from './Pages/Discover/Discover'
import ContainerDetailsPage from './Pages/ContainerDetailsPage'
import LoginPage from './Pages/LoginPage'
import CreateContainerPage from './Pages/Create'

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<AboutUs />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/containers/:id" element={<ContainerDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CreateContainerPage />} />
      </Routes>
  )
}

export default App