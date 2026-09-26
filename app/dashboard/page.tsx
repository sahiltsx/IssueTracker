"use client";

import { useState } from "react";
import {toast} from "sonner"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { createIssues, updateIssue, deleteIssue } from "../actions/issues";
import { useSession } from "../hooks/session";

const DUMMY_ISSUES = [
  { id: "1", issueKey: "ISS-101", title: "Implement user authentication with JWT & refresh tokens", priority: "High", status: "TODO", tag: "backend" },
  { id: "2", issueKey: "ISS-102", title: "Setup PostgreSQL schema and migrate initial tables", priority: "Medium", status: "TODO", tag: "database" },
  { id: "3", issueKey: "ISS-103", title: "Fix login page layout shifts on mobile viewport", priority: "Urgent", status: "IN_PROGRESS", tag: "bug" },
  { id: "4", issueKey: "ISS-104", title: "Integrate shadcn dialog for ticket creation modal", priority: "Medium", status: "IN_PROGRESS", tag: "frontend" },
  { id: "5", issueKey: "ISS-105", title: "Configure Tailwind CSS dark theme tokens", priority: "Low", status: "DONE", tag: "ui" },
];

const COLUMNS = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

export default function Dashboard() {
  const [issues, setIssues] = useState(DUMMY_ISSUES);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newTag, setNewTag] = useState("feature");
  const [selectedIssues, setSelectedIssues] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [filteredMyIssues, setFilteredMyIssues] = useState(false);
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
      setIssues((prev) => [res.data, ...prev]);
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Issue Tracker</h2>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilteredMyIssues(false)}
              className={`border-zinc-800 ${!filteredMyIssues ? "text-zinc-100" : "text-zinc-400"}`}
            >
              All
            </Button>
            <Button
              variant={filteredIssues?"default":"outline"}
              size="sm"
              onClick={() => setFilteredMyIssues(!filteredMyIssues)}
              className={`border-zinc-800 ${filteredMyIssues ? "text-zinc-100" : "text-zinc-400"}`}
            >
              My Issues
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => {
            const columnIssues = displayedIssues.filter((i: any) => i.status === column.id);

            return (
              <div
                key={column.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, column.id)}
                className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 min-h-112.5 flex flex-col"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                  <span className="font-medium text-sm text-zinc-300">{column.label}</span>
                  <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                    {columnIssues.length}
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  {columnIssues.map((issue: any) => (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, issue.id)}
                      onClick={() => setSelectedIssues(issue)}
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

        <Sheet open={Boolean(selectedIssues)} onOpenChange={(open) => !open && setSelectedIssues(null)}>
          <SheetContent className="bg-zinc-950 border-l border-zinc-800 text-zinc-100 sm:max-w-md flex flex-col justify-between">
            {selectedIssues && (
              <div className="space-y-6 pt-4">
                <SheetHeader className="text-left space-y-2">
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
                  <SheetTitle className="text-lg font-semibold text-zinc-100">
                    {selectedIssues.title}
                  </SheetTitle>
                </SheetHeader>

                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-400 truncate max-w-60">
                    git checkout -b {selectedIssues.issueKey.toLowerCase()}-
                    {selectedIssues.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-zinc-700 text-zinc-300"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(
                          `git checkout -b ${selectedIssues.issueKey.toLowerCase()}-${selectedIssues.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .slice(0, 20)}`
                        )
                        .then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        });
                    }}
                  >
                    {copied ? "copied" : "Copy"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium">Status</label>
                  <select
                    value={selectedIssues.status}
                    onChange={(e) => {
                      const updatedStatus = e.target.value;
                      setIssues((prev) =>
                        prev.map((i) => (i.id === selectedIssues.id ? { ...i, status: updatedStatus } : i))
                      );
                      setSelectedIssues({ ...selectedIssues, status: updatedStatus });
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-zinc-800">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs"
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