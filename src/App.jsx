import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import FarmerDashboard from './pages/FarmerDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import Chat from './pages/Chat'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App