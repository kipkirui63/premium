import toolsCatalog from '../../../shared/marketplace_tools.json';

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

interface CatalogTool {
  id: number;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  freeTrialDays: number;
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

export const TOOLS: Tool[] = (toolsCatalog as CatalogTool[]).map((tool) => ({
  ...tool,
  freeTrialDays: `${tool.freeTrialDays}-day free trial`,
}));

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
