import React, { useState, useEffect } from 'react'
import { ArrowRight, TrendingUp, Battery, Zap, Users, Bell, LayoutDashboard, MapPinned, Activity, AlertTriangle, Wrench, Settings, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { apiService } from '../services/api'
import { useAnalyticsStore, useAuthStore } from '../contexts/store'
import AlertsPanel from '../components/AlertsPanel'

export const AdminDashboard = () => {
  const navigate = useNavigate()
  const { systemAnalytics, setSystemAnalytics, stationsAnalytics, setStationsAnalytics } =
    useAnalyticsStore()
  const { role, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('Dashboard')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sysRes, stationsRes] = await Promise.all([
          role === 'admin' ? apiService.getAdminDashboard() : apiService.getSystemAnalytics(),
          apiService.getStationsAnalytics(),
        ])
        setSystemAnalytics(sysRes.data)
        setStationsAnalytics(stationsRes.data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 5000)
    return () => clearInterval(interval)
  }, [setSystemAnalytics, setStationsAnalytics, role])

  // Generate mock chart data
  const chartData = [
    { time: '00:00', demand: 20, utilization: 30 },
    { time: '04:00', demand: 15, utilization: 20 },
    { time: '08:00', demand: 60, utilization: 75 },
    { time: '12:00', demand: 45, utilization: 55 },
    { time: '16:00', demand: 75, utilization: 90 },
    { time: '20:00', demand: 85, utilization: 95 },
    { time: '24:00', demand: 30, utilization: 40 },
  ]

  const StatCard = ({ icon: Icon, label, value, unit, trend }) => (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-[rgba(0,212,255,0.06)] shadow-[0_8px_30px_rgba(0,212,255,0.04)]">
        <Icon size={24} className="text-[var(--primary)]" />
      </div>
      <div className="flex-grow">
        <p className="text-gray-400 text-sm">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500">{unit}</p>
        </div>
      </div>
      {trend && (
        <div className={`text-sm font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-24 bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Stations', icon: MapPinned },
    { label: 'Analytics', icon: Activity },
    { label: 'Alerts', icon: AlertTriangle },
    { label: 'Demand Prediction', icon: TrendingUp },
    { label: 'Infrastructure Planning', icon: Wrench },
    { label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-[var(--dark-bg)] overflow-hidden">
      <aside className="hidden md:flex w-64 border-r border-[rgba(255,255,255,0.05)] p-4 flex-col gap-2 glass-card rounded-none">
        <div className="mb-4">
          <p className="text-xs text-[var(--primary)] uppercase tracking-wider">BESCOM</p>
          <h2 className="text-xl font-bold">URBANVOLT Admin</h2>
        </div>
        {sidebarItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActiveSection(label)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
              activeSection === label
                ? 'bg-[rgba(0,212,255,0.1)] text-[var(--primary)] border border-[rgba(0,212,255,0.2)]'
                : 'text-gray-300 hover:bg-[rgba(255,255,255,0.03)]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)]">
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="w-full text-left px-3 py-3 rounded-xl text-sm flex items-center gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
          >
            <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-all">
              <LogOut size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold">Logout</span>
              <span className="text-[10px] opacity-50">Exit Admin Session</span>
            </div>
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 glass-card border-b border-[rgba(255,255,255,0.03)]">
        <h1 className="text-3xl font-bold text-white">URBANVOLT Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time EV Charging Network Analytics</p>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
        {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Zap}
                label="Active Stations"
                value={systemAnalytics?.total_stations || 0}
                unit="stations"
                trend={5}
              />
              <StatCard
                icon={Users}
                label="Vehicles Served"
                value={systemAnalytics?.total_vehicles_served_today || systemAnalytics?.total_charging_sessions || 0}
                unit="today"
                trend={12}
              />
              <StatCard
                icon={Battery}
                label="Energy Distributed"
                value={(systemAnalytics?.total_energy_distributed || 0).toFixed(0)}
                unit="kWh"
                trend={8}
              />
              <StatCard
                icon={TrendingUp}
                label="Avg Utilization"
                value={Number(systemAnalytics?.avg_utilization || 0).toFixed(1)}
                unit="%"
                trend={-3}
              />
            </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demand Trend */}
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">24-Hour Demand Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1f3a',
                    border: '1px solid #2d3561',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="#00d4ff"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Station Utilization */}
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">Station Utilization</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1f3a',
                    border: '1px solid #2d3561',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="utilization" fill="#0066ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">System Alerts</h3>
            <button className="text-cyan-500 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <AlertsPanel />
        </div>

        {/* AI-Driven Administrative Insights (Part 2) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Redistribution & Load Analysis */}
          <div className="card border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Load Redistribution
              </h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">Real-time</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-xs text-blue-300 font-bold mb-1 uppercase">AI Suggestion</p>
                <p className="text-sm text-gray-300">Redirecting traffic from <b>FastCharge Hub 4</b> to <b>Volt Station 2</b></p>
                <p className="text-[10px] text-gray-500 mt-2">Optimization: Prevents congestion in Central Zone</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-red-500/5 border border-red-500/10 rounded">
                  <p className="text-[10px] text-red-400 font-bold">OVERLOADED</p>
                  <p className="text-xs font-bold">3 Stations</p>
                </div>
                <div className="p-2 bg-green-500/5 border border-green-500/10 rounded">
                  <p className="text-[10px] text-green-400 font-bold">UNDERUTILIZED</p>
                  <p className="text-xs font-bold">5 Stations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Planning */}
          <div className="card border-l-4 border-purple-500">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench size={18} className="text-purple-400" />
                Infrastructure Planning
              </h3>
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase font-bold">Growth Analysis</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <p className="text-xs text-purple-300 font-bold mb-1 uppercase">Expansion Zone</p>
                <p className="text-sm font-bold">Whitefield Corridor</p>
                <p className="text-xs text-gray-400 mt-1">Recommend: New 12-slot Station</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 font-bold mb-1 uppercase">Capacity Upgrade</p>
                <p className="text-sm font-bold">Indiranagar Metro Hub</p>
                <p className="text-xs text-purple-300 mt-1">+4 Fast Chargers Needed</p>
              </div>
            </div>
          </div>

          {/* Grid Impact & Data Patterns */}
          <div className="card border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-400" />
                Grid Load Impact
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Peak Load Period</span>
                <span className="font-bold text-amber-400">18:00 - 21:00</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[72%]"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  User Movement
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Demand Patterns
                </div>
              </div>
              <p className="text-[10px] text-gray-500 italic">Balancing efficiency: 92% achieved via AI redistribution</p>
            </div>
          </div>
        </div>

        {/* Demand Prediction + Infrastructure Planning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">Demand Prediction</h3>
              <span className="neon-badge">AI Forecast</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">Simulated LSTM/XGBoost demand forecast for next 6 hours.</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={[
                  { h: '1h', demand: 62 },
                  { h: '2h', demand: 68 },
                  { h: '3h', demand: 74 },
                  { h: '4h', demand: 71 },
                  { h: '5h', demand: 79 },
                  { h: '6h', demand: 83 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="h" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="demand" stroke="#00d4ff" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">Infrastructure Planning</h3>
              <Bell size={16} className="text-[var(--accent-orange)]" />
            </div>
            <p className="text-sm text-gray-400 mb-4">AI-suggested expansion zones based on wait time and overload.</p>
            <div className="space-y-3">
              {[
                { zone: 'Indiranagar', score: 92, action: 'Add 8 fast chargers' },
                { zone: 'Whitefield', score: 87, action: 'Add swap station' },
                { zone: 'Koramangala', score: 81, action: 'Upgrade grid capacity' },
              ].map((item) => (
                <div key={item.zone} className="p-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{item.zone}</p>
                    <p className="text-sm text-[var(--primary)]">{item.score}% priority</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.action}</p>
                </div>
              ))}
            </div>
          </div>
      </div>
      </div>

      {/* Floating AI Insights Info - For Admin Demo */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <div className="group relative">
          <button className="bg-purple-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all border-2 border-white/20">
            <TrendingUp size={24} />
          </button>
          <div className="absolute bottom-full right-0 mb-4 w-80 bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-5 shadow-2xl opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all">
            <h4 className="text-purple-400 font-bold text-base mb-3 flex items-center gap-2">
              <TrendingUp size={18} /> AI Admin Intelligence
            </h4>
            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <div>
                <p className="text-purple-300 font-bold uppercase text-[10px] mb-1">Infrastructure Planning</p>
                <p>Identifies high-demand zones and EV growth corridors. Detects congestion areas for capacity upgrades.</p>
              </div>
              <div>
                <p className="text-blue-300 font-bold uppercase text-[10px] mb-1">Load Management</p>
                <p>Real-time redistribution suggestions from overloaded hubs to underutilized stations.</p>
              </div>
              <div>
                <p className="text-amber-300 font-bold uppercase text-[10px] mb-1">Grid Impact</p>
                <p>Analyzes peak demand windows and balances efficiency for utility providers.</p>
              </div>
            </div>
        </div>
      </div>

      {/* Floating AI Insights Info - For Admin Demo */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <div className="group relative">
          <button className="bg-purple-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all border-2 border-white/20">
            <TrendingUp size={24} />
          </button>
          <div className="absolute bottom-full right-0 mb-4 w-80 bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-5 shadow-2xl opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all">
            <h4 className="text-purple-400 font-bold text-base mb-3 flex items-center gap-2">
              <TrendingUp size={18} /> AI Admin Intelligence
            </h4>
            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <div>
                <p className="text-purple-300 font-bold uppercase text-[10px] mb-1">Infrastructure Planning</p>
                <p>Identifies high-demand zones and EV growth corridors. Detects congestion areas for capacity upgrades.</p>
              </div>
              <div>
                <p className="text-blue-300 font-bold uppercase text-[10px] mb-1">Load Management</p>
                <p>Real-time redistribution suggestions from overloaded hubs to underutilized stations.</p>
              </div>
              <div>
                <p className="text-amber-300 font-bold uppercase text-[10px] mb-1">Grid Impact</p>
                <p>Analyzes peak demand windows and balances efficiency for utility providers.</p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default AdminDashboard
