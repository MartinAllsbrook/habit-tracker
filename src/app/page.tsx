import { auth } from "@/auth.ts";

export default async function Home() {
    const authenticated = await auth();

    return (
        <main>
            <h1>Welcome to Habit Tracker</h1>
            <p>The best place to track your habits!</p>

            {authenticated ? (
                <p>You are logged in.</p>
            ) : (
                <p>Please log in to access your habits.</p>
            )}
        </main>
    );
}
