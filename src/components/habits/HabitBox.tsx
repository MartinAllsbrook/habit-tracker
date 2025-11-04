"use client";

import { useState, useEffect } from "react";
import { Habit, HabitEntry } from "@/generated/prisma/client.ts";
import styles from "./HabitBox.module.css";
import { useRef } from "react";

interface Props {
    habit: Habit;
    entry?: HabitEntry;
    date: string; // Current date for the entry
}

export default function HabitBox({ habit, entry, date }: Props) {
    const { name, description, type } = habit;
    
    // Optimistic UI state
    const [completed, setCompleted] = useState(!!entry);
    const [entryId, setEntryId] = useState(entry?.id);
    const [value, setValue] = useState(entry?.value ?? "");
    
    // Debounce management
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const DEBOUNCE_MS = 1000; // 1 second
    
    const syncWithServer = async (currentCompleted: boolean, currentValue: string | number, currentEntryId?: string) => {
        try {
            console.log('Syncing with server:', { completed: currentCompleted, value: currentValue, entryId: currentEntryId });
            if (type === "BOOLEAN") {
                // Boolean habit logic
                if (currentCompleted && !currentEntryId) {
                    // POST - Create new entry
                    const response = await fetch(`/api/habits/${habit.id}/entries`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ date })
                    });
                    const newEntry = await response.json();
                    setEntryId(newEntry.id);
                } else if (!currentCompleted && currentEntryId) {
                    // DELETE - Remove entry
                    await fetch(`/api/habits/${habit.id}/entries/${currentEntryId}`, {
                        method: 'DELETE'
                    });
                    setEntryId(undefined);
                }
            } else if (type === "VALUE") {
                // Value habit logic
                const numericValue = currentValue === "" ? null : Number(currentValue);
                
                if ((numericValue === null || numericValue === 0) && currentEntryId) {
                    // DELETE - Remove entry when value is cleared or 0
                    await fetch(`/api/habits/${habit.id}/entries/${currentEntryId}`, {
                        method: 'DELETE'
                    });
                    setEntryId(undefined);
                } else if (numericValue && numericValue > 0) {
                    if (currentEntryId) {
                        // PATCH - Update existing entry
                        await fetch(`/api/habits/${habit.id}/entries/${currentEntryId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ value: numericValue })
                        });
                    } else {
                        // POST - Create new entry
                        const response = await fetch(`/api/habits/${habit.id}/entries`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date, value: numericValue })
                        });
                        const newEntry = await response.json();
                        setEntryId(newEntry.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error syncing with server:', error);
            // TODO: Add error handling/rollback logic
        }
    };
    
    const handleToggle = () => {
        // Optimistic update for boolean habits
        const newCompleted = !completed;
        setCompleted(newCompleted);
        
        // Debounce server sync
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => syncWithServer(newCompleted, value, entryId), DEBOUNCE_MS);
    };
    
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        
        // Debounce server sync
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => syncWithServer(completed, newValue, entryId), DEBOUNCE_MS);
    };
    
    const handleClear = () => {
        setValue("");
        
        // Debounce server sync
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => syncWithServer(completed, "", entryId), DEBOUNCE_MS);
    };
    
    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <li className={styles.habitBox}>
            <div className={styles.headerContainer}>
                <h2>{name}</h2>
                {description && <p>{description}</p>}
            </div>
            {type === "VALUE" ? (
                <div className={styles.valueHabit}>
                    <input
                        type="number"
                        value={value}
                        onChange={handleValueChange}
                        placeholder="0"
                        min="0"
                        className={styles.valueInput}
                    />
                    <button
                        onClick={handleClear}
                        disabled={!value}
                        type="button"
                        className={styles.clearBtn}
                    >
                        Clear
                    </button>
                </div>
            ) : (
                <button
                    className={styles.squircleBtn}
                    aria-pressed={completed}
                    onClick={handleToggle}
                    type="button"
                >
                    <span className={styles.squircleOuter}>
                        {completed && <span className={styles.squircleInner} />}
                    </span>
                </button>
            )}
        </li>
    );
}