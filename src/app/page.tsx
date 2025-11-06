import { auth } from "@/auth.ts";
import DailyEntries from "./DailyEntries.tsx";
import CreateDummyEntries from "./CreateDummyEntries.tsx";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const _authenticated = await auth();

    return (
        <main>
            <h1>Welcome to Habit Tracker</h1>
            <DailyEntries />
            <CreateDummyEntries />
        </main>
    );
}
