'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from '@/types';

interface Building {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(true);

  // Fetch buildings on mount
  useEffect(() => {
    fetchBuildings();
  }, []);

  // Fetch stats when selected building changes
  useEffect(() => {
    fetchStats();
  }, [selectedBuilding]);

  const fetchBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const response = await fetch('/api/buildings');
      const data = await response.json();

      if (data.success) {
        setBuildings(data.data);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    } finally {
      setLoadingBuildings(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const url = selectedBuilding === 'all'
        ? '/api/dashboard/stats'
        : `/api/dashboard/stats?buildingId=${selectedBuilding}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Building Selector */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Resumen general de tus edificios y unidades
            </p>
          </div>

          {/* Building Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="building-select" className="text-sm font-medium text-gray-700">
              Filtrar por edificio:
            </label>
            <select
              id="building-select"
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              disabled={loadingBuildings}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[200px]"
            >
              <option value="all">Todos los edificios</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Unidades */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Unidades</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalUnits}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-600">{stats.occupiedUnits} ocupadas</span>
                {' · '}
                <span className="text-blue-600">{stats.vacantUnits} vacantes</span>
              </div>
            </div>
            <div className="text-4xl">🏠</div>
          </div>
        </div>

        {/* Inquilinos Activos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inquilinos Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activeTenants}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Inquilinos registrados
              </div>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        {/* Tareas Pendientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tareas Pendientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pendingTasks}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {stats.urgentTasks > 0 && (
                  <span className="text-red-600">
                    {stats.urgentTasks} urgentes
                  </span>
                )}
                {stats.urgentTasks === 0 && (
                  <span className="text-green-600">Sin tareas urgentes</span>
                )}
              </div>
            </div>
            <div className="text-4xl">🔧</div>
          </div>
        </div>

        {/* Pagos Pendientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pagos Pendientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pendingPayments}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {stats.overduePayments > 0 && (
                  <span className="text-red-600">
                    {stats.overduePayments} vencidos
                  </span>
                )}
                {stats.overduePayments === 0 && (
                  <span className="text-green-600">Al día</span>
                )}
              </div>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-900 mt-2">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Tasa de Cobro</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {stats.collectionRate}%
              </p>
            </div>
            <div className="text-3xl">💵</div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800 font-medium">Tasa de Ocupación</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {stats.totalUnits > 0
                  ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
                  : 0}%
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h2>
          <div className="text-center py-8 text-gray-500">
            Próximamente: Actividad reciente
          </div>
        </div>

        {/* Urgent Tasks Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tareas Urgentes
          </h2>
          {stats.urgentTasks === 0 ? (
            <div className="text-center py-8 text-green-600">
              ✅ No hay tareas urgentes
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {stats.urgentTasks} tareas urgentes requieren atención
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
