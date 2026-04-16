'use client';
import { createContext, useContext, useCallback, ReactNode } from 'react';

interface DataRefreshContextType {
  refreshData: () => void;
  isRefreshing: boolean;
}

const DataRefreshContext = createContext<DataRefreshContextType | null>(null);

interface DataRefreshProviderProps {
  children: ReactNode;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const DataRefreshProvider = ({ 
  children, 
  onRefresh, 
  isRefreshing = false 
}: DataRefreshProviderProps) => {
  const refreshData = useCallback(() => {
    console.log('DataRefreshContext: Triggering data refresh...');
    onRefresh?.();
  }, [onRefresh]);

  return (
    <DataRefreshContext.Provider value={{ refreshData, isRefreshing }}>
      {children}
    </DataRefreshContext.Provider>
  );
};

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) {
    throw new Error('useDataRefresh must be used within DataRefreshProvider');
  }
  return context;
};