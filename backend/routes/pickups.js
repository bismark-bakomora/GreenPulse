const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const auth   = require('../middleware/auth')
const prisma = new PrismaClient()

// GET /api/pickups/available — all pending pickup requests (visible to every collector)
router.get('/available', auth, async (req, res) => {
  try {
    const pickups = await prisma.pickupRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        resident: { select: { id: true, firstName: true, lastName: true, zoneId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json(pickups)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch pickup requests' })
  }
})

// POST /api/pickups/:id/accept — a collector accepts a pending request
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const pickup = await prisma.pickupRequest.findUnique({ where: { id: req.params.id } })
    if (!pickup) return res.status(404).json({ error: 'Pickup request not found' })
    if (pickup.status !== 'PENDING') return res.status(409).json({ error: 'This request has already been accepted' })

    // Only the first collector to update a PENDING request wins
    const updated = await prisma.pickupRequest.updateMany({
      where: { id: req.params.id, status: 'PENDING' },
      data: { status: 'ACCEPTED', acceptedBy: req.user.id },
    })
    if (updated.count === 0) return res.status(409).json({ error: 'This request has already been accepted by another collector' })

    const accepted = await prisma.pickupRequest.findUnique({
      where: { id: req.params.id },
      include: {
        resident: { select: { id: true, firstName: true, lastName: true, zoneId: true } },
      },
    })
    res.json(accepted)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to accept pickup request' })
  }
})

// GET /api/pickups/collector/:id — a collector's accepted/assigned pickups
router.get('/collector/:id', auth, async (req, res) => {
  try {
    const pickups = await prisma.pickupRequest.findMany({
      where: { acceptedBy: req.params.id },
      include: {
        resident: { select: { id: true, firstName: true, lastName: true, zoneId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json(pickups)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch your pickup requests' })
  }
})

// POST /api/pickups/:id/collect — mark a pickup as collected and award points
router.post('/:id/collect', auth, async (req, res) => {
  try {
    const pickup = await prisma.pickupRequest.findUnique({ 
      where: { id: req.params.id },
      include: { resident: true }
    })
    if (!pickup) return res.status(404).json({ error: 'Pickup request not found' })
    if (pickup.status !== 'ACCEPTED') return res.status(409).json({ error: 'This request must be accepted before it can be collected' })

    // Award green points for collection (5 points per kg)
    const pointsEarned = Math.round(pickup.weightKg * 5)

    const [updated] = await prisma.$transaction([
      prisma.pickupRequest.update({
        where: { id: req.params.id },
        data: { status: 'COLLECTED' },
      }),
      prisma.resident.update({ 
        where: { id: pickup.residentId }, 
        data: { greenPoints: { increment: pointsEarned } } 
      }),
      prisma.greenPointsLedger.create({
        data: { 
          citizenId: pickup.residentId, 
          points: pointsEarned, 
          reason: 'Waste collected from pickup' 
        },
      }),
    ])

    res.json({ ...updated, pointsEarned })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to mark pickup as collected' })
  }
})

module.exports = router
