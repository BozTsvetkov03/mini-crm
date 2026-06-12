import { Users, CalendarDays, Clock, CheckCircle2 } from "lucide-react";

// Single source of truth for workspace modules. Future modules (Expenses,
// Notes, Focus…) and the artsy redesign's custom SVGs only touch this list —
// each entry's `icon` is any React component taking a `size` prop.
export const WORKSPACE_NAV = [
  { to: "/app", label: "CRM", icon: Users },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/tasks/due", label: "Due tasks", icon: Clock },
  { to: "/tasks/completed", label: "Completed", icon: CheckCircle2 },
];
