import { auth } from "@/auth.ts";
import { HabitType } from "@/generated/prisma/client.ts";
import HabitModalWrapper from "./_components/HabitModalWrapper.tsx";
import { prisma } from "../../lib/prisma.ts";
import HabitTable from "./_components/HabitTable.tsx";

export default async function HabitsPage() {
    const session = await auth();
    if (!session?.user) {
        return <div>Please log in to manage your habits.</div>;
    }

    const habitTypeOptions = Object.values(HabitType);

    const habits = await prisma.habit.findMany({
        where: { userId: session.user.id },
    });

    return (
        <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <HabitModalWrapper habitTypeOptions={habitTypeOptions} />
            <HabitTable habits={habits} />
        </main>
    );
}