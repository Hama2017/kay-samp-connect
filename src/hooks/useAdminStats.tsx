import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch simple counts instead of using RPC
      const [
        { count: totalUsers },
        { count: totalPosts },
        { count: totalComments },
        { count: totalSpaces },
        // @ts-ignore - reports table exists
        { count: totalReports },
        // @ts-ignore - reports table exists  
        { count: pendingReports }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('spaces').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        total_users: totalUsers || 0,
        total_posts: totalPosts || 0,
        total_comments: totalComments || 0,
        total_spaces: totalSpaces || 0,
        total_reports: totalReports || 0,
        pending_reports: pendingReports || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    refetch: fetchStats
  };
};
