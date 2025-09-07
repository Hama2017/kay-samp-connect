import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

// Hook for swipe gestures
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;  
  threshold?: number;
}) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}

// Mobile-optimized button with haptic feedback simulation
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  haptic?: boolean;
}

export function MobileButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  haptic = true,
  className,
  ...props 
}: MobileButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const baseClasses = "relative transition-all duration-150 select-none touch-manipulation active:scale-95";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground active:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground active:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80"
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-sm min-h-[44px] min-w-[44px]", // Minimum touch target 44px
    md: "h-10 px-4 min-h-[44px] min-w-[44px]",
    lg: "h-12 px-6 text-lg min-h-[44px] min-w-[44px]"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isPressed && "scale-95",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      {...props}
    >
      {children}
    </button>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !containerRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    // Only allow pull-to-refresh if scrolled to top
    if (containerRef.current.scrollTop === 0 && diff > 0) {
      e.preventDefault();
      setPullDistance(Math.min(diff, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
          style={{ 
            height: Math.min(pullDistance, threshold),
            backgroundColor: 'hsl(var(--muted))',
            opacity: pullProgress
          }}
        >
          <div className={cn(
            "transition-all duration-200",
            shouldTrigger ? "text-primary" : "text-muted-foreground"
          )}>
            {isRefreshing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                <span className="text-sm">Actualisation...</span>
              </div>
            ) : shouldTrigger ? (
              <span className="text-sm">Relâchez pour actualiser</span>
            ) : (
              <span className="text-sm">Tirez pour actualiser</span>
            )}
          </div>
        </div>
      )}
      
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: `translateY(${Math.min(pullDistance, threshold)}px)` 
        }}
      >
        {children}
      </div>
    </div>
  );
}