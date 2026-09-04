import { useMemo, useState } from 'react';
import { usePersonnel } from '@/hooks/usePersonnel';
import type { Personnel, PersonnelStatus } from '@/services/personnelApi';
import PageHeader from '@/components/common/PageHeader';
import GlassCard from '@/components/common/GlassCard';
import ErrorState from '@/components/common/ErrorState';
import StatCard from '@/components/common/StatCard';
import { IconPersonnel, IconSearch, IconUser, IconX } from '@/components/common/Icons';
import PersonnelCard from '@/components/dashboard/PersonnelCard';
import PersonnelDetailModal from '@/components/dashboard/PersonnelDetailModal';
import RotationTimeline from '@/components/dashboard/RotationTimeline';

type StatusFilter = 'all' | PersonnelStatus;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'on-duty', label: 'On Duty' },
  { value: 'in-field', label: 'In Field' },
  { value: 'at-base', label: 'At Base' },
  { value: 'on-leave', label: 'On Leave' },
];

export default function Personnel() {
  const { people, summary, loading, error, refetch, replacePerson } = usePersonnel();

  const [stationFilter, setStationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stations = useMemo(() => {
    const map = new Map<string, string>();
    for (const person of people) {
      if (person.stationName && person.stationId) map.set(person.stationId, person.stationName);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [people]);

  const roles = useMemo(
    () => [...new Set(people.map((person) => person.role))].sort(),
    [people]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return people.filter((person) => {
      if (stationFilter !== 'all' && person.stationId !== stationFilter) return false;
      if (statusFilter !== 'all' && person.status !== statusFilter) return false;
      if (roleFilter !== 'all' && person.role !== roleFilter) return false;
      if (query && !person.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [people, stationFilter, statusFilter, roleFilter, search]);

  const selected = selectedId ? people.find((person) => person.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Personnel" subtitle="Team whereabouts, qualifications, and rotations" />

      {/* Summary strip */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[88px] animate-pulse rounded-[20px] bg-white/[0.04]" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Could not load personnel" message={error} onRetry={refetch} retryLabel="Retry" />
      ) : summary ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <StatCard
            icon={<IconPersonnel width={18} height={18} />}
            label="Total personnel"
            value={summary.total}
            hint="across all stations"
          />
          <StatCard icon={<IconUser width={18} height={18} />} label="On duty" value={summary.onDuty} tone="success" />
          <StatCard icon={<IconUser width={18} height={18} />} label="In field" value={summary.inField} tone="accent" />
          <StatCard icon={<IconUser width={18} height={18} />} label="At base" value={summary.atBase} tone="neutral" />
          <StatCard icon={<IconUser width={18} height={18} />} label="On leave" value={summary.onLeave} tone="warning" />
        </div>
      ) : null}

      {/* Filter / toolbar row */}
      <GlassCard padded={false} className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="personnel-station-filter">
            Station
          </label>
          <select
            id="personnel-station-filter"
            value={stationFilter}
            onChange={(event) => setStationFilter(event.target.value)}
            className="h-10 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
          >
            <option value="all">All stations</option>
            {stations.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="personnel-status-filter">
            Status
          </label>
          <select
            id="personnel-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-10 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="personnel-role-filter">
            Role
          </label>
          <select
            id="personnel-role-filter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
          >
            <option value="all">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--color-text-secondary)]">
              <IconSearch width={15} height={15} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name…"
              aria-label="Search personnel by name"
              className="h-10 w-full rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] pl-9 pr-9 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-border)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-1 my-auto flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-primary)]"
              >
                <IconX width={14} height={14} />
              </button>
            )}
          </div>

          <p className="ml-auto text-xs tabular-nums text-[var(--color-text-secondary)]">
            Showing <span className="font-semibold text-[var(--color-text-primary)]">{filtered.length}</span> of{' '}
            {people.length}
          </p>
        </div>
      </GlassCard>

      {/* Personnel grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-[190px] animate-pulse rounded-[20px] bg-white/[0.04]" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Could not load personnel" message={error} onRetry={refetch} retryLabel="Retry" />
      ) : filtered.length === 0 ? (
        <GlassCard className="py-14 text-center text-sm text-[var(--color-text-secondary)]">
          No personnel match the current filters.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((person) => (
            <PersonnelCard key={person.id} person={person} onOpen={(p) => setSelectedId(p.id)} />
          ))}
        </div>
      )}

      {/* Rotation timeline */}
      <RotationTimeline people={people} />

      {selected && (
        <PersonnelDetailModal
          person={selected}
          onClose={() => setSelectedId(null)}
          onSaved={replacePerson}
        />
      )}
    </div>
  );
}