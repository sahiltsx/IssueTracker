// src/components/OpenSourceCard.tsx
import { Button } from "@/components/ui/button";

export function OpenSourceCard({
  issue,
  onImport,
}: {
  issue: any;
  onImport: (issue: any) => void;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
          <span className="truncate max-w-50 text-zinc-300 font-medium">
            {issue.repo_name}
          </span>
          <span className="text-zinc-500">#{issue.number}</span>
        </div>
        <h4 className="text-sm font-medium text-zinc-100 mb-3 line-clamp-2 leading-snug">
          {issue.title}
        </h4>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {issue.labels.slice(0, 3).map((label: any) => (
            <span
              key={label.name}
              className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400"
            >
              {label.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80">
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-8 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            GitHub ↗
          </Button>
        </a>

        <Button
          size="sm"
          onClick={() => onImport(issue)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8 px-3"
        >
          Track +
        </Button>
      </div>
    </div>
  );
}