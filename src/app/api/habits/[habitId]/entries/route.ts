import { NextRequest } from "next/server"
import { auth } from "@/auth.ts"
import { prisma } from "@/lib/prisma.ts"

interface NewHabitEntry {
    date?: string // ISO date string (e.g., "2025-11-04") - for BOOLEAN habits
    timestamp?: string // ISO datetime string (e.g., "2025-11-04T14:30:00Z") - for VALUE/TALLY habits
    value?: number | null // For VALUE habits (required), null for TALLY and BOOLEAN habits
    notes?: string | null
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ habitId: string }> }
) {
    const { habitId } = await params;
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
        // Verify the habit exists and belongs to the user
        const habit = await prisma.habit.findUnique({
            where: { id: habitId },
            select: { userId: true, type: true }
        })

        if (!habit) {
            return Response.json(
                { error: "Habit not found" },
                { status: 404 }
            )
        }

        if (habit.userId !== userId) {
            return Response.json(
                { error: "Forbidden: You don't own this habit" },
                { status: 403 }
            )
        }

        // Parse request body
        const body = await request.json() as NewHabitEntry
        const { date, timestamp, value, notes } = body

        if (habit.type === "BOOLEAN") {
            // Handle boolean habit entry
            if (!date) {
                return Response.json(
                    { error: "Date is required for boolean habits" },
                    { status: 400 }
                )
            }

            const entryDate = new Date(date)
            // Set timestamp to start of day for boolean entries
            const entryTimestamp = new Date(date)
            entryTimestamp.setHours(0, 0, 0, 0)

            // Check if entry already exists for this date (application-level check)
            const existingEntry = await prisma.habitEntry.findFirst({
                where: {
                    habitId,
                    date: entryDate
                }
            })

            if (existingEntry) {
                return Response.json(
                    { error: "Entry already exists for this date" },
                    { status: 409 }
                )
            }

            // Create the boolean habit entry
            const habitEntry = await prisma.habitEntry.create({
                data: {
                    habitId,
                    date: entryDate,
                    timestamp: entryTimestamp,
                    value: null,
                    notes: notes ?? null
                }
            })

            return Response.json(habitEntry, { status: 201 })
        } else {
            // Handle VALUE or TALLY habit entry
            if (!timestamp) {
                return Response.json(
                    { error: "Timestamp is required for value/tally habits" },
                    { status: 400 }
                )
            }

            // Validate value based on habit type
            if (habit.type === "VALUE") {
                if (value === undefined || value === null) {
                    return Response.json(
                        { error: "Value habits require a numeric value" },
                        { status: 400 }
                    )
                }
                if (typeof value !== "number") {
                    return Response.json(
                        { error: "Value must be a number" },
                        { status: 400 }
                    )
                }
            } else if (habit.type === "TALLY") {
                if (value !== undefined && value !== null) {
                    return Response.json(
                        { error: "Tally habits should not have a value" },
                        { status: 400 }
                    )
                }
            }

            const entryTimestamp = new Date(timestamp)
            // Extract date from timestamp
            const entryDate = new Date(timestamp)
            entryDate.setHours(0, 0, 0, 0)

            // Create the timed habit entry
            const habitEntry = await prisma.habitEntry.create({
                data: {
                    habitId,
                    date: entryDate,
                    timestamp: entryTimestamp,
                    value: value ?? null,
                    notes: notes ?? null
                }
            })

            return Response.json(habitEntry, { status: 201 })
        }
    } catch (error) {
        console.error("Error creating habit entry:", error)

        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}