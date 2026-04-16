'use client';
import { useEffect, useRef, useCallback } from 'react';
import { usePOSStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

/**
 * RealtimeProvider subscribes to Supabase realtime changes on mount
 * and re-fetches data whenever rows are inserted, updated, or deleted.
 * 
 * Handles offline/disconnected state gracefully — will not spam
 * reconnection attempts while the browser is offline.
 */
export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { fetchProducts, fetchCategories, fetchSales } = usePOSStore();
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  const isOnlineRef = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const setupSubscriptions = useCallback(() => {
    // Don't subscribe if offline
    if (!isOnlineRef.current) return;

    // Clean any existing channels first
    channelsRef.current.forEach(ch => {
      try { supabase.removeChannel(ch); } catch {}
    });
    channelsRef.current = [];

    const productsChannel = supabase
      .channel('realtime-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe();

    const categoriesChannel = supabase
      .channel('realtime-categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchCategories())
      .subscribe();

    const salesChannel = supabase
      .channel('realtime-sales')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => fetchSales())
      .subscribe();

    const saleItemsChannel = supabase
      .channel('realtime-sale-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sale_items' }, () => fetchSales())
      .subscribe();

    channelsRef.current = [productsChannel, categoriesChannel, salesChannel, saleItemsChannel];
  }, [fetchProducts, fetchCategories, fetchSales]);

  const cleanupSubscriptions = useCallback(() => {
    channelsRef.current.forEach(ch => {
      try { supabase.removeChannel(ch); } catch {}
    });
    channelsRef.current = [];
  }, []);

  useEffect(() => {
    // Only subscribe if browser is online
    if (navigator.onLine) {
      setupSubscriptions();
    }

    // Listen for online/offline events
    const handleOnline = () => {
      isOnlineRef.current = true;
      // Re-fetch all data when coming back online
      fetchProducts();
      fetchCategories();
      fetchSales();
      // Re-establish realtime subscriptions
      setupSubscriptions();
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      // Tear down subscriptions to prevent error flooding
      cleanupSubscriptions();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cleanupSubscriptions();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setupSubscriptions, cleanupSubscriptions, fetchProducts, fetchCategories, fetchSales]);

  return <>{children}</>;
}
