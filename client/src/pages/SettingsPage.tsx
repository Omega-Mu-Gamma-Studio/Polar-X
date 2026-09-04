import PageHeader from '@/components/common/PageHeader';
import ComingSoon from '@/components/common/ComingSoon';
import { IconSettings } from '@/components/common/Icons';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Workspace, notifications & station configuration" />
      <ComingSoon
        icon={IconSettings}
        title="Configuration"
        description="Profile management, notification preferences and station-level configuration once authenticated accounts arrive."
        features={['Profile & roles', 'Notification rules', 'Station profile']}
      />
    </div>
  );
}
