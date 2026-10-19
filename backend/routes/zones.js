const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const dispatchState = (zone) => zone.currentVolumeKg >= zone.thresholdKg ? 'READY_FOR_COLLECTION' : zone.status

router.get('/', async (_, res) => {
  try {
    const zones = await prisma.zone.findMany({ orderBy: { name: 'asc' } })
    res.json(zones.map(z => ({ ...z, status: dispatchState(z), fillPercent: Math.min(100, Math.round((z.currentVolumeKg / z.thresholdKg) * 100)) })))
  } catch { res.status(500).json({ error: 'Unable to load zones' }) }
})

router.get('/:id', async (req, res) => {
  try {
    const zone = await prisma.zone.findUnique({ where: { id: req.params.id }, include: { campaigns: { orderBy: { createdAt: 'desc' }, take: 5 } } })
    if (!zone) return res.status(404).json({ error: 'Zone not found' })
    res.json({ ...zone, status: dispatchState(zone), fillPercent: Math.min(100, Math.round((zone.currentVolumeKg / zone.thresholdKg) * 100)) })
  } catch { res.status(500).json({ error: 'Unable to load zone' }) }
})

router.post('/:id/campaigns', async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) return res.status(400).json({ error: 'A campaign message is required' })
    const campaign = await prisma.engagementCampaign.create({ data: { zoneId: req.params.id, message: message.trim() } })
    res.status(201).json(campaign)
  } catch { res.status(500).json({ error: 'Unable to create campaign' }) }
})

module.exports = router
