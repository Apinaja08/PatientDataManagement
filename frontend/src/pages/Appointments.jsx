import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getAppointments, getPatients,
  createAppointment, cancelAppointment, deleteAppointment,
} from '../api/api'
import Spinner from '../components/Spinner'

const EMPTY_FORM = { patient: '', doctor: '', date: '', reason: '', status: 'Scheduled' }

const statusBadge = (s) => {
  if (s === 'Scheduled') return <span className="badge-scheduled">{s}</span>
  if (s === 'Completed') return <span className="badge-completed">{s}</span>
  return <span className="badge-cancelled">{s}</span>
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [saving, setSaving]             = useState(false)
  const [filter, setFilter]             = useState('All')

  const load = async () => {
    try {
      const [a, p] = await Promise.all([getAppointments(), getPatients()])
      setAppointments(a.data)
      setPatients(p.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleBook = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createAppointment(form)
      toast.success('Appointment booked!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error booking appointment')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await cancelAppointment(id)
      toast.success('Appointment cancelled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment permanently?')) return
    try {
      await deleteAppointment(id)
      toast.success('Appointment deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = filter === 'All'
    ? appointments
    : appointments.filter(a => a.status === filter)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['All', 'Scheduled', 'Completed', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Book Appointment
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Patient', 'Doctor', 'Date', 'Reason', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{a.patient?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{a.patient?.contact || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.doctor}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(a.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{a.reason || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(a.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {a.status === 'Scheduled' && (
                          <button onClick={() => handleCancel(a._id)} className="btn-warning">
                            Cancel
                          </button>
                        )}
                        <button onClick={() => handleDelete(a._id)} className="btn-danger !px-2 !py-1.5 !text-xs">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Book Appointment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleBook} className="px-6 py-4 space-y-3">
              <div>
                <label className="label">Patient *</label>
                <select required value={form.patient} onChange={e => setForm({...form, patient: e.target.value})}
                  className="input-field">
                  <option value="">— Select patient —</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.contact})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Doctor *</label>
                <input required value={form.doctor} onChange={e => setForm({...form, doctor: e.target.value})}
                  className="input-field" placeholder="Dr. Smith" />
              </div>
              <div>
                <label className="label">Date & Time *</label>
                <input required type="datetime-local" value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label">Reason</label>
                <input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
                  className="input-field" placeholder="Regular checkup" />
              </div>
              <div>
                <label className="label">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  className="input-field">
                  <option>Scheduled</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Spinner size="sm" /> : null}
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
