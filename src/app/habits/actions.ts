'use server';

import { auth } from "@/auth.ts";
import { HabitType } from "@/generated/prisma/client.ts";
import { prisma } from "@/lib/prisma.ts";
import { revalidatePath } from "next/cache";

export async function createHabit(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    const name = formData.get('name') as string;
    const habitType = formData.get('category') as HabitType;
    const description = formData.get('description') as string | null;

    await prisma.habit.create({
        data: {
            name,
            type: habitType,
            description: description || null,
            userId: session.user.id,
        },
    });

    revalidatePath('/');
    return { success: true };
}
