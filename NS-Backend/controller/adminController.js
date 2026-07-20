const User = require("../models/user");
const Requirement = require("../models/Requirement");

const getDashboard = async (req, res) => {
  try {

    const totalClients = await User.countDocuments({
      role: "Client",
    });

    const totalDevelopers = await User.countDocuments({
      role: "Developer",
    });

    const totalProjects = await Requirement.countDocuments();

    const activeProjects = await Requirement.countDocuments({
      status: { $in: ["Open", "Assigned"] },
    });

    const completedProjects = await Requirement.countDocuments({
      status: "Completed",
    });

    const recentClients = await User.find({
      role: "Client",
    })
      .select("name email companyName avatar createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

  const recentProjects = await Requirement.find()
  .select("projectTitle progress status")
  .sort({ createdAt: -1 })
  .limit(4);

res.status(200).json({
  success: true,
  stats: {
    totalClients,
    totalDevelopers,
    totalProjects,
    activeProjects,
    completedProjects,
  },
  recentClients,
  recentProjects,
});

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  getDashboard,
};
