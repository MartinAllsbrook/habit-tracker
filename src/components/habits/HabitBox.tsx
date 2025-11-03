"use client";

import { Habit, HabitEntry } from "@/generated/prisma/client.ts";
import styles from "./HabitBox.module.css";

interface Props {
    habit: Habit;
    entry?: HabitEntry;
}

export default function HabitBox(props: Props) {
    const { name, description } = props.habit;
    
    return (
        <li className={styles.habitBox}>
            <div>
                <h2>{name}</h2>
                {description && <p>{description}</p>}
            </div>
            <label>
                <input
                    type="checkbox"
                    checked={!!props.entry}
                    onChange={() => { /* handle completion toggle */ }}
                />
                {props.entry ? "Completed" : "Not Completed"}
            </label>
        </li>
    );
}