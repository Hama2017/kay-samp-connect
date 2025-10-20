import React from 'react';
import logo from '@/assets/kaaysamp-logo.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export function AuthLayout({ children, title, subtitle, showLogo = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5 overflow-y-auto">
      <div className="w-full max-w-md space-y-4 md:space-y-8 animate-fade-in my-auto">
        {showLogo && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <img 
                src={logo} 
                alt="KaaySamp" 
                className="relative h-24 w-24 object-contain"
              />
            </div>
            {(title || subtitle) && (
              <div className="text-center space-y-2">
                {title && (
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-muted-foreground text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
