const en = {
  dashboard: {
    welcome: "Welcome back",
    subtitle: "What would you like to work on today?",
  },
  features: {
    ideas: {
      title: "My Ideas",
      description:
        "All your saved business ideas, roadmaps, tasks, and validation reports in one place.",
    },
    aiChat: {
      title: "AI Chat",
      description:
        "Start a conversation with the AI to generate, refine, and validate new business ideas.",
    },
    team: {
      title: "Team",
      description:
        "Manage your team: invite members, assign roles, and view team activity.",
    },
    marketplace: {
      title: "Marketplace",
      description:
        "Browse and connect with external partners: suppliers, mentors, and manufacturers.",
    },
  },
  activity: {
    title: "Recent Activity",
    viewAll: "View all",
    headers: {
      activity: "Activity",
      module: "Module",
    },
    modules: {
      ideas: "Ideas",
      aiChat: "AI Chat",
      team: "Team",
    },
  },
  aiSearch: {
    placeholder:
      "Ask Bizify anything — validate an idea, find a supplier, draft a pitch…",
    askAI: "Ask AI",
    tryLabel: "Try:",
    suggestions: [
      "Analyze my target market",
      "Draft a pitch deck outline",
      "Suggest validation experiments",
    ],
  },
  nav: {
    logout: "Log out",
    profile: "Profile",
    settings: "Settings",
    lightMode: "Light mode",
    darkMode: "Dark mode",
    search: "Search",
    notifications: "Notifications",
    logoutConfirmTitle: "Log out?",
    logoutConfirmMessage: "Are you sure you want to log out of your account?",
    logoutConfirmButton: "Log out",
    cancel: "Cancel",
  },
};

export type Translations = typeof en;
export default en;
