import { prisma } from "@/lib/prisma.ts";
import { auth } from "@/auth.ts";
import Link from "next/link";
import styles from "./DailyEntries.module.css";
import { BooleanHabitEntry, TimedHabitEntry } from "@/generated/prisma/client.ts";
import HabitBox from "@/components/habits/HabitBox.tsx";

export type HabitEntries = {
    booleanEntry?: BooleanHabitEntry;
    timedEntries: TimedHabitEntry[];
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

    const entriesByHabitId: Record<string, HabitEntries> = {};
    const todayDate = new Date(today);
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    for (const habit of userHabits) {
        if (habit.type === 'BOOLEAN') {
            // For boolean habits, get the single entry for today (date only)
            const booleanEntry = await prisma.booleanHabitEntry.findUnique({
                where: {
                    habitId_date: {
                        habitId: habit.id,
                        date: todayDate,
                    },
                },
            });
            entriesByHabitId[habit.id] = {
                booleanEntry: booleanEntry || undefined,
                timedEntries: [],
            };
        } else {
            // For VALUE and TALLY habits, get all timestamped entries for today
            const timedEntries = await prisma.timedHabitEntry.findMany({
                where: {
                    habitId: habit.id,
                    timestamp: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                orderBy: {
                    timestamp: 'desc',
                },
            });
            entriesByHabitId[habit.id] = {
                timedEntries,
            };
        }
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
                            entries={entriesByHabitId[habit.id] || { timedEntries: [] }} 
                            date={today}
                        />
                    )}
                </ul>
            )}
        </div>
    )
}