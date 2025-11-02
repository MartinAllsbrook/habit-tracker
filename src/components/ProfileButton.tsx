"use client";

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProfileButton.module.css";


export default function ProfileButton() {
    const { data: session, status } = useSession();
    console.log("SignInButton session:", session, "status:", status);
    
    if (status === "loading") {
        return <>...</>
    }

    if (status === "authenticated") {
        return (
            <Link className={styles.button} href="/profile">
                <Image
                    src={session.user?.image ?? "/logo.svg"}
                    alt="Profile"
                    width={64}
                    height={64}
                    className={styles.avatar}
                />
            </Link>
        )
    }

    return (
        <button type="button" onClick={() => signIn()} className={styles.button}>
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="w-6 h-6 text-gray-600"
            >
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
            </svg>
        </button>
    )
}