import { prisma } from "@/lib/prisma.ts";
import { auth } from "@/auth.ts";
import Link from "next/link";
import styles from "./DailyEntries.module.css";
import { HabitEntry } from "@/generated/prisma/client.ts";
import HabitBox from "@/components/habits/HabitBox.tsx";

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

    const entriesByHabitId: Record<string, HabitEntry | null> = {};
    for (const habit of userHabits) {
        const entry = await prisma.habitEntry.findUnique({
            where: {
                habitId_date: {
                    habitId: habit.id,
                    date: new Date(today),
                },
            },
        });
        entriesByHabitId[habit.id] = entry;
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
                            entry={entriesByHabitId[habit.id] || undefined} 
                        />
                    )}
                </ul>
            )}
        </div>
    )
}