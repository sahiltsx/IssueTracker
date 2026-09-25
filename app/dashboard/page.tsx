"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DUMMY_ISSUES = [
  {
    id: "1",
    issueKey: "ISS-101",
    title: "Implement user authentication with JWT & refresh tokens",
    priority: "High",
    status: "TODO",
    tag: "backend",
  },
  {
    id: "2",
    issueKey: "ISS-102",
    title: "Setup PostgreSQL schema and migrate initial tables",
    priority: "Medium",
    status: "TODO",
    tag: "database",
  },
  {
    id: "3",
    issueKey: "ISS-103",
    title: "Fix login page layout shifts on mobile viewport",
    priority: "Urgent",
    status: "IN_PROGRESS",
    tag: "bug",
  },
  {
    id: "4",
    issueKey: "ISS-104",
    title: "Integrate shadcn dialog for ticket creation modal",
    priority: "Medium",
    status: "IN_PROGRESS",
    tag: "frontend",
  },
  {
    id: "5",
    issueKey: "ISS-105",
    title: "Configure Tailwind CSS dark theme tokens",
    priority: "Low",
    status: "DONE",
    tag: "ui",
  },
];

const COLUMNS = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

export default function Dashboard() {
  const [issues,setIssues] = useState(DUMMY_ISSUES);
  const [search, setSearch] = useState("");
  const [title,newTitle]=useState("");
  const [priority,setPriority]=useState("Medium")
  const[tag,setTag]=useState("features")

  const filteredIssues = issues.filter((issue) =>
    issue.title.toLowerCase().includes(search.toLowerCase()) ||
    issue.issueKey.toLowerCase().includes(search.toLowerCase()) ||
    issue.tag.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "text-rose-500";
      case "High":
        return "text-orange-400";
      case "Medium":
        return "text-emerald-400";
      default:
        return "text-neutral-300";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Issue Tracker</h2>
          </div>

          <div className="flex items-center gap-3">
            <Button  variant="outline" className="text-violet-400 text-sm h-9">
              New Issue
            </Button>
            <span className="text-sm font-medium text-zinc-400">User Profile</span>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          {COLUMNS.map((column) => {
            const columnIssues = filteredIssues.filter((i) => i.status === column.id);

            return (
              <div
                key={column.id}
                className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 min-h-112.5 flex flex-col"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                  <span className="font-medium text-sm text-zinc-300">{column.label}</span>
                  <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                    {columnIssues.length}
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  {columnIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition cursor-pointer"
                    >
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-mono text-zinc-500">#{issue.issueKey}</span>
                        <span className={`font-medium text-[11px] ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-200 mb-3">{issue.title}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                          {issue.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                  {columnIssues.length === 0 && (
                    <div className="h-28 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg text-xs text-zinc-600">
                      No issues
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}