import { prisma } from "@/lib/prisma.ts";
import styles from "./page.module.css";
import { auth } from "../../auth.ts";

function getStartOfLastWeek() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    // Go back 7 days
    now.setDate(now.getDate() - 7);
    return now;
}

export default async function Page() {

    const session = await auth();
    if (!session) {
        return <div>Please log in to view your habits overview.</div>;
    }

    if (!session.user) {
        return <div>User information is missing in the session.</div>;
    }


    const userId = session.user?.id;

    // Generate habit list and labels
    const habits = await prisma.habit.findMany({
        where: {
            userId: userId,
        },
    });
    const labels = habits.map(habit => habit.name);
    
    const startOfLastWeek = getStartOfLastWeek();

    // Dynamically generate last 7 days ending with today
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayIdx = new Date().getDay();
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => weekDays[(todayIdx + i + 1) % 7]);
    
    // Get all habit entries from the last week
    const entriesThisWeek = await prisma.habitEntry.findMany({
        where: {
            date: {
                gte: startOfLastWeek,
            },
        },
        include: {
            habit: true,
        },
    });

    // Create a 2D array to hold the entries for the grid
    const entries: (number)[][] = labels.map(() => Array(7).fill(0));

    // Populate the entries array
    entriesThisWeek.forEach(entry => {
        const habitIdx = habits.findIndex(habit => habit.id === entry.habitId);
        if (habitIdx === -1) return;
        const entryDate = new Date(entry.date);
        const dayDiff = Math.floor((entryDate.getTime() - startOfLastWeek.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
            if (entry.value) {
                entries[habitIdx][dayDiff] += entry.value;
            } else {
                entries[habitIdx][dayDiff] += 1;
            }
        }
    });

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
                {entries.map((row, rowIdx) => (
                    <>
                        <div key={"label-" + rowIdx} className={styles.gridItem} style={{ fontWeight: "bold" }}>
                            {labels[rowIdx]}
                        </div>
                        {row.map((entrySum, colIdx) => (
                            <div key={`cell-${rowIdx}-${colIdx}`} className={styles.gridItem}>
                                {entrySum}
                            </div>
                        ))}
                    </>
                ))}
            </div>
            <pre>{JSON.stringify(entriesThisWeek, null, 2)}</pre>
        </div>
    );
}