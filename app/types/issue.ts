export type IssueStatus="TODO" | "IN_PROGRESS" | "DONE" ;
export type IssuePriority="Low" | "Medium" | "High" ;

export type Issue = {
  id: string;
  issueKey: string;
  title: string;
  priority: string;
  status: string;
  tag: string;
  assignee?: { name: string } | null;
};