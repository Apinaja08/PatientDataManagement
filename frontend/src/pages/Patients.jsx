import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getPatients, createPatient, updatePatient,
  updateAddress, deletePatient,
} from '../api/api'
import Spinner from '../components/Spinner'

const EMPTY_FORM = {
  name: '', dateOfBirth: '', gender: 'Male',
  contact: '', address: '', medicalHistory: '',
}

export default function Patients() {
  const [patients, setPatients]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)   // patient being edited (full edit)
  const [addrModal, setAddrModal]   = useState(null)   // patient id for address-only update
  const [addrValue, setAddrValue]   = useState('')
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')

  const load = async () => {
    try {
      const { data } = await getPatients()
      setPatients(data)
    } catch {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditTarget(p)
    setForm({
      name: p.name,
      dateOfBirth: p.dateOfBirth?.split('T')[0] || '',
      gender: p.gender,
      contact: p.contact,
      address: p.address || '',
      medicalHistory: p.medicalHistory || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editTarget) {
        await updatePatient(editTarget._id, form)
        toast.success('Patient updated!')
      } else {
        await createPatient(form)
        toast.success('Patient added!')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving patient')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient? This cannot be undone.')) return
    try {
      await deletePatient(id)
      toast.success('Patient deleted')
      load()
    } catch {
      toast.error('Failed to delete patient')
    }
  }

  const handleAddressUpdate = async () => {
    if (!addrValue.trim()) return toast.error('Address cannot be empty')
    try {
      await updateAddress(addrModal, addrValue)
      toast.success('Address updated!')
      setAddrModal(null)
      setAddrValue('')
      load()
    } catch {
      toast.error('Failed to update address')
    }
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.contact.includes(search)
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or contact..."
          className="input-field max-w-xs"
        />
        <button onClick={openAdd} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Patient
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>No patients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Age', 'Gender', 'Contact', 'Address', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.medicalHistory || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.age ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.gender === 'Male' ? 'bg-blue-50 text-blue-700' :
                        p.gender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-gray-100 text-gray-600'
                      }`}>{p.gender}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.contact}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{p.address || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="btn-warning">Edit</button>
                        <button
                          onClick={() => { setAddrModal(p._id); setAddrValue(p.address || '') }}
                          className="btn-success"
                        >Address</button>
                        <button onClick={() => handleDelete(p._id)} className="btn-danger !px-2 !py-1.5 !text-xs">
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">{editTarget ? 'Edit Patient' : 'Add New Patient'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="input-field" placeholder="John Doe" />
                </div>
                <div>
                  <label className="label">Date of Birth *</label>
                  <input required type="date" value={form.dateOfBirth}
                    onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Gender *</label>
                  <select required value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                    className="input-field">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Contact *</label>
                  <input required value={form.contact} onChange={e => setForm({...form, contact: e.target.value})}
                    className="input-field" placeholder="0771234567" />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="input-field" placeholder="123 Main St, Colombo" />
              </div>
              <div>
                <label className="label">Medical History</label>
                <textarea rows={2} value={form.medicalHistory}
                  onChange={e => setForm({...form, medicalHistory: e.target.value})}
                  className="input-field resize-none" placeholder="Diabetes, Hypertension..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Spinner size="sm" /> : null}
                  {editTarget ? 'Save Changes' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Update Modal */}
      {addrModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Update Address</h2>
              <button onClick={() => setAddrModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <label className="label">New Address</label>
                <input value={addrValue} onChange={e => setAddrValue(e.target.value)}
                  className="input-field" placeholder="456 New Road, Kandy" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAddrModal(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleAddressUpdate} className="btn-primary">Update Address</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
