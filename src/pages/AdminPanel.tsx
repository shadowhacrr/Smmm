import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogIn, LogOut, Users, CheckCircle, Clock, 
  CreditCard, Link2, Zap, BarChart3, Send, X
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = ''

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-900/20 via-black to-black" />
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-15"
          style={{
            width: Math.random() * 250 + 150,
            height: Math.random() * 250 + 150,
            background: i % 2 === 0 ? '#FE2C55' : '#25F4EE',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 40, 0],
          }}
          transition={{
            duration: 12 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [admin, setAdmin] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, completedOrders: 0 })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [showSetup, setShowSetup] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('JazzCash')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('adminSession')
    if (saved) {
      try {
        const session = JSON.parse(saved)
        setAdmin(session)
        setIsLoggedIn(true)
        loadData(session.id)
      } catch (e) {
        localStorage.removeItem('adminSession')
      }
    }
  }, [])

  const loadData = async (adminId: string) => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/orders/${adminId}`),
        fetch(`${API_URL}/api/admin/stats/${adminId}`)
      ])
      const ordersData = await ordersRes.json()
      const statsData = await statsRes.json()
      setOrders(ordersData)
      setStats(statsData)
    } catch (e) {
      console.error(e)
    }
  }

  const login = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.success) {
        setAdmin(data.admin)
        setIsLoggedIn(true)
        localStorage.setItem('adminSession', JSON.stringify(data.admin))
        if (!data.admin.paymentMethod) {
          setShowSetup(true)
        }
        loadData(data.admin.id)
        toast.success('Login successful!')
      } else {
        toast.error('Invalid credentials!')
      }
    } catch (e) {
      toast.error('Login failed!')
    }
  }

  const setupPayment = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/setup-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: admin.id,
          paymentMethod,
          accountNumber,
          accountName
        })
      })
      const data = await res.json()
      if (data.success) {
        setAdmin(data.admin)
        localStorage.setItem('adminSession', JSON.stringify(data.admin))
        setShowSetup(false)
        toast.success('Payment details saved!')
      }
    } catch (e) {
      toast.error('Failed to save!')
    }
  }

  const completeOrder = async (orderId: string) => {
    try {
      await fetch(`${API_URL}/api/admin/complete-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, message })
      })
      toast.success('Order marked complete!')
      setSelectedOrder(null)
      setMessage('')
      loadData(admin.id)
    } catch (e) {
      toast.error('Failed!')
    }
  }

  const sendMessage = async (orderId: string) => {
    try {
      await fetch(`${API_URL}/api/admin/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, message })
      })
      toast.success('Message sent!')
      setMessage('')
      loadData(admin.id)
    } catch (e) {
      toast.error('Failed!')
    }
  }

  const logout = () => {
    localStorage.removeItem('adminSession')
    setIsLoggedIn(false)
    setAdmin(null)
    setOrders([])
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white relative flex items-center justify-center px-4">
        <AnimatedBackground />
        <motion.div 
          className="glass-card rounded-2xl p-8 max-w-md w-full relative z-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Admin Login</h1>
            <p className="text-sm text-gray-400 mt-1">Apna account access karein</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                placeholder="Username"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                placeholder="Password"
              />
            </div>
            <motion.button
              onClick={login}
              className="w-full bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-4 rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <AnimatedBackground />
      
      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass-card rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h3 className="text-lg font-bold mb-4">Payment Setup</h3>
              <p className="text-sm text-gray-400 mb-4">Apne payment details add karein taake users order place kar saken.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option>JazzCash</option>
                    <option>EasyPaisa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Full Name"
                  />
                </div>
                <motion.button
                  onClick={setupPayment}
                  className="w-full bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-3 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Details
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-400">@{admin?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {admin?.uniqueLink && (
              <motion.div 
                className="hidden sm:flex items-center gap-2 glass-card rounded-xl px-3 py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Link2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs">{window.location.origin}{admin.uniqueLink}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${admin.uniqueLink}`)
                    toast.success('Link copied!')
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Copy
                </button>
              </motion.div>
            )}
            <motion.button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut className="w-5 h-5 text-red-400" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'orders', label: 'Orders', icon: Users },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-cyan-400/20 to-pink-500/20 border border-cyan-400/30 text-white' 
                  : 'glass-card text-gray-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Orders', value: stats.totalOrders, icon: Users, color: 'from-cyan-400 to-cyan-600' },
                { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'from-yellow-400 to-orange-500' },
                { label: 'Completed', value: stats.completedOrders, icon: CheckCircle, color: 'from-green-400 to-emerald-600' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="glass-card rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-6 h-6 text-gray-400" />
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Payment Details Card */}
            <motion.div 
              className="glass-card rounded-2xl p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" /> Payment Details
                </h3>
                <button 
                  onClick={() => setShowSetup(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Edit
                </button>
              </div>
              {admin?.paymentMethod ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-400">Method</p>
                    <p className="font-semibold">{admin.paymentMethod}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-400">Number</p>
                    <p className="font-mono font-semibold text-cyan-400">{admin.accountNumber}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-semibold">{admin.accountName}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No payment details added yet.</p>
              )}
            </motion.div>

            {/* Unique Link */}
            <motion.div 
              className="glass-card rounded-2xl p-6 border-cyan-400/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-cyan-400" /> Your Unique Link
              </h3>
              <p className="text-sm text-gray-400 mb-3">Is link se aye orders sirf apko milenge</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-black/50 rounded-xl py-3 px-4 text-sm text-cyan-400 font-mono break-all">
                  {window.location.origin}{admin?.uniqueLink}
                </code>
                <motion.button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${admin?.uniqueLink}`)
                    toast.success('Copied!')
                  }}
                  className="bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-3 px-4 rounded-xl shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Copy
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-bold">Orders</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                  Pending: {stats.pendingOrders}
                </span>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                  Completed: {stats.completedOrders}
                </span>
              </div>
            </div>

            {orders.length === 0 && (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Abhi tak koi order nahi aya</p>
              </div>
            )}

            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                className="glass-card rounded-2xl p-6 cursor-pointer hover:border-white/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      order.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                    }`}>
                      {order.status === 'completed' ? 
                        <CheckCircle className="w-5 h-5 text-green-400" /> : 
                        <Clock className="w-5 h-5 text-yellow-400" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold">@{order.tiktokUsername}</p>
                      <p className="text-xs text-gray-400 capitalize">{order.service} x {order.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold gradient-text">{order.price} PKR</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Username</span>
                  <span>@{selectedOrder.tiktokUsername}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Service</span>
                  <span className="capitalize">{selectedOrder.service}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Quantity</span>
                  <span>{selectedOrder.quantity}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Price</span>
                  <span className="font-bold">{selectedOrder.price} PKR</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="font-mono">{selectedOrder.transactionId}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    selectedOrder.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {selectedOrder.screenshot && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Payment Screenshot</p>
                  <img src={selectedOrder.screenshot} alt="Payment" className="rounded-xl max-h-48 object-cover" />
                </div>
              )}

              <div className="space-y-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="User ko message bhejein..."
                  className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 min-h-[80px]"
                />
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => sendMessage(selectedOrder.id)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </motion.button>
                  {selectedOrder.status !== 'completed' && (
                    <motion.button
                      onClick={() => completeOrder(selectedOrder.id)}
                      className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CheckCircle className="w-4 h-4" /> Complete
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
