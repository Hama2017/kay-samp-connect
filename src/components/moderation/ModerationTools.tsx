import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReports } from "@/hooks/useReports";
import { useAdminActions } from "@/hooks/useAdminActions";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  FileText, 
  Ban, 
  Eye, 
  MessageCircle,
  Flag,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Report {
  id: string;
  type: 'post' | 'comment' | 'user' | 'space';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reportedBy: string;
  targetId: string;
  targetName: string;
  content?: string;
  createdAt: string;
  details?: string;
}

const mockReports: Report[] = [
  {
    id: "report_001",
    type: "post",
    reason: "Contenu inapproprié",
    status: "pending",
    reportedBy: "user123",
    targetId: "post_001",
    targetName: "Post sur le football",
    content: "Ce post contient du contenu offensant...",
    createdAt: "2024-03-15T10:30:00Z",
    details: "L'utilisateur a utilisé un langage inapproprié"
  },
  {
    id: "report_002", 
    type: "user",
    reason: "Harcèlement",
    status: "pending",
    reportedBy: "user456",
    targetId: "user_harass",
    targetName: "@UserProblem",
    createdAt: "2024-03-15T09:15:00Z",
    details: "Comportement de harcèlement répété"
  },
  {
    id: "report_003",
    type: "comment",
    reason: "Spam",
    status: "resolved",
    reportedBy: "user789",
    targetId: "comment_spam",
    targetName: "Commentaire publicitaire",
    content: "Achetez nos produits maintenant !!!",
    createdAt: "2024-03-14T16:20:00Z"
  }
];

export function ModerationTools() {
  const { reports, fetchReports, updateReportStatus, isLoading } = useReports();
  const { banUser, deletePost, isLoading: actionLoading } = useAdminActions();
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleReportAction = async (reportId: string, action: string, reason?: string) => {
    const success = await updateReportStatus(reportId, action, reason);
    
    if (success) {
      setSelectedReport(null);
      setActionReason("");
      setActionType("");
    }
  };

  const handleModAction = async () => {
    if (!selectedReport || !actionType) return;

    switch (actionType) {
      case 'resolve':
      case 'dismiss':
        await handleReportAction(selectedReport.id, actionType, actionReason);
        break;
      case 'ban':
        if (selectedReport.reported_item_type === 'user') {
          const success = await banUser(selectedReport.reported_item_id, actionReason || 'Banni suite à signalement');
          if (success) {
            await handleReportAction(selectedReport.id, 'resolved', 'Utilisateur banni');
          }
        }
        break;
      case 'delete':
        if (selectedReport.reported_item_type === 'post') {
          const success = await deletePost(selectedReport.reported_item_id);
          if (success) {
            await handleReportAction(selectedReport.id, 'resolved', 'Contenu supprimé');
          }
        }
        break;
    }
  };

  const pendingReports = reports.filter((r: any) => r.status === 'pending');
  const resolvedReports = reports.filter((r: any) => r.status === 'resolved');
  const dismissedReports = reports.filter((r: any) => r.status === 'dismissed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive" className="gap-1"><Clock className="h-3 w-3" /> En attente</Badge>;
      case 'resolved':
        return <Badge variant="default" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="h-3 w-3" /> Résolu</Badge>;
      case 'dismissed':
        return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" /> Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <FileText className="h-4 w-4" />;
      case 'comment': return <MessageCircle className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'space': return <Shield className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReports.length}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedReports.length}</p>
                <p className="text-sm text-muted-foreground">Résolus</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dismissedReports.length}</p>
                <p className="text-sm text-muted-foreground">Rejetés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Flag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestion des signalements
          </CardTitle>
          <CardDescription>
            Examinez et traitez les signalements de la communauté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">En attente ({pendingReports.length})</TabsTrigger>
              <TabsTrigger value="resolved">Résolus ({resolvedReports.length})</TabsTrigger>
              <TabsTrigger value="dismissed">Rejetés ({dismissedReports.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {pendingReports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun signalement en attente
                    </div>
                  ) : (
                    pendingReports.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(report.type)}
                            <div>
                              <h4 className="font-medium">{report.targetName}</h4>
                              <p className="text-sm text-muted-foreground">
                                Signalé par @{report.reportedBy}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(report.status)}
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-destructive">Raison:</span>
                            <span className="text-sm ml-2">{report.reason}</span>
                          </div>
                          {report.details && (
                            <div>
                              <span className="text-sm font-medium">Détails:</span>
                              <p className="text-sm text-muted-foreground ml-2">{report.details}</p>
                            </div>
                          )}
                          {report.content && (
                            <div>
                              <span className="text-sm font-medium">Contenu:</span>
                              <p className="text-sm text-muted-foreground ml-2 italic">"{report.content}"</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Examiner
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleReportAction(report.id, 'resolve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Résoudre
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReportAction(report.id, 'dismiss')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="resolved">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {resolvedReports.map((report: any) => (
                    <div key={report.id} className="p-4 border rounded-lg opacity-75">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(report.reported_item_type)}
                          <div>
                            <h4 className="font-medium">{report.reason}</h4>
                            <p className="text-sm text-muted-foreground">
                              Résolu
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="dismissed">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {dismissedReports.map((report: any) => (
                    <div key={report.id} className="p-4 border rounded-lg opacity-75">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(report.reported_item_type)}
                          <div>
                            <h4 className="font-medium">{report.reason}</h4>
                            <p className="text-sm text-muted-foreground">
                              Rejeté
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(selectedReport.type)}
                Détails du signalement
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <p className="font-medium capitalize">{selectedReport.reported_item_type}</p>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>

                <div>
                  <Label>ID du contenu</Label>
                  <p className="font-medium text-xs">{selectedReport.reported_item_id}</p>
                </div>

                <div>
                  <Label>Raison du signalement</Label>
                  <p className="font-medium text-destructive">{selectedReport.reason}</p>
                </div>

                {selectedReport.description && (
                  <div>
                    <Label>Détails</Label>
                    <p className="text-muted-foreground">{selectedReport.description}</p>
                  </div>
                )}

              <Separator />

              <div className="space-y-4">
                <Label>Action de modération</Label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolve">Résoudre le signalement</SelectItem>
                    <SelectItem value="dismiss">Rejeter le signalement</SelectItem>
                    <SelectItem value="warn">Avertir l'utilisateur</SelectItem>
                    <SelectItem value="suspend">Suspendre temporairement</SelectItem>
                    <SelectItem value="ban">Bannir définitivement</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label>Raison de l'action (optionnel)</Label>
                  <Textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Expliquez votre décision..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setSelectedReport(null)} className="flex-1">
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleModAction}
                    disabled={!actionType || isLoading || actionLoading}
                    className="flex-1"
                  >
                    {isLoading || actionLoading ? 'Traitement...' : 'Appliquer l\'action'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}