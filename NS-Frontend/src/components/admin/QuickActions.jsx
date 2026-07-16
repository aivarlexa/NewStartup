import { Plus, Users, FolderKanban } from "lucide-react";

const actions = [
  {
    title: "Add Client",
    icon: Users,
  },
  {
    title: "Create Project",
    icon: FolderKanban,
  },
  {
    title: "Add Developer",
    icon: Plus,
  },
];

const QuickActions = () => {
  return (
    <div className="admin-widget-card">

      <h2>
        Quick Actions
      </h2>

      <div className="admin-quick-grid">

        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className="admin-quick-action"
            >
              <Icon />

              {item.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
