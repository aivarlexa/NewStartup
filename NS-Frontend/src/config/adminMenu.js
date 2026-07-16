import {
  LayoutDashboard,
  Users,
  UserCog,
  FolderKanban,
  ClipboardList,
  Bell,
  FileText,
  Settings,
  CalendarDays,
  MessageSquare,
  Receipt,
  Bot,
  Kanban,
  FolderArchive,
} from "lucide-react";

export const adminMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    title: "Clients",
    icon: Users,
    path: "/admin/clients",
  },
  {
    title: "Developers",
    icon: UserCog,
    path: "/admin/developers",
  },
  {
    title: "Projects",
    icon: FolderKanban,
    path: "/admin/projects",
  },
  {
    title: "Project Requests",
    icon: Kanban,
    path: "/admin/project-requests",
  },
  {
    title: "Teams",
    icon: Users,
    path: "/admin/teams",
  },
  {
    title: "Tasks",
    icon: ClipboardList,
    path: "/admin/tasks",
  },
  {
    title: "Calendar",
    icon: CalendarDays,
    path: "/admin/calendar",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    path: "/admin/messages",
  },
  {
    title: "Reports",
    icon: FileText,
    path: "/admin/reports",
  },
  {
    title: "Invoices",
    icon: Receipt,
    path: "/admin/invoices",
  },
  {
    title: "AI Analytics",
    icon: Bot,
    path: "/admin/ai-analytics",
  },
  {
    title: "Files",
    icon: FolderArchive,
    path: "/admin/files",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/admin/notifications",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];
