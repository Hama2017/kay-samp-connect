import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, Calendar } from 'lucide-react';

interface SpaceBadgeProps {
  badge: 'kaaysamp' | 'factcheck' | 'evenement' | 'official';
  className?: string;
}

export function SpaceBadge({ badge, className }: SpaceBadgeProps) {
  const badgeConfig = {
    kaaysamp: {
      label: 'KaaySamp',
      icon: Award,
      className: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
    },
    factcheck: {
      label: 'Fact Check',
      icon: CheckCircle,
      className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
    },
    evenement: {
      label: 'Événement',
      icon: Calendar,
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0'
    },
    official: {
      label: 'officiel',
      icon: Calendar,
      className: 'bg-gradient-to-r from-purple-500 to-green-500 text-white border-0'
    }
  };

  const config = badgeConfig[badge];
  const IconComponent = config.icon;

  return (
    <Badge className={`${config.className} ${className}`}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}