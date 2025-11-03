import { auth } from "@/auth.ts";
import { prisma } from "@/lib/prisma.ts";
import { redirect } from "next/navigation";

async function handleCreateHabit(formData: FormData) {
    'use server';
    
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Not authenticated');
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;

    await prisma.habit.create({
        data: {
            name,
            description: description || null,
            userId: session.user.id,
        },
    });

    redirect('/habits');
}

export default async function HabitsPage() {
    const session = await auth();
    if (!session?.user) {
        return <div>Please log in to manage your habits.</div>;
    }

    return (
        <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Create New Habit</h1>
            <form action={handleCreateHabit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Name *
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