
"use client";

import styles from "./HabitTable.module.css";

import { Habit } from "@/generated/prisma/client.ts";

interface Props {
    habits: Habit[];
}

export default function HabitTable(props: Props) {
    return (
        <div>
            <h2>Your Habits: </h2>
            <table className={styles.habitTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                {props.habits.length === 0 ? (
                        <tr>
                        <td colSpan={3}>No habits found.</td>
                        </tr>
                    ) : (
                        props.habits.map((habit) => (
                        <tr key={habit.id}>
                            <td>{habit.name}</td>
                            <td>{habit.type}</td>
                            <td>{habit.description || 'N/A'}</td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}