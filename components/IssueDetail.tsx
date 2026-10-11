"use client";

import { useState } from "react";
import { Issue } from "@/app/types/issue";

type Props = {
  issue: Issue;
  onStatusChange: (status: string) => void;
  onDelete: (id: string) => void;
};

const STATUS_LABEL: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const PRIORITY_PILL: Record<string, string> = {
  Urgent: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const timeAgo = (date?: string | Date | null) => {
  if (!date) return "just now";
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-zinc-500">{label}</p>
      <div className="font-medium text-zinc-200">{children}</div>
    </div>
  );
}

export default function IssueDetail({ issue, onStatusChange, onDelete }: Props) {
  const [copied, setCopied] = useState(false);

  const assignee = issue.assignee as any;
  const createdAt = (issue as any).createdAt;
  const assigneeName =
    assignee?.name || assignee?.email?.split("@")[0] || "Unassigned";
  const isOpen = issue.status !== "DONE";

  const branch = `${issue.issueKey.toLowerCase()}-${issue.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 15)}`;

  const copyBranch = () => {
    navigator.clipboard.writeText(`git checkout -b ${branch}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="space-y-6 pt-10 pb-8">
      <div>
        <h2 className="pr-8 text-xl font-semibold leading-snug text-zinc-100">
          {issue.title}{" "}
          <span className="font-light text-zinc-500">#{issue.issueKey}</span>
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 font-medium text-white ${
              isOpen ? "bg-emerald-600" : "bg-violet-600"
            }`}
          >
            {isOpen ? "Open" : "Closed"}
          </span>
          <span>
            <span className="font-medium text-zinc-200">{assigneeName}</span> opened this issue{" "}
            {timeAgo(createdAt)}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-400">
          <span>
            <span className="font-semibold text-zinc-200">{assigneeName}</span> commented{" "}
            {timeAgo(createdAt)}
          </span>
          <span className="rounded border border-zinc-700 px-2 py-0.5">Author</span>
        </div>
        <div className="min-h-24 whitespace-pre-wrap bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-300">
          {issue.discription || (
            <span className="italic text-zinc-500">No description provided.</span>
          )}
        </div>
      </div>

      
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs">
        <Field label="Assignee">{assigneeName}</Field>
        <Field label="Priority">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${
              PRIORITY_PILL[issue.priority] ?? "border-zinc-500/20 text-zinc-300"
            }`}
          >
            {issue.priority}
          </span>
        </Field>
        <Field label="Label">
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-zinc-300">
            {issue.tag}
          </span>
        </Field>
        <Field label="Created">
          {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
        </Field>
        <Field label="Source">
          {issue.tag === "open-source" ? "GitHub OSS Hub" : "Internal Board"}
        </Field>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-400">Status</p>
        <div className="grid grid-cols-3 gap-2">
          {(["TODO", "IN_PROGRESS", "DONE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`rounded-md border px-2 py-1.5 text-xs transition ${
                issue.status === s
                  ? "border-blue-500 bg-blue-500/10 text-blue-300"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-400">Create a branch</p>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
          <code className="truncate font-mono text-[11px] text-zinc-400">
            git checkout -b {branch}
          </code>
          <button
            onClick={copyBranch}
            className="shrink-0 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="border-t border-zinc-900 pt-4">
        <button
          onClick={() => onDelete(issue.id)}
          className="w-full rounded-md bg-rose-600 py-2 text-xs font-medium text-white hover:bg-rose-500"
        >
          Delete Issue
        </button>
      </div>
    </div>
  );
}