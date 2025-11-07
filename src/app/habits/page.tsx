import { auth } from "@/auth.ts";
import { HabitType } from "@/generated/prisma/client.ts";
import HabitModalWrapper from "./HabitModalWrapper.tsx";

export default async function HabitsPage() {
    const session = await auth();
    if (!session?.user) {
        return <div>Please log in to manage your habits.</div>;
    }

    const habitTypeOptions = Object.values(HabitType);

    return (
        <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <HabitModalWrapper habitTypeOptions={habitTypeOptions} />
        </main>
    );
}