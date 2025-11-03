import { prisma } from "@/lib/prisma.ts";
import { auth } from "@/auth.ts";
import Link from "next/link";
import styles from "./DailyEntries.module.css";

export default async function DailyEntries() {
    const session = await auth();


    const userId = session?.user?.id;
    if (!userId) {
        return <div>Please log in to view your daily entries.</div>;
    } 

    const habits = await prisma.habit.findMany({
        where: { userId }
    })

    console.log(habits);
    
    return (
        <div>
            {habits.length === 0 ? (
                <div>
                    You have no habits yet. 
                    <Link href="/habits">Create your first habit!</Link>
                </div>
            ) : (
                <ul className={styles.dailyLog}>
                    {habits.map((habit) => 
                        <li key={habit.id}>
                            <div>
                                <h2>{habit.name}</h2>
                            </div>
                            <div>
                                <p>click here to complete (not really)</p>
                            </div>
                        </li>
                    )}
                </ul>
            )}
        </div>
    )
}