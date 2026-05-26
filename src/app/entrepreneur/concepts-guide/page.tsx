"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is TAM, SAM, and SOM?",
    a: "TAM (Total Addressable Market) is the total demand for your product if you served every possible customer worldwide. SAM (Serviceable Addressable Market) is the portion you can realistically reach given your product's scope and geography. SOM (Serviceable Obtainable Market) is what you can actually capture in the next 3–5 years. Think of them as three nested circles — TAM is the biggest, SOM is the smallest and most realistic.",
  },
  {
    q: "What is PESTEL Analysis?",
    a: "PESTEL stands for Political, Economic, Social, Technological, Environmental, and Legal. It's a scan of the external forces that could affect your business. For example, a new law (Legal) might open a market for you, or an economic downturn (Economic) might reduce customer spending. It helps you spot tailwinds to ride and risks to plan around.",
  },
  {
    q: "What is Porter's Five Forces?",
    a: "Porter's Five Forces is a framework for understanding how competitive and profitable an industry is. The five forces are: (1) Threat of new entrants — how easy is it for new competitors to enter? (2) Supplier power — can suppliers dictate terms to you? (3) Buyer power — can customers force prices down? (4) Threat of substitutes — could customers switch to a different type of solution? (5) Competitive rivalry — how intense is competition between existing players? The more powerful these forces, the harder it is to make money in that industry.",
  },
  {
    q: "What is VRIO Analysis?",
    a: "VRIO helps you assess whether a competitive advantage is sustainable. It asks four questions about a resource or capability: Is it Valuable (does it help you compete)? Is it Rare (do few competitors have it)? Is it Inimitable (is it hard to copy)? Is your business Organised to exploit it? Only advantages that pass all four tests create a lasting competitive moat.",
  },
  {
    q: "What is the Business Model Canvas?",
    a: "The Business Model Canvas (BMC) is a one-page template that maps out how your business creates and captures value. It has nine blocks: Customer Segments, Value Propositions, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partnerships, and Cost Structure. It's designed to give you a full picture of your business at a glance and spot any gaps or contradictions.",
  },
  {
    q: "What is LTV (Customer Lifetime Value)?",
    a: "LTV is the total revenue you expect to earn from a single customer over the entire time they use your product. For example, if a customer pays $50/month and stays for 18 months on average, their LTV is $900. LTV tells you the upper limit of how much you can spend to acquire a customer and still be profitable.",
  },
  {
    q: "What is CAC (Customer Acquisition Cost)?",
    a: "CAC is the total cost to acquire one new paying customer — including marketing spend, sales effort, and tooling. If you spend $5,000/month on marketing and sales and get 20 new customers, your CAC is $250. Knowing your CAC tells you whether your growth is actually creating value or burning money.",
  },
  {
    q: "What is the LTV:CAC ratio?",
    a: "The LTV:CAC ratio compares how much a customer is worth to how much it costs to acquire them. A ratio of 3:1 or higher is considered healthy — meaning each customer brings in 3× what it cost to win them. Below 1:1 means you're losing money on every customer. It's one of the most important signals of whether a business model is fundamentally sound.",
  },
  {
    q: "What is Break-Even Analysis?",
    a: "Break-even is the point where your total revenue equals your total costs — the moment you stop losing money. Break-even analysis tells you how many customers you need and how long it will take before the business becomes self-sustaining. It's essential for understanding how much funding or runway you need.",
  },
  {
    q: "What is an MVP (Minimum Viable Product)?",
    a: "An MVP is the simplest version of your product that you can build to test your core idea with real users. The goal is not to build something polished — it's to validate your riskiest assumptions as quickly and cheaply as possible before investing heavily. A good MVP is deliberately small; if you're not a little uncomfortable with how basic it is, you've probably built too much.",
  },
  {
    q: "What are Riskiest Assumptions and Kill Signals?",
    a: "Riskiest assumptions are the beliefs your business depends on that are most likely to be wrong — the ones that, if false, would invalidate your idea. A kill signal is a specific, measurable result that tells you an assumption has failed. For example: 'If fewer than 5% of landing-page visitors sign up, the problem isn't painful enough.' Pre-defining kill signals removes emotion from the decision to pivot or stop.",
  },
  {
    q: "What is a Customer Journey Map?",
    a: "A customer journey map traces every step a customer takes from first hearing about you to becoming a loyal advocate. The five stages are: Awareness → Consideration → Conversion → Onboarding → Advocacy. It reveals where friction and drop-off happen so you can fix the weakest parts of the experience.",
  },
  {
    q: "What is Go-to-Market (GTM) Strategy?",
    a: "A go-to-market strategy is your plan for getting your product in front of customers and generating your first revenue. It answers: Who do we sell to first? Through what channel? With what message? A strong GTM picks one specific customer type and one specific channel rather than trying to reach everyone at once.",
  },
  {
    q: "What is a Competitive Moat?",
    a: "A moat is a durable advantage that makes it hard for competitors to copy your success. Common moats include network effects (the product gets better as more people use it), switching costs (customers lose data or workflow if they leave), proprietary data, and brand. Without a moat, a well-funded rival can eventually outcompete you by simply spending more.",
  },
  {
    q: "What is Product-Market Fit (PMF)?",
    a: "Product-market fit is the point where your product satisfies a strong, real market demand. Signs of PMF include high retention, customers who would be 'very disappointed' if the product disappeared, and organic word-of-mouth growth. Before PMF, everything should be focused on finding it. After PMF, you scale.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700 last:border-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer"
      >
        <span className={cn("text-sm font-medium leading-snug", open ? "text-amber-600 dark:text-amber-400" : "text-neutral-900 dark:text-white")}>
          {q}
        </span>
        {open
          ? <ChevronUp size={16} className="shrink-0 text-neutral-400" />
          : <ChevronDown size={16} className="shrink-0 text-neutral-400" />
        }
      </button>
      {open && (
        <p className="pb-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export default function ConceptsGuidePage() {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Plain-language explanations of every business concept in your AI analysis.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 px-6">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
