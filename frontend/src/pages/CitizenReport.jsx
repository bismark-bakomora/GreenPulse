import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, CheckCircle, Upload, Loader2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import L from 'leaflet'
import { reportAPI } from '../lib/api'
import { ACCRA_CENTER, ACCRA_ZOOM, ISSUE_CATEGORIES } from '../lib/constants'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

const steps = ['Photo', 'Location', 'Details', 'Submit']

function getResidentId() {
  try {
    return JSON.parse(localStorage.getItem('gp_resident') || 'null')?.id
  } catch {
    return null
  }
}

export default function CitizenReport() {
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [position, setPosition] = useState(null)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const fileRef = useRef()
  const qc = useQueryClient()

  useEffect(() => {
    const lat = parseFloat(params.get('lat'))
    const lng = parseFloat(params.get('lng'))
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) setPosition([lat, lng])
  }, [params])

  const mutation = useMutation({
    mutationFn: (formData) => reportAPI.submit(formData),
    onSuccess: (res) => {
      setEarnedPoints(res.data.pointsEarned || 5)
      setSubmitted(true)
      qc.invalidateQueries({ queryKey: ['reports'] })
      qc.invalidateQueries({ queryKey: ['resident'] })
    },
    onError: (error) => {
      console.error('Report submission error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit. Please try again.'
      toast.error(errorMessage)
    },
  })

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setStep(1)
  }

  const handleSubmit = () => {
    if (!photo || !position) {
      toast.error('Please add a photo and pin the location.')
      return
    }
    if (!category) {
      toast.error('Please select a category.')
      return
    }
    const fd = new FormData()
    fd.append('photo', photo)
    fd.append('lat', position[0])
    fd.append('lng', position[1])
    fd.append('category', category)
    fd.append('severity', ISSUE_CATEGORIES[category]?.defaultSeverity || 'MEDIUM')
    fd.append('description', description)
    const residentId = getResidentId()
    if (residentId) fd.append('residentId', residentId)
    mutation.mutate(fd)
  }

  const reset = () => {
    setSubmitted(false)
    setStep(0)
    setPhoto(null)
    setPhotoPreview(null)
    setPosition(null)
    setCategory('')
    setDescription('')
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card max-w-md w-full text-center py-12"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-gp-foam rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-gp-emerald" />
          </motion.div>
          <h2 className="font-display font-bold text-2xl text-gp-slate mb-2">Report Submitted!</h2>
          <p className="text-gp-grey mb-6">
            A collector has been notified. You can track this issue from your dashboard.
          </p>
          <div className="bg-gp-foam rounded-2xl p-6 mb-6">
            <div className="font-display font-bold text-4xl text-gp-emerald mb-1">
              +{earnedPoints}
            </div>
            <div className="text-gp-grey text-sm flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              GreenPoints earned
            </div>
          </div>
          <button onClick={reset} className="btn-primary w-full">
            Report Another Issue
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-gp-slate mb-2">Report an Issue</h1>
        <p className="text-gp-grey">Choose a category, describe what you see, and help keep your neighbourhood clean.</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-gp-emerald text-white' :
              i === step ? 'bg-gp-forest text-white' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-gp-forest' : 'text-gray-400'}`}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-gp-emerald' : 'bg-gray-100'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="photo"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display font-semibold text-xl text-gp-slate mb-2">Take a photo of the issue</h2>
              <p className="text-gp-grey text-sm mb-6">A clear photo helps our team verify the report faster.</p>
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                onChange={handlePhoto} className="hidden" />
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Issue" className="w-full h-64 object-cover rounded-xl" />
                  <button onClick={() => fileRef.current.click()}
                    className="absolute bottom-3 right-3 bg-white rounded-lg px-3 py-1.5 text-sm font-medium text-gp-slate shadow">
                    Change photo
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current.click()}
                  className="w-full border-2 border-dashed border-gp-mint rounded-xl p-12 text-center
                             hover:bg-gp-foam transition-colors group">
                  <Camera className="w-10 h-10 text-gp-jade mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p className="font-medium text-gp-forest">Click to open camera or upload photo</p>
                  <p className="text-gp-grey text-sm mt-1">JPG, PNG up to 10MB</p>
                </button>
              )}
              {photoPreview && (
                <button onClick={() => setStep(1)} className="btn-primary w-full mt-4">
                  Next: Pin Location
                </button>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="map"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display font-semibold text-xl text-gp-slate mb-2">Pin the location</h2>
              <p className="text-gp-grey text-sm mb-4">
                <MapPin className="w-4 h-4 inline mr-1 text-gp-jade" />
                Tap anywhere on the map to drop a pin
              </p>
              <div className="h-72 rounded-xl overflow-hidden mb-4">
                <MapContainer center={position || ACCRA_CENTER} zoom={ACCRA_ZOOM} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap contributors'
                  />
                  <LocationPicker onSelect={setPosition} />
                  {position && <Marker position={position} />}
                </MapContainer>
              </div>
              {position && (
                <p className="text-xs text-gp-grey font-mono bg-gp-foam px-3 py-2 rounded-lg mb-4">
                  📍 {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => position && setStep(2)}
                  className={`flex-1 ${position ? 'btn-primary' : 'bg-gray-100 text-gray-400 px-6 py-3 rounded-xl cursor-not-allowed'}`}>
                  Next: Add Details
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="details"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display font-semibold text-xl text-gp-slate mb-6">Tell us about the issue</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gp-slate mb-2" htmlFor="issue-category">Select a category</label>
                <select
                  id="issue-category"
                  className="input-field"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {Object.entries(ISSUE_CATEGORIES).map(([id, c]) => (
                    <option key={id} value={id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gp-slate mb-2" htmlFor="issue-description">Describe what you see</label>
                <textarea
                  id="issue-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Bin overflowing onto the pavement near the market entrance..."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={() => {
                    if (!category) { toast.error('Please select a category.'); return }
                    setStep(3)
                  }}
                  className="btn-primary flex-1"
                >
                  Review & Submit
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="review"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display font-semibold text-xl text-gp-slate mb-6">Review your report</h2>
              <div className="space-y-4 mb-6">
                <img src={photoPreview} alt="Issue" className="w-full h-48 object-cover rounded-xl" />
                <div className="bg-gp-foam rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gp-grey">Category</span>
                    <span className="font-medium text-gp-slate">{ISSUE_CATEGORIES[category]?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gp-grey">Location</span>
                    <span className="font-mono text-xs text-gp-slate">
                      {position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : '—'}
                    </span>
                  </div>
                  {description && (
                    <div className="text-sm pt-1 border-t border-white/60">
                      <span className="text-gp-grey block mb-1">What you see</span>
                      <span className="text-gp-slate">{description}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gp-grey">GreenPoints earned</span>
                    <span className="font-bold text-gp-emerald">+5 pts</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Edit</button>
                <button onClick={handleSubmit} disabled={mutation.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {mutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Submit Report</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
