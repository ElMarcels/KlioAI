export const APP_NAME = "KlioAI";
export const APP_DESCRIPTION =
  "Access specialized AI models for every task. Chat, code, write, research, and learn with KlioAI.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const SITE = {
  name: "KlioAI",
  tagline: "Your intelligence, amplified.",
  description:
    "KlioAI is a multi-model AI platform with specialized assistants for every task.",
  url: APP_URL,
  ogImage: `${APP_URL}/og-image.png`,
} as const;

export const LINKS = {
  dashboard: "/dashboard",
  chat: "/chat",
  models: "/models",
  pricing: "/pricing",
  settings: "/settings",
  billing: "/billing",
  support: "/support",
  login: "/login",
  register: "/register",
  admin: "/admin",
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: LINKS.dashboard, icon: "LayoutDashboard" },
  { label: "Chat", href: LINKS.chat, icon: "MessageSquare" },
  { label: "Models", href: LINKS.models, icon: "Bot" },
  { label: "Support", href: LINKS.support, icon: "HeadphonesIcon" },
  { label: "Billing", href: LINKS.billing, icon: "CreditCard" },
  { label: "Settings", href: LINKS.settings, icon: "Settings" },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: "CreditCard" },
  { label: "Payments", href: "/admin/payments", icon: "DollarSign" },
  { label: "Support", href: "/admin/support", icon: "HeadphonesIcon" },
  { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { label: "Logs", href: "/admin/logs", icon: "FileText" },
] as const;

export const OWNER_NAV_ITEMS = [
  { label: "Models", href: "/admin/models", icon: "Bot" },
  { label: "Security", href: "/admin/security", icon: "Shield" },
  { label: "Knowledge Base", href: "/admin/knowledge-base", icon: "BookOpen" },
  { label: "Announcements", href: "/admin/announcements", icon: "Megaphone" },
  { label: "Administrators", href: "/admin/administrators", icon: "Crown" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
] as const;

export const KLIO_MODELS = [
  {
    id: "klio-core",
    name: "Klio Core",
    description: "General purpose AI assistant for everyday tasks",
    icon: "Bot",
    color: "from-blue-500 to-violet-500",
    tier: "FREE" as const,
  },
  {
    id: "klio-code",
    name: "Klio Code",
    description: "Expert programming assistant",
    icon: "Code2",
    color: "from-green-500 to-emerald-500",
    tier: "FREE" as const,
  },
  {
    id: "klio-study",
    name: "Klio Study",
    description: "Learning and education companion",
    icon: "GraduationCap",
    color: "from-amber-500 to-orange-500",
    tier: "FREE" as const,
  },
  {
    id: "klio-writer",
    name: "Klio Writer",
    description: "Creative writing and content creation",
    icon: "PenTool",
    color: "from-pink-500 to-rose-500",
    tier: "PRO" as const,
  },
  {
    id: "klio-research",
    name: "Klio Research",
    description: "Deep research and analysis assistant",
    icon: "Search",
    color: "from-cyan-500 to-blue-500",
    tier: "PRO" as const,
  },
  {
    id: "klio-vision",
    name: "Klio Vision",
    description: "Image understanding and visual analysis",
    icon: "Eye",
    color: "from-purple-500 to-fuchsia-500",
    tier: "PRO" as const,
  },
] as const;

export const PRICING_PLANS = [
  {
    name: "Free",
    type: "FREE" as const,
    price: 0,
    interval: "month" as const,
    features: [
      "50 messages per day",
      "Klio Core",
      "Klio Code",
      "Klio Study",
      "50K tokens per day",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    type: "PRO" as const,
    price: 19,
    interval: "month" as const,
    yearlyPrice: 190,
    features: [
      "Unlimited messages",
      "All AI models",
      "500K tokens per day",
      "Priority support",
      "Advanced analytics",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    type: "ENTERPRISE" as const,
    price: 99,
    interval: "month" as const,
    features: [
      "Everything in Pro",
      "Unlimited tokens",
      "Custom models",
      "Dedicated support",
      "SLA guarantee",
      "SSO & team management",
    ],
    cta: "Contact Sales",
    popular: false,
  },
] as const;

export const MAX_MESSAGE_LENGTH = 10000;
export const MESSAGES_PER_PAGE = 50;
export const DEFAULT_MODEL = "klio-core";
