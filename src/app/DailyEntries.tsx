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

    const entriesByHabitId: Record<string, HabitEntries> = {};
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    
    for (const habit of userHabits) {
        // Get all entries for today
        const entries = await prisma.habitEntry.findMany({
            where: {
                habitId: habit.id,
                date: todayDate,
            },
            orderBy: {
                timestamp: 'desc',
            },
        });
        
        entriesByHabitId[habit.id] = { entries };
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