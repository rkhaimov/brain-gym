import { Link, useLocation, useMatches } from '@tanstack/react-router';
import type { CSSProperties, PropsWithChildren } from 'react';

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

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
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
                <Link to="/products">
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
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === '/products'}
                    tooltip="Штучки"
                  >
                    <Link to="/products">
                      <CeramicProductIcon />
                      <span>Штучки</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-2 px-6">
            <CeramicProductIcon className="size-5" />
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
