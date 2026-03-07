'use client';

import { useState } from 'react';
import { Building } from '@/types';
import { BuildingForm } from '@/components/buildings/BuildingForm';
import { useBuildingContext } from '@/contexts/BuildingContext';

export default function BuildingsPage() {
  const { buildings, loading, refreshBuildings } = useBuildingContext();
  const [showForm, setShowForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este edificio?')) {
      return;
    }

    try {
      const response = await fetch(`/api/buildings/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Refresh buildings list after deletion
        await refreshBuildings();
      } else {
        alert(data.error?.message || 'Error al eliminar edificio');
      }
    } catch (error) {
      console.error('Error deleting building:', error);
      alert('Error de conexión');
    }
  };

  const handleEdit = (building: Building) => {
    setEditingBuilding(building);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBuilding(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edificios</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los edificios que administras
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Edificio
        </button>
      </div>

      {showForm && (
        <BuildingForm
          building={editingBuilding}
          onClose={handleFormClose}
        />
      )}

      {buildings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay edificios registrados
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza agregando tu primer edificio
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Edificio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {building.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {building.address}, {building.city}
                  </p>
                </div>
                <span className="text-3xl">🏢</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pisos:</span>
                  <span className="font-semibold text-gray-900">
                    {building.floors}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Unidades:</span>
                  <span className="font-semibold text-gray-900">
                    {building.totalUnits}
                  </span>
                </div>
                {building.zipCode && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Código Postal:</span>
                    <span className="font-semibold text-gray-900">
                      {building.zipCode}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(building)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(building.id)}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
