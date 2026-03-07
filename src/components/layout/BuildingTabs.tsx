'use client';

import { Building } from '@/types';
import { cn } from '@/lib/utils';

interface BuildingTabsProps {
  buildings: Building[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function BuildingTabs({ buildings, selectedId, onSelect }: BuildingTabsProps) {
  if (buildings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <span className="text-xl">🏢</span>
        <span className="text-sm">No hay edificios registrados</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <span className="text-xl mr-2">🏢</span>
      {buildings.map((building) => (
        <button
          key={building.id}
          onClick={() => onSelect(building.id)}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
            selectedId === building.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {building.name}
        </button>
      ))}
    </div>
  );
}
