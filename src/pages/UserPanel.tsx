import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Heart, MessageCircle, Share2, 
  Upload, CreditCard, CheckCircle, Clock, 
  Star, MessageSquare, AlertCircle, ArrowRight,
  Zap, Shield, Globe, Smartphone, X
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = ''

const services = [
  { id: 'followers', name: 'Followers', icon: Users, color: '#25F4EE', description: 'Real followers jaldi' },
  { id: 'likes', name: 'Likes', icon: Heart, color: '#FE2C55', description: 'Video likes boost' },
  { id: 'comments', name: 'Comments', icon: MessageCircle, color: '#25F4EE', description: 'Comments increase karein' },
  { id: 'shares', name: 'Shares', icon: Share2, color: '#FE2C55', description: 'Viral hone ka raasta' }
]

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black" />
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: Math.random() * 300 + 200,
            height: Math.random() * 300 + 200,
            background: i % 2 === 0 ? '#25F4EE' : '#FE2C55',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

export default function UserPanel() {
  const { adminLink } = useParams()
  const [step, setStep] = useState(1)
  const [tiktokUsername, setTiktokUsername] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState(0)
  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState('')
  const [orderId, setOrderId] = useState('')
  const [orderStatus, setOrderStatus] = useState('pending')
  const [adminMessage, setAdminMessage] = useState('')
  const [adminData, setAdminData] = useState<any>(null)
  const [pricing, setPricing] = useState<any>(null)
  const [showReview, setShowReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showComplaint, setShowComplaint] = useState(false)
  const [complaintText, setComplaintText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchServices()
    if (adminLink) {
      fetchAdminByLink(adminLink)
    }
  }, [adminLink])

  useEffect(() => {
    if (orderId) {
      const interval = setInterval(() => {
        checkOrderStatus()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [orderId])

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services`)
      const data = await res.json()
      setPricing(data.services)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchAdminByLink = async (link: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/by-link/${encodeURIComponent(link)}`)
      const data = await res.json()
      if (data.success) {
        setAdminData(data.admin)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const calculatePrice = async (svc: string, qty: string) => {
    if (!svc || !qty) return
    try {
      const res = await fetch(`${API_URL}/api/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: svc, quantity: qty })
      })
      const data = await res.json()
      setPrice(data.price)
    } catch (e) {
      console.error(e)
    }
  }

  const handleServiceSelect = (svc: string) => {
    setSelectedService(svc)
    if (quantity) calculatePrice(svc, quantity)
  }

  const handleQuantityChange = (val: string) => {
    setQuantity(val)
    if (selectedService && val) {
      calculatePrice(selectedService, val)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setScreenshot(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const placeOrder = async () => {
    if (!tiktokUsername || !selectedService || !quantity || !transactionId) {
      toast.error('Sari fields bharein!')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiktokUsername,
          service: selectedService,
          quantity,
          price,
          transactionId,
          screenshot,
          adminLink: adminLink ? `/order/${adminLink}` : null
        })
      })
      const data = await res.json()
      if (data.success) {
        setOrderId(data.order.id)
        setOrderStatus('pending')
        toast.success('Order place ho gaya!')
        setStep(4)
      }
    } catch (e) {
      toast.error('Order failed!')
    }
  }

  const checkOrderStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/order-status/${orderId}`)
      const data = await res.json()
      if (data.status) {
        setOrderStatus(data.status)
        if (data.adminMessage) setAdminMessage(data.adminMessage)
        if (data.status === 'completed') {
          toast.success('Order complete ho gaya!')
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const submitReview = async () => {
    try {
      await fetch(`${API_URL}/api/submit-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          rating: reviewRating,
          comment: reviewComment,
          userName: tiktokUsername
        })
      })
      toast.success('Review bhej diya gaya!')
      setShowReview(false)
    } catch (e) {
      toast.error('Review failed!')
    }
  }

  const submitComplaint = async () => {
    try {
      await fetch(`${API_URL}/api/submit-complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: tiktokUsername,
          message: complaintText,
          orderId,
          adminUsername: adminData?.username || ''
        })
      })
      toast.success('Complaint register ho gayi!')
      setShowComplaint(false)
      setComplaintText('')
    } catch (e) {
      toast.error('Complaint failed!')
    }
  }

  const openWhatsApp = () => {
    const text = `Complaint: Order ID ${orderId}\nUser: ${tiktokUsername}\nIssue: ${complaintText}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <motion.header 
        className="relative z-10 py-6 px-4 border-b border-white/10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">TikTok Boost Pro</h1>
              <p className="text-xs text-gray-400">Pakistan #1 SMM Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>100% Secure</span>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? 'bg-gradient-to-r from-cyan-400 to-pink-500 text-black' : 'bg-white/10 text-gray-400'
                }`}
                animate={{ scale: step === s ? 1.1 : 1 }}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </motion.div>
              {s < 4 && (
                <div className={`w-12 h-0.5 ${step > s ? 'bg-gradient-to-r from-cyan-400 to-pink-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Username */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <motion.h2 
                  className="text-3xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Apna <span className="gradient-text">TikTok Username</span> Dalein
                </motion.h2>
                <p className="text-gray-400">Sahi username se order sahi jagah jaye ga</p>
              </div>

              <motion.div 
                className="glass-card rounded-2xl p-8 max-w-lg mx-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-pink-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold">TikTok Username</p>
                    <p className="text-xs text-gray-400">@username format mein nahi, sirf username</p>
                  </div>
                </div>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <input
                    type="text"
                    value={tiktokUsername}
                    onChange={(e) => setTiktokUsername(e.target.value.replace(/^@/, ''))}
                    placeholder="apna username yahan likhein..."
                    className="w-full bg-black/50 border border-white/20 rounded-xl py-4 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <motion.button
                  onClick={() => tiktokUsername ? setStep(2) : toast.error('Username dalain!')}
                  className="w-full mt-6 bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Agay Barhein <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 2: Service Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  <span className="gradient-text">Service</span> Chunein
                </h2>
                <p className="text-gray-400">Apni zaroorat ki service select karein</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {services.map((service, idx) => {
                  const Icon = service.icon
                  const isSelected = selectedService === service.id
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`glass-card rounded-2xl p-6 cursor-pointer transition-all ${
                        isSelected ? 'border-cyan-400/50 glow-cyan' : 'hover:border-white/30'
                      }`}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center"
                          style={{ background: `${service.color}20` }}
                        >
                          <Icon className="w-7 h-7" style={{ color: service.color }} />
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 text-black" />
                          </motion.div>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{service.name}</h3>
                      <p className="text-sm text-gray-400">{service.description}</p>
                      <p className="text-sm mt-2" style={{ color: service.color }}>
                        {pricing ? `${pricing.find((p: any) => p.id === service.id)?.price} PKR per 1` : 'Loading...'}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              {selectedService && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 max-w-lg mx-auto"
                >
                  <label className="block text-sm font-medium mb-3">Quantity (Kitne chahiye?)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder="Maslan: 100, 500, 1000"
                    className="w-full bg-black/50 border border-white/20 rounded-xl py-4 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  {price > 0 && (
                    <motion.div 
                      className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-400/10 to-pink-500/10 border border-cyan-400/20"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      <p className="text-sm text-gray-400">Total Price</p>
                      <p className="text-2xl font-bold gradient-text">{price} PKR</p>
                    </motion.div>
                  )}
                  <motion.button
                    onClick={() => price > 0 ? setStep(3) : toast.error('Quantity dalain!')}
                    className="w-full mt-4 bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Payment Pay Jayein <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  <span className="gradient-text">Payment</span> Karein
                </h2>
                <p className="text-gray-400">Neechay diye gaye account pe payment bhejein</p>
              </div>

              <div className="max-w-lg mx-auto space-y-4">
                {/* Order Summary */}
                <motion.div 
                  className="glass-card rounded-2xl p-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" /> Order Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">Username</span><span>@{tiktokUsername}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Service</span><span className="capitalize">{selectedService}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Quantity</span><span>{quantity}</span></div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span className="gradient-text">Total</span>
                      <span className="gradient-text">{price} PKR</span>
                    </div>
                  </div>
                </motion.div>

                {/* Admin Payment Details */}
                <motion.div 
                  className="glass-card rounded-2xl p-6 border-yellow-500/20"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-pink-400" /> Payment Details
                  </h3>
                  
                  {adminData?.paymentMethod ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <Smartphone className="w-6 h-6 text-green-400" />
                        <div>
                          <p className="text-sm text-gray-400">Method</p>
                          <p className="font-semibold">{adminData.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-sm text-gray-400">Account Number</p>
                        <p className="font-mono text-lg font-bold text-cyan-400">{adminData.accountNumber}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-sm text-gray-400">Account Name</p>
                        <p className="font-semibold">{adminData.accountName}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-400">
                        <AlertCircle className="w-4 h-4 inline mr-2" />
                        Admin ne abhi tak payment details add nahi ki. Order place karein, admin contact kare ga.
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Payment Proof */}
                <motion.div 
                  className="glass-card rounded-2xl p-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-bold mb-4">Payment Proof</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Transaction ID</label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="JazzCash/EasyPaisa Transaction ID"
                        className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Screenshot Upload</label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <motion.button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 hover:border-cyan-400 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <Upload className="w-5 h-5 text-cyan-400" />
                        <span>{screenshot ? 'Screenshot uploaded' : 'Click to upload screenshot'}</span>
                      </motion.button>
                      {screenshot && (
                        <motion.img 
                          src={screenshot} 
                          alt="Payment proof" 
                          className="mt-3 rounded-xl max-h-40 object-cover"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                    </div>
                  </div>

                  <motion.button
                    onClick={placeOrder}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap className="w-5 h-5" /> Order Place Karein
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Order Tracking */}
          {step === 4 && orderId && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-black" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">
                  <span className="gradient-text">Order Placed!</span>
                </h2>
                <p className="text-gray-400">Order ID: <span className="font-mono text-cyan-400">{orderId.slice(0, 8)}</span></p>
              </div>

              <div className="max-w-lg mx-auto space-y-4">
                {/* Status Card */}
                <motion.div 
                  className="glass-card rounded-2xl p-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Order Status</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      orderStatus === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {orderStatus === 'completed' ? 'COMPLETED' : 'PENDING'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${orderStatus === 'completed' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                      <span className="text-sm">
                        {orderStatus === 'completed' ? 'Order complete ho gaya!' : 'Admin process kar raha hai...'}
                      </span>
                    </div>
                    
                    {adminMessage && (
                      <motion.div 
                        className="p-4 rounded-xl bg-cyan-400/10 border border-cyan-400/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-sm text-gray-400 mb-1">Admin Message:</p>
                        <p className="text-sm">{adminMessage}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    onClick={() => setShowReview(true)}
                    className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-yellow-400/50 transition-colors"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <Star className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm font-medium">Review Dein</span>
                  </motion.button>

                  <motion.button
                    onClick={() => setShowComplaint(true)}
                    className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-red-400/50 transition-colors"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <MessageSquare className="w-6 h-6 text-red-400" />
                    <span className="text-sm font-medium">Complaint</span>
                  </motion.button>
                </div>

                <motion.button
                  onClick={() => {
                    setStep(1)
                    setOrderId('')
                    setOrderStatus('pending')
                    setTiktokUsername('')
                    setSelectedService('')
                    setQuantity('')
                    setPrice(0)
                    setTransactionId('')
                    setScreenshot('')
                  }}
                  className="w-full glass-card rounded-2xl py-4 font-medium hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  New Order
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Review Modal */}
      <AnimatePresence>
        {showReview && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass-card rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Review Dein</h3>
                <button onClick={() => setShowReview(false)}><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  </motion.button>
                ))}
              </div>
              
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Apna experience share karein..."
                className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 min-h-[100px]"
              />
              
              <motion.button
                onClick={submitReview}
                className="w-full mt-4 bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-3 rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Review
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complaint Modal */}
      <AnimatePresence>
        {showComplaint && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass-card rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Complaint</h3>
                <button onClick={() => setShowComplaint(false)}><X className="w-5 h-5" /></button>
              </div>
              
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Apni complaint likhein..."
                className="w-full bg-black/50 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 min-h-[100px]"
              />
              
              <div className="flex gap-3 mt-4">
                <motion.button
                  onClick={submitComplaint}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-3 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit
                </motion.button>
                <motion.button
                  onClick={openWhatsApp}
                  className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  WhatsApp
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
