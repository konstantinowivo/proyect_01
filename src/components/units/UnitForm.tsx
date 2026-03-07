'use client';

import { useState, useEffect } from 'react';
import { Unit, Building } from '@/types';

interface UnitFormProps {
  unit?: Unit | null;
  buildings: Building[];
  onClose: () => void;
}

export function UnitForm({ unit, buildings, onClose }: UnitFormProps) {
  const [formData, setFormData] = useState({
    buildingId: '',
    number: '',
    floor: 0,
    size: '',
    status: 'VACANT' as 'OCCUPIED' | 'VACANT' | 'MAINTENANCE',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData({
        buildingId: unit.buildingId,
        number: unit.number,
        floor: unit.floor,
        size: unit.size?.toString() || '',
        status: unit.status as 'OCCUPIED' | 'VACANT' | 'MAINTENANCE',
      });
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = unit ? `/api/units/${unit.id}` : '/api/units';
      const method = unit ? 'PUT' : 'POST';

      const payload: any = {
        buildingId: formData.buildingId,
        number: formData.number.trim(),
        floor: parseInt(formData.floor.toString()),
        status: formData.status,
      };

      if (formData.size) {
        payload.size = parseFloat(formData.size);
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Error al guardar unidad');
        setLoading(false);
        return;
      }

      onClose();
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'VACANT', label: 'Vacante', color: 'text-green-600' },
    { value: 'OCCUPIED', label: 'Ocupada', color: 'text-blue-600' },
    { value: 'MAINTENANCE', label: 'Mantenimiento', color: 'text-orange-600' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {unit ? 'Editar Unidad' : 'Nueva Unidad'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Building Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edificio *
                </label>
                <select
                  required
                  value={formData.buildingId}
                  onChange={(e) =>
                    setFormData({ ...formData, buildingId: e.target.value })
                  }
                  disabled={!!unit}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Selecciona un edificio</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name} - {building.address}
                    </option>
                  ))}
                </select>
                {unit && (
                  <p className="mt-1 text-xs text-gray-500">
                    No se puede cambiar el edificio de una unidad existente
                  </p>
                )}
              </div>

              {/* Unit Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Unidad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="101, 2A, PH1"
                  maxLength={10}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ej: 101, 2A, PH1, etc.
                </p>
              </div>

              {/* Floor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Piso *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floor: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  0 para Planta Baja
                </p>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño (m²)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="45.50"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Guardando...' : unit ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
