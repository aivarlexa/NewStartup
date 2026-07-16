const activities = [
  "New client registered",
  "Project AI Assistant created",
  "Developer assigned to Project",
  "Requirement document uploaded",
];

const RecentActivities = () => {
  return (
    <div className="admin-widget-card">

      <h2>
        Recent Activities
      </h2>

      <div className="admin-activity-list">

        {activities.map((item, index) => (
          <div
            key={index}
            className="admin-activity-item"
          >
            <div></div>

            <p>
              {item}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
};

export default RecentActivities;
