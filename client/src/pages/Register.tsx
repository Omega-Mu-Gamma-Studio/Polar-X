import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import { IconSnowflake } from '@/components/common/Icons';
import { cn } from '@/utils/cn';

const inputClasses = cn(
  'h-11 w-full rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-surface-glass)] px-3.5',
  'text-sm text-[var(--color-text-primary)] backdrop-blur-md transition-colors',
  'placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent-border)]',
  'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20'
);

export default function Register() {
  const { register, initializing } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, role });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed — please try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg-primary)] px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora-glow opacity-30 blur-3xl"
      />

      <div className="polar-glass relative w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-aurora-soft ring-1 ring-white/10">
            <IconSnowflake width={26} height={26} className="text-[var(--color-accent)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            ❄️ POLARX
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Create a Command Center account
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-[var(--color-danger)]"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Dr. A. Scientist"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@polarx.in"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              Password <span className="normal-case opacity-70">(min 8 characters)</span>
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="reg-role" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
              Role
            </label>
            <select
              id="reg-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={inputClasses}
            >
              <option value="viewer">Viewer</option>
              <option value="commander">Commander</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={submitting || initializing}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}