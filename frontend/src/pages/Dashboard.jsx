import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPatients, getAppointments } from '../api/api'
import Spinner from '../components/Spinner'

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [patients, setPatients]         = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([getPatients(), getAppointments()])
      .then(([p, a]) => {
        setPatients(p.data)
        setAppointments(a.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const scheduled  = appointments.filter(a => a.status === 'Scheduled').length
  const completed  = appointments.filter(a => a.status === 'Completed').length
  const cancelled  = appointments.filter(a => a.status === 'Cancelled').length
  const recent5    = [...patients].reverse().slice(0, 5)
  const upcoming5  = appointments
    .filter(a => a.status === 'Scheduled')
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value={patients.length}
          color="bg-blue-100"
          icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="Scheduled"
          value={scheduled}
          color="bg-yellow-100"
          icon={<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="Completed"
          value={completed}
          color="bg-green-100"
          icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Cancelled"
          value={cancelled}
          color="bg-red-100"
          icon={<svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Patients</h2>
            <Link to="/patients" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {recent5.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No patients yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent5.map(p => (
                <li key={p._id} className="py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.gender} · Age {p.age} · {p.contact}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {upcoming5.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No upcoming appointments</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming5.map(a => (
                <li key={a._id} className="py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-semibold text-sm">
                    {a.doctor.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {a.patient?.name || 'Unknown'} → {a.doctor}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.date).toLocaleDateString('en-US', { dateStyle: 'medium' })} · {a.reason || 'No reason'}
                    </p>
                  </div>
                  <span className="badge-scheduled">Scheduled</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
