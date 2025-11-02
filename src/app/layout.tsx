import type { Metadata } from "next";
import { EB_Garamond, Open_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "./AuthProvider";
import NavMenu from "./NavBar";

const ebGaramond = EB_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    style: ["normal", "italic"],
    variable: "--font-eb-garamond",
});

const openSans = Open_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    style: ["normal", "italic"],
    variable: "--font-open-sans",
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
            <html lang="en" className={ebGaramond.variable + " " + openSans.variable}>
                <head>

                </head>
                <body>
                    <NavMenu/>
                    {children}
                </body>
            </html>
        </AuthProvider>
    );
}
