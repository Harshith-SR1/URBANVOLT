import React, { useMemo, useState } from 'react'
import { ShieldCheck, Smartphone, KeyRound } from 'lucide-react'
import { apiService } from '../services/api'
import { useAuthStore } from '../contexts/store'
import { useNavigate } from 'react-router-dom'

const VEHICLE_OPTIONS = [
  { label: '2-Wheeler', value: '2W', charging: 'slow', connector: 'Type1' },
  { label: '3-Wheeler', value: '3W', charging: 'slow', connector: 'Type2' },
  { label: '4-Wheeler', value: '4W', charging: 'fast', connector: 'CCS' },
  { label: 'Commercial', value: 'Commercial', charging: 'fast', connector: 'CHAdeMO' },
]

const UserAuthPage = () => {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState('register')
  const [registering, setRegistering] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [otpHint, setOtpHint] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    email: '',
    password: '',
    vehicle_types: ['2W'],
    charging_type: 'fast',
    connector_type: 'CCS',
    battery_capacity: 40,
  })

  const selectedVehicles = useMemo(() => form.vehicle_types, [form.vehicle_types])

  const toggleVehicle = (vehicleType) => {
    setForm((prev) => {
      const exists = prev.vehicle_types.includes(vehicleType)
      const next = exists
        ? prev.vehicle_types.filter((v) => v !== vehicleType)
        : [...prev.vehicle_types, vehicleType]

      return { ...prev, vehicle_types: next.length ? next : prev.vehicle_types }
    })
  }

  const handleRegister = async () => {
    setRegistering(true)
    setError('')
    // Client-side validation
    if (!form.name || form.name.trim().length < 2) {
      setError('Please enter your full name')
      setRegistering(false)
      return
    }
    if (!form.phone_number || !/^\d{10,15}$/.test(form.phone_number)) {
      setError('Please enter a valid phone number (10-15 digits)')
      setRegistering(false)
      return
    }
    if (!Array.isArray(form.vehicle_types) || form.vehicle_types.length === 0) {
      setError('Please select at least one vehicle type')
      setRegistering(false)
      return
    }
    if (!form.battery_capacity || Number(form.battery_capacity) <= 0) {
      setError('Please provide a valid battery capacity')
      setRegistering(false)
      return
    }
    try {
      await apiService.registerUser(form)
      setStep('otp')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const handleSendOtp = async () => {
    setSendingOtp(true)
    setError('')
    try {
      const response = await apiService.sendUserOtp({ phone_number: form.phone_number })
      const otp = response.data?.otp_code
      setOtpHint(otp ? `Demo OTP: ${otp}` : 'OTP sent to your phone')
      setStep('verify')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to send OTP')
    } finally {
      setSendingOtp(false)
    }
  }

  const [otpCode, setOtpCode] = useState('')
  const handleVerifyOtp = async () => {
    setVerifying(true)
    setError('')
    try {
      const response = await apiService.verifyUserOtp({
        phone_number: form.phone_number,
        otp_code: otpCode,
      })

      const token = response.data.token.access_token
      const profile = response.data.user
      setAuth({ token, role: 'user', profile })
      navigate('/user')
    } catch (e) {
      setError(e?.response?.data?.detail || 'OTP verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const autoMapVehicleMeta = () => {
    const firstVehicle = VEHICLE_OPTIONS.find((item) => form.vehicle_types.includes(item.value))
    if (!firstVehicle) return
    setForm((prev) => ({
      ...prev,
      charging_type: firstVehicle.charging,
      connector_type: firstVehicle.connector,
    }))
  }

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-5 space-y-4">
        <div>
          <p className="text-xs text-[var(--primary)] uppercase tracking-wider">URBANVOLT</p>
          <h1 className="text-2xl font-bold">EV User Secure Login</h1>
          <p className="text-sm text-gray-400">Phone + OTP authentication for quick access</p>
        </div>

        {step === 'register' && (
          <div className="space-y-3">
            <input
              id="user-name"
              name="user-name"
              className="input-field"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              id="user-phone"
              name="user-phone"
              className="input-field"
              placeholder="Phone Number"
              value={form.phone_number}
              onChange={(e) => setForm((prev) => ({ ...prev, phone_number: e.target.value }))}
            />
            <input
              id="user-email"
              name="user-email"
              className="input-field"
              placeholder="Email (optional)"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              id="user-password"
              name="user-password"
              className="input-field"
              type="password"
              placeholder="Password (optional for email login)"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />

            <div>
              <p className="text-xs text-gray-400 mb-2">Select Vehicle Types (multi-select)</p>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_OPTIONS.map((vehicle) => (
                  <button
                    type="button"
                    key={vehicle.value}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      selectedVehicles.includes(vehicle.value)
                        ? 'border-[var(--primary)] text-[var(--primary)] bg-[rgba(0,212,255,0.08)]'
                        : 'border-[rgba(255,255,255,0.08)] text-gray-300'
                    }`}
                    onClick={() => {
                      toggleVehicle(vehicle.value)
                      setTimeout(autoMapVehicleMeta, 0)
                    }}
                  >
                    {vehicle.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              id="battery-capacity"
              name="battery-capacity"
              className="input-field"
              type="number"
              placeholder="Battery Capacity (kWh)"
              value={form.battery_capacity}
              onChange={(e) => setForm((prev) => ({ ...prev, battery_capacity: Number(e.target.value) || 1 }))}
            />

            <button className="btn-primary w-full" onClick={handleRegister} disabled={registering}>
              {registering ? 'Registering...' : 'Register User'}
            </button>
            <button className="btn-secondary w-full" onClick={handleSendOtp} disabled={sendingOtp || !form.phone_number}>
              <Smartphone size={16} className="inline mr-2" />
              {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-300">Registration done. Send OTP to continue.</p>
            <button className="btn-secondary w-full" onClick={handleSendOtp} disabled={sendingOtp}>
              {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-3">
            <did="verify-otp"
              name="verify-otp"
              iv className="text-xs text-gray-400">{otpHint}</div>
            <input
              className="input-field"
              placeholder="Enter OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
            />
            <button className="btn-primary w-full" onClick={handleVerifyOtp} disabled={verifying || otpCode.length < 4}>
              <ShieldCheck size={16} className="inline mr-2" />
              {verifying ? 'Verifying...' : 'Verify OTP & Login'}
            </button>
          </div>
        )}

        <div className="pt-1 border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <KeyRound size={12} />
            JWT auth with role-based access enabled
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}

export default UserAuthPage
