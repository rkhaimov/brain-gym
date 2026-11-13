import { Link, useLocation, useMatches } from '@tanstack/react-router';
import { House, Store } from 'lucide-react';
import type { ComponentType, CSSProperties, PropsWithChildren } from 'react';

import logoUrl from '@/client/assets/ceramics-logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/client/components/ui/sidebar.js';

interface AppShellStyle extends CSSProperties {
  '--header-height': string;
  '--sidebar-width': string;
}

const appShellStyle: AppShellStyle = {
  '--header-height': 'calc(var(--spacing) * 12)',
  '--sidebar-width': 'calc(var(--spacing) * 72)',
};

function CeramicProductIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12.4 3.25c3.1.12 5.82 2.24 6.45 5.28.73 3.56-.78 7.4-3.8 9.41-2.72 1.81-6.48 1.56-8.9-.59-2.55-2.27-3.13-6.15-1.66-9.2 1.31-2.72 3.95-5.02 6.91-4.9Z" />
      <circle cx="12" cy="8.5" r="1.35" />
      <path d="M8.8 13.4c.9.85 2 1.3 3.3 1.3 1.35 0 2.45-.45 3.35-1.35" />
    </svg>
  );
}

interface NavigationItem {
  readonly headerIconClassName?: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly label: string;
  readonly to: '/' | '/outlets' | '/products';
}

const navigationItems: readonly NavigationItem[] = [
  { icon: House, label: 'Обзор', to: '/' },
  {
    headerIconClassName: 'size-5',
    icon: CeramicProductIcon,
    label: 'Штучки',
    to: '/products',
  },
  { icon: Store, label: 'Магазины', to: '/outlets' },
];

function NavigationIcon({
  header = false,
  item,
}: Readonly<{ header?: boolean; item: NavigationItem }>) {
  const Icon = item.icon;
  return header && item.headerIconClassName !== undefined ? (
    <Icon className={item.headerIconClassName} />
  ) : (
    <Icon />
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const currentNavigationItem = navigationItems.find((item) => item.to === location.pathname);
  const pageTitle = useMatches({
    select: (matches) =>
      matches.findLast((match) => match.staticData.pageTitle !== undefined)?.staticData.pageTitle ??
      'Керамика',
  });

  return (
    <SidebarProvider style={appShellStyle}>
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link to="/">
                  <img alt="" className="size-8" src={logoUrl} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold">Керамика</span>
                    <span className="truncate text-xs">Учёт продаж и остатков</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.to}
                      tooltip={item.label}
                    >
                      <Link to={item.to}>
                        <NavigationIcon item={item} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-2 px-6">
            {currentNavigationItem === undefined ? null : (
              <NavigationIcon header item={currentNavigationItem} />
            )}
            <h1 className="text-base font-bold">{pageTitle}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
