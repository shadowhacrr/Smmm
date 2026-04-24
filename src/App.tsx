import { Routes, Route } from 'react-router-dom'
import UserPanel from './pages/UserPanel'
import AdminPanel from './pages/AdminPanel'
import OwnerPanel from './pages/OwnerPanel'

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserPanel />} />
      <Route path="/order/:adminLink" element={<UserPanel />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/owner" element={<OwnerPanel />} />
    </Routes>
  )
}

export default App
