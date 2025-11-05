import { NextRequest } from "next/server"
import { auth } from "@/auth.ts"
import { prisma } from "@/lib/prisma.ts"

interface NewHabitEntry {
    date: string // ISO datetime string (e.g., "2025-11-04T14:30:00Z" or "2025-11-04")
    value?: number | null // For value-based habits
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
        const body: NewHabitEntry = await request.json()
        const { date, value, notes } = body

        if (!date) {
            return Response.json(
                { error: "Date is required" },
                { status: 400 }
            )
        }

        // Validate value based on habit type
        if (habit.type === "BOOLEAN") {
            if (value !== undefined && value !== null) {
                return Response.json(
                    { error: "Boolean habits should not have a value" },
                    { status: 400 }
                )
            }
        } else if (habit.type === "VALUE") {
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
        }

        // Create the habit entry
        const habitEntry = await prisma.habitEntry.create({
            data: {
                habitId,
                date: new Date(date),
                value: value ?? null,
                notes: notes ?? null
            }
        })

        return Response.json(habitEntry, { status: 201 })
    } catch (error) {
        console.error("Error creating habit entry:", error)

        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}