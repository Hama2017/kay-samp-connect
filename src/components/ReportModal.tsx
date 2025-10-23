import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag, AlertTriangle } from "lucide-react";
import { useReports } from "@/hooks/useReports";

interface ReportModalProps {
  children: React.ReactNode;
  contentType: 'post' | 'comment' | 'user' | 'space';
  contentId: string;
  targetName?: string;
}

const reportReasons = {
  post: [
    { id: 'spam', label: 'Contenu indésirable ou spam' },
    { id: 'harassment', label: 'Harcèlement ou intimidation' },
    { id: 'hate', label: 'Discours de haine' },
    { id: 'misinformation', label: 'Désinformation' },
    { id: 'inappropriate', label: 'Contenu inapproprié' },
    { id: 'violence', label: 'Violence ou menaces' },
    { id: 'other', label: 'Autre' }
  ],
  comment: [
    { id: 'spam', label: 'Spam ou contenu indésirable' },
    { id: 'harassment', label: 'Harcèlement' },
    { id: 'hate', label: 'Propos haineux' },
    { id: 'inappropriate', label: 'Contenu inapproprié' },
    { id: 'other', label: 'Autre' }
  ],
  user: [
    { id: 'harassment', label: 'Harcèlement' },
    { id: 'impersonation', label: 'Usurpation d\'identité' },
    { id: 'hate', label: 'Comportement haineux' },
    { id: 'spam', label: 'Compte de spam' },
    { id: 'inappropriate', label: 'Comportement inapproprié' },
    { id: 'other', label: 'Autre' }
  ],
  space: [
    { id: 'inappropriate', label: 'Contenu inapproprié' },
    { id: 'hate', label: 'SAMP Zone de discours de haine' },
    { id: 'spam', label: 'SAMP Zone de spam' },
    { id: 'misinformation', label: 'Propagation de désinformation' },
    { id: 'other', label: 'Autre' }
  ]
};

export function ReportModal({ children, contentType, contentId, targetName }: ReportModalProps) {
  const { createReport } = useReports();
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      return;
    }

    setIsSubmitting(true);
    
    const reasonLabel = reasons.find(r => r.id === selectedReason)?.label || selectedReason;
    const success = await createReport(contentType, contentId, reasonLabel, details);
    
    if (success) {
      setOpen(false);
      setSelectedReason('');
      setDetails('');
    }
    
    setIsSubmitting(false);
  };

  const reasons = reportReasons[contentType];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Flag className="h-5 w-5" />
            Signaler {contentType === 'post' ? 'ce post' : 
                     contentType === 'comment' ? 'ce commentaire' :
                     contentType === 'user' ? 'cet utilisateur' : 'cette SAMP Zone'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {targetName && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Signalement concernant : <span className="font-medium text-foreground">{targetName}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Label>Raison du signalement *</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {reasons.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id} className="font-normal cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Détails supplémentaires (optionnel)</Label>
            <Textarea
              id="details"
              placeholder="Ajoutez des détails qui pourraient nous aider à examiner ce signalement..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Les signalements malveillants ou répétés peuvent entraîner des sanctions sur votre compte.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1"
              variant="destructive"
            >
              {isSubmitting ? "Envoi..." : "Signaler"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}