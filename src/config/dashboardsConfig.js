// Dashboard configuration (Admin + User)

export const DASHBOARD_CONFIG = {
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