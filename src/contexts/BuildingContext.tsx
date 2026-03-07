'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Building } from '@/types';

interface BuildingContextType {
  buildings: Building[];
  selectedBuildingId: string | null;
  loading: boolean;
  setSelectedBuildingId: (id: string | null) => void;
  refreshBuildings: () => Promise<void>;
}

const BuildingContext = createContext<BuildingContextType | undefined>(undefined);

export function BuildingProvider({ children }: { children: ReactNode }) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/buildings');
      const data = await response.json();

      if (data.success) {
        setBuildings(data.data);

        // Auto-select first building if none selected
        if (!selectedBuildingId && data.data.length > 0) {
          setSelectedBuildingId(data.data[0].id);
        }

        // If selected building was deleted, select first available
        if (selectedBuildingId && !data.data.find((b: Building) => b.id === selectedBuildingId)) {
          setSelectedBuildingId(data.data.length > 0 ? data.data[0].id : null);
        }
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const refreshBuildings = async () => {
    await fetchBuildings();
  };

  return (
    <BuildingContext.Provider
      value={{
        buildings,
        selectedBuildingId,
        loading,
        setSelectedBuildingId,
        refreshBuildings,
      }}
    >
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuildingContext() {
  const context = useContext(BuildingContext);
  if (context === undefined) {
    throw new Error('useBuildingContext must be used within a BuildingProvider');
  }
  return context;
}
