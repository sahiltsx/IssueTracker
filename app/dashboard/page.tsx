import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialIssues = [
  {
    id: "1",
    issueKey: "ISS-101",
    title: "Implement user authentication with JWT",
    priority: "High",
    status: "TODO",
  },
  {
    id: "2",
    issueKey: "ISS-102",
    title: "Fix login page layout on mobile viewport",
    priority: "Medium",
    status: "IN_PROGRESS",
  },
  {
    id: "3",
    issueKey: "ISS-103",
    title: "Database index optimization",
    priority: "Low",
    status: "DONE",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Issue Tracker</h2>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-violet-400">
              New Issue
            </Button>
            <span className="text-sm font-medium text-zinc-500">User Profile</span>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search issues..."
              className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 w-64"
            />
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300">
              All
            </Button>
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400">
              My Issues
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* To-Do */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 min-h-112.5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <span className="font-medium text-sm text-zinc-300">To Do</span>
              <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                1
              </span>
            </div>
            <div className="space-y-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition cursor-pointer">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-mono text-zinc-500">#ISS-101</span>
                  <span className="text-rose-400 font-medium text-[11px]">High</span>
                </div>
                <p className="text-sm font-medium text-zinc-200">
                  Implement user authentication with JWT
                </p>
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 min-h-112.5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <span className="font-medium text-sm text-zinc-300">In Progress</span>
              <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                1
              </span>
            </div>
            <div className="space-y-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition cursor-pointer">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-mono text-zinc-500">#ISS-102</span>
                  <span className="text-amber-400 font-medium text-[11px]">Medium</span>
                </div>
                <p className="text-sm font-medium text-zinc-200">
                  Fix login page layout on mobile viewport
                </p>
              </div>
            </div>
          </div>

          {/* Done */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 min-h-112.5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <span className="font-medium text-sm text-zinc-300">Done</span>
              <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                1
              </span>
            </div>
            <div className="space-y-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition cursor-pointer">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-mono text-zinc-500">#ISS-103</span>
                  <span className="text-emerald-400 font-medium text-[11px]">Low</span>
                </div>
                <p className="text-sm font-medium text-zinc-200">
                  Database index optimization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}