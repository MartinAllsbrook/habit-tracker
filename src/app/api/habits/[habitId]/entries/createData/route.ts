import { auth } from "@/auth.ts"
import { prisma } from "@/lib/prisma.ts"

export async function POST() {
    console.log("Received request to create dummy habit entries")

    try {
        // Authenticate the user
        const session = await auth()
        if (!session?.user?.id) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // Define the 6 test habits
        const testHabits = [
            { name: "Bool test 1", type: "BOOLEAN" as const, unit: null },
            { name: "Bool test 2", type: "BOOLEAN" as const, unit: null },
            { name: "Tally test 1", type: "TALLY" as const, unit: "times" },
            { name: "Tally test 2", type: "TALLY" as const, unit: "times" },
            { name: "Value test 1", type: "VALUE" as const, unit: "kilometers" },
            { name: "Value test 2", type: "VALUE" as const, unit: "minutes" },
        ]

        // Create or find existing habits
        const createdHabits = []
        for (const habitData of testHabits) {
            const existingHabit = await prisma.habit.findFirst({
                where: {
                    userId,
                    name: habitData.name,
                    type: habitData.type
                }
            })

            if (existingHabit) {
                createdHabits.push(existingHabit)
            } else {
                const newHabit = await prisma.habit.create({
                    data: {
                        userId,
                        name: habitData.name,
                        type: habitData.type,
                        unit: habitData.unit,
                        description: `Test habit for ${habitData.type} tracking`
                    }
                })
                createdHabits.push(newHabit)
            }
        }

        // Generate entries for the last 1.5-2 weeks (let's use 12 days)
        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 12)

        let totalEntriesCreated = 0

        for (const habit of createdHabits) {
            const entriesForHabit = []

            // Iterate through each day
            const d = new Date(startDate)
            while (d <= today) {
                const currentDate = new Date(d)
                
                if (habit.type === "BOOLEAN") {
                    // Max 1 entry per day for boolean, 70% chance
                    if (Math.random() > 0.3) {
                        entriesForHabit.push({
                            habitId: habit.id,
                            date: currentDate,
                            timestamp: new Date(currentDate.setHours(12, 0, 0, 0)), // Noon
                            value: null,
                            notes: Math.random() > 0.7 ? `Completed on ${currentDate.toDateString()}` : null
                        })
                    }
                } else {
                    // 0-5 entries per day for TALLY and VALUE
                    const numEntries = Math.floor(Math.random() * 6) // 0 to 5
                    
                    for (let i = 0; i < numEntries; i++) {
                        const hour = 8 + Math.floor(Math.random() * 14) // Random hour between 8am and 10pm
                        const minute = Math.floor(Math.random() * 60)
                        const timestamp = new Date(currentDate)
                        timestamp.setHours(hour, minute, 0, 0)

                        if (habit.type === "TALLY") {
                            entriesForHabit.push({
                                habitId: habit.id,
                                date: new Date(currentDate.setHours(0, 0, 0, 0)),
                                timestamp,
                                value: null,
                                notes: Math.random() > 0.8 ? "Quick tally" : null
                            })
                        } else if (habit.type === "VALUE") {
                            // Random value between 1 and 100
                            const value = Math.floor(Math.random() * 100) + 1
                            entriesForHabit.push({
                                habitId: habit.id,
                                date: new Date(currentDate.setHours(0, 0, 0, 0)),
                                timestamp,
                                value,
                                notes: Math.random() > 0.8 ? `Logged ${value} ${habit.unit}` : null
                            })
                        }
                    }
                }
                d.setDate(d.getDate() + 1)
            }

            // Bulk create entries for this habit
            if (entriesForHabit.length > 0) {
                await prisma.habitEntry.createMany({
                    data: entriesForHabit,
                    skipDuplicates: true
                })
                totalEntriesCreated += entriesForHabit.length
            }
        }

        return Response.json({
            message: "Test data created successfully",
            habits: createdHabits.map(h => ({ id: h.id, name: h.name, type: h.type })),
            entriesCreated: totalEntriesCreated
        }, { status: 201 })

    } catch (error) {
        console.error("Error creating test data:", error)
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
