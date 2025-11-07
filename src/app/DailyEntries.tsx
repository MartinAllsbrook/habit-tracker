import { prisma } from "@/lib/prisma.ts";
import { auth } from "@/auth.ts";
import Link from "next/link";
import styles from "./DailyEntries.module.css";
import { HabitEntry } from "@/generated/prisma/client.ts";
import HabitBox from "@/components/habits/HabitBox.tsx";

export type HabitEntries = {
    entries: HabitEntry[];
};

export default async function DailyEntries() {
    const session = await auth();

    const today = new Date().toISOString().slice(0, 10);

    const userId = session?.user?.id;
    if (!userId) {
        return <div>Please log in to view your daily entries.</div>;
    } 

    const userHabits = await prisma.habit.findMany({
        where: { userId }
    })

    // Get midnight local time for today
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get all entries for user's habits since midnight
    const habitIds = userHabits.map(h => h.id);
    const allEntries = await prisma.habitEntry.findMany({
        where: {
            habitId: { in: habitIds },
            timestamp: { gte: midnight },
        },
        orderBy: {
            timestamp: 'desc',
        },
    });

    // Group entries by habitId
    const entriesByHabitId: Record<string, HabitEntries> = {};
    for (const habitId of habitIds) {
        entriesByHabitId[habitId] = { entries: allEntries.filter(e => e.habitId === habitId) };
    }
    
    return (
        <div>
            {userHabits.length === 0 ? (
                <div>
                    You have no habits yet. 
                    <Link href="/habits">Create your first habit!</Link>
                </div>
            ) : (
                <ul className={styles.dailyLog}>
                    {userHabits.map((habit) => 
                        <HabitBox
                            key={habit.id} 
                            habit={habit} 
                            entries={entriesByHabitId[habit.id] || { entries: [] }} 
                            date={today}
                        />
                    )}
                </ul>
            )}
        </div>
    )
}