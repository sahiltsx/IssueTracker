export const getPriorityColor = (priority: string) => {
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