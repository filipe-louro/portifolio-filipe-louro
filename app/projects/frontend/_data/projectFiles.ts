export type FileType = 'file' | 'folder';

export interface FileNode {
    id: string;
    name: string;
    type: FileType;
    language?: 'typescript' | 'json' | 'css' | 'javascript';
    content?: string;
    children?: FileNode[];
    isOpen?: boolean;
}

export const projectFiles: FileNode[] = [
    {
        id: 'root',
        name: 'frontend-app',
        type: 'folder',
        isOpen: true,
        children: [
            {
                id: 'app',
                name: 'app',
                type: 'folder',
                isOpen: true,
                children: [
                    {
                        id: 'page.tsx',
                        name: 'page.tsx',
                        type: 'file',
                        language: 'typescript',
                        content: `"use client";\n\nimport { Card } from "@/components/ui/card";\nimport { Overview } from "@/components/overview";\nimport { RecentSales } from "@/components/recent-sales";\n\nexport default function DashboardPage() {\n  return (\n    <div className="flex-1 space-y-4 p-8 pt-6">\n      <div className="flex items-center justify-between space-y-2">\n        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>\n      </div>\n      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">\n        <Card title="Total Revenue" value="$45,231.89" change="+20.1%" />\n        <Card title="Subscriptions" value="+2350" change="+180.1%" />\n        <Card title="Sales" value="+12,234" change="+19%" />\n        <Card title="Active Now" value="+573" change="+201" />\n      </div>\n      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">\n        <Card className="col-span-4">\n          <Overview />\n        </Card>\n        <Card className="col-span-3">\n          <RecentSales />\n        </Card>\n      </div>\n    </div>\n  );\n}`
                    },
                    {
                        id: 'layout.tsx',
                        name: 'layout.tsx',
                        type: 'file',
                        language: 'typescript',
                        content: `import { Inter } from 'next/font/google';\nimport { Sidebar } from '@/components/sidebar';\n\nconst inter = Inter({ subsets: ['latin'] });\n\nexport default function RootLayout({\n  children,\n}: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body className={inter.className}>\n        <div className="flex h-screen overflow-hidden">\n          <Sidebar />\n          <main className="flex-1 overflow-y-auto bg-slate-50">\n             {children}\n          </main>\n        </div>\n      </body>\n    </html>\n  );\n}`
                    },
                    {
                        id: 'globals.css',
                        name: 'globals.css',
                        type: 'file',
                        language: 'css',
                        content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --background: 0 0% 100%;\n  --foreground: 222.2 84% 4.9%;\n  --primary: 221.2 83.2% 53.3%;\n}\n\n.dark {\n  --background: 222.2 84% 4.9%;\n  --foreground: 210 40% 98%;\n}\n\nbody {\n  @apply bg-background text-foreground;\n}`
                    }
                ]
            },
            {
                id: 'components',
                name: 'components',
                type: 'folder',
                isOpen: false,
                children: [
                    {
                        id: 'ui',
                        name: 'ui',
                        type: 'folder',
                        children: [
                            {
                                id: 'button.tsx',
                                name: 'button.tsx',
                                type: 'file',
                                language: 'typescript',
                                content: `import * as React from "react"\nimport { Slot } from "@radix-ui/react-slot"\nimport { cva, type VariantProps } from "class-variance-authority"\nimport { cn } from "@/lib/utils"\n\nconst buttonVariants = cva(\n  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",\n  {\n    variants: {\n      variant: {\n        default: "bg-primary text-primary-foreground hover:bg-primary/90",\n        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",\n        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",\n      },\n      size: {\n        default: "h-10 px-4 py-2",\n        sm: "h-9 rounded-md px-3",\n        lg: "h-11 rounded-md px-8",\n      },\n    },\n    defaultVariants: {\n      variant: "default",\n      size: "default",\n    },\n  }\n)\n\nexport { Button, buttonVariants }`
                            },
                        ]
                    },
                    {
                        id: 'sidebar.tsx',
                        name: 'sidebar.tsx',
                        type: 'file',
                        language: 'typescript',
                        content: `"use client";\n\nimport { cn } from "@/lib/utils";\nimport { Button } from "@/components/ui/button";\nimport { LayoutDashboard, Settings, User } from "lucide-react";\n\nexport function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {\n  return (\n    <div className={cn("pb-12 w-64 border-r", className)}>\n      <div className="space-y-4 py-4">\n        <div className="px-3 py-2">\n          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">\n            Overview\n          </h2>\n          <div className="space-y-1">\n            <Button variant="secondary" className="w-full justify-start">\n              <LayoutDashboard className="mr-2 h-4 w-4" />\n              Dashboard\n            </Button>\n            <Button variant="ghost" className="w-full justify-start">\n              <Settings className="mr-2 h-4 w-4" />\n              Settings\n            </Button>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}`
                    }
                ]
            },
            {
                id: 'next.config.js',
                name: 'next.config.js',
                type: 'file',
                language: 'javascript',
                content: `/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  images: {\n    domains: ['avatars.githubusercontent.com'],\n  },\n  experimental: {\n    serverActions: true,\n  },\n}\n\nmodule.exports = nextConfig`
            },
            {
                id: 'package.json',
                name: 'package.json',
                type: 'file',
                language: 'json',
                content: `{\n  "name": "enterprise-dashboard",\n  "version": "2.0.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "lint": "next lint"\n  },\n  "dependencies": {\n    "next": "14.1.0",\n    "react": "^18",\n    "react-dom": "^18",\n    "lucide-react": "^0.330.0",\n    "tailwindcss": "^3.3.0",\n    "framer-motion": "^10.18.0"\n  }\n}`
            }
        ]
    }
];