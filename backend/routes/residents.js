const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const sign = payload => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
const POINTS = { MIXED: 4, ORGANIC: 6, PLASTIC: 10, EWASTE: 14 }

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, zoneId } = req.body
    if (!firstName || !lastName || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' })
    const resident = await prisma.resident.create({ data: { firstName, lastName, email: email.toLowerCase(), password: await bcrypt.hash(password, 12), zoneId }, select: { id: true, firstName: true, lastName: true, email: true, zoneId: true, greenPoints: true } })
    res.status(201).json({ resident, token: sign({ id: resident.id, name: resident.firstName, role: 'resident' }) })
  } catch (err) { res.status(409).json({ error: 'An account with this email already exists' }) }
})

router.post('/login', async (req, res) => {
  try {
    const resident = await prisma.resident.findUnique({ where: { email: req.body.email?.toLowerCase() } })
    if (!resident || !(await bcrypt.compare(req.body.password || '', resident.password))) return res.status(401).json({ error: 'Incorrect email or password' })
    const { password, ...safe } = resident
    res.json({ resident: safe, token: sign({ id: safe.id, name: safe.firstName, role: 'resident' }) })
  } catch { res.status(500).json({ error: 'Login failed' }) }
})

router.get('/:id', async (req, res) => {
  try {
    const resident = await prisma.resident.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, firstName: true, lastName: true, email: true, zoneId: true, greenPoints: true,
        dropoffs: { orderBy: { createdAt: 'desc' }, take: 10, include: { zone: { select: { name: true } } } },
        redemptions: { orderBy: { createdAt: 'desc' }, take: 10 },
        reports: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })
    if (!resident) return res.status(404).json({ error: 'Resident not found' })
    res.json(resident)
  } catch { res.status(500).json({ error: 'Unable to load resident' }) }
})

router.post('/:id/dropoffs', async (req, res) => {
  try {
    const { zoneId, wasteType, estimatedKg, isSorted } = req.body
    if (!zoneId || !wasteType || !estimatedKg) return res.status(400).json({ error: 'Zone, waste type, and estimated volume are required' })
    const kg = Number(estimatedKg)
    const points = Math.round(kg * (POINTS[wasteType] || 4) * (isSorted ? 1.5 : 1))
    const [dropoff, zone] = await prisma.$transaction([
      prisma.wasteDropoff.create({ data: { residentId: req.params.id, zoneId, wasteType, estimatedKg: kg, isSorted: Boolean(isSorted), verified: true } }),
      prisma.zone.update({ where: { id: zoneId }, data: { currentVolumeKg: { increment: kg } } }),
      prisma.resident.update({ where: { id: req.params.id }, data: { greenPoints: { increment: points } } }),
    ])
    res.status(201).json({ dropoff, pointsEarned: points, dispatchReady: zone.currentVolumeKg >= zone.thresholdKg })
  } catch { res.status(500).json({ error: 'Unable to log drop-off' }) }
})

router.post('/:id/redemptions', async (req, res) => {
  try {
    const { reward, points } = req.body
    const resident = await prisma.resident.findUnique({ where: { id: req.params.id } })
    if (!reward || !Number.isInteger(points) || points < 1) return res.status(400).json({ error: 'A valid reward is required' })
    if (!resident || resident.greenPoints < points) return res.status(400).json({ error: 'Insufficient GreenPoints' })
    const [redemption] = await prisma.$transaction([
      prisma.redemption.create({ data: { residentId: req.params.id, reward, points } }),
      prisma.resident.update({ where: { id: req.params.id }, data: { greenPoints: { decrement: points } } }),
    ])
    res.status(201).json(redemption)
  } catch { res.status(500).json({ error: 'Unable to redeem points' }) }
})

const VALID_WASTE_TYPES = ['PLASTIC', 'ORGANIC', 'MIXED', 'EWASTE']

// POST /api/residents/:id/pickups — request a home waste pickup
router.post('/:id/pickups', async (req, res) => {
  try {
    const { wasteType, weightKg, note } = req.body
    const kg = Number(weightKg)
    if (!VALID_WASTE_TYPES.includes(wasteType)) return res.status(400).json({ error: 'Please choose a valid waste type' })
    if (!kg || kg <= 0) return res.status(400).json({ error: 'Weight in kg is required' })
    const resident = await prisma.resident.findUnique({ where: { id: req.params.id } })
    if (!resident) return res.status(404).json({ error: 'Resident not found' })
    
    // Award green points for requesting pickup (2 points per kg)
    const pointsEarned = Math.round(kg * 2)
    
    const [pickup] = await prisma.$transaction([
      prisma.pickupRequest.create({
        data: { residentId: req.params.id, wasteType, weightKg: kg, note: note || null },
        include: { collector: { select: { id: true, name: true, phone: true, zone: true } } },
      }),
      prisma.resident.update({ where: { id: req.params.id }, data: { greenPoints: { increment: pointsEarned } } }),
      prisma.greenPointsLedger.create({
        data: { citizenId: req.params.id, points: pointsEarned, reason: 'Pickup request submitted' },
      }),
    ])
    
    res.status(201).json({ ...pickup, pointsEarned })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Unable to request pickup' })
  }
})

// GET /api/residents/:id/pickups — list a resident's pickup requests
router.get('/:id/pickups', async (req, res) => {
  try {
    const pickups = await prisma.pickupRequest.findMany({
      where: { residentId: req.params.id },
      include: { collector: { select: { id: true, name: true, phone: true, zone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(pickups)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Unable to load pickup requests' })
  }
})

router.get('/leaderboard/zones', async (_, res) => {
  try {
    const zones = await prisma.zone.findMany({ include: { dropoffs: true } })
    res.json(zones.map(z => ({ id: z.id, name: z.name, participants: new Set(z.dropoffs.map(d => d.residentId)).size, wasteKg: z.dropoffs.reduce((sum, d) => sum + d.estimatedKg, 0) })).sort((a, b) => b.wasteKg - a.wasteKg))
  } catch { res.status(500).json({ error: 'Unable to load leaderboard' }) }
})

module.exports = router
