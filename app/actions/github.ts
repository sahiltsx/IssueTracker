// src/app/actions/github.ts
"use server";

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  repo_name: string;
  labels: { name: string; color: string }[];
  comments: number;
  created_at: string;
}

export async function fetchOpenSourceIssues(language: string = "typescript") {
  try {
    const query = encodeURIComponent(
      `is:issue is:open label:"good first issue" no:assignee language:${language}`
    );

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      }),
    };

    const res = await fetch(
      `https://api.github.com/search/issues?q=${query}&per_page=15&sort=created&order=desc`,
      {
        headers,
        next: { revalidate: 1800 }, // Caches for 30 minutes
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.statusText}`);
    }

    const data = await res.json();

    const issues: GitHubIssue[] = (data.items || []).map((item: any) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      html_url: item.html_url,
      repo_name: item.repository_url.replace("https://api.github.com/repos/", ""),
      labels: item.labels.map((l: any) => ({
        name: l.name,
        color: l.color,
      })),
      comments: item.comments,
      created_at: item.created_at,
    }));

    return { success: true, data: issues };
  } catch (error) {
    console.error("Failed to fetch OSS issues:", error);
    return { success: false, data: [] };
  }
}