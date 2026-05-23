
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const name = localStorage.getItem('name')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
    fetchOrders()
    fetchProducts()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await API.get('/api/admin/users')
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchOrders = async () => {
    try {
      const res = await API.get('/api/admin/orders')
      setOrders(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchProducts = async () => {
    try {
      const res = await API.get('/api/products/browse')
      setProducts(res.data)
    } catch (err) { console.error(err) }
  }

  const toggleUser = async (userId, active) => {
    try {
      await API.patch(`/api/admin/users/${userId}/toggle`)
      fetchUsers()
    } catch (err) { console.error(err) }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const farmers = users.filter(u => u.role === 'FARMER')
  const customers = users.filter(u => u.role === 'CUSTOMER')
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">🌱 FarmLink — Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">🛡️ {name}</span>
          <button onClick={logout}
            className="bg-red-100 text-red-600 px-4 py-1 rounded-lg text-sm hover:bg-red-200">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {['overview', 'users', 'orders', 'products'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium capitalize ${
                tab === t ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-2xl shadow text-center">
                <p className="text-3xl font-bold text-green-600">{farmers.length}</p>
                <p className="text-gray-500 mt-1">Farmers</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow text-center">
                <p className="text-3xl font-bold text-blue-600">{customers.length}</p>
                <p className="text-gray-500 mt-1">Customers</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow text-center">
                <p className="text-3xl font-bold text-purple-600">{products.length}</p>
                <p className="text-gray-500 mt-1">Products</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow text-center">
                <p className="text-3xl font-bold text-orange-600">₹{totalRevenue}</p>
                <p className="text-gray-500 mt-1">Total Revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow">
                <h3 className="font-semibold text-gray-700 mb-3">Recent Orders ({orders.length})</h3>
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">Order #{o.id}</p>
                      <p className="text-xs text-gray-400">{o.customer?.name} → {o.farmer?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">₹{o.totalAmount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        o.status === 'PLACED' ? 'bg-yellow-100 text-yellow-600' :
                        o.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'}`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-5 rounded-2xl shadow">
                <h3 className="font-semibold text-gray-700 mb-3">Recent Users ({users.length})</h3>
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="flex justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 h-fit rounded-full ${
                      u.role === 'FARMER' ? 'bg-green-100 text-green-600' :
                      u.role === 'CUSTOMER' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.role === 'FARMER' ? 'bg-green-100 text-green-600' :
                        u.role === 'CUSTOMER' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleUser(u.id, u.active)}
                        className={`text-xs px-3 py-1 rounded-lg ${
                          u.active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="bg-white p-5 rounded-2xl shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{o.id}</p>
                    <p className="text-sm text-gray-500">Customer: {o.customer?.name}</p>
                    <p className="text-sm text-gray-500">Farmer: {o.farmer?.name}</p>
                    <p className="text-sm text-gray-500">Address: {o.deliveryAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{o.totalAmount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      o.status === 'PLACED' ? 'bg-yellow-100 text-yellow-600' :
                      o.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Farmer</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.farmer?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.category}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">₹{p.price}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.quantityAvailable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}