import { auth } from "@/auth.ts";
import { prisma } from "@/lib/prisma.ts";
import { redirect } from "next/navigation";
import { HabitType } from "prisma/client.ts";

async function handleCreateHabit(formData: FormData) {
    'use server';
    
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

    redirect('/');
}

export default async function HabitsPage() {
    const session = await auth();
    if (!session?.user) {
        return <div>Please log in to manage your habits.</div>;
    }

    // Import the enum from Prisma client

    // Get enum values as array
    const habitTypeOptions = Object.values(HabitType);

    return (
        <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Create New Habit</h1>
            <form action={handleCreateHabit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        placeholder="e.g., Exercise, Read, Meditate"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>

                <div>
                    <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Habit Type
                    </label>
                    <select
                        id="category"
                        name="category"
                        required
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                        defaultValue="Boolean"
                    >   
                        {habitTypeOptions.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        placeholder="Optional: Add details about this habit"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', resize: 'none' }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        backgroundColor: '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Create Habit
                </button>
            </form>
        </main>
    );
}