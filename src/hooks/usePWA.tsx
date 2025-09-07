import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
      
      setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome);
    };

    checkIfInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setIsInstallable(true);
      
      // Afficher une notification pour l'installation
      toast({
        title: "📱 Installation disponible",
        description: "Vous pouvez installer KaaySamp sur votre appareil pour une meilleure expérience",
        duration: 8000,
      });
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      toast({
        title: "🎉 Installation réussie !",
        description: "KaaySamp est maintenant installé sur votre appareil",
        duration: 5000,
      });
    };

    // Écouter les changements de connexion
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (online) {
        toast({
          title: "🌐 Connexion rétablie",
          description: "Vous êtes de nouveau en ligne",
          duration: 3000,
        });
      } else {
        toast({
          title: "📶 Connexion perdue", 
          description: "Vous êtes en mode hors ligne",
          duration: 5000,
        });
      }
    };

    // Enregistrer le Service Worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          setSwRegistration(registration);
          console.log('Service Worker enregistré:', registration);
          
          // Écouter les mises à jour du SW
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nouvelle version disponible
                  toast({
                    title: "🔄 Mise à jour disponible",
                    description: "Une nouvelle version de KaaySamp est disponible. Rechargez pour l'installer.",
                    duration: 10000,
                  });
                }
              });
            }
          });

        } catch (error) {
          console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
        }
      }
    };

    // Événements
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Enregistrer le SW
    registerServiceWorker();

    // Nettoyage
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [toast]);

  const installApp = async () => {
    if (!deferredPrompt) {
      toast({
        title: "❌ Installation impossible",
        description: "L'installation n'est pas disponible sur ce navigateur",
        duration: 5000,
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Installation acceptée');
      } else {
        console.log('Installation refusée');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
      toast({
        title: "❌ Erreur d'installation",
        description: "Impossible d'installer l'application",
        duration: 5000,
      });
    }
  };

  const updateApp = async () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const checkForUpdates = async () => {
    if (swRegistration) {
      await swRegistration.update();
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    updateApp,
    checkForUpdates,
    swRegistration,
  };
}