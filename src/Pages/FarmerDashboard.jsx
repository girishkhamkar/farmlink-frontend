import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function FarmerDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('products')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', quantityAvailable: '', unit: 'kg', category: 'VEGETABLES' })
  const [loading, setLoading] = useState(false)
  const name = localStorage.getItem('name')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await API.get('/api/farmer/products')
      setProducts(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchOrders = async () => {
    try {
      const res = await API.get('/api/farmer/orders')
      setOrders(res.data)
    } catch (err) { console.error(err) }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/api/farmer/products', {
        ...form,
        price: parseFloat(form.price),
        quantityAvailable: parseInt(form.quantityAvailable)
      })
      setForm({ name: '', description: '', price: '', quantityAvailable: '', unit: 'kg', category: 'VEGETABLES' })
      setShowForm(false)
      fetchProducts()
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const updateStatus = async (orderId, status) => {
    try {
      await API.patch(`/api/farmer/orders/${orderId}/status`, { status })
      fetchOrders()
    } catch (err) { console.error(err) }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">🌱 FarmLink</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/chat')}
            className="bg-green-100 text-green-700 px-4 py-1 rounded-lg text-sm hover:bg-green-200">
            💬 Chat
          </button>
          <span className="text-gray-600">👨‍🌾 {name}</span>
          <button onClick={logout}
            className="bg-red-100 text-red-600 px-4 py-1 rounded-lg text-sm hover:bg-red-200">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab('products')}
            className={`px-6 py-2 rounded-lg font-medium ${tab === 'products' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
            My Products
          </button>
          <button onClick={() => setTab('orders')}
            className={`px-6 py-2 rounded-lg font-medium ${tab === 'orders' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
            Orders {orders.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{orders.length}</span>}
          </button>
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">My Products ({products.length})</h2>
              <button onClick={() => setShowForm(!showForm)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                + Add Product
              </button>
            </div>

            {showForm && (
              <div className="bg-white p-6 rounded-2xl shadow mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">Add New Product</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Product Name</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="e.g. Fresh Tomatoes" required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400">
                      {['VEGETABLES','FRUITS','GRAINS','DAIRY','SPICES','PULSES','OTHER'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Price (₹)</label>
                    <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="40" required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Quantity</label>
                    <input type="number" value={form.quantityAvailable} onChange={e => setForm({...form, quantityAvailable: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="100" required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Unit</label>
                    <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400">
                      {['kg','litre','dozen','piece','bundle'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Description</label>
                    <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="Short description" />
                  </div>
                  <div className="col-span-2 flex gap-3">
                    <button type="submit" disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                      {loading ? 'Adding...' : 'Add Product'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)}
                      className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{p.name}</h3>
                      <p className="text-sm text-gray-500">{p.category} • {p.unit}</p>
                      <p className="text-green-600 font-bold mt-1">₹{p.price}</p>
                      <p className="text-sm text-gray-500">Stock: {p.quantityAvailable}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {p.available ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Incoming Orders ({orders.length})</h2>
            {orders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-2xl shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">Customer: {order.customer.name}</p>
                    <p className="text-sm text-gray-500">Address: {order.deliveryAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{order.totalAmount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'PLACED' ? 'bg-yellow-100 text-yellow-600' :
                      order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['CONFIRMED','PACKED','SHIPPED','DELIVERED'].map(s => (
                    <button key={s} onClick={() => updateStatus(order.id, s)}
                      className="text-xs bg-green-50 border border-green-300 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100">
                      Mark {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}