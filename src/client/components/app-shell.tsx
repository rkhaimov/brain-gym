import { BarChart3, FileText, MapPin, PackageOpen } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';

import logoUrl from '../../../artefacts/ceramics-logo.svg';

interface NavigationItemProps {
  readonly active?: boolean;
  readonly icon: ReactNode;
  readonly label: string;
}

function NavigationItem({ active = false, icon, label }: NavigationItemProps) {
  return (
    <div
      aria-current={active ? 'page' : undefined}
      aria-disabled={active ? undefined : true}
      className={
        active
          ? 'flex h-10 items-center gap-3 rounded-lg bg-[var(--primary-soft)] px-3 font-semibold text-[var(--primary-hover)]'
          : 'flex h-10 items-center gap-3 rounded-lg px-3 text-[var(--muted)] opacity-65'
      }
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-5 py-6">
        <div className="flex items-center gap-3 px-2">
          <img alt="" className="h-8 w-8" src={logoUrl} />
          <div>
            <div className="text-lg font-bold leading-tight">Керамика</div>
            <div className="text-xs text-[var(--muted)]">Учёт продаж и остатков</div>
          </div>
        </div>

        <nav aria-label="Основная навигация" className="mt-10 space-y-1 text-sm">
          <NavigationItem
            icon={<BarChart3 aria-hidden size={18} strokeWidth={1.75} />}
            label="Обзор"
          />
          <NavigationItem
            icon={<MapPin aria-hidden size={18} strokeWidth={1.75} />}
            label="Торговые точки"
          />
          <NavigationItem
            icon={<FileText aria-hidden size={18} strokeWidth={1.75} />}
            label="Отчёты"
          />
          <NavigationItem
            active
            icon={<PackageOpen aria-hidden size={18} strokeWidth={1.75} />}
            label="Штучки"
          />
        </nav>

        <div className="mt-auto px-2 text-xs leading-relaxed text-[var(--muted)]">
          Данные хранятся только на этом компьютере
        </div>
      </aside>
      <main className="min-h-screen pl-64">
        <div className="mx-auto max-w-6xl px-12 py-12">{children}</div>
      </main>
    </div>
  );
}
