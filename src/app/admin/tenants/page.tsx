'use client';

import { useState, useEffect } from 'react';
import { Building, Unit, User } from '@/types';
import { TenantForm } from '@/components/tenants/TenantForm';
import { useBuildingContext } from '@/contexts/BuildingContext';

interface Tenant {
  id: string;
  userId: string;
  unitId: string;
  buildingId: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  unit: {
    id: string;
    number: string;
    floor: number;
  };
  building: {
    id: string;
    name: string;
    address: string;
  };
  _count: {
    payments: number;
  };
}

export default function TenantsPage() {
  const { buildings, selectedBuildingId } = useBuildingContext();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchTenants();
  }, [selectedBuildingId]);

  useEffect(() => {
    fetchUnits();
    fetchUsers();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      let url = '/api/tenants';

      if (selectedBuildingId && selectedBuildingId !== 'all') {
        url += `?buildingId=${selectedBuildingId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTenants(data.data);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units');
      const data = await response.json();
      if (data.success) {
        setUnits(data.data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este inquilino? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTenants(tenants.filter((t) => t.id !== id));
      } else {
        alert(data.error?.message || 'Error al eliminar inquilino');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('Error de conexión');
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTenant(null);
    fetchTenants();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (isActive: boolean, endDate?: string | null) => {
    if (!isActive) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactivo
        </span>
      );
    }

    if (endDate) {
      const daysUntilEnd = Math.ceil(
        (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilEnd < 0) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Vencido
          </span>
        );
      }

      if (daysUntilEnd <= 30) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Por vencer
          </span>
        );
      }
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Activo
      </span>
    );
  };

  const filteredTenants =
    filterStatus === 'ALL'
      ? tenants
      : filterStatus === 'ACTIVE'
      ? tenants.filter((t) => t.isActive)
      : tenants.filter((t) => !t.isActive);

  const stats = {
    total: tenants.length,
    active: tenants.filter((t) => t.isActive).length,
    inactive: tenants.filter((t) => !t.isActive).length,
    expiringSoon: tenants.filter((t) => {
      if (!t.isActive || !t.endDate) return false;
      const daysUntilEnd = Math.ceil(
        (new Date(t.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilEnd > 0 && daysUntilEnd <= 30;
    }).length,
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
          <h1 className="text-3xl font-bold text-gray-900">Inquilinos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los inquilinos de tus edificios
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Asignar Inquilino
        </button>
      </div>

      {showForm && (
        <TenantForm
          tenant={editingTenant}
          buildings={buildings}
          units={units}
          users={users}
          onClose={handleFormClose}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Inquilinos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-800">Activos</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4">
          <p className="text-sm text-orange-800">Por Vencer</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{stats.expiringSoon}</p>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-4">
          <p className="text-sm text-gray-800">Inactivos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por estado:
        </label>
        <div className="flex gap-2">
          {[
            { value: 'ALL', label: 'Todos' },
            { value: 'ACTIVE', label: 'Activos' },
            { value: 'INACTIVE', label: 'Inactivos' },
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

      {/* Tenants List */}
      {filteredTenants.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay inquilinos registrados
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza asignando tu primer inquilino a una unidad
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Asignar Inquilino
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {tenant.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tenant.user.name}
                    </h3>
                    <p className="text-sm text-gray-600">{tenant.user.email}</p>
                  </div>
                </div>
                {getStatusBadge(tenant.isActive, tenant.endDate)}
              </div>

              <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">📍 Edificio:</span>
                  <span className="font-semibold text-gray-900">
                    {tenant.building.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">🏠 Unidad:</span>
                  <span className="font-semibold text-gray-900">
                    {tenant.unit.number} - Piso {tenant.unit.floor === 0 ? 'PB' : tenant.unit.floor}
                  </span>
                </div>
                {tenant.user.phone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">📞 Teléfono:</span>
                    <span className="font-semibold text-gray-900">
                      {tenant.user.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">📅 Inicio:</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(tenant.startDate)}
                  </span>
                </div>
                {tenant.endDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">📅 Fin:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(tenant.endDate)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">💰 Pagos:</span>
                  <span className="font-semibold text-gray-900">
                    {tenant._count.payments}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(tenant)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(tenant.id)}
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
