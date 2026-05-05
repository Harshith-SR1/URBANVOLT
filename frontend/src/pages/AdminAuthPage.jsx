import React, { useState } from 'react'
import { Lock, ShieldCheck } from 'lucide-react'
import { apiService } from '../services/api'
import { useAuthStore } from '../contexts/store'
import { useNavigate } from 'react-router-dom'

const AdminAuthPage = () => {
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('admin@urbanvolt.ai')
  const [password, setPassword] = useState('Admin@123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    // Basic client-side validation
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid admin email')
      setLoading(false)
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    try {
      const response = await apiService.loginAdmin({ email, password })
      const token = response.data.token.access_token
      const profile = response.data.admin
      setAuth({ token, role: 'admin', profile })
      navigate('/admin')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Admin login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-5 space-y-4">
        <div>
          <p className="text-xs text-[var(--primary)] uppercase tracking-wider">BESCOM Console</p>
          <h1 className="text-2xl font-bold">Administrator Login</h1>
          <p className="text-sm text-gray-400">Email + Password secured access</p>
        </div>

        <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" />
        <input
          className="input-field"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button className="btn-primary w-full" onClick={handleLogin} disabled={loading}>
          <Lock size={16} className="inline mr-2" />
          {loading ? 'Signing in...' : 'Login as Admin'}
        </button>

        <p className="text-xs text-gray-500 flex items-center gap-2">
          <ShieldCheck size={12} />
          Supports role: super_admin / operator
        </p>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}

export default AdminAuthPage
