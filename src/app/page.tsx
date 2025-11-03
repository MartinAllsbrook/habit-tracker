import { auth } from "@/auth";
import DailyEntries from "./DailyEntries.tsx";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const authenticated = await auth();

    return (
        <main>
            <h1>Welcome to Habit Tracker</h1>
            <DailyEntries />
        </main>
    );
}
