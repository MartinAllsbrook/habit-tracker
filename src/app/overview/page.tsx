import { prisma } from "@/lib/prisma.ts";
import styles from "./page.module.css";
import { auth } from "@/auth.ts";
import { HabitType } from "@/generated/prisma/client.ts";

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

    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const startOfLastWeek = getStartOfLastWeek();

    // Dynamically generate last 7 days ending with today
    const todayIdx = new Date().getDay();
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => (todayIdx + i + 1) % 7);
    
    // Get all habit entries from the last week
    const entriesThisWeek = await prisma.habitEntry.findMany({
        where: {
            timestamp: {
                gte: startOfLastWeek,
            },
        },
        include: {
            habit: true,
        },
    });

    // Create a 2D array to hold the entries for the grid
    const entries: Record<string, {
        type: HabitType, 
        days: Record<number, number>,
    }> = {};

    habits.forEach(habit => {
        entries[habit.id] = {
            type: habit.type,
            days: {},
        };
        
        daysOfWeek.forEach(day => {
            entries[habit.id].days[day] = 0;
        });
    });

    // Populate the entries array
    entriesThisWeek.forEach(entry => {
        const entryDate = new Date(entry.timestamp);

        const id = entry.habitId;
        const weekday = entryDate.getDay();
        
        if (entry.value) {
            entries[id].days[weekday] += entry.value;
        } else {
            entries[id].days[weekday] += 1;
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
                    <div key={"header-" + idx} className={styles.gridItem + " " + styles.gridHeader}>
                        {weekDays[day]}
                    </div>
                ))}

                {/* Render each row: label + data */}
                {habits.map((habit) => (
                    <>
                        
                        <div key={"label-" + habit.id} className={styles.gridItem + " " + styles.gridHeader}>
                            {habit.name}
                        </div>
                        {entries[habit.id].type === HabitType.BOOLEAN ? (
                            Object.values(entries[habit.id].days).map((value) => {return value > 0 ? (
                                <div className={styles.gridItem}>★</div>
                            ) : (
                                <div className={styles.gridItem}></div>
                            )}) 
                        ) : (
                            Object.values(entries[habit.id].days).map((value) => {return value > 0 ? (
                                <div className={styles.gridItem}>{value}</div>
                            ) : (
                                <div className={styles.gridItem}></div>
                            )})
                        )}
                    </>
                ))}
            </div>
        </div>
    );
}