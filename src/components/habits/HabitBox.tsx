"use client";


import { useState } from "react";
import { Habit, HabitEntry } from "@/generated/prisma/client.ts";
import styles from "./HabitBox.module.css";

interface Props {
    habit: Habit;
    entry?: HabitEntry;
}

export default function HabitBox(props: Props) {
    const { name, description } = props.habit;
    // Local state for testing completion toggle
    const [completed, setCompleted] = useState(false);

    return (
        <li className={styles.habitBox}>
            <div>
                <h2>{name}</h2>
                {description && <p>{description}</p>}
            </div>
            <button
                className={styles.squircleBtn}
                aria-pressed={completed}
                onClick={() => setCompleted((prev) => !prev)}
                type="button"
            >
                <span className={styles.squircleOuter}>
                    {completed && <span className={styles.squircleInner} />}
                </span>
            </button>
        </li>
    );
}