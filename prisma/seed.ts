import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing records
  await prisma.attendance.deleteMany({})
  await prisma.member.deleteMany({})
  await prisma.messageAlert.deleteMany({})
  await prisma.settings.deleteMany({})

  // Seed settings
  await prisma.settings.create({
    data: {
      id: 1,
      gymName: "The Fitness Gym",
      email: "support@fitnessgym.com",
      phone: "+1 (555) 999-8888",
      address: "123 Main St, New York, NY"
    }
  })

  // Seed members
  await prisma.member.create({
    data: {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      joinDate: '2024-01-15',
      expiryDate: '2026-08-15',
      membershipType: 'Annual'
    }
  })

  await prisma.member.create({
    data: {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@example.com',
      phone: '+1 (555) 234-5678',
      status: 'active',
      joinDate: '2024-02-10',
      expiryDate: '2026-09-10',
      membershipType: 'Quarterly'
    }
  })

  await prisma.member.create({
    data: {
      id: 3,
      name: 'Emma Wilson',
      email: 'emma@example.com',
      phone: '+1 (555) 345-6789',
      status: 'expired',
      joinDate: '2023-12-20',
      expiryDate: '2026-05-20',
      membershipType: 'Monthly'
    }
  })

  await prisma.member.create({
    data: {
      id: 4,
      name: 'Alex Rodriguez',
      email: 'alex@example.com',
      phone: '+1 (555) 456-7890',
      status: 'active',
      joinDate: '2024-03-05',
      expiryDate: '2026-10-05',
      membershipType: 'Annual'
    }
  })

  await prisma.member.create({
    data: {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      phone: '+1 (555) 567-8901',
      status: 'expiring',
      joinDate: '2024-06-01',
      expiryDate: '2026-07-02',
      membershipType: 'Monthly'
    }
  })

  await prisma.member.create({
    data: {
      id: 6,
      name: 'David Kim',
      email: 'david@example.com',
      phone: '+1 (555) 678-9012',
      status: 'inactive',
      joinDate: '2024-04-12',
      expiryDate: '2026-06-01',
      membershipType: 'Weekly'
    }
  })

  await prisma.member.create({
    data: {
      id: 7,
      name: 'Rachel Green',
      email: 'rachel@example.com',
      phone: '+1 (555) 789-0123',
      status: 'expiring',
      joinDate: '2024-05-20',
      expiryDate: '2026-07-05',
      membershipType: 'Monthly'
    }
  })

  await prisma.member.create({
    data: {
      id: 8,
      name: 'James Carter',
      email: 'james@example.com',
      phone: '+1 (555) 890-1234',
      status: 'active',
      joinDate: '2024-03-15',
      expiryDate: '2026-12-15',
      membershipType: 'Annual'
    }
  })

  await prisma.member.create({
    data: {
      id: 9,
      name: 'Rishwanth Vemula',
      email: 'rishwanth@example.com',
      phone: '8919640596',
      status: 'active',
      joinDate: '2024-05-10',
      expiryDate: '2026-10-10',
      membershipType: 'Annual'
    }
  })

  // Seed attendance logs
  await prisma.attendance.create({
    data: {
      memberId: 1,
      memberName: 'Sarah Johnson',
      date: '2026-06-28',
      time: '08:30 AM',
      status: 'present'
    }
  })

  await prisma.attendance.create({
    data: {
      memberId: 2,
      memberName: 'Mike Chen',
      date: '2026-06-28',
      time: '09:15 AM',
      status: 'present'
    }
  })

  await prisma.attendance.create({
    data: {
      memberId: 4,
      memberName: 'Alex Rodriguez',
      date: '2026-06-28',
      time: '10:00 AM',
      status: 'present'
    }
  })

  // Seed messages
  await prisma.messageAlert.create({
    data: {
      title: 'Holiday Closure',
      content: 'The gym will be closed on July 4th for Independence Day.',
      type: 'announcement',
      recipient: 'All Members',
      date: '2026-06-28 10:00 AM'
    }
  })

  await prisma.messageAlert.create({
    data: {
      title: 'Membership Expiration Warning',
      content: 'Your subscription expires in 4 days. Please renew to avoid check-in disruption.',
      type: 'reminder',
      recipient: 'Lisa Anderson',
      date: '2026-06-27 02:00 PM'
    }
  })

  await prisma.messageAlert.create({
    data: {
      title: 'Gym Maintenance Scheduled',
      content: 'Maintenance in the locker rooms this Friday from 10 PM - 2 AM.',
      type: 'alert',
      recipient: 'All Members',
      date: '2026-06-26 09:30 AM'
    }
  })

  // Reset sequences so new records don't conflict with seeded explicit IDs
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Member"', 'id'), MAX(id)) FROM "Member"`)
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Attendance"', 'id'), MAX(id)) FROM "Attendance"`)
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"MessageAlert"', 'id'), MAX(id)) FROM "MessageAlert"`)

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
