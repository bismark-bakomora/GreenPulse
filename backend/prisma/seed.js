const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const ISSUE_LOCATIONS = [
  { lat: 5.6508, lng: -0.1869, severity: 'HIGH',     category: 'CLOGGED_DRAIN',    desc: 'Completely blocked with plastic bags near Legon bus stop' },
  { lat: 5.6800, lng: -0.1660, severity: 'CRITICAL', category: 'OVERFLOWING_BIN',  desc: 'Market bin overflowing onto the road — Madina market' },
  { lat: 5.6345, lng: -0.1567, severity: 'MEDIUM',   category: 'CLOGGED_DRAIN',    desc: 'Partial blockage near East Legon residential' },
  { lat: 5.7100, lng: -0.1680, severity: 'LOW',      category: 'CLOGGED_DRAIN',    desc: 'Minor accumulation of leaves — Adenta' },
  { lat: 5.6050, lng: -0.1670, severity: 'HIGH',     category: 'ILLEGAL_DUMPING',  desc: 'Plastic bottles dumped beside the curb — Airport Hills' },
  { lat: 5.5830, lng: -0.1190, severity: 'MEDIUM',   category: 'OVERFLOWING_BIN',  desc: 'Public bin overflowing at Teshie Junction' },
  { lat: 5.6200, lng: -0.1800, severity: 'CRITICAL', category: 'CLOGGED_DRAIN',    desc: 'Large blockage causing surface flooding — Ring Road' },
  { lat: 5.6650, lng: -0.1750, severity: 'HIGH',     category: 'ILLEGAL_DUMPING',  desc: 'Construction debris dumped at the roadside — Cantonments' },
  { lat: 5.6480, lng: -0.1820, severity: 'LOW',      category: 'CLOGGED_DRAIN',    desc: 'Seasonal leaf buildup — Roman Ridge' },
  { lat: 5.6900, lng: -0.1550, severity: 'MEDIUM',   category: 'ILLEGAL_DUMPING',  desc: 'Organic waste dumped in an open lot — Haatso' },
]

async function main() {
  console.log('🌱 Seeding GreenPulse database...\n')
  const hash = await bcrypt.hash('password123', 12)

  // ── Collection zones / QR bins ──
  const zones = [
    { id: 'legon-main', name: 'Legon Main Road', lat: 5.6508, lng: -0.1869, currentVolumeKg: 68, collectionDay: 'Tuesday' },
    { id: 'madina-market', name: 'Madina Market', lat: 5.6800, lng: -0.1660, currentVolumeKg: 112, collectionDay: 'Wednesday' },
    { id: 'east-legon', name: 'East Legon Avenue', lat: 5.6345, lng: -0.1567, currentVolumeKg: 45, collectionDay: 'Thursday' },
    { id: 'adenta-housing', name: 'Adenta Housing', lat: 5.7100, lng: -0.1680, currentVolumeKg: 82, collectionDay: 'Friday' },
    { id: 'airport-hills', name: 'Airport Hills', lat: 5.6050, lng: -0.1670, currentVolumeKg: 96, collectionDay: 'Monday' },
    { id: 'teshie-junction', name: 'Teshie Junction', lat: 5.5830, lng: -0.1190, currentVolumeKg: 35, collectionDay: 'Saturday' },
  ]
  await Promise.all(zones.map(zone => prisma.zone.upsert({ where: { id: zone.id }, update: {}, create: zone })))
  console.log(`✅ ${zones.length} QR collection zones created`)

  // ── Collectors ──
  const collectors = await Promise.all([
    prisma.collector.upsert({
      where: { phone: '0244000001' }, update: {},
      create: { name: 'Kwame Asante', phone: '0244000001', password: hash, zone: 'East Legon', totalKgLifetime: 245.5, totalCO2Lifetime: 368.3, greenPoints: 736 },
    }),
    prisma.collector.upsert({
      where: { phone: '0244000002' }, update: {},
      create: { name: 'Abena Mensah', phone: '0244000002', password: hash, zone: 'Madina', totalKgLifetime: 189.0, totalCO2Lifetime: 283.5, greenPoints: 567 },
    }),
    prisma.collector.upsert({
      where: { phone: '0244000003' }, update: {},
      create: { name: 'Kofi Boateng', phone: '0244000003', password: hash, zone: 'Adenta', totalKgLifetime: 312.8, totalCO2Lifetime: 469.2, greenPoints: 938 },
    }),
  ])
  console.log(`✅ ${collectors.length} collectors created`)
  console.log('   Login: phone=0244000001, password=password123\n')

  // ── Recyclers ──
  const recyclers = await Promise.all([
    prisma.recycler.upsert({
      where: { phone: '0302000001' }, update: {},
      create: { companyName: 'Accra Plastics Recycling Ltd', phone: '0302000001', password: hash, recyclerType: 'PLASTIC', address: 'Industrial Area, Accra', zone: 'Greater Accra', isVerified: true },
    }),
    prisma.recycler.upsert({
      where: { phone: '0302000002' }, update: {},
      create: { companyName: 'GreenCompost Ghana', phone: '0302000002', password: hash, recyclerType: 'ORGANIC', address: 'Pokuase, Accra', zone: 'Peri-urban Accra', isVerified: true },
    }),
    prisma.recycler.upsert({
      where: { phone: '0302000003' }, update: {},
      create: { companyName: 'TechRecycle GH', phone: '0302000003', password: hash, recyclerType: 'EWASTE', address: 'Tema Industrial, Accra', zone: 'Tema', isVerified: false },
    }),
    prisma.recycler.upsert({
      where: { phone: '0302000004' }, update: {},
      create: { companyName: 'All-Waste Solutions', phone: '0302000004', password: hash, recyclerType: 'GENERAL', address: 'Achimota, Accra', zone: 'Greater Accra', isVerified: true },
    }),
  ])
  console.log(`✅ ${recyclers.length} recyclers created`)
  console.log('   Login: phone=0302000001, password=password123\n')

  // ── Residents ──
  const residents = await Promise.all([
    prisma.resident.upsert({
      where: { email: 'ama@greenpulse.gh' }, update: {},
      create: { firstName: 'Ama', lastName: 'Owusu', email: 'ama@greenpulse.gh', password: hash, zoneId: 'east-legon', greenPoints: 180 },
    }),
    prisma.resident.upsert({
      where: { email: 'yaw@greenpulse.gh' }, update: {},
      create: { firstName: 'Yaw', lastName: 'Mensah', email: 'yaw@greenpulse.gh', password: hash, zoneId: 'madina-market', greenPoints: 95 },
    }),
  ])
  console.log(`✅ ${residents.length} residents created`)
  console.log('   Login: email=ama@greenpulse.gh, password=password123\n')

  await prisma.cityAdmin.upsert({
    where: { email: 'admin@greenpulse.gh' },
    update: {},
    create: { name: 'AMA Operations', email: 'admin@greenpulse.gh', password: hash, agency: 'Accra Metropolitan Assembly' },
  })
  console.log(`✅ City admin created`)
  console.log('   Login: email=admin@greenpulse.gh, password=password123\n')

  // ── Tricycles ──
  const tricycleData = [
    { driverName: 'Ebo Quartey',    phone: '0554000001', zone: 'East Legon',  capacityKg: 250, lat: 5.6350, lng: -0.1567 },
    { driverName: 'Yaa Darko',      phone: '0554000002', zone: 'Madina',      capacityKg: 180, lat: 5.6800, lng: -0.1660 },
    { driverName: 'Kojo Agyeman',   phone: '0554000003', zone: 'Adenta',      capacityKg: 200, lat: 5.7100, lng: -0.1700 },
    { driverName: 'Akosua Frimpong',phone: '0554000004', zone: 'Legon',       capacityKg: 220, lat: 5.6508, lng: -0.1869 },
    { driverName: 'Nii Armah',      phone: '0554000005', zone: 'Teshie',      capacityKg: 160, lat: 5.5830, lng: -0.1190 },
    { driverName: 'Ama Boateng',    phone: '0554000006', zone: 'Cantonments', capacityKg: 200, lat: 5.6650, lng: -0.1750 },
  ]

  let tricycleCount = 0
  for (const t of tricycleData) {
    await prisma.tricycle.upsert({
      where: { phone: t.phone }, update: {}, create: t,
    })
    tricycleCount++
  }
  console.log(`✅ ${tricycleCount} tricycles created\n`)

  // ── Issue Reports ──
  const wasteTypes = ['PLASTIC', 'ORGANIC', 'MIXED', 'PLASTIC', 'EWASTE', 'MIXED', 'PLASTIC', 'ORGANIC', 'MIXED', 'PLASTIC']
  const reports = []
  for (let i = 0; i < ISSUE_LOCATIONS.length; i++) {
    const loc = ISSUE_LOCATIONS[i]
    const isClear = i < 6
    const report = await prisma.drainReport.create({
      data: {
        lat: loc.lat, lng: loc.lng,
        photoUrl: `https://placehold.co/800x600/D8F3DC/1B4332?text=${loc.category}`,
        category: loc.category, severity: loc.severity, description: loc.desc,
        status: isClear ? 'CLEARED' : 'PENDING',
        residentId: residents[i % residents.length].id,
        reportedBy: residents[i % residents.length].id,
      },
    })
    reports.push({ ...report, wasteType: wasteTypes[i] })
  }
  console.log(`✅ ${reports.length} issue reports created`)

  // ── Waste Collections (for cleared reports → listed on marketplace) ──
  const CO2_FACTORS = { PLASTIC: 2.5, ORGANIC: 0.8, MIXED: 1.5, EWASTE: 5.0 }
  let collectionCount = 0
  for (let i = 0; i < 6; i++) {
    const r = reports[i]
    const kg = parseFloat((Math.random() * 20 + 8).toFixed(1))
    const wt = r.wasteType
    try {
      await prisma.wasteCollection.upsert({
        where: { drainReportId: r.id }, update: {},
        create: {
          drainReportId:  r.id,
          collectorId:    collectors[i % collectors.length].id,
          weightKg:       kg,
          wasteType:      wt,
          co2SavedKg:     kg * (CO2_FACTORS[wt] || 1.5),
          revenueGHS:     kg * 0.6,
          listedOnMarket: true,
          soldToRecycler: false,
        },
      })
      collectionCount++
    } catch (e) {
      // Skip if already exists
    }
  }
  console.log(`✅ ${collectionCount} waste collections created (listed on marketplace)\n`)

  console.log('═══════════════════════════════════════════')
  console.log('✅ Seed complete!')
  console.log('\n📋 Test Accounts:')
  console.log('  Resident:   email=ama@greenpulse.gh  password=password123')
  console.log('  City admin: email=admin@greenpulse.gh  password=password123')
  console.log('  Collector:  phone=0244000001  password=password123')
  console.log('  Recycler:   phone=0302000001  password=password123')
  console.log('\n🛺 Tricycles: 6 available across Accra zones')
  console.log('🛒 Marketplace: 6 waste batches ready for recyclers')
  console.log('═══════════════════════════════════════════\n')
}

main().catch(console.error).finally(() => prisma.$disconnect())
