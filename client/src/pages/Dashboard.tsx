import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStations } from '@/hooks/useStations';
import { useMissions } from '@/hooks/useMissions';
import { useShipments } from '@/hooks/useShipments';
import { useInventory } from '@/hooks/useInventory';
import { usePersonnel } from '@/hooks/usePersonnel';
import { useEmergencyAlerts } from '@/hooks/useEmergencyAlerts';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import StatusBadge from '@/components/common/StatusBadge';
import StationCard from '@/components/dashboard/StationCard';
import ShipmentsMapPreview from '@/components/dashboard/ShipmentsMapPreview';
import RecentShipmentsCard from '@/components/dashboard/RecentShipmentsCard';
import OverviewStripCard from '@/components/dashboard/OverviewStripCard';
import { IconEmergency, IconInventory, IconPersonnel } from '@/components/common/Icons';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    stations,
    loading: stationsLoading,
    error: stationsError,
    refetch: refetchStations,
  } = useStations();
  const {
    missions,
    loading: missionsLoading,
    error: missionsError,
  } = useMissions();
  const {
    shipments,
    loading: shipmentsLoading,
    error: shipmentsError,
    refetch: refetchShipments,
  } = useShipments({ limit: 10 });
  const {
    summary: inventorySummary,
    loading: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
  } = useInventory();
  const {
    summary: personnelSummary,
    loading: personnelLoading,
    error: personnelError,
    refetch: refetchPersonnel,
  } = usePersonnel();
  const {
    summary: alertsSummary,
    loading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = useEmergencyAlerts();

  const activeMissionCount = useMemo(
    () => missions.filter((mission) => mission.status === 'active').length,
    [missions]
  );

  const mapLoading = stationsLoading || shipmentsLoading;
  const mapError = stationsError ?? shipmentsError;
  const mapRetry = () => {
    refetchStations();
    refetchShipments();
  };

  const missionsReady = !missionsLoading && !missionsError;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of Polar Expedition Operations"
        actions={
          <StatusBadge
            status={missionsReady ? 'active' : 'info'}
            label={missionsReady ? `${activeMissionCount} active missions` : 'Loading missions…'}
          />
        }
      />

      {/* Station summary cards */}
      {stationsLoading ? (
        <LoadingState label="Loading stations…" />
      ) : stationsError ? (
        <ErrorState
          title="Could not load stations"
          message={stationsError}
          onRetry={refetchStations}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onOpen={() => navigate('/app/stations')}
            />
          ))}
        </div>
      )}

      {/* Map + recent shipments */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ShipmentsMapPreview
            stations={stations}
            shipments={shipments}
            loading={mapLoading}
            error={mapError}
            onRetry={mapRetry}
          />
        </div>
        <RecentShipmentsCard
          shipments={shipments}
          loading={shipmentsLoading}
          error={shipmentsError}
          onRetry={refetchShipments}
        />
      </div>

      {/* Summary strip — all three overview cards are live (Inventory Phase 3,
          Personnel Phase 4, Active Alerts Phase 5). */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <OverviewStripCard
          title="Inventory Overview"
          icon={<IconInventory width={16} height={16} className="text-[var(--color-accent)]" />}
          value={inventorySummary?.total ?? 0}
          valueLabel="total items"
          loading={inventoryLoading}
          error={inventoryError}
          onRetry={refetchInventory}
          stats={
            inventorySummary
              ? [
                  { label: 'adequate', value: inventorySummary.adequate, tone: 'success' },
                  { label: 'low stock', value: inventorySummary.lowStock, tone: 'warning' },
                  { label: 'critical', value: inventorySummary.critical, tone: 'danger' },
                  { label: 'out of stock', value: inventorySummary.outOfStock, tone: 'danger' },
                ]
              : []
          }
          to="/app/inventory"
        />
        <OverviewStripCard
          title="Active Alerts"
          icon={<IconEmergency width={16} height={16} className="text-[var(--color-danger)]" />}
          value={alertsSummary?.active ?? 0}
          valueLabel="active alerts"
          loading={alertsLoading}
          error={alertsError}
          onRetry={refetchAlerts}
          stats={
            alertsSummary
              ? [
                  { label: 'critical', value: alertsSummary.critical, tone: 'danger' },
                  { label: 'warning', value: alertsSummary.warning, tone: 'warning' },
                  { label: 'info', value: alertsSummary.info, tone: 'info' },
                ]
              : []
          }
          to="/app/emergency"
        />
        <OverviewStripCard
          title="Personnel Overview"
          icon={<IconPersonnel width={16} height={16} className="text-[var(--color-success)]" />}
          value={personnelSummary?.total ?? 0}
          valueLabel="total personnel"
          loading={personnelLoading}
          error={personnelError}
          onRetry={refetchPersonnel}
          stats={
            personnelSummary
              ? [
                  { label: 'on duty', value: personnelSummary.onDuty, tone: 'success' },
                  { label: 'in field', value: personnelSummary.inField, tone: 'accent' },
                  { label: 'at base', value: personnelSummary.atBase, tone: 'neutral' },
                  { label: 'on leave', value: personnelSummary.onLeave, tone: 'warning' },
                ]
              : []
          }
          to="/app/personnel"
        />
      </div>
    </div>
  );
}
