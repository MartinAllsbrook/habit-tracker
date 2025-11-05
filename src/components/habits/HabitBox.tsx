"use client";

import { useState, useEffect, useRef } from "react";
import { Habit, BooleanHabitEntry, TimedHabitEntry } from "@/generated/prisma/client.ts";
import styles from "./HabitBox.module.css";

interface Props {
    habit: Habit;
    entries: {
        booleanEntry?: BooleanHabitEntry;
        timedEntries: TimedHabitEntry[];
    };
    date: string; // Current date for the entry (YYYY-MM-DD)
}

export default function HabitBox({ habit, entries, date }: Props) {
    const { name, description, type } = habit;
    
    // For boolean habits
    const booleanEntry = entries.booleanEntry;
    
    // Optimistic UI state
    const [completed, setCompleted] = useState(!!booleanEntry);
    const [entryId, setEntryId] = useState(booleanEntry?.id);
    const [localEntries, setLocalEntries] = useState(entries.timedEntries);
    const [inputValue, setInputValue] = useState<number>(1); // Default value for new entries
    
    // Debounce management for boolean habits only
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const DEBOUNCE_MS = 1000; // 1 second
    
    const syncBooleanWithServer = async (currentCompleted: boolean, currentEntryId?: string) => {
        try {
            console.log('Syncing boolean with server:', { completed: currentCompleted, entryId: currentEntryId });
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
        } catch (error) {
            console.error('Error syncing with server:', error);
            // TODO: Add error handling/rollback logic
        }
    };
    
    const addTimedEntry = async () => {
        try {
            // For VALUE habits, don't create entry if value is 0 or negative
            if (type === 'VALUE' && inputValue <= 0) return;
            
            // Create new entry with the input value (for VALUE) or without (for TALLY) at current time
            const response = await fetch(`/api/habits/${habit.id}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    timestamp: new Date().toISOString(),
                    value: type === 'VALUE' ? inputValue : null
                })
            });
            const newEntry = await response.json();
            
            // Add to local state optimistically
            setLocalEntries([newEntry, ...localEntries]);
            
            // Reset input value for VALUE habits
            if (type === 'VALUE') {
                setInputValue(1);
            }
        } catch (error) {
            console.error('Error adding entry:', error);
            // TODO: Add error handling
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "") {
            setInputValue(0);
        } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0) {
                setInputValue(numValue);
            }
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
        timeoutRef.current = setTimeout(() => syncBooleanWithServer(newCompleted, entryId), DEBOUNCE_MS);
    };
    
    const formatTime = (timestamp: Date) => {
        return new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };
    
    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <>
            <li className={styles.habitBox}>
                <div className={styles.headerContainer}>
                    <h2>{name}</h2>
                    {description && <p>{description}</p>}
                </div>
                {type === "VALUE" ? (
                    <div className={styles.valueHabit}>
                        <input
                            type="number"
                            value={inputValue || ""}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                            step="1"
                            className={styles.valueInput}
                        />
                        <button
                            onClick={addTimedEntry}
                            type="button"
                            className={styles.addBtn}
                            aria-label="Add entry"
                            disabled={inputValue <= 0}
                        >
                            +
                        </button>
                    </div>
                ) : type === "TALLY" ? (
                    <button
                        onClick={addTimedEntry}
                        type="button"
                        className={styles.addBtn}
                        aria-label="Add tally"
                    >
                        +
                    </button>
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
            {(type === "VALUE" || type === "TALLY") && localEntries.length > 0 && (
                <ul className={styles.entriesList}>
                    {localEntries.map((entry) => (
                        <li key={entry.id}>
                            {formatTime(entry.timestamp)}
                            {type === "VALUE" && ` - ${entry.value} ${habit.unit || ''}`}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}