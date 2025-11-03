import { auth } from "@/auth.ts";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
    const authenticated = await auth();

    if (!authenticated) {
        redirect("/api/auth/signin")
    }     

    return (
        <main>
            <Link href="/api/auth/signout">
                Sign Out
            </Link>
        </main>
    );
}
