import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { X, Smartphone, Download, Wifi, WifiOff } from 'lucide-react';

export function PWAPrompt() {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Afficher le prompt d'installation après 30 secondes si installable
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Réafficher dans 24h
    setTimeout(() => setDismissed(false), 24 * 60 * 60 * 1000);
  };

  // Status indicator pour la connexion
  const ConnectionStatus = () => (
    <div className="fixed bottom-4 left-4 z-40 sm:top-20 sm:right-4 sm:left-auto sm:bottom-auto">
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-2 px-3 py-1 shadow-lg"
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            En ligne
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Hors ligne
          </>
        )}
      </Badge>
    </div>
  );

  return (
    <>
      {/* Connection Status */}
      <ConnectionStatus />
      
      {/* Install Prompt */}
      {showPrompt && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full max-w-md animate-slide-in-right">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Installer KaaySamp</CardTitle>
                  <CardDescription>
                    Une expérience native sur votre appareil
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Accès hors ligne</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Notifications push</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Démarrage plus rapide</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Expérience comme une app native</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleInstall} className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Installer
                </Button>
                <Button variant="outline" onClick={handleDismiss}>
                  Plus tard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}