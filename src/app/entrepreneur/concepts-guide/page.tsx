"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Search,
  Users,
  BarChart2,
  Shield,
  Compass,
  Layers,
  Rocket,
  DollarSign,
  Megaphone,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PlatformTab =
  | "Problems"
  | "Customers"
  | "Market"
  | "Competitor Analysis"
  | "Strategy"
  | "Business Model"
  | "MVP"
  | "Financial"
  | "Go-to-Market";

const TAB_BADGE: Record<PlatformTab, { label: string; bg: string }> = {
  Problems: {
    label: "Problems",
    bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  Customers: {
    label: "Customers",
    bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  Market: {
    label: "Market",
    bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  "Competitor Analysis": {
    label: "Competitor Analysis",
    bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  Strategy: {
    label: "Strategy",
    bg: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  "Business Model": {
    label: "Business Model",
    bg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  MVP: {
    label: "MVP",
    bg: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  },
  Financial: {
    label: "Financial",
    bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  "Go-to-Market": {
    label: "Go-to-Market",
    bg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
};

interface Concept {
  q: string;
  a: string;
  platformTab?: PlatformTab;
}

interface Phase {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  headerBg: string;
  concepts: Concept[];
}

const PHASES: Phase[] = [
  {
    id: 1,
    title: "The Foundation",
    subtitle: "What a business is and how to think like an entrepreneur",
    icon: Lightbulb,
    accentColor: "text-amber-600 dark:text-amber-400",
    headerBg:
      "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40",
    concepts: [
      {
        q: "What is a Business?",
        a: "A business is an organization that creates value for a specific group of people (customers) and captures a portion of that value in return (revenue). Every business answers three fundamental questions: Who has a problem worth solving? What solution can we offer? How do we make money doing it? A business is not just an idea — it's a repeatable, scalable system for creating and delivering that value. An idea becomes a business only when someone pays for it.",
      },
      {
        q: "What is an Entrepreneur?",
        a: "An entrepreneur is someone who identifies a problem, builds a solution, and takes on the financial and personal risk of turning it into a sustainable business. The key word is risk — entrepreneurs invest time, money, and reputation before they know if it will work. Great entrepreneurs are not reckless risk-takers; they're systematic risk-reducers, constantly testing assumptions and learning before making big bets. The goal is to reduce uncertainty, not to embrace it.",
      },
      {
        q: "What is a Business Idea vs. a Business Opportunity?",
        a: "A business idea is a concept you find interesting. A business opportunity is an idea backed by evidence: a real, painful problem that a specific group of people urgently wants solved, a solution that's technically feasible, and a credible path to profitability. Most ideas never become opportunities because they lack one of these pillars. Your job in the early stage is to turn an idea into a verified opportunity — through research, interviews, and testing — before investing heavily.",
      },
      {
        q: "What is Problem-Solution Fit?",
        a: "Problem-solution fit is the stage where you've confirmed: (1) a real, painful problem exists, (2) a specific group of people actively wants it solved, and (3) your proposed solution actually addresses it better than existing alternatives. It must be established before building anything — before writing code, hiring, or spending. Without problem-solution fit, you risk building a technically impressive product that nobody wants. Bizify's Problems tab helps you define and validate this fit.",
        platformTab: "Problems",
      },
    ],
  },
  {
    id: 2,
    title: "Discovering the Problem",
    subtitle: "Confirming the problem is real, painful, and worth building around",
    icon: Search,
    accentColor: "text-red-600 dark:text-red-400",
    headerBg:
      "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40",
    concepts: [
      {
        q: "What is Problem Validation?",
        a: "Problem validation is the process of confirming — through real evidence, not assumptions — that a specific group of people experience a problem that's painful enough to pay to solve. You validate a problem through customer interviews, surveys, behavioral data, and willingness-to-pay signals. A validated problem is the most important asset a startup can have; you can iterate on your solution, pivot your model, and change your team, but you can't fix a business that solved the wrong problem.",
        platformTab: "Problems",
      },
      {
        q: "What is a Problem Statement?",
        a: "A problem statement precisely describes who experiences the problem, what the problem is, and why existing solutions are inadequate. A strong problem statement is specific and falsifiable — you should be able to run a test that proves it wrong. Weak: 'People want better productivity tools.' Strong: 'Freelance designers spend 6+ hours per week chasing late invoice payments because their invoicing software doesn't automate follow-ups.' Specificity is what makes a problem statement actionable.",
        platformTab: "Problems",
      },
      {
        q: "What are Customer Pain Points?",
        a: "Pain points are the specific frustrations, inefficiencies, or unmet needs your target customers experience. They fall into four categories: (1) Functional — a task is slow, broken, or hard to complete. (2) Financial — it costs too much or the ROI is unclear. (3) Social — it affects how they appear to peers or stakeholders. (4) Emotional — it causes stress, anxiety, or frustration. The most valuable businesses address pain points that are both intense (very painful) and widespread (many people experience them simultaneously).",
        platformTab: "Problems",
      },
      {
        q: "What is a Job-to-be-Done (JTBD)?",
        a: "The Jobs-to-be-Done framework says that customers don't buy products — they 'hire' them to make progress toward a goal. The 'job' is the progress they're trying to make in their life or work. For example, people don't hire a drill because they want a drill — they hire it because they want a hole in the wall; they want to hang a picture; they want their home to feel like theirs. Understanding the underlying job reveals what customers actually value, why they switch solutions, and how to position your product compellingly.",
        platformTab: "Problems",
      },
    ],
  },
  {
    id: 3,
    title: "Understanding Your Customer",
    subtitle: "Deeply knowing who you're building for and how they experience the world",
    icon: Users,
    accentColor: "text-blue-600 dark:text-blue-400",
    headerBg:
      "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40",
    concepts: [
      {
        q: "What is a Target Market?",
        a: "Your target market is the specific group of people most likely to buy your product — defined by shared characteristics such as demographics, industry, behaviors, or situations. A common mistake is defining the target market too broadly ('everyone who uses a smartphone') to avoid limiting potential. In reality, a sharply defined target market leads to better product decisions, far cheaper customer acquisition, and stronger organic word-of-mouth within that group. You can always expand later; you can't rebuild trust with an audience you alienated.",
        platformTab: "Customers",
      },
      {
        q: "What is a Customer Segment?",
        a: "A customer segment is a distinct group within your broader market that shares the same problem, values, and buying behavior. Different segments may use the same product for completely different reasons and require different messaging, pricing, or features. Slack's customer segments include small startups (want simplicity and a free tier) and enterprise companies (want security, SSO, and compliance controls). Identifying your initial segment helps you prioritize who to serve first, delight deeply, and use as a reference for expanding to adjacent segments.",
        platformTab: "Customers",
      },
      {
        q: "What is a Buyer Persona?",
        a: "A buyer persona is a semi-fictional profile of your ideal customer, built from real research. It captures who they are (role, age, industry, goals), what a typical day looks like, what frustrates them about existing solutions, and how they make purchase decisions. Personas help your entire team make consistent decisions: 'Would Sarah — our primary persona — find this feature valuable?' They work best when grounded in actual customer interviews rather than internal guesses about what users want.",
        platformTab: "Customers",
      },
      {
        q: "What is Customer Discovery?",
        a: "Customer discovery is the structured process of talking to potential customers before building your product — to understand their problems, behaviors, and context. The goal is NOT to validate your solution idea; it's to understand the world from their perspective. The most effective discovery interviews ask open-ended questions about past behavior ('Tell me about the last time you experienced this problem...') rather than hypothetical futures ('Would you use a product that does X?'). People are unreliable predictors of their future behavior but reliable reporters of their past.",
        platformTab: "Customers",
      },
      {
        q: "What is a Customer Journey Map?",
        a: "A customer journey map traces every step a customer takes from first becoming aware of a problem to becoming a loyal advocate for your solution. The five key stages are: Awareness (they realize they have a problem) → Consideration (they evaluate options) → Conversion (they choose your solution) → Onboarding (they start using it and form habits) → Advocacy (they recommend it unprompted). It reveals friction points, drop-off moments, and the highest-leverage opportunities to improve the overall experience.",
        platformTab: "Customers",
      },
    ],
  },
  {
    id: 4,
    title: "Sizing the Market",
    subtitle: "Quantifying the opportunity and understanding the forces shaping your industry",
    icon: BarChart2,
    accentColor: "text-green-600 dark:text-green-400",
    headerBg:
      "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/40",
    concepts: [
      {
        q: "What is Market Sizing?",
        a: "Market sizing is the process of estimating how large your potential revenue opportunity is. It tells investors — and yourself — whether the market is worth pursuing at scale. Two approaches exist: (1) Top-down — start from a published total industry size, then narrow down to your reachable segment using logical assumptions. (2) Bottom-up — estimate the number of customers you could realistically reach and multiply by average revenue per customer. Bottom-up is more credible in practice because it's grounded in actual customer counts rather than broad industry statistics.",
        platformTab: "Market",
      },
      {
        q: "What is TAM, SAM, and SOM?",
        a: "TAM (Total Addressable Market) is the total global demand for your product category — as if you served every possible customer worldwide. SAM (Serviceable Addressable Market) is the portion you can realistically reach given your product's scope, geography, language, and go-to-market strategy. SOM (Serviceable Obtainable Market) is what you can realistically capture in the next 3–5 years given your resources, team, and competition. Think of them as three nested circles — TAM is the biggest, SOM is the smallest and most honest target for near-term planning.",
        platformTab: "Market",
      },
      {
        q: "What is PESTEL Analysis?",
        a: "PESTEL scans the macro-environmental forces that could help or hurt your business: Political (regulations, trade policy, government stability), Economic (interest rates, inflation, consumer spending power), Social (demographic shifts, cultural trends, changing attitudes), Technological (new platforms, automation, digital adoption curves), Environmental (climate regulations, sustainability expectations, resource costs), and Legal (employment law, intellectual property, data privacy). It helps you spot macro tailwinds to ride and systemic risks to plan around before they materialize.",
        platformTab: "Market",
      },
      {
        q: "What are Market Trends?",
        a: "Market trends are directional shifts in customer behavior, technology, regulation, or demographics that are changing how an industry operates. Riding a confirmed tailwind — like the shift to remote work, mobile-first design, or AI adoption — can make growth dramatically easier. Fighting a headwind, like declining industry relevance or regulatory crackdown, can doom an otherwise well-built business. The ideal trend to bet on is early enough to still be a first-mover advantage but confirmed enough that you're not just speculating.",
        platformTab: "Market",
      },
    ],
  },
  {
    id: 5,
    title: "Competitive Landscape",
    subtitle: "Understanding who you're up against and how to build a durable advantage",
    icon: Shield,
    accentColor: "text-orange-600 dark:text-orange-400",
    headerBg:
      "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/40",
    concepts: [
      {
        q: "What is Competitive Analysis?",
        a: "Competitive analysis is the systematic study of your competitors — direct (solving the same problem the same way), indirect (solving the same problem differently), and substitutes (customers doing nothing or using a manual workaround). It reveals: what solutions already exist, why they're inadequate for specific segments, and where a genuine gap can be filled. The goal is not to copy competitors but to understand the landscape well enough to position your product so distinctly that comparison becomes difficult.",
        platformTab: "Competitor Analysis",
      },
      {
        q: "What is Porter's Five Forces?",
        a: "Porter's Five Forces is a framework for assessing how structurally profitable an industry is. The five forces are: (1) Threat of new entrants — how easily can newcomers compete? (low barriers = worse for you) (2) Supplier power — can suppliers raise costs or limit access? (3) Buyer power — can customers demand lower prices or switch easily? (4) Threat of substitutes — could customers abandon the entire product category? (5) Competitive rivalry — how intensely do existing players fight? The more powerful each force is, the harder sustained profitability becomes in that industry.",
        platformTab: "Competitor Analysis",
      },
      {
        q: "What is VRIO Analysis?",
        a: "VRIO is a framework for assessing whether a resource or capability gives you a sustainable competitive advantage. It asks four questions about each resource: Is it Valuable (does it help you serve customers or reduce costs)? Is it Rare (do few or no competitors possess it)? Is it Inimitable (is it costly or difficult to replicate)? Is your business Organised to exploit it (do your structure and processes support it)? Only resources that pass all four tests create a lasting advantage. Resources that are valuable but common provide only temporary parity.",
        platformTab: "Competitor Analysis",
      },
      {
        q: "What is a Competitive Moat?",
        a: "A moat is a durable structural advantage that protects your business's profitability from competition over time. The four most powerful moats are: (1) Network effects — the product becomes more valuable as more people use it (e.g., Slack, Airbnb, WhatsApp). (2) Switching costs — customers lose data, workflows, or trained integrations if they leave (e.g., Salesforce, Figma). (3) Proprietary data or technology — what you've built is not easily reproducible. (4) Brand trust — customers default to you before evaluating alternatives. Without a moat, any margin you create will eventually be competed away.",
        platformTab: "Competitor Analysis",
      },
    ],
  },
  {
    id: 6,
    title: "Strategy & Positioning",
    subtitle: "Defining how you compete and why customers should choose you over every alternative",
    icon: Compass,
    accentColor: "text-purple-600 dark:text-purple-400",
    headerBg:
      "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/40",
    concepts: [
      {
        q: "What is a Value Proposition?",
        a: "A value proposition is a clear statement of the specific benefit your product delivers to a specific customer — and why it's better than the alternatives. A strong value proposition answers: What do we do? For whom specifically? What concrete outcome do we deliver? Why are we different? It's not a tagline or a mission statement — it's the core commercial logic. If a customer can't articulate why they chose you over alternatives in one or two sentences, you don't have a value proposition yet.",
        platformTab: "Strategy",
      },
      {
        q: "What is Strategic Positioning?",
        a: "Strategic positioning is the deliberate choice to serve a specific segment, with a specific value proposition, in a way that requires trade-offs competitors are unwilling to make. You cannot be everything to everyone — attempting to is the most common strategic failure. The best positions align your genuine strengths with what a specific segment values most, and are defensible because competitors would have to cannibalize their own business model to copy you. Strategy is as much about what you choose NOT to do as what you do.",
        platformTab: "Strategy",
      },
      {
        q: "What is a Unique Selling Proposition (USP)?",
        a: "Your Unique Selling Proposition is the single, most compelling reason your target customer should choose you over every alternative. It is not a list of features — it's one memorable, distinct advantage. 'We're faster,' 'We're cheaper,' and 'We're easier to use' are weak USPs because competitors can match them over time. Strong USPs are rooted in structural advantages: proprietary technology, unique data access, a fundamentally different business model, or a specific focus that large generalist competitors cannot match without major strategic shifts.",
        platformTab: "Strategy",
      },
      {
        q: "What is Blue Ocean Strategy?",
        a: "Blue Ocean Strategy is the idea of creating an entirely new market space rather than competing in an existing overcrowded one (a 'red ocean'). Instead of fighting over existing demand, you redefine the competitive playing field so that current competitors become irrelevant. It uses a Four Actions Framework: Eliminate (what factors can we remove that the industry takes for granted?), Reduce (what can we cut below industry standard?), Raise (what can we elevate well above industry standard?), Create (what factors can we add that no one in the industry has ever offered?). Cirque du Soleil is the canonical example.",
        platformTab: "Strategy",
      },
    ],
  },
  {
    id: 7,
    title: "Business Model",
    subtitle: "Designing how your business creates, delivers, and captures value sustainably",
    icon: Layers,
    accentColor: "text-indigo-600 dark:text-indigo-400",
    headerBg:
      "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40",
    concepts: [
      {
        q: "What is a Business Model?",
        a: "A business model describes how your organization creates value, delivers it to customers, and earns money in return. It encompasses who your customers are, what you're selling, how you reach them, how you charge, and what it costs to operate. Two companies can solve the same problem with completely different business models — for example, one sells perpetual software licenses while another charges a monthly subscription — and the model chosen dramatically affects cash flow, growth rate, and defensibility.",
        platformTab: "Business Model",
      },
      {
        q: "What is the Business Model Canvas (BMC)?",
        a: "The Business Model Canvas is a one-page visual template that maps all nine components of a business on a single sheet: (1) Customer Segments, (2) Value Propositions, (3) Channels (how you reach customers), (4) Customer Relationships, (5) Revenue Streams, (6) Key Resources (what you must have to operate), (7) Key Activities (what you must do every day), (8) Key Partnerships, and (9) Cost Structure. Its purpose is to let you see your entire business logic at once and immediately spot contradictions or missing links between the blocks.",
        platformTab: "Business Model",
      },
      {
        q: "What are Revenue Models?",
        a: "A revenue model is the specific mechanism by which your business earns money. Common models include: Subscription (recurring monthly or annual fee — predictable and scalable), Transaction (fee per completed sale or booking — aligns incentives with customer success), Freemium (free core tier + paid upgrades — lowers adoption barrier), Marketplace (percentage of each transaction between buyers and sellers — requires both sides), Advertising (charge advertisers to reach your audience — requires scale), and Licensing (charge others to use your IP or technology). The right model depends on your customer's buying behavior, your sales cycle, and your scalability goals.",
        platformTab: "Business Model",
      },
      {
        q: "What is a Pricing Strategy?",
        a: "Pricing strategy determines what you charge and why. The three main philosophies are: (1) Cost-plus — add a fixed margin to your cost of delivery. Simple, but ignores how much value the customer actually receives. (2) Competitive pricing — match or undercut competitors. Dangerous because it commoditizes your offering and is a race to the bottom. (3) Value-based pricing — charge based on the economic value you create for the customer. This is the most profitable approach because it captures a fair share of the value you generate. Pricing is also a positioning signal: charging too little can signal low quality to the very customers you want.",
        platformTab: "Business Model",
      },
    ],
  },
  {
    id: 8,
    title: "Building Your MVP",
    subtitle: "Testing your riskiest assumptions as quickly and cheaply as possible",
    icon: Rocket,
    accentColor: "text-teal-600 dark:text-teal-400",
    headerBg:
      "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/40",
    concepts: [
      {
        q: "What is an MVP (Minimum Viable Product)?",
        a: "An MVP is the smallest version of your product that lets you test your most critical hypothesis with real users. The goal is not to build something polished — it's to learn as fast as possible at minimum cost. A good MVP is deliberately limited: one core use case, one customer segment, minimal features. If you're not at least a little uncomfortable with how basic it is, you've probably built too much. An MVP that takes 6 months to ship isn't minimum — it's just a slow product launch.",
        platformTab: "MVP",
      },
      {
        q: "What are Riskiest Assumptions and Kill Signals?",
        a: "Riskiest assumptions are the beliefs your business depends on that are most likely to be wrong — the ones that, if false, would invalidate the entire idea. Kill signals are pre-defined, measurable thresholds that tell you an assumption has failed. For example: 'If fewer than 5% of landing page visitors complete a sign-up, the problem isn't painful enough.' Pre-defining kill signals before testing removes emotion from the pivot-or-stop decision. Without them, founders unconsciously move the goalposts when results disappoint.",
        platformTab: "MVP",
      },
      {
        q: "What is the Lean Startup methodology?",
        a: "The Lean Startup applies scientific thinking to building businesses. Its core loop is Build → Measure → Learn: build the smallest possible experiment, measure what actually happens (not what you hoped), and use the learning to decide whether to persevere or pivot. The key insight is that most startup failures are caused by executing on untested assumptions — building something no one wants — not by technical failure. The methodology demands intellectual honesty: you must define success metrics before running experiments, not after seeing the results.",
      },
      {
        q: "What is Rapid Prototyping?",
        a: "Rapid prototyping is creating a quick, low-fidelity version of a product concept to test ideas with users before investing in development. A prototype can be as simple as a clickable mockup in Figma, a paper sketch, a Wizard-of-Oz service (humans simulating automation behind the scenes), or a landing page with a waitlist form. The value is getting real feedback early — when changes cost hours, not months. The speed of iteration in the prototype phase is one of the biggest levers founders have over their outcome.",
        platformTab: "MVP",
      },
    ],
  },
  {
    id: 9,
    title: "Financial Fundamentals",
    subtitle: "The numbers that determine whether your business is viable and how long it can survive",
    icon: DollarSign,
    accentColor: "text-emerald-600 dark:text-emerald-400",
    headerBg:
      "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40",
    concepts: [
      {
        q: "What is LTV (Customer Lifetime Value)?",
        a: "LTV is the total revenue you expect to earn from a single customer over their entire relationship with your business. For subscriptions: LTV = Average Monthly Revenue per Customer × Average Customer Lifespan in months. For example, a customer paying $50/month who stays for 18 months has an LTV of $900. LTV sets the ceiling on how much you can spend to acquire a customer and still be profitable. It's also the key input for comparing marketing channels: a channel that costs $300 to acquire a customer with $900 LTV is far better than one costing $100 to acquire a customer with $200 LTV.",
        platformTab: "Financial",
      },
      {
        q: "What is CAC (Customer Acquisition Cost)?",
        a: "CAC is the total cost of acquiring one new paying customer — including all sales team costs, marketing spend, advertising, and related operational expenses in a given period. Formula: Total Sales & Marketing Spend ÷ Number of New Customers Acquired = CAC. If you spend $10,000/month and acquire 40 customers, CAC = $250. CAC must be weighed against LTV: if LTV is $900 and CAC is $250, you net $650 per customer before overhead. If CAC approaches or exceeds LTV, you're destroying value with every new sale.",
        platformTab: "Financial",
      },
      {
        q: "What is the LTV:CAC ratio?",
        a: "The LTV:CAC ratio measures how much lifetime value you generate per dollar spent acquiring a customer. A ratio of 3:1 is generally the minimum healthy benchmark for SaaS and subscription businesses. Below 1:1 means every new customer destroys value. Above 5:1 often means you're under-investing in growth — leaving money on the table. The ratio must also be paired with CAC payback period: a 5:1 ratio where it takes 48 months to recoup the CAC still creates a dangerous cash flow problem, even if the economics look good on paper.",
        platformTab: "Financial",
      },
      {
        q: "What is Break-Even Analysis?",
        a: "Break-even is the point where total revenue equals total costs — the moment your business stops losing money on an operating basis. Break-even analysis answers: how many customers or units do we need before we stop burning cash? How long will it take at our current growth rate? How much runway do we need? Formula: Break-Even Units = Fixed Monthly Costs ÷ (Price per Unit − Variable Cost per Unit). It's one of the most practical tools for planning cash needs, fundraising timelines, and hiring decisions.",
        platformTab: "Financial",
      },
      {
        q: "What are Burn Rate and Runway?",
        a: "Burn rate is the speed at which your company spends its cash reserves, typically measured monthly. Gross burn is total cash out; net burn is cash out minus cash in. Runway is how long your cash will last: Cash Balance ÷ Net Monthly Burn = Months of Runway. If you have $600K in the bank and net burn is $50K/month, you have 12 months of runway. Every founder must know their runway at all times. The general rule is to begin fundraising when you have at least 6 months remaining — fundraising takes far longer than expected and running out of runway is existential.",
        platformTab: "Financial",
      },
      {
        q: "What are Unit Economics?",
        a: "Unit economics analyzes the revenue and costs of your business on a per-unit basis — where a unit is typically one customer, one transaction, or one subscription. It answers the foundational question: does this business make or lose money on each individual sale, before considering overhead? Healthy unit economics is a prerequisite for scalability: if you lose $10 per transaction, selling more just accelerates losses. Common unit economics metrics include contribution margin per customer, gross margin per order, CAC payback period, and LTV:CAC.",
        platformTab: "Financial",
      },
      {
        q: "What is Gross Margin?",
        a: "Gross margin is the percentage of revenue remaining after subtracting the direct costs of delivering your product (Cost of Goods Sold / COGS). Formula: Gross Margin % = (Revenue − COGS) ÷ Revenue × 100. Pure software businesses often achieve 70–90% gross margins because marginal delivery costs are near zero. Physical product companies typically achieve 30–50%. Service businesses can range widely depending on labor intensity. High gross margin means more of each revenue dollar is available to cover overhead, reinvest in growth, and generate profit — making the business far easier to scale.",
        platformTab: "Financial",
      },
    ],
  },
  {
    id: 10,
    title: "Go-to-Market",
    subtitle: "Getting your product in front of the right customers and generating repeatable revenue",
    icon: Megaphone,
    accentColor: "text-cyan-600 dark:text-cyan-400",
    headerBg:
      "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/40",
    concepts: [
      {
        q: "What is a Go-to-Market (GTM) Strategy?",
        a: "A GTM strategy is your plan for bringing a product to market and acquiring your first customers profitably. It answers: Who do we sell to first (the beachhead segment)? Where do we find them? What message will resonate with their specific pain? What sales motion fits the price point and complexity? A strong GTM picks one specific customer segment, one primary acquisition channel, and one clear message — rather than trying to reach everyone at once. The first GTM's goal is not market domination; it's proving you can acquire customers repeatably and at a viable cost.",
        platformTab: "Go-to-Market",
      },
      {
        q: "What is a Sales Funnel?",
        a: "A sales funnel maps the journey a potential customer takes from first discovering your product to becoming a paying, retained customer. Classic stages: Awareness (they discover you exist) → Interest (they engage with your content or try the product) → Consideration (they evaluate you against alternatives) → Intent (they show clear buying signals) → Purchase (they convert) → Retention (they renew and expand). Mapping your funnel reveals where the largest drops occur, so you can focus optimization on the highest-leverage stage rather than guessing.",
        platformTab: "Go-to-Market",
      },
      {
        q: "What are Growth Channels?",
        a: "A growth channel is the specific mechanism you use to acquire customers. Major categories include: Paid acquisition (Google, Meta, LinkedIn ads — fast but expensive and non-compounding), Content and SEO (blog posts, videos, thought leadership — slow to build but compounds over time), Product-led growth (word-of-mouth driven by the product itself), Outbound sales (cold email and calls — controllable and scalable with the right team), Partnerships and integrations (reach existing audiences), and Community (build an audience around a topic). Most successful businesses find 1–2 channels that work exceptionally and concentrate on them rather than spreading thin.",
        platformTab: "Go-to-Market",
      },
      {
        q: "What is Product-Led Growth (PLG)?",
        a: "Product-Led Growth is a go-to-market strategy in which the product itself is the primary driver of acquisition, conversion, expansion, and retention — rather than a sales team or advertising budget. Examples: Slack spreads through team invites, Dropbox through file sharing links, Zoom through meeting links sent to non-users. PLG works best when the product delivers immediate value, has a natural virality or collaboration element, and onboarding is smooth enough that users can adopt it without a sales conversation. The key metric in PLG is activation — the moment a new user experiences the core value.",
        platformTab: "Go-to-Market",
      },
    ],
  },
  {
    id: 11,
    title: "Growth & Scaling",
    subtitle: "What comes after product-market fit — building a business that compounds over time",
    icon: TrendingUp,
    accentColor: "text-pink-600 dark:text-pink-400",
    headerBg:
      "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800/40",
    concepts: [
      {
        q: "What is Product-Market Fit (PMF)?",
        a: "Product-market fit is the moment when your product meets a strong, real market demand — evidenced by high retention, organic word-of-mouth, and customers who would be genuinely upset if the product disappeared. The classic test (Sean Ellis): ask users 'How would you feel if you could no longer use this product?' If 40%+ answer 'Very disappointed,' you likely have PMF. Before PMF, every resource should be focused on finding it — premature scaling before PMF is the fastest way to burn capital and destroy a company. After PMF, the focus shifts entirely to scaling what's already working.",
      },
      {
        q: "What are Growth Loops?",
        a: "A growth loop is a compounding mechanism where existing users or revenue generate new users — automatically and self-reinforcingly. Unlike a linear funnel (spend $1 on ads, acquire 1.5 customers), a loop reinvests outputs as new inputs. Examples: Viral loop — every new user invites others (WhatsApp). Content loop — users create content that attracts search traffic that attracts more users (Reddit, YouTube). Paid loop — revenue funds ads that acquire customers whose revenue funds more ads. Businesses with strong loops grow exponentially at decreasing marginal cost per user, making them far more capital-efficient than ad-dependent businesses.",
      },
      {
        q: "What are Network Effects?",
        a: "A network effect is when a product becomes more valuable as more people use it. Direct network effects: more users directly benefit all users (WhatsApp — more contacts makes the app more useful). Indirect (cross-side) network effects: more users on one side attract more value to the other side (Uber — more riders attract more drivers; more drivers make the app more useful for riders). Data network effects: more usage generates more data which improves the product (Waze, Spotify recommendations). Network effects are the most powerful moat because they're structural — a competitor cannot replicate the network even with unlimited capital.",
      },
      {
        q: "What is Churn and Retention?",
        a: "Churn is the percentage of customers who stop using or paying for your product in a given period. Monthly churn of even 2–3% compounds to losing 22–31% of your customer base annually. Retention is the inverse: the percentage who stay and continue to pay. High churn signals that your product isn't delivering enough sustained value, or that you've acquired customers who were a poor fit. Net Revenue Retention (NRR) is an even better metric — it accounts for expansions and upsells. NRR above 100% means your existing customer base is growing in revenue even as some customers churn, which is the sign of a truly compounding business.",
      },
    ],
  },
];

function ConceptItem({
  concept,
  accentColor,
}: {
  concept: Concept;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const badge = concept.platformTab ? TAB_BADGE[concept.platformTab] : null;

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700 last:border-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 py-4 text-left cursor-pointer"
      >
        <span
          className={cn(
            "flex-1 text-sm font-medium leading-snug",
            open ? accentColor : "text-neutral-900 dark:text-white"
          )}
        >
          {concept.q}
        </span>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {badge && (
            <span
              className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded-md whitespace-nowrap",
                badge.bg
              )}
            >
              {badge.label}
            </span>
          )}
          {open ? (
            <ChevronUp size={16} className="text-neutral-400 shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-neutral-400 shrink-0" />
          )}
        </div>
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {concept.a}
          </p>
          {badge && (
            <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
              Analyzed in Bizify under the{" "}
              <span className={cn("font-semibold px-1.5 py-0.5 rounded-md", badge.bg)}>
                {badge.label}
              </span>{" "}
              tab.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConceptsGuidePage() {
  const totalConcepts = PHASES.reduce((acc, p) => acc + p.concepts.length, 0);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 px-4 py-16">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <BookOpen size={12} />
            Business Builder&apos;s Guide
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            From Idea to Scale
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            A complete A-to-Z guide to every business concept — in the exact order you&apos;ll need
            them, from your first idea to building a scalable company.
          </p>
        </div>

        {/* Platform Coverage Legend */}
        <div className="mb-8 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5">
          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 uppercase tracking-wide">
            Bizify Platform Coverage
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">
            Concepts marked with a colored badge are actively analyzed by Bizify&apos;s AI in your
            idea report. Open the corresponding tab in any idea to explore them in depth.
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.values(TAB_BADGE).map((val) => (
              <span
                key={val.label}
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-md",
                  val.bg
                )}
              >
                {val.label}
              </span>
            ))}
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-8">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <div key={phase.id}>
                {/* Phase Header */}
                <div
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border mb-3",
                    phase.headerBg
                  )}
                >
                  <div className={cn("shrink-0 mt-0.5", phase.accentColor)}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-widest",
                        phase.accentColor
                      )}
                    >
                      Phase {phase.id}
                    </span>
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
                      {phase.title}
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                      {phase.subtitle}
                    </p>
                  </div>
                </div>

                {/* Concept Accordions */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 px-6">
                  {phase.concepts.map((concept) => (
                    <ConceptItem
                      key={concept.q}
                      concept={concept}
                      accentColor={phase.accentColor}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            {totalConcepts} concepts across {PHASES.length} phases of building a business
          </p>
        </div>
      </div>
    </div>
  );
}
