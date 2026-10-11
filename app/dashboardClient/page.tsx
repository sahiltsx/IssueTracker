"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createIssues, updateIssue, deleteIssue } from "../actions/issues";
import { useSession } from "../hooks/session";
import { fetchOpenSourceIssues, GitHubIssue } from "../actions/github";
import { OpenSourceCard } from "@/components/OpenSourceCard";
import { Issue } from "../types/issue";
import Link from "next/link";
import IssueDetail from "@/components/IssueDetail";

const COLUMNS = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

const getInitials = (name?: string | null, email?: string | null) => {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (email?.[0] || "U").toUpperCase();
};

export default function DashboardClient({ initialIssues }: { initialIssues: Issue[] }) {
  const { user: sessionUser } = useSession();
  const [issues, setIssues] = useState<Issue[]>(initialIssues || []);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(sessionUser?.name || "");
  const [profileBio, setProfileBio] = useState((sessionUser as any)?.bio || "");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newTag, setNewTag] = useState("feature");
  const [selectedIssues, setSelectedIssues] = useState<Issue | null>(null);
  const [filteredMyIssues, setFilteredMyIssues] = useState(false);
  const [activeTab, setActiveTab] = useState<"board" | "oss">("board");
  const [ossIssues, setOssIssues] = useState<GitHubIssue[]>([]);
  const [ossLanguage, setOssLanguage] = useState("typescript");
  const [ossLoading, setOssLoading] = useState(false);

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
      description: newDescription,
      priority: newPriority as any,
      tag: newTag,
      assigneeId: sessionUser?.id,
    } as any);

    if (res.success && res.data) {
      const created = res.data as any;
      setIssues((prev) => [created, ...prev]);
      setSelectedIssues(created);
      toast.success("Issue created successfully");
      setNewTitle("");
      setNewDescription("");
      setIsOpen(false);
    } else {
      toast.error("Failed to create issue");
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedIssues) return;
    setIssues((prev) =>
      prev.map((i) => (i.id === selectedIssues.id ? { ...i, status } : i))
    );
    setSelectedIssues({ ...selectedIssues, status } as Issue);
    await updateIssue(selectedIssues.id, { status: status as any });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "text-rose-500";
      case "High":
        return "text-orange-400";
      case "Medium":
        return "text-amber-400";
      case "Low":
        return "text-sky-400";
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

    await updateIssue(id, { status: targetStatus as any });
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
      description: `Imported from GitHub: ${ossItem.html_url}`,
      priority: "Medium",
      tag: "open-source",
      assigneeId: sessionUser?.id,
    } as any);

    if (res.success && res.data) {
      setIssues((prev) => [res.data as any, ...prev]);
      toast.success(`Tracked issue #${ossItem.number} on your board!`);
      setActiveTab("board");
    } else {
      toast.error("Failed to track issue");
    }
  };

  const handleProfile = async () => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, bio: profileBio }),
      });

      if (res.ok) {
        setIsEditingProfile(false);
        window.location.reload();
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-6">
      <div>
        <header className="flex items-center justify-between pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-semibold text-neutral-300 tracking-tight">
              Issue<span className="text-blue-500">Flow</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "board" && (
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

                    <div>
                      <label className="text-xs font-medium text-zinc-400">Description</label>
                      <textarea
                        placeholder="Describe the issue, steps to reproduce, or expected behavior..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="mt-1 h-28 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
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
            )}

            {sessionUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full p-1 hover:border-zinc-700 transition"
                  title="Profile Settings"
                >
                  {sessionUser.image ? (
                    <img
                      src={sessionUser.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {getInitials(sessionUser.name, sessionUser.email)}
                    </div>
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 z-50 text-zinc-100 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {sessionUser.image ? (
                          <img
                            src={sessionUser.image}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
                            {getInitials(sessionUser.name, sessionUser.email)}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-zinc-200 truncate">
                            {sessionUser.name || "Set your profile"}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">{sessionUser.email}</p>
                        </div>
                      </div>
                    </div>

                    {!isEditingProfile ? (
                      <div className="space-y-3 text-xs">
                        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
                          <span className="text-zinc-500 block text-[10px] uppercase font-mono">Bio / Role</span>
                          <p className="text-zinc-300">
                            {(sessionUser as any).bio ||
                              "No profile details created yet. Click create to set up your profile!"}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setProfileName(sessionUser?.name || "");
                            setProfileBio((sessionUser as any).bio || "");
                            setIsEditingProfile(true);
                          }}
                          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          {!sessionUser?.name && !(sessionUser as any)?.bio ? "Create Profile" : "Edit Profile"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-zinc-400">Name</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-400">Bio / About You</label>
                          <textarea
                            value={profileBio}
                            onChange={(e) => setProfileBio(e.target.value)}
                            placeholder="Full-stack developer..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700 h-16 resize-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleProfile}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-1.5 rounded text-xs transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-1.5 rounded text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-800">
                      <button
                        onClick={() => {
                          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                          window.location.href = "/";
                        }}
                        className="w-full text-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-xs h-8 border-zinc-800 bg-zinc-900">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </header>

        <div className="flex gap-6 text-sm mt-4">
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
              GitHub
            </span>
          </button>
        </div>

        {activeTab === "oss" && (
          <p className="text-xs text-zinc-500 mt-3">
            Beginner-friendly issues from public GitHub repos. Import one to track it on your board.
          </p>
        )}

        {activeTab === "board" ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search issues or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
                />

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
                Showing {displayedIssues.length} {displayedIssues.length === 1 ? "issue" : "issues"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COLUMNS.map((column) => {
                const columnIssues = displayedIssues.filter((i) => i.status === column.id);

                return (
                  <div
                    key={column.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, column.id)}
                    className="flex min-h-65 flex-col rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-sm font-medium text-zinc-300">{column.label}</span>
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
                        {columnIssues.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      {columnIssues.map((issue) => (
                        <div
                          key={issue.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, issue.id)}
                          onClick={() => setSelectedIssues(issue)}
                          className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-sm transition hover:border-zinc-600 hover:bg-zinc-800/60 active:cursor-grabbing"
                        >
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="font-mono text-zinc-400">#{issue.issueKey}</span>
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
                              {(issue.assignee as any)?.name ||
                                issue.assignee?.email?.split("@")[0] ||
                                "Unassigned"}
                            </span>
                          </div>
                        </div>
                      ))}

                      {columnIssues.length === 0 && (
                        <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-zinc-800/80 text-xs text-zinc-600">
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
          <div className="space-y-6 py-6">
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
                  <OpenSourceCard key={issue.id} issue={issue} onImport={handleImportToBoard} />
                ))}
              </div>
            )}
          </div>
        )}

        <Sheet open={Boolean(selectedIssues)} onOpenChange={(open) => !open && setSelectedIssues(null)}>
          <SheetContent className="bg-zinc-950 border-l border-zinc-800 text-zinc-100 sm:max-w-lg overflow-y-auto [&>button]:text-zinc-400 [&>button:hover]:text-zinc-100">
            <SheetHeader className="sr-only">
              <SheetTitle>{selectedIssues?.title ?? "Issue details"}</SheetTitle>
            </SheetHeader>

            {selectedIssues && (
              <IssueDetail
                issue={selectedIssues}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteIssues}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}