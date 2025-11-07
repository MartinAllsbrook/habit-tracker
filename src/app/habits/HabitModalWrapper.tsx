'use client';

import { useState } from 'react';
import NewHabitModal from './NewHabitModal.tsx';
import styles from './NewHabitModal.module.css';

interface HabitModalWrapperProps {
    habitTypeOptions: string[];
}

export default function HabitModalWrapper({ habitTypeOptions }: HabitModalWrapperProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSuccess = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button 
                type="button"
                onClick={() => setIsOpen(true)}
                className={styles.openButton}
                aria-label="Create new habit"
            >
                +
            </button>

            {isOpen && (
                <div className={styles.backdrop} onClick={handleClose}>
                    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                        <button 
                            type="button"
                            onClick={handleClose}
                            className={styles.closeButton}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                        <NewHabitModal 
                            habitTypeOptions={habitTypeOptions}
                            onSuccess={handleSuccess}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
