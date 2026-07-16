const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}) => {
  return (
    <div className="admin-widget-card admin-widget-stat">

      <div>

        <div>

          <p>
            {title}
          </p>

          <h2>
            {value}
          </h2>

        </div>

        <div
          className="admin-widget-icon"
          style={{ background: color }}
        >
          <Icon size={26} />
        </div>

      </div>

    </div>
  );
};

export default StatCard;
