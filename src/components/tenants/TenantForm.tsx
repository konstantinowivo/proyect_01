'use client';

import { useState, useEffect } from 'react';
import { Building, Unit, User } from '@/types';

interface Tenant {
  id: string;
  userId: string;
  unitId: string;
  buildingId: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  user?: User;
  unit?: Unit;
  building?: Building;
}

interface TenantFormProps {
  tenant?: Tenant | null;
  buildings: Building[];
  units: Unit[];
  users: User[];
  onClose: () => void;
}

export function TenantForm({ tenant, buildings, units, users, onClose }: TenantFormProps) {
  const [formData, setFormData] = useState({
    userId: '',
    buildingId: '',
    unitId: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);

  useEffect(() => {
    if (tenant) {
      setFormData({
        userId: tenant.userId,
        buildingId: tenant.buildingId,
        unitId: tenant.unitId,
        startDate: tenant.startDate.split('T')[0],
        endDate: tenant.endDate ? tenant.endDate.split('T')[0] : '',
        isActive: tenant.isActive,
      });
    }
  }, [tenant]);

  // Filter units by selected building
  useEffect(() => {
    if (formData.buildingId) {
      const filtered = units.filter((u) => u.buildingId === formData.buildingId);
      setAvailableUnits(filtered);

      // Reset unitId if the selected unit doesn't belong to the new building
      if (formData.unitId && !filtered.find((u) => u.id === formData.unitId)) {
        setFormData((prev) => ({ ...prev, unitId: '' }));
      }
    } else {
      setAvailableUnits([]);
    }
  }, [formData.buildingId, units]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = tenant ? `/api/tenants/${tenant.id}` : '/api/tenants';
      const method = tenant ? 'PUT' : 'POST';

      const payload: any = {
        isActive: formData.isActive,
      };

      // Only include these fields when creating
      if (!tenant) {
        payload.userId = formData.userId;
        payload.buildingId = formData.buildingId;
        payload.unitId = formData.unitId;
        payload.startDate = new Date(formData.startDate).toISOString();
      } else {
        // When updating, only include changed date fields
        if (formData.startDate && formData.startDate !== tenant.startDate.split('T')[0]) {
          payload.startDate = new Date(formData.startDate).toISOString();
        }
      }

      if (formData.endDate) {
        payload.endDate = new Date(formData.endDate).toISOString();
      } else {
        payload.endDate = null;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Error al guardar inquilino');
        setLoading(false);
        return;
      }

      onClose();
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  // Filter users with TENANT role
  const tenantUsers = users.filter((u) => u.role === 'TENANT');

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
              {tenant ? 'Editar Inquilino' : 'Asignar Inquilino'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario/Inquilino *
                </label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  disabled={!!tenant}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Selecciona un usuario</option>
                  {tenantUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
                {tenant && (
                  <p className="mt-1 text-xs text-gray-500">
                    No se puede cambiar el usuario de una asignación existente
                  </p>
                )}
              </div>

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
                  disabled={!!tenant}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Selecciona un edificio</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name} - {building.address}
                    </option>
                  ))}
                </select>
                {tenant && (
                  <p className="mt-1 text-xs text-gray-500">
                    No se puede cambiar el edificio de una asignación existente
                  </p>
                )}
              </div>

              {/* Unit Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad *
                </label>
                <select
                  required
                  value={formData.unitId}
                  onChange={(e) =>
                    setFormData({ ...formData, unitId: e.target.value })
                  }
                  disabled={!!tenant || !formData.buildingId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.buildingId
                      ? 'Primero selecciona un edificio'
                      : 'Selecciona una unidad'}
                  </option>
                  {availableUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Unidad {unit.number} - Piso {unit.floor === 0 ? 'PB' : unit.floor}
                    </option>
                  ))}
                </select>
                {tenant && (
                  <p className="mt-1 text-xs text-gray-500">
                    No se puede cambiar la unidad de una asignación existente
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  disabled={!!tenant}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {tenant && (
                  <p className="mt-1 text-xs text-gray-500">
                    No se puede cambiar la fecha de inicio
                  </p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin (Opcional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  min={formData.startDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Dejar vacío para contrato indefinido
                </p>
              </div>

              {/* Active Status */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Inquilino Activo
                    </span>
                    <p className="text-xs text-gray-500">
                      Los inquilinos inactivos no aparecen en reportes de ocupación
                    </p>
                  </div>
                </label>
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
                {loading ? 'Guardando...' : tenant ? 'Actualizar' : 'Asignar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
