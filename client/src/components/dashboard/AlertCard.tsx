import type { ComponentType, SVGProps } from 'react';
import type { EmergencyAlert, Severity } from '@/services/emergencyApi';
import ClayCard from '@/components/common/ClayCard';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';
import { IconFlame, IconMedkit, IconShield, IconWind, IconWrench } from '@/components/common/Icons';
import { timeAgo } from '@/utils/datetime';

const TYPE_ICON: Record<EmergencyAlert['alertType'], ComponentType<SVGProps<SVGSVGElement>>> = {
  Medical: IconMedkit,
  Fire: IconFlame,
  Weather: IconWind,
  'Equipment Failure': IconWrench,
  Other: IconShield,
};

const SEVERITY_VAR: Record<Severity, string> = {
  critical: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
};

interface AlertCardProps {
  alert: EmergencyAlert;
  onViewChecklist: (alert: EmergencyAlert) => void;
  onResolve: (alert: EmergencyAlert) => void;
}

export default function AlertCard({ alert, onViewChecklist, onResolve }: AlertCardProps) {
  const Icon = TYPE_ICON[alert.alertType];
  const accent = SEVERITY_VAR[alert.severity];
  const done = alert.checklistItems.filter((item) => item.completed).length;
  const total = alert.checklistItems.length;

  return (
    <ClayCard
      className="flex flex-col gap-3.5 p-5 pl-6"
      pressed={alert.status === 'resolved'}
    >
      <div
        aria-hidden
        className="absolute inset-y-4 left-0 w-[3px] rounded-r-full"
        style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border"
            style={{
              background: 'var(--color-surface-glass)',
              borderColor: `var(--color-${alert.severity === 'info' ? 'info' : alert.severity}-border)`,
              color: accent,
            }}
          >
            <Icon width={18} height={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
              {alert.alertType} · {alert.stationName ?? 'Station'}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
              {timeAgo(alert.timestamp)} · by {alert.triggeredByName ?? 'System'}
            </p>
            {alert.description && (
              <p className="mt-1.5 line-clamp-2 max-w-xl text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {alert.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={alert.severity} size="sm" />
          <StatusBadge
            status={alert.status === 'active' ? 'warning' : 'resolved'}
            size="sm"
            label={alert.status === 'active' ? 'Active' : 'Resolved'}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-[220px]">
          <ProgressBar
            value={done}
            max={Math.max(1, total)}
            size="sm"
            tone={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'accent'}
            label={`${done}/${total} checklist complete`}
            showValue
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onViewChecklist(alert)}>
            View Checklist
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!alert.checklistCompleted}
            onClick={() => onResolve(alert)}
            title={
              alert.checklistCompleted
                ? 'Resolve this alert'
                : 'Complete the checklist before resolving'
            }
          >
            Resolve
          </Button>
        </div>
      </div>
    </ClayCard>
  );
}