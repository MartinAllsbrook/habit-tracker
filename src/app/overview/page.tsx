import { prisma } from "@/lib/prisma.ts";
import styles from "./page.module.css";

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

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const labels = ["First", "Second", "Third"]
    const sampleData = [
        [1, 0, 2, 1, 3, 0, 4],
        [0, 1, 0, 2, 1, 0, 3],
        [2, 2, 1, 0, 0, 1, 0],
    ];

    return (
        <div>
            <h2>Overview Page</h2>
            <div className={styles.weeklyGrid}>
                {/* Top-left empty cell */}
                <div></div>
                {/* Days of week as column headers */}
                {daysOfWeek.map((day, idx) => (
                    <div key={"header-" + idx} className={styles.gridItem} style={{ fontWeight: "bold" }}>
                        {day}
                    </div>
                ))}
                {/* Render each row: label + data */}
                {sampleData.map((row, rowIdx) => (
                    <>
                        <div key={"label-" + rowIdx} className={styles.gridItem} style={{ fontWeight: "bold" }}>
                            {labels[rowIdx]}
                        </div>
                        {row.map((val, colIdx) => (
                            <div key={`cell-${rowIdx}-${colIdx}`} className={styles.gridItem}>
                                {val}
                            </div>
                        ))}
                    </>
                ))}
            </div>
            <pre>{JSON.stringify(entriesThisWeek, null, 2)}</pre>
        </div>
    );
}