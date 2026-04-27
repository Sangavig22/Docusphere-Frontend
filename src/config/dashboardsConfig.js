// Dashboard configuration (Admin + User)

export const DASHBOARD_CONFIG = {
  admin: {
    statCards: [
      {
        title: "Total Users",
        dataKey: "totalUsers",
        growthKey: "userGrowth",
        type: "users",
      },
      {
        title: "Total Documents",
        dataKey: "totalDocuments",
        growthKey: "documentGrowth",
        type: "documents",
      },
      {
        title: "Active Session",
        dataKey: "activeSessions",
        subtitle: "Currently online",
        type: "sessions",
      },
      {
        title: "Total Teams",
        dataKey: "totalTeams",
        growthKey: "teamGrowth",
        type: "teams",
      },
    ],

    charts: [
      {
        title: "Monthly Uploads",
        description: "Document upload trends over the year",
        component: "AdminChartLine",
      },
      {
        title: "Active Team",
        description: "Daily active users this week",
        component: "AdminChartBar",
      },
    ],
  },

  user: {
    statCards: [
      {
        title: "My Documents",
        countKey: "total",
        subtitle: "Total Files",
        icon: "documents",
      },
      {
        title: "Recent",
        countKey: "recent",
        subtitle: "Last 7 days",
        icon: "clock",
      },
      {
        title: "Starred",
        countKey: "starred",
        subtitle: "Important files",
        icon: "starred",
      },
      {
        title: "Uploads",
        countKey: "uploads",
        subtitle: "+4 this week",
        icon: "upload",
      },
    ],
  },
};
