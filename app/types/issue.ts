export type IssueStatus="TODO" | "IN_PROGRESS" | "DONE" ;
export type IssuePriority="Low" | "Medium" | "High" ;

export type Issue = {
  id: string;
  issueKey: string;
  title: string;
  description:string | null;
  priority: string;
  status: string;
  tag: string;
  assignee?: { email: string , name:string | null} | null;
};