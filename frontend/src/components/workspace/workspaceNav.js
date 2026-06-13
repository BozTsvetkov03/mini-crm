import { Users, CalendarDays, Timer, NotebookText, Clock, CheckCircle2 } from "lucide-react";

// Single source of truth for workspace modules. Future modules (Expenses,
// Notes…) and the artsy redesign's custom SVGs only touch this list — each
// entry's `icon` is any React component taking a `size` prop.
//
// `mobilePrimary` items get a slot in the mobile bottom bar; the rest live
// in the "More" sheet so the bar never gets crowded. The desktop rail
// always shows everything.
export const WORKSPACE_NAV = [
  { to: "/app", label: "CRM", icon: Users, mobilePrimary: true },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, mobilePrimary: true },
  { to: "/focus", label: "Focus", icon: Timer, mobilePrimary: true },
  { to: "/notebook", label: "Notebook", icon: NotebookText, mobilePrimary: true },
  { to: "/tasks/due", label: "Due tasks", icon: Clock },
  { to: "/tasks/completed", label: "Completed", icon: CheckCircle2 },
];
