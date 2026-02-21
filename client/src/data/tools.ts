// Static tools data - no database required
export interface Tool {
  id: number;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  freeTrialDays: string;
  rating: number;
  reviewCount: number;
  badge: string;
  badgeColor: string;
  icon: string;
  backgroundGradient: string;
  agentUrl?: string;
  isComingSoon?: boolean;
  actionType?: 'view' | 'cart';
}

export const TOOLS: Tool[] = [
  {
    id: 1,
    name: 'Business Intelligence Agent',
    description: 'Advanced AI-powered analytics platform that transforms your data into actionable insights with real-time dashboards and predictive modeling.',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    freeTrialDays: '7-day free trial',
    rating: 4.6,
    reviewCount: 176,
    badge: 'Popular',
    badgeColor: 'bg-blue-500',
    icon: '/lovable-uploads/db8496d5-abfd-475d-acfa-4ec1a30bb1e6.png',
    backgroundGradient: 'bg-gradient-to-br from-blue-400 to-purple-600',
    agentUrl: 'https://businessagent.crispai.ca/',
    isComingSoon: false,
  },
  {
    id: 2,
    name: 'AI Recruitment Assistant',
    description: 'Streamline your hiring process with AI-powered candidate screening, interview scheduling, and talent matching algorithms.',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    freeTrialDays: '7-day free trial',
    rating: 4,
    reviewCount: 146,
    badge: 'New',
    badgeColor: 'bg-green-500',
    icon: '/lovable-uploads/4d97bc8a-c3f5-40eb-807d-b6745199d8dd.png',
    backgroundGradient: 'bg-gradient-to-br from-green-400 to-blue-500',
    agentUrl: 'https://workflow.getmindpal.com/67751ba8f77a6fddb63cd44e',
    isComingSoon: false,
  },
  {
    id: 3,
    name: 'CrispWrite',
    description: 'Professional writing assistant that helps create compelling content, from emails to reports, with AI-powered grammar and style suggestions.',
    monthlyPrice: 89.99,
    yearlyPrice: 899.99,
    freeTrialDays: '7-day free trial',
    rating: 5,
    reviewCount: 170,
    badge: 'Trending',
    badgeColor: 'bg-gray-500',
    icon: '/lovable-uploads/d66f2274-4cd1-4479-83ff-ae819baf5942.png',
    backgroundGradient: 'bg-gradient-to-br from-orange-400 to-red-500',
    agentUrl: 'https://crispwrite.crispai.ca/',
    isComingSoon: false,
  },
  {
    id: 4,
    name: 'SOP Assistant',
    description: 'Create, manage, and optimize Standard Operating Procedures with intelligent templates and collaborative editing features.',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    freeTrialDays: '7-day free trial',
    rating: 4.5,
    reviewCount: 145,
    badge: 'Trending',
    badgeColor: 'bg-purple-500',
    icon: '/lovable-uploads/e3d9814f-4b52-429f-8456-40b09db8f73a.png',
    backgroundGradient: 'bg-gradient-to-br from-purple-400 to-pink-500',
    agentUrl: 'https://workflow.getmindpal.com/sop-agent-workflow-avlkgrhad7x0xazm',
    isComingSoon: false,
  },
  {
    id: 5,
    name: 'Resume Analyzer',
    description: 'Advanced resume screening tool that evaluates candidates against job requirements with detailed scoring and recommendations.',
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    freeTrialDays: '7-day free trial',
    rating: 120,
    reviewCount: 180,
    badge: 'Essential',
    badgeColor: 'bg-indigo-500',
    icon: '/lovable-uploads/ee996b90-5709-4ed0-a535-014aa0accf98.png',
    backgroundGradient: 'bg-gradient-to-br from-indigo-400 to-blue-600',
    agentUrl: 'https://workflow.getmindpal.com/67751e695156e8aaefc0c8de',
    isComingSoon: false,
  },
  {
    id: 6,
    name: 'AI Twin Agent',
    description: 'Create an AI twin that mirrors your tone and expertise to engage customers and handle conversations in real time.',
    monthlyPrice: 50.00,
    yearlyPrice: 100.99,
    freeTrialDays: '7-day free trial',
    rating: 4.7,
    reviewCount: 128,
    badge: 'Popular',
    badgeColor: 'bg-blue-500',
    icon: '/lovable-uploads/twin.jpeg',
    backgroundGradient: 'bg-gradient-to-br from-blue-400 to-purple-600',
    agentUrl: 'https://aitwin.crispai.ca/',
    isComingSoon: false,
    actionType: 'view',
  },
  {
    id: 7,
    name: 'Email Scrapper',
    description: 'Collect and organize verified business emails from targeted domains with smart filtering and export options.',
    monthlyPrice: 21.99,
    yearlyPrice: 100.99,
    freeTrialDays: '7-day free trial',
    rating: 4.5,
    reviewCount: 92,
    badge: 'New',
    badgeColor: 'bg-green-500',
    icon: '/lovable-uploads/scrape.png',
    backgroundGradient: 'bg-gradient-to-br from-blue-400 to-purple-600',
    agentUrl: 'https://emailscrapper.crispai.ca/',
    isComingSoon: false,
    actionType: 'view',
  },
  {
    id: 8,
    name: 'CustomGPTs',
    description: 'Build and deploy tailored GPTs for your team with private knowledge, tools, and workflows.',
    monthlyPrice: 15.00,
    yearlyPrice: 199.99,
    freeTrialDays: '7-day free trial',
    rating: 4.8,
    reviewCount: 84,
    badge: 'Trending',
    badgeColor: 'bg-gray-500',
    icon: '/lovable-uploads/gpts.jpeg',
    backgroundGradient: 'bg-gradient-to-br from-blue-400 to-purple-600',
    agentUrl: 'https://customgpts.crispai.ca/',
    isComingSoon: false,
    actionType: 'view',
  },
//   {
//     id: 6,
//     name: 'Coupon',
//     description: 'Flexible access to AI tools and resources at a discounted monthly rate. Ideal for users seeking great value with full platform capabilities.',
//     monthlyPrice: 19.00,
//     yearlyPrice: 199.00,
//     freeTrialDays: '7-day free trial',
//     rating: 4.5,
//     reviewCount: 48,
//     badge: 'New',
//     badgeColor: 'bg-green-500',
//     icon: '/lovable-uploads/your-coupon-icon.png',
//     backgroundGradient: 'bg-gradient-to-br from-green-400 to-blue-500',
//     agentUrl: 'https://www.crispai.ca/coupon',
//     isComingSoon: false
// }

];

// Helper functions
export const getToolById = (id: number): Tool | undefined => {
  return TOOLS.find(tool => tool.id === id);
};

export const getToolByName = (name: string): Tool | undefined => {
  return TOOLS.find(tool => tool.name.toLowerCase() === name.toLowerCase());
};

export const getAvailableTools = (): Tool[] => {
  return TOOLS.filter(tool => !tool.isComingSoon);
};

export const getComingSoonTools = (): Tool[] => {
  return TOOLS.filter(tool => tool.isComingSoon);
};
