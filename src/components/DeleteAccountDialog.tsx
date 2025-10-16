import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountDialog({ open, onOpenChange, onConfirm }: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const CONFIRMATION_TEXT = "CONFIRMER SUPPRESSION";

  const isConfirmationValid = confirmText === CONFIRMATION_TEXT;

  const handleConfirm = async () => {
    if (!isConfirmationValid) return;
    
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Supprimer définitivement votre compte
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cette action est irréversible et entraînera la suppression de :
              </AlertDescription>
            </Alert>
            
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Tous vos posts et médias</li>
              <li>Tous vos commentaires et votes</li>
              <li>Toutes les SAMP Zones que vous avez créées</li>
              <li>Vos abonnements et abonnés</li>
              <li>Toutes vos données personnelles</li>
            </ul>

            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm font-semibold">
                Pour confirmer, saisissez : <span className="text-destructive">{CONFIRMATION_TEXT}</span>
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Saisissez le texte de confirmation"
                disabled={isDeleting}
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression en cours...
              </>
            ) : (
              "Supprimer mon compte"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
