
import React from 'react';
import AppCard from './AppCard';

interface App {
  id: number;
  name: string;
  description: string;
  price: string;
  freeTrialDays: string;
  rating: number;
  reviewCount: number;
  badge: string;
  badgeColor: string;
  icon: string;
  backgroundGradient: string;
  agentUrl?: string;
}

interface AppsGridProps {
  apps: App[];
  userRatings: { [key: number]: number };
  onAddToCart: (app: App) => void;
  onRate: (appId: number, rating: number) => void;
}

const AppsGrid = ({ apps, userRatings, onAddToCart, onRate }: AppsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          userRating={userRatings[app.id] || 0}
          onAddToCart={onAddToCart}
          onRate={onRate}
        />
      ))}
    </div>
  );
};

export default AppsGrid;
