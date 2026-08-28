import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "Filipe Louro — Animation Lab",
        template: "%s | Louro Lab",
    },
    description: "Laboratório de animações e simulações interativas em WebGL 2.0 e Canvas, por Filipe Louro.",
    authors: [{ name: "Filipe Louro", url: "https://github.com/filipe-louro" }],
    openGraph: {
        title: "Filipe Louro — Animation Lab",
        description: "Simulações interativas feitas à mão: buraco negro em raymarching, fluidos em GPU, física de partículas e mais.",
        type: "website",
        locale: "pt_BR",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
        <body className={inter.className}>
        <Navbar />
        {children}
        </body>
        </html>
    );
}
