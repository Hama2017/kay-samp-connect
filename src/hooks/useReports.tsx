import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Report {
  id: string;
  reported_item_type: string;
  reported_item_id: string;
  reporter_id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  resolution_note?: string;
}

export const useReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createReport = useCallback(async (
    contentType: string,
    contentId: string,
    reason: string,
    description?: string
  ) => {
    if (!user) {
      toast.error('Vous devez être connecté pour signaler du contenu');
      return false;
    }

    try {
      // @ts-ignore - reports table exists but not in generated types
      const { error } = await supabase
        .from('reports')
        .insert({
          reported_item_type: contentType,
          reported_item_id: contentId,
          reporter_id: user.id,
          reason,
          description,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Signalement envoyé. Notre équipe l\'examinera sous peu.');
      return true;
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Erreur lors de l\'envoi du signalement');
      return false;
    }
  }, [user]);

  const fetchReports = useCallback(async (status?: string) => {
    setIsLoading(true);
    try {
      // @ts-ignore - reports table exists but not in generated types
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Erreur lors du chargement des signalements');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateReportStatus = useCallback(async (
    reportId: string,
    status: string,
    resolutionNote?: string
  ) => {
    if (!user) return false;

    try {
      // @ts-ignore - reports table exists but not in generated types
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          resolution_note: resolutionNote
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Signalement ${status === 'resolved' ? 'résolu' : status === 'dismissed' ? 'rejeté' : 'examiné'}`);
      await fetchReports();
      return true;
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Erreur lors de la mise à jour du signalement');
      return false;
    }
  }, [user, fetchReports]);

  return {
    reports,
    isLoading,
    createReport,
    fetchReports,
    updateReportStatus
  };
};
