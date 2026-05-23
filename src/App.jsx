import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/Login'
import Register from './Pages/Register'
import FarmerDashboard from './Pages/FarmerDashboard'
import CustomerDashboard from './Pages/CustomerDashboard'
import Chat from './Pages/Chat'
import AdminDashboard from './Pages/AdminDashboard'

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