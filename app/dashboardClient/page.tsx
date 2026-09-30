"use client";

import { useState } from "react";
import {toast} from "sonner"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createIssues, updateIssue, deleteIssue } from "../actions/issues";
import { useSession } from "../hooks/session";
import { fetchOpenSourceIssues,GitHubIssue } from "../actions/github";
import { OpenSourceCard } from "@/components/OpenSourceCard";
import { Issue } from "../types/issue";
import Link from "next/link";

const COLUMNS = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

export default function DashboardClient({initialIssues}:{initialIssues:Issue[]}) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues || []);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newTag, setNewTag] = useState("feature");
  const [selectedIssues, setSelectedIssues] = useState<Issue | null>(null);
  const [copied, setCopied] = useState(false);
  const [filteredMyIssues, setFilteredMyIssues] = useState(false);
  const [activeTab, setActiveTab] = useState<"board" | "oss">("board");
  const [ossIssues, setOssIssues] = useState<GitHubIssue[]>([]);
  const [ossLanguage, setOssLanguage] = useState("typescript");
  const [ossLoading, setOssLoading] = useState(false);

  const { user: sessionUser } = useSession();

  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.issueKey.toLowerCase().includes(search.toLowerCase()) ||
      issue.tag.toLowerCase().includes(search.toLowerCase())
  );

  const displayedIssues = filteredIssues.filter((issue: any) => {
    if (!filteredMyIssues) return true;
    return issue.assigneeId === sessionUser?.id;
  });

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await createIssues({
      title: newTitle,
      priority: newPriority as any,
      tag: newTag,
      assigneeId: sessionUser?.id, // Passes the logged-in user ID
    });

    if (res.success && res.data) {
      setIssues((prev) => [res.data as any, ...prev]);
      toast.success("Issue created successfully");
      setNewTitle("");
      setIsOpen(false);
    } else {
      toast.error("Failed to create issue");
    }
  };

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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");

    setIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: targetStatus } : item))
    );

    await updateIssue(id, targetStatus as any);
  };

  const handleDeleteIssues = async (id: string) => {
    setIssues((prev) => prev.filter((item) => item.id !== id));
    setSelectedIssues(null);

    await deleteIssue(id);
  };
    
  // Load issues from GitHub
  const loadOssIssues = async (lang: string) => {
  setOssLoading(true);
  const res = await fetchOpenSourceIssues(lang);
  if (res.success) {
    setOssIssues(res.data);
  } else {
    toast.error("Could not fetch GitHub issues");
  }
  setOssLoading(false);
};
 
// Import an OSS issue into your board
const handleImportToBoard = async (ossItem: GitHubIssue) => {
  const title = `[${ossItem.repo_name}] ${ossItem.title}`;

  const res = await createIssues({
    title,
    priority: "Medium",
    tag: "open-source",
    assigneeId: sessionUser?.id,
  });

  if (res.success && res.data) {
    setIssues((prev) => [res.data as any, ...prev]);
    toast.success(`Tracked issue #${ossItem.number} on your board!`);
    setActiveTab("board"); // Switch back to view the added card
  } else {
    toast.error("Failed to track issue");
  }
};


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">IssueFlow</h2>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-sm h-9">
                  New Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold">Create New Issue</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateIssue} className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Title</label>
                    <input
                      required
                      placeholder="e.g., Fix navbar overlap on mobile"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 mt-1 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Priority</label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-200 mt-1 focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Tag</label>
                      <input
                        placeholder="e.g., ui, backend"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 mt-1 focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="border-zinc-800 text-zinc-400 text-xs h-8"
                    >
                      Cancel
                    </Button>
                    <Button variant="outline" type="submit" className="text-white text-sm h-8">
                      Create
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

{sessionUser ? (
    <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-full py-1.5 px-3">
      {(sessionUser as any).image ? (
        <img 
          src={(sessionUser as any).image} 
          alt="Profile" 
          className="w-6 h-6 rounded-full object-cover border border-zinc-700" 
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
          {sessionUser.email?.[0].toUpperCase() || "U"}
        </div>
      )}
      <span className="text-xs font-medium text-zinc-300 max-w-30 truncate">
        {sessionUser.email}
      </span>
      
      {/* Logout button */}
      <button 
        onClick={async () => {
          // Clear auth cookie by hitting a logout route or clearing state
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/";
        }}
        className="text-[10px] text-zinc-500 hover:text-rose-400 ml-1 transition-colors"
        title="Logout"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="outline" size="sm" className="text-xs h-8 border-zinc-800 bg-zinc-900">
          Login
        </Button>
      </Link>
    </div>
  )}          </div>
        </header>

        {/* View Tabs */}
<div className="flex gap-6 border-b border-zinc-800 text-sm mt-4">
  <button
    onClick={() => setActiveTab("board")}
    className={`pb-2.5 font-medium transition-colors border-b-2 ${
      activeTab === "board"
        ? "border-blue-500 text-white"
        : "border-transparent text-zinc-400 hover:text-zinc-200"
    }`}
  >
    Active Board
  </button>
  <button
    onClick={() => {
      setActiveTab("oss");
      if (ossIssues.length === 0) loadOssIssues(ossLanguage);
    }}
    className={`pb-2.5 font-medium transition-colors border-b-2 flex items-center gap-2 ${
      activeTab === "oss"
        ? "border-blue-500 text-white"
        : "border-transparent text-zinc-400 hover:text-zinc-200"
    }`}
  >
    <span>Open Source Hub</span>
    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-500/20">
      Live
    </span>
  </button>
</div>

       {activeTab === "board" ? (
  <>
    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search issues or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
        />

        {/* All Issues Toggle */}
        <Button
          type="button"
          variant={!filteredMyIssues ? "default" : "outline"}
          size="sm"
          onClick={() => setFilteredMyIssues(false)}
          className={`h-8 border-zinc-800 text-xs ${
            !filteredMyIssues ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200" : "text-zinc-400"
          }`}
        >
          All
        </Button>

        {/* My Issues Toggle */}
        <Button
          type="button"
          variant={filteredMyIssues ? "default" : "outline"}
          size="sm"
          onClick={() => setFilteredMyIssues(true)}
          className={`h-8 border-zinc-800 text-xs ${
            filteredMyIssues ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200" : "text-zinc-400"
          }`}
        >
          My Issues
        </Button>
      </div>

      <span className="text-xs text-zinc-500 font-mono">
        Showing {displayedIssues.length} {displayedIssues.length === 1 ? "task" : "tasks"}
      </span>
    </div>

    {/* ================= 3-COLUMN KANBAN GRID ================= */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map((column) => {
        const columnIssues = displayedIssues.filter((i) => i.status === column.id);

        return (
          <div
            key={column.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.id)}
            className="flex min-h-120 flex-col rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4"
          >
            {/* Column Header */}
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-sm font-medium text-zinc-300">{column.label}</span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
                {columnIssues.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-3">
              {columnIssues.map((issue) => (
                <div
                  key={issue.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, issue.id)}
                  onClick={() => setSelectedIssues(issue)} 
                  className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-sm transition hover:border-zinc-700 active:cursor-grabbing"
                >
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-500">#{issue.issueKey}</span>
                    <span className={`text-[11px] font-medium ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </div>

                  <p className="mb-3 text-sm font-medium text-zinc-200 leading-snug">
                    {issue.title}
                  </p>

                  <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[10px]">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-zinc-400">
                      {issue.tag}
                    </span>
                    <span className="text-zinc-500">
                      {issue.assignee?.email || "Unassigned"}
                    </span>
                  </div>
                </div>
              ))}

              {columnIssues.length === 0 && (
                <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-zinc-800/80 text-xs text-zinc-600">
                  No issues
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </>
) : (
  /* ================= OPEN SOURCE EXPLORER VIEW ================= */
  <div className="space-y-6 py-6">
    {/* Filter bar: Language select */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="oss-language" className="text-xs font-medium text-zinc-400">
          Filter by Stack:
        </label>
        <select
          id="oss-language"
          value={ossLanguage}
          onChange={(e) => {
            const selected = e.target.value;
            setOssLanguage(selected);
            loadOssIssues(selected);
          }}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:border-zinc-700 focus:outline-none"
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="rust">Rust</option>
          <option value="go">Go</option>
        </select>
      </div>

      <span className="text-xs text-zinc-500">
        Filtered by: <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-300">good first issue</code>
      </span>
    </div>

    {/* Issues Grid / State Display */}
    {ossLoading ? (
      <div className="animate-pulse py-24 text-center text-xs text-zinc-500">
        Searching GitHub for beginner-friendly issues...
      </div>
    ) : ossIssues.length === 0 ? (
      <div className="py-24 text-center text-xs text-zinc-500">
        No open issues found for {ossLanguage}. Try selecting another language!
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ossIssues.map((issue) => (
          <OpenSourceCard
            key={issue.id}
            issue={issue}
            onImport={handleImportToBoard}
          />
        ))}
      </div>
    )}
  </div>
)}

      <Sheet open={Boolean(selectedIssues)} onOpenChange={(open) => !open && setSelectedIssues(null)}>
  <SheetContent className="bg-zinc-950 border-l border-zinc-800 text-zinc-100 sm:max-w-md flex flex-col justify-between overflow-y-auto">
    {selectedIssues && (
      <div className="space-y-6 pt-4 pb-8">
        
        {/* Header Section: Key & Priority */}
        <SheetHeader className="text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-500 font-semibold">
                #{selectedIssues.issueKey}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 ${getPriorityColor(
                  selectedIssues.priority
                )}`}
              >
                {selectedIssues.priority}
              </span>
            </div>
          </div>

          <SheetTitle className="text-lg font-semibold text-zinc-100 leading-snug">
            {selectedIssues.title}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-2">
          <label className="text-xs text-zinc-400 font-medium">Description / Notes</label>
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-lg text-xs text-zinc-300 leading-relaxed min-h-20">
            {selectedIssues.discription || "No description provided for this task yet."}
          </div>
        </div>

        {/* Assignee & Origin Meta Info */}
        <div className="grid grid-cols-2 gap-3 bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-lg text-xs">
          <div>
            <span className="text-zinc-500 block mb-1">Assignee</span>
            <span className="text-zinc-200 font-medium">
              {selectedIssues.assignee?.email || "Unassigned"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-1">Source / Tracker</span>
            <span className="text-zinc-200 font-medium truncate block">
              {selectedIssues.tag === "open-source" ? "GitHub OSS Hub" : "Internal Board"}
            </span>
          </div>
        </div>

        {/* Quick Git Branch Helper */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 font-medium">Git Branch Command</label>
          <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-zinc-400 truncate">
              git checkout -b {selectedIssues.issueKey.toLowerCase()}-
              {selectedIssues.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 15)}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-zinc-700 text-zinc-300 shrink-0"
              onClick={() => {
                navigator.clipboard
                  .writeText(
                    `git checkout -b ${selectedIssues.issueKey.toLowerCase()}-${selectedIssues.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .slice(0, 15)}`
                  )
                  .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  });
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 font-medium">Update Status</label>
          <select
            value={selectedIssues.status}
            onChange={(e) => {
              const updatedStatus = e.target.value;
              setIssues((prev) =>
                prev.map((i) => (i.id === selectedIssues.id ? { ...i, status: updatedStatus } : i))
              );
              setSelectedIssues({ ...selectedIssues, status: updatedStatus });
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Delete Action */}
        <div className="pt-4 border-t border-zinc-900">
          <Button
            variant="destructive"
            size="sm"
            className="w-full text-xs h-9"
            onClick={() => handleDeleteIssues(selectedIssues.id)}
          >
            Delete Issue
          </Button>
        </div>

      </div>
    )}
  </SheetContent>
</Sheet>
      </div>
    </div>
  );
}