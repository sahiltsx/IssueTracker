// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kanban, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-between p-8 selection:bg-blue-500 selection:text-white overflow-hidden">
            <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-30" 
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      <div className="z-10 w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <Kanban className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-sm font-mono">IssueFlow</span>
        </div>
      </div>

      <main className="z-10 flex-1 flex flex-col items-center justify-center text-center max-w-xl my-auto py-12">
        
        <div className="absolute w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-zinc-100 mb-4 font-mono">
          IssueFlow
        </h1>
        
        <p className="text-sm sm:text-base text-zinc-400 mb-10 leading-relaxed font-normal">
          Manage internal sprints with fluid Kanban boards and track open-source GitHub issues effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm">
          <Link href="/register" className="w-full">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11 rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm"
            >
              Sign Up
            </Button>
          </Link>

          <Link href="/login" className="w-full">
            <Button 
              variant="outline" 
              className="w-full border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 font-medium h-11 rounded-xl transition-all text-sm"
            >
              Login
            </Button>
          </Link>
        </div>

      </main>

      <footer className="z-10 text-center text-xs text-zinc-600 font-mono">
        <p>© {new Date().getFullYear()} IssueFlow • Built with Next.js & Prisma</p>
      </footer>
    </div>
  );
}