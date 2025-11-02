'use client';

import { SessionProvider } from "next-auth/react";

type Props = {
    children: React.ReactNode;
}

// Having this wrap the root layout allows any part of the app can access auth state

export default function AuthProvider({ children }: Props) {
    return <SessionProvider>{children}</SessionProvider>;
}