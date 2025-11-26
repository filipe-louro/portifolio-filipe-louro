import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavProvider } from "@/components/providers/nav-provider";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Creative Developer Portfolio",
    description: "Next.js 15 Portfolio",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
        <body className={inter.className}>
        <NavProvider>
            <Navbar />
            {children}
        </NavProvider>
        </body>
        </html>
    );
}