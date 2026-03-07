'use client';

import { useState, useEffect } from 'react';
import { Unit, Building } from '@/types';
import { UnitForm } from '@/components/units/UnitForm';
import { useBuildingContext } from '@/contexts/BuildingContext';

export default function UnitsPage() {
  const { buildings, selectedBuildingId } = useBuildingContext();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchUnits();
  }, [selectedBuildingId]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      let url = '/api/units';

      if (selectedBuildingId && selectedBuildingId !== 'all') {
        url += `?buildingId=${selectedBuildingId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setUnits(data.data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta unidad?')) {
      return;
    }

    try {
      const response = await fetch(`/api/units/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setUnits(units.filter((u) => u.id !== id));
      } else {
        alert(data.error?.message || 'Error al eliminar unidad');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Error de conexión');
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUnit(null);
    fetchUnits();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      VACANT: { label: 'Vacante', bg: 'bg-green-100', text: 'text-green-800' },
      OCCUPIED: { label: 'Ocupada', bg: 'bg-blue-100', text: 'text-blue-800' },
      MAINTENANCE: { label: 'Mantenimiento', bg: 'bg-orange-100', text: 'text-orange-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.VACANT;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredUnits = filterStatus === 'ALL'
    ? units
    : units.filter(u => u.status === filterStatus);

  const stats = {
    total: units.length,
    vacant: units.filter(u => u.status === 'VACANT').length,
    occupied: units.filter(u => u.status === 'OCCUPIED').length,
    maintenance: units.filter(u => u.status === 'MAINTENANCE').length,
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
          <h1 className="text-3xl font-bold text-gray-900">Unidades</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las unidades de tus edificios
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nueva Unidad
        </button>
      </div>

      {showForm && (
        <UnitForm
          unit={editingUnit}
          buildings={buildings}
          onClose={handleFormClose}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Unidades</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-800">Vacantes</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.vacant}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-800">Ocupadas</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.occupied}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4">
          <p className="text-sm text-orange-800">Mantenimiento</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{stats.maintenance}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por estado:
        </label>
        <div className="flex gap-2">
          {[
            { value: 'ALL', label: 'Todas' },
            { value: 'VACANT', label: 'Vacantes' },
            { value: 'OCCUPIED', label: 'Ocupadas' },
            { value: 'MAINTENANCE', label: 'Mantenimiento' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterStatus === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Units List */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay unidades registradas
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza agregando tu primera unidad
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Unidad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Unidad {unit.number}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {unit.building?.name}
                  </p>
                </div>
                <span className="text-3xl">🏠</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Piso:</span>
                  <span className="font-semibold text-gray-900">
                    {unit.floor === 0 ? 'Planta Baja' : `Piso ${unit.floor}`}
                  </span>
                </div>
                {unit.size && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tamaño:</span>
                    <span className="font-semibold text-gray-900">
                      {unit.size} m²
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estado:</span>
                  {getStatusBadge(unit.status)}
                </div>
                {(unit as any)._count?.tenants > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Inquilinos:</span>
                    <span className="font-semibold text-gray-900">
                      {(unit as any)._count.tenants}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(unit)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(unit.id)}
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
