'use client';

import { createHabit } from '../actions.ts';
import styles from './NewHabitModal.module.css';
import { useRouter } from 'next/navigation';

interface NewHabitModalProps {
    habitTypeOptions: string[];
    onSuccess: () => void;
}

export default function NewHabitModal({ habitTypeOptions, onSuccess }: NewHabitModalProps) {
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        try {
            await createHabit(formData);
            onSuccess();
            router.refresh();
        } catch (error) {
            console.error('Failed to create habit:', error);
            alert('Failed to create habit. Please try again.');
        }
    }
    
    return (
        <div className={styles.modalContent}>
            <h1 className={styles.title}>Create New Habit</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        placeholder="e.g., Exercise, Read, Meditate"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="category" className={styles.label}>
                        Habit Type
                    </label>
                    <select
                        id="category"
                        name="category"
                        required
                        className={styles.select}
                        defaultValue="Boolean"
                    >   
                        {habitTypeOptions.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.label}>
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        placeholder="Optional: Add details about this habit"
                        className={styles.textarea}
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                >
                    Create Habit
                </button>
            </form>
        </div>
    )
}