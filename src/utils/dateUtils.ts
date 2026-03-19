import { formatDistanceToNow, parseISO } from "date-fns";

export const formatTimestamp = (timestamp: string): string => {
  try {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  } catch {
    return "just now";
  }
};
