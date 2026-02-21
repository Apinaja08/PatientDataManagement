import { useLocation } from 'react-router-dom'

const titles = {
  '/dashboard':    { label: 'Dashboard',             sub: 'Overview of your system' },
  '/patients':     { label: 'Patients',              sub: 'Manage patient records' },
  '/appointments': { label: 'Appointments',          sub: 'Manage appointments' },
  '/availability': { label: 'Doctor Availability',   sub: 'Check doctor schedules' },
}

export default function Navbar() {
  const { pathname } = useLocation()
  const current = titles[pathname] || { label: 'PatientCare', sub: '' }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{current.label}</h1>
        <p className="text-xs text-gray-500">{current.sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 font-medium">
          ● Connected
        </span>
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
      </div>
    </header>
  )
}
