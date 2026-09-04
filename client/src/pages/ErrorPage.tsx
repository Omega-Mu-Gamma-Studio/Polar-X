import { useNavigate, useRouteError } from 'react-router-dom';
import ErrorState from '@/components/common/ErrorState';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const message = error instanceof Error ? error.message : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <ErrorState
        title="Page failed to load"
        message={message ?? 'Something unexpected happened while rendering this page.'}
        onRetry={() => navigate('/app')}
        retryLabel="Back to Dashboard"
        className="w-full max-w-lg"
      />
    </div>
  );
}
