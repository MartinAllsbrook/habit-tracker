import { NextRequest } from "next/server"
import { auth } from "@/auth.ts"
import { prisma } from "@/lib/prisma.ts"

interface NewBooleanEntry {
    date: string // ISO date string (e.g., "2025-11-04")
    notes?: string | null
}

interface NewTimedEntry {
    timestamp: string // ISO datetime string (e.g., "2025-11-04T14:30:00Z")
    value?: number | null // For VALUE habits (required), null for TALLY habits
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
        const body = await request.json()

        if (habit.type === "BOOLEAN") {
            // Handle boolean habit entry
            const { date, notes } = body as NewBooleanEntry

            if (!date) {
                return Response.json(
                    { error: "Date is required" },
                    { status: 400 }
                )
            }

            // Check if entry already exists for this date
            const existingEntry = await prisma.booleanHabitEntry.findUnique({
                where: {
                    habitId_date: {
                        habitId,
                        date: new Date(date)
                    }
                }
            })

            if (existingEntry) {
                return Response.json(
                    { error: "Entry already exists for this date" },
                    { status: 409 }
                )
            }

            // Create the boolean habit entry
            const habitEntry = await prisma.booleanHabitEntry.create({
                data: {
                    habitId,
                    date: new Date(date),
                    notes: notes ?? null
                }
            })

            return Response.json(habitEntry, { status: 201 })
        } else {
            // Handle VALUE or TALLY habit entry
            const { timestamp, value, notes } = body as NewTimedEntry

            if (!timestamp) {
                return Response.json(
                    { error: "Timestamp is required" },
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

            // Create the timed habit entry
            const habitEntry = await prisma.timedHabitEntry.create({
                data: {
                    habitId,
                    timestamp: new Date(timestamp),
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