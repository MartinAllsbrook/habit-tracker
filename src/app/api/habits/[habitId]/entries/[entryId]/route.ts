import { NextRequest } from "next/server"
import { auth } from "@/auth.ts"
import { prisma } from "@/lib/prisma.ts"

interface UpdateHabitEntry {
    value?: number
    notes?: string | null
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ habitId: string; entryId: string }> }
) {
    const { habitId, entryId } = await params;
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
        // Verify the habit exists, belongs to the user, and get its type
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

        // PATCH is only allowed for VALUE and TALLY type habits
        if (habit.type === "BOOLEAN") {
            return Response.json(
                { error: "Cannot update boolean habit entries. Delete and recreate instead." },
                { status: 400 }
            )
        }

        // Verify the entry exists and belongs to this habit
        const existingEntry = await prisma.habitEntry.findUnique({
            where: { id: entryId }
        })

        if (!existingEntry) {
            return Response.json(
                { error: "Entry not found" },
                { status: 404 }
            )
        }

        if (existingEntry.habitId !== habitId) {
            return Response.json(
                { error: "Entry does not belong to this habit" },
                { status: 400 }
            )
        }

        // Parse request body
        const body: UpdateHabitEntry = await request.json()
        const { value, notes } = body

        // Validate that at least one field is being updated
        if (value === undefined && notes === undefined) {
            return Response.json(
                { error: "No fields to update" },
                { status: 400 }
            )
        }

        // Validate value based on habit type
        if (value !== undefined) {
            if (habit.type === "TALLY") {
                return Response.json(
                    { error: "Cannot update value for tally habits" },
                    { status: 400 }
                )
            }

            if (typeof value !== "number") {
                return Response.json(
                    { error: "Value must be a number" },
                    { status: 400 }
                )
            }

            // Don't allow updating to 0 - should use DELETE instead
            if (value === 0) {
                return Response.json(
                    { error: "Cannot set value to 0. Use DELETE to remove the entry instead." },
                    { status: 400 }
                )
            }
        }

        // Update the entry
        const updatedEntry = await prisma.habitEntry.update({
            where: { id: entryId },
            data: {
                ...(value !== undefined && { value }),
                ...(notes !== undefined && { notes })
            }
        })

        return Response.json(updatedEntry, { status: 200 })
    } catch (error) {
        console.error("Error updating habit entry:", error)
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ habitId: string; entryId: string }> }
) {
    const { habitId, entryId } = await params;
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

        // Verify the entry exists and belongs to this habit
        const existingEntry = await prisma.habitEntry.findUnique({
            where: { id: entryId }
        })

        if (!existingEntry) {
            return Response.json(
                { error: "Entry not found" },
                { status: 404 }
            )
        }

        if (existingEntry.habitId !== habitId) {
            return Response.json(
                { error: "Entry does not belong to this habit" },
                { status: 400 }
            )
        }

        // Delete the entry
        await prisma.habitEntry.delete({
            where: { id: entryId }
        })

        return Response.json(
            { message: "Entry deleted successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error deleting habit entry:", error)
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
