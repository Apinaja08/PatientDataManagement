import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})

// ── Patients ──────────────────────────────────────
export const getPatients        = ()        => api.get('/patients')
export const getPatient         = (id)      => api.get(`/patients/${id}`)
export const createPatient      = (data)    => api.post('/patients', data)
export const updatePatient      = (id, data)=> api.put(`/patients/${id}`, data)
export const updateAddress      = (id, addr)=> api.patch(`/patients/${id}/address`, { address: addr })
export const deletePatient      = (id)      => api.delete(`/patients/${id}`)

// ── Appointments ───────────────────────────────────
export const getAppointments    = ()        => api.get('/appointments')
export const createAppointment  = (data)    => api.post('/appointments', data)
export const cancelAppointment  = (id)      => api.patch(`/appointments/${id}/cancel`)
export const deleteAppointment  = (id)      => api.delete(`/appointments/${id}`)
export const checkAvailability  = (doctor, date) =>
  api.get(`/appointments/availability?doctor=${encodeURIComponent(doctor)}&date=${date}`)

export default api
