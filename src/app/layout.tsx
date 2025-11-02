import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";
import AuthProvider from "./AuthProvider";

const ebGaramond = EB_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    style: ["normal", "italic"],
    variable: "--font-eb-garamond",
});

export const metadata: Metadata = {
    title: "Dinosaur App",
    description: "Run Next.js with Deno",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthProvider>
            <html lang="en" className={ebGaramond.variable}>
                <head>

                </head>
                <body>
                    {children}
                </body>
            </html>
        </AuthProvider>
    );
}
