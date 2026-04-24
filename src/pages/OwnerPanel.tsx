import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LogOut, Users, CheckCircle, Clock, Plus, Trash2,
  Star, MessageSquare, DollarSign, Settings, BarChart3,
  Shield, Zap
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = ''

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black" />
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-15"
          style={{
            width: Math.random() * 300 + 200,
            height: Math.random() * 300 + 200,
            background: i % 2 === 0 ? '#25F4EE' : '#FE2C55',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 60, -60, 0],
            y: [0, -60, 60, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export default function OwnerPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalAdmins: 0, totalReviews: 0 })
  const [admins, setAdmins] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [newAdminUsername, setNewAdminUsername] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  
  const [newUsername, setNewUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  const [followersPrice, setFollowersPrice] = useState(3)
  const [likesPrice, setLikesPrice] = useState(2)
  const [commentsPrice, setCommentsPrice] = useState(5)
  const [sharesPrice, setSharesPrice] = useState(2.5)

  useEffect(() => {
    const saved = localStorage.getItem('ownerSession')
    if (saved) {
      setIsLoggedIn(true)
      loadAllData()
    }
  }, [])

  const loadAllData = async () => {
    try {
      const [statsRes, adminsRes, ordersRes, reviewsRes, complaintsRes, servicesRes] = await Promise.all([
        fetch(`${API_URL}/api/owner/stats`),
        fetch(`${API_URL}/api/owner/admins`),
        fetch(`${API_URL}/api/owner/orders`),
        fetch(`${API_URL}/api/owner/reviews`),
        fetch(`${API_URL}/api/owner/complaints`),
        fetch(`${API_URL}/api/services`)
      ])
      
      setStats(await statsRes.json())
      setAdmins(await adminsRes.json())
      setOrders(await ordersRes.json())
      setReviews(await reviewsRes.json())
      setComplaints(await complaintsRes.json())
      const svc = await servicesRes.json()
      if (svc.services) {
        setFollowersPrice(svc.services.find((s: any) => s.id === 'followers')?.price || 3)
        setLikesPrice(svc.services.find((s: any) => s.id === 'likes')?.price || 2)
        setCommentsPrice(svc.services.find((s: any) => s.id === 'comments')?.price || 5)
        setSharesPrice(svc.services.find((s: any) => s.id === 'shares')?.price || 2.5)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const login = async () => {
    try {
      const res = await fetch(`${API_URL}/api/owner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.success) {
        setIsLoggedIn(true)
        localStorage.setItem('ownerSession', 'true')
        loadAllData()
        toast.success('Owner login successful!')
      } else {
        toast.error('Invalid credentials!')
      }
    } catch (e) {
      toast.error('Login failed!')
    }
  }

  const addAdmin = async () => {
    if (!newAdminUsername || !newAdminPassword) {
      toast.error('Fill all fields!')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/owner/add-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Admin added!')
        setNewAdminUsername('')
        setNewAdminPassword('')
        loadAllData()
      } else {
        toast.error(data.message || 'Failed!')
      }
    } catch (e) {
      toast.error('Error!')
    }
  }

  const removeAdmin = async (adminId: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await fetch(`${API_URL}/api/owner/remove-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      })
      toast.success('Admin removed!')
      loadAllData()
    } catch (e) {
      toast.error('Error!')
    }
  }

  const updatePricing = async () => {
    try {
      await fetch(`${API_URL}/api/owner/update-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followers: followersPrice,
          likes: likesPrice,
          comments: commentsPrice,
          shares: sharesPrice
        })
      })
      toast.success('Pricing updated!')
    } catch (e) {
      toast.error('Failed!')
    }
  }

  const changePassword = async () => {
    try {
      const res = await fetch(`${API_URL}/api/owner/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          currentPassword,
          newPassword,
          newUsername: newUsername || undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Credentials updated!')
        setCurrentPassword('')
        setNewPassword('')
        setNewUsername('')
      } else {
        toast.error('Invalid current password!')
      }
    } catch (e) {
      toast.error('Failed!')
    }
  }

  const logout = () => {
    localStorage.removeItem('ownerSession')
    setIsLoggedIn(false)
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Owner Panel</h1>
            <p className="text-sm text-gray-400 mt-1">Super Admin Access</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                placeholder="shadow"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                placeholder="1234"
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
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Owner Panel</h1>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
          </div>
          <motion.button
            onClick={logout}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <LogOut className="w-5 h-5 text-red-400" />
          </motion.button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'admins', label: 'Admins', icon: Users },
            { id: 'orders', label: 'Orders', icon: Clock },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'complaints', label: 'Complaints', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings },
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: stats.totalOrders, icon: Zap, color: 'from-cyan-400 to-cyan-600', trend: 'up' },
                { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'from-yellow-400 to-orange-500', trend: 'down' },
                { label: 'Completed', value: stats.completedOrders, icon: CheckCircle, color: 'from-green-400 to-emerald-600', trend: 'up' },
                { label: 'Admins', value: stats.totalAdmins, icon: Users, color: 'from-pink-400 to-rose-600', trend: 'up' },
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

            {/* Live Monitoring */}
            <motion.div 
              className="glass-card rounded-2xl p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" /> Live Admin Monitoring
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="text-left py-3 px-2">Admin</th>
                      <th className="text-center py-3 px-2">Total</th>
                      <th className="text-center py-3 px-2">Pending</th>
                      <th className="text-center py-3 px-2">Completed</th>
                      <th className="text-right py-3 px-2">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 font-medium">@{admin.username}</td>
                        <td className="text-center py-3 px-2">{admin.totalOrders}</td>
                        <td className="text-center py-3 px-2">
                          <span className="text-yellow-400">{admin.pendingOrders}</span>
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className="text-green-400">{admin.completedOrders}</span>
                        </td>
                        <td className="text-right py-3 px-2">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}${admin.uniqueLink}`)
                              toast.success('Copied!')
                            }}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            Copy Link
                          </button>
                        </td>
                      </tr>
                    ))}
                    {admins.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">No admins yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Admins Management */}
        {activeTab === 'admins' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Add New Admin
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  placeholder="Username"
                  className="bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <motion.button
                  onClick={addAdmin}
                  className="bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" /> Add Admin
                </motion.button>
              </div>
            </div>

            <div className="space-y-3">
              {admins.map((admin, idx) => (
                <motion.div
                  key={admin.id}
                  className="glass-card rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-pink-500/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-bold">@{admin.username}</p>
                        <p className="text-xs text-gray-400">Pass: {admin.password}</p>
                        <p className="text-xs text-cyan-400 mt-1">{window.location.origin}{admin.uniqueLink}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="flex gap-3 text-xs">
                          <span className="text-yellow-400">{admin.pendingOrders} pending</span>
                          <span className="text-green-400">{admin.completedOrders} done</span>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => removeAdmin(admin.id)}
                        className="p-2 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
              <h2 className="text-xl font-bold">All Orders</h2>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                Total: {orders.length}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="text-left py-3 px-2">User</th>
                    <th className="text-left py-3 px-2">Service</th>
                    <th className="text-center py-3 px-2">Qty</th>
                    <th className="text-right py-3 px-2">Price</th>
                    <th className="text-center py-3 px-2">Admin</th>
                    <th className="text-center py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-2">@{order.tiktokUsername}</td>
                      <td className="py-3 px-2 capitalize">{order.service}</td>
                      <td className="text-center py-3 px-2">{order.quantity}</td>
                      <td className="text-right py-3 px-2 font-bold">{order.price} PKR</td>
                      <td className="text-center py-3 px-2 text-xs">{order.adminUsername}</td>
                      <td className="text-center py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">No orders yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                className="glass-card rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center text-xs font-bold">
                      {review.userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">@{review.userName}</p>
                      <p className="text-xs text-gray-400">via {review.adminUsername}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-300">{review.comment}</p>
              </motion.div>
            ))}
            {reviews.length === 0 && (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No reviews yet</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Complaints */}
        {activeTab === 'complaints' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold mb-4">Complaints</h2>
            {complaints.map((complaint, idx) => (
              <motion.div
                key={complaint.id}
                className="glass-card rounded-2xl p-6 border-red-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-red-400" />
                    <p className="font-semibold text-sm">@{complaint.userName}</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{complaint.message}</p>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>Order: {complaint.orderId?.slice(0, 8)}</span>
                  <span>Admin: {complaint.adminUsername}</span>
                </div>
              </motion.div>
            ))}
            {complaints.length === 0 && (
              <div className="glass-card rounded-2xl p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No complaints yet</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-2xl"
          >
            {/* Pricing Settings */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" /> Pricing Settings (PKR per unit)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Followers', value: followersPrice, setter: setFollowersPrice },
                  { label: 'Likes', value: likesPrice, setter: setLikesPrice },
                  { label: 'Comments', value: commentsPrice, setter: setCommentsPrice },
                  { label: 'Shares', value: sharesPrice, setter: setSharesPrice },
                ].map((item) => (
                  <div key={item.label}>
                    <label className="block text-xs text-gray-400 mb-1">{item.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={item.value}
                      onChange={(e) => item.setter(parseFloat(e.target.value))}
                      className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                ))}
              </div>
              <motion.button
                onClick={updatePricing}
                className="w-full mt-4 bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-3 rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Update Pricing
              </motion.button>
            </div>

            {/* Owner Credentials */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-400" /> Change Credentials
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="New Username (optional)"
                  className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <motion.button
                  onClick={changePassword}
                  className="w-full bg-gradient-to-r from-pink-400 to-rose-500 text-black font-bold py-3 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Update Credentials
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
