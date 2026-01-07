import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateExistingSubscriptions() {
    console.log('🔄 Migrating existing schools and users to subscription system...')

    try {
        // Get all schools
        const schools = await prisma.school.findMany({
            include: {
                subscriptions: true
            }
        })

        console.log(`📊 Found ${schools.length} schools`)

        // Get or create a basic package
        let basicPackage = await prisma.package.findFirst({
            where: { name: 'Basic' }
        })

        if (!basicPackage) {
            console.log('📦 Creating basic package...')
            basicPackage = await prisma.package.create({
                data: {
                    name: 'Basic',
                    description: 'Basic features for schools and independent users',
                    price: 29.99,
                    duration: 30, // 30 days
                    maxTeachers: 10,
                    maxStudents: 100,
                    features: [
                        'AI Lesson Plans',
                        'Basic Analytics',
                        'Student Management',
                        'Assignment Creation'
                    ],
                    isActive: true
                }
            })
        }

        // Check which schools already have premium status (existing paid schools)
        const premiumSchools = await prisma.school.findMany({
            where: {
                // Add your criteria for identifying premium schools
                // For example, schools created before a certain date or with certain features
                createdAt: {
                    lt: new Date('2024-01-01') // Schools created before 2024 are considered premium
                }
            }
        })

        console.log(`👑 Found ${premiumSchools.length} existing premium schools`)

        // Create premium package
        let premiumPackage = await prisma.package.findFirst({
            where: { name: 'Premium' }
        })

        if (!premiumPackage) {
            console.log('📦 Creating premium package...')
            premiumPackage = await prisma.package.create({
                data: {
                    name: 'Premium',
                    description: 'Full access to all features',
                    price: 99.99,
                    duration: 30, // 30 days
                    maxTeachers: 100,
                    maxStudents: 1000,
                    features: [
                        'Unlimited AI Lesson Plans',
                        'Advanced Analytics',
                        'Student Management',
                        'Assignment Creation',
                        'Scheme of Work Generator',
                        'Advanced AI Tools',
                        'Priority Support',
                        'Export Features'
                    ],
                    isActive: true
                }
            })
        }

        // Migrate existing premium schools
        for (const school of premiumSchools) {
            if (school.subscriptions && school.subscriptions.length === 0) {
                console.log(`👑 Creating premium subscription for school: ${school.name}`)

                const startDate = new Date()
                const endDate = new Date()
                endDate.setFullYear(endDate.getFullYear() + 1) // 1 year subscription

                await prisma.subscription.create({
                    data: {
                        schoolId: school.id,
                        packageId: premiumPackage.id,
                        status: 'ACTIVE',
                        startDate,
                        endDate,
                        amount: premiumPackage.price * 12, // Annual pricing
                        isTrial: false,
                        type: 'SUBSCRIPTION',
                        paymentMethod: 'GRANDFATHERED',
                        notes: 'Migrated existing premium school'
                    }
                })
            }
        }

        // Get all independent teachers (teachers without schoolId)
        const independentTeachers = await prisma.teacher.findMany({
            where: {
                schoolId: null
            },
            include: {
                user: true
            }
        })

        console.log(`👨‍🏫 Found ${independentTeachers.length} independent teachers`)

        // Check if they need trial setup
        for (const teacher of independentTeachers) {
            const existingSubscription = await prisma.subscription.findFirst({
                where: { userId: teacher.userId }
            })

            if (!existingSubscription) {
                const userCreatedAt = teacher.user.createdAt
                const daysSinceCreation = Math.floor((Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24))

                if (daysSinceCreation <= 7) {
                    // Still eligible for trial
                    console.log(`🆓 Creating trial for independent teacher: ${teacher.user.email}`)

                    const startDate = userCreatedAt
                    const trialEndDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000))

                    await prisma.subscription.create({
                        data: {
                            userId: teacher.userId,
                            packageId: basicPackage.id,
                            status: daysSinceCreation < 7 ? 'TRIAL' : 'TRIAL_EXPIRED',
                            startDate,
                            endDate: trialEndDate,
                            trialEndsAt: trialEndDate,
                            amount: 0,
                            isTrial: true,
                            type: 'TRIAL',
                            paymentMethod: 'FREE_TRIAL'
                        }
                    })
                }
            }
        }

        // Get all independent students
        const independentStudents = await prisma.student.findMany({
            where: {
                schoolId: null
            },
            include: {
                user: true,
                teacher: true
            }
        })

        console.log(`👨‍🎓 Found ${independentStudents.length} independent students`)

        // Independent students inherit subscription from their teacher
        // No separate subscription needed for students

        console.log('✅ Migration completed successfully!')
        console.log('\n📊 Summary:')
        console.log(`- Premium schools: ${premiumSchools.length}`)
        console.log(`- Independent teachers: ${independentTeachers.length}`)
        console.log(`- Independent students: ${independentStudents.length}`)
        console.log(`- Basic package: ${basicPackage.name} ($${basicPackage.price})`)
        console.log(`- Premium package: ${premiumPackage.name} ($${premiumPackage.price})`)

    } catch (error) {
        console.error('❌ Migration failed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

migrateExistingSubscriptions()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })