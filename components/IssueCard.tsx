"use client";

import { Issue } from "@/app/types/issue";
import { getPriorityColor } from "@/lib/issueHelper";

type IssueCardProps = {
  issue: Issue;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
};

export default function IssueCard({ issue, onClick, onDragStart }: IssueCardProps) {
  const assigneeName =
    (issue.assignee as any)?.name ||
    issue.assignee?.email?.split("@")[0] ||
    "Unassigned";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-sm transition hover:border-zinc-600 hover:bg-zinc-800/60 active:cursor-grabbing"
    >
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-mono text-zinc-400">#{issue.issueKey}</span>
        <span className={`text-[11px] font-medium ${getPriorityColor(issue.priority)}`}>
          {issue.priority}
        </span>
      </div>

      <p className="mb-3 text-sm font-medium leading-snug text-zinc-200">
        {issue.title}
      </p>

      <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[10px]">
        <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-zinc-400">
          {issue.tag}
        </span>
        <span className="text-zinc-500">{assigneeName}</span>
      </div>
    </div>
  );
}