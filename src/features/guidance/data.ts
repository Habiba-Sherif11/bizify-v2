// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpotlightStep {
  id: string;
  target: string | null; // data-tour attribute value; null = centered modal
  stage: string;
  title: string;
  description: string;
  helpText: string;
}

// ─── Steps ────────────────────────────────────────────────────────────────────

export const SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    id: "welcome",
    target: null,
    stage: "Getting Started",
    title: "Welcome to Bizify! 🎉",
    description:
      "Bizify is your AI-powered startup co-founder. We guide you from idea to launch — covering validation, team building, supplier sourcing, and mentorship all in one platform.",
    helpText:
      "This quick tour will walk you through the key features. You can skip it anytime and reopen it with the guide button.",
  },
  {
    id: "ai-search",
    target: "ai-search",
    stage: "Getting Started",
    title: "AI-Powered Assistant",
    description:
      "Ask Bizify anything — validate an idea, analyze a market, draft a pitch deck, or find a supplier. The AI understands startup context and gives actionable answers.",
    helpText:
      'Just type your question naturally. Try: "Is there a market for sustainable packaging?"',
  },
  {
    id: "feature-cards",
    target: "feature-cards",
    stage: "Exploring Modules",
    title: "Your Main Modules",
    description:
      "These four cards are the core of Bizify. Ideas for capturing and validating concepts, AI Chat for deep conversations, Team for managing your co-founders, and Marketplace to find partners.",
    helpText: "Click any card to jump straight into that module.",
  },
  {
    id: "recent-activity",
    target: "recent-activity",
    stage: "Staying Informed",
    title: "Recent Activity",
    description:
      "Your activity feed shows everything happening across your startup in real time — idea updates, team changes, AI sessions, and more.",
    helpText: "Use this to quickly catch up after time away from the platform.",
  },
];

export const TOTAL_STEPS = SPOTLIGHT_STEPS.length;
