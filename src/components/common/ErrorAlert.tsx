import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string | null;
  className?: string;
  dismissible?: boolean;
}

export function ErrorAlert({ message, className, dismissible = true }: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!message || !isVisible) return null;

  return (
    <Alert 
      variant="destructive" 
      className={className}
      dismissible={dismissible}
      onClose={() => setIsVisible(false)}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
