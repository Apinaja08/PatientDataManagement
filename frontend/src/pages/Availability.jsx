import { useState } from 'react'
import toast from 'react-hot-toast'
import { checkAvailability } from '../api/api'
import Spinner from '../components/Spinner'

export default function Availability() {
  const [doctor,  setDoctor]  = useState('')
  const [date,    setDate]    = useState('')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!doctor.trim() || !date) return toast.error('Please enter both doctor name and date')
    setLoading(true)
    setResult(null)
    try {
      const { data } = await checkAvailability(doctor.trim(), date)
      setResult(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error checking availability')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setDoctor('')
    setDate('')
    setResult(null)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Form card */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Check Doctor Availability</h2>
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="label">Doctor Name *</label>
            <input
              value={doctor}
              onChange={e => setDoctor(e.target.value)}
              className="input-field"
              placeholder="Dr. Smith"
            />
          </div>
          <div>
            <label className="label">Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Spinner size="sm" /> : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              Check Availability
            </button>
            {result && (
              <button type="button" onClick={handleClear} className="btn-secondary">
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className={`card border-l-4 ${result.available ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex items-start gap-3">
            {result.available ? (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <p className={`font-semibold text-lg ${result.available ? 'text-green-700' : 'text-red-600'}`}>
                {result.available ? 'Available' : 'Not Available'}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">{result.message}</p>
            </div>
          </div>

          {/* Existing appointments if not available */}
          {!result.available && result.appointments?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Existing Appointments on this day
              </p>
              <div className="space-y-2">
                {result.appointments.map(a => (
                  <div key={a._id}
                    className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {a.patient?.name || 'Unknown Patient'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(a.date).toLocaleTimeString('en-US', { timeStyle: 'short' })} · {a.reason || 'No reason'}
                      </p>
                    </div>
                    <span className="badge-scheduled">Scheduled</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">How it works</p>
        <ul className="space-y-1 text-blue-600 list-disc list-inside">
          <li>Enter the doctor's exact name as saved in appointments</li>
          <li>Select the date you want to check</li>
          <li>The system checks for all "Scheduled" appointments on that day</li>
          <li>If none found, the doctor is marked as available</li>
        </ul>
      </div>
    </div>
  )
}
