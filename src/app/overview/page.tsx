import { prisma } from "@/lib/prisma.ts";

function getStartOfLastWeek() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    // Go back 7 days
    now.setDate(now.getDate() - 7);
    return now;
}

export default async function Page() {
    const startOfLastWeek = getStartOfLastWeek();

    // Get BooleanHabitEntries from the last week
    const booleanEntries = await prisma.booleanHabitEntry.findMany({
        where: {
            date: {
                gte: startOfLastWeek,
            },
        },
    });

    // Get TimedHabitEntries from the last week
    const timedEntries = await prisma.timedHabitEntry.findMany({
        where: {
            timestamp: {
                gte: startOfLastWeek,
            },
        },
    });

    // Combine all entries
    const entriesThisWeek = [
        ...booleanEntries.map((e) => ({ ...e, type: "BOOLEAN" })),
        ...timedEntries.map((e) => ({ ...e, type: "TIMED" })),
    ];

    return (
        <div>
            <h2>Overview Page</h2>
            <pre>{JSON.stringify(entriesThisWeek, null, 2)}</pre>
        </div>
    );
}