import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function CustomerDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('browse')
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const name = localStorage.getItem('name')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await API.get('/api/products/browse')
      setProducts(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchOrders = async () => {
    try {
      const res = await API.get('/api/customer/orders')
      setOrders(res.data)
    } catch (err) { console.error(err) }
  }

  const addToCart = (product) => {
    const existing = cart.find(c => c.productId === product.id)
    if (existing) {
      setCart(cart.map(c => c.productId === product.id
        ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart([...cart, { productId: product.id, name: product.name,
        price: product.price, quantity: 1, farmerId: product.farmer.id }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(c => c.productId !== productId))
  }

  const placeOrder = async () => {
    if (!deliveryAddress) return alert('Please enter delivery address')
    if (cart.length === 0) return alert('Cart is empty')
    try {
      const farmerId = cart[0].farmerId
      const items = cart.map(c => ({ productId: c.productId, quantity: c.quantity }))
      await API.post('/api/customer/orders', { farmerId, items, deliveryAddress })
      setCart([])
      setDeliveryAddress('')
      setShowCheckout(false)
      setTab('orders')
      fetchOrders()
      alert('Order placed successfully!')
    } catch (err) { console.error(err) }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()))

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0)

  return (
    <div className="min-h-screen bg-green-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-700">🌱 FarmLink</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/chat')}
            className="bg-green-100 text-green-700 px-4 py-1 rounded-lg text-sm hover:bg-green-200">
            💬 Chat
          </button>
          <button onClick={() => setShowCheckout(true)}
            className="relative bg-green-100 text-green-700 px-4 py-1 rounded-lg text-sm hover:bg-green-200">
            🛒 Cart ({cart.length})
          </button>
          <span className="text-gray-600">👤 {name}</span>
          <button onClick={logout}
            className="bg-red-100 text-red-600 px-4 py-1 rounded-lg text-sm hover:bg-red-200">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab('browse')}
            className={`px-6 py-2 rounded-lg font-medium ${tab === 'browse' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
            Browse Products
          </button>
          <button onClick={() => setTab('orders')}
            className={`px-6 py-2 rounded-lg font-medium ${tab === 'orders' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}>
            My Orders {orders.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
            )}
          </button>
        </div>

        {tab === 'browse' && (
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search products..."
              className="w-full border rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl shadow">
                  <div className="bg-green-100 h-24 rounded-xl flex items-center justify-center text-4xl mb-3">
                    {p.category === 'VEGETABLES' ? '🥦' :
                     p.category === 'FRUITS' ? '🍎' :
                     p.category === 'GRAINS' ? '🌾' :
                     p.category === 'DAIRY' ? '🥛' : '🌿'}
                  </div>
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.farmer.name} • Local Farm</p>
                  <p className="text-sm text-gray-500">{p.category} • {p.unit}</p>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-green-600 font-bold text-lg">₹{p.price}</p>
                    <button onClick={() => addToCart(p)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700">
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">My Orders ({orders.length})</h2>
            {orders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-2xl shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">Farmer: {order.farmer.name}</p>
                    <p className="text-sm text-gray-500">Address: {order.deliveryAddress}</p>
                    <div className="mt-2 space-y-1">
                      {order.items.map(item => (
                        <p key={item.id} className="text-sm text-gray-600">
                          • {item.product.name} × {item.quantity} = ₹{item.priceAtPurchase * item.quantity}
                        </p>
                      ))}
                    </div>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🛒 Your Cart</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Cart is empty</p>
            ) : (
              <>
                {cart.map(c => (
                  <div key={c.productId} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-gray-500">₹{c.price} × {c.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-green-600">₹{c.price * c.quantity}</p>
                      <button onClick={() => removeFromCart(c.productId)}
                        className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg mt-3 mb-4">
                  <span>Total</span>
                  <span className="text-green-600">₹{cartTotal}</span>
                </div>
                <input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address"
                  className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400" />
                <button onClick={placeOrder}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
                  Place Order
                </button>
              </>
            )}
            <button onClick={() => setShowCheckout(false)}
              className="w-full mt-2 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}