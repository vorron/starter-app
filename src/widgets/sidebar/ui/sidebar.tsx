'use client';

import { cn } from '@/shared/lib/utils/cn';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/shared/ui/accordion';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Sheet as AppSheet, SheetContent, SheetTitle } from '@/shared/ui/sheet';
import {
  Home,
  Users,
  Settings,
  FileText,
  BarChart3,
  Calendar,
  CreditCard,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
}

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FileText,
    children: [
      { title: 'All Projects', href: '/projects', icon: FileText },
      { title: 'Templates', href: '/projects/templates', icon: FileText },
    ],
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      { title: 'Profile', href: '/profile', icon: Users },
      { title: 'Team Settings', href: '/settings/team', icon: Settings },
      { title: 'Billing', href: '/settings/billing', icon: CreditCard },
    ],
  },
];

function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={item.title} className="border-none">
            <AccordionTrigger className={cn('py-2 hover:no-underline', level > 0 && 'pl-8')}>
              <div className="flex items-center space-x-3">
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 mt-1">
                {item.children!.map((child) => renderNavItem(child, level + 1))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
          level > 0 && 'pl-8',
          isMobile ? 'text-base' : 'text-sm'
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <div className={cn('flex h-full flex-col bg-background', !isMobile && 'w-64 border-r')}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">A</span>
          </div>
          <span className="font-semibold">App</span>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              /* close logic */
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">{navigation.map((item) => renderNavItem(item))}</nav>

      {/* User section */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User Name</p>
            <p className="text-xs text-muted-foreground truncate">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar({ open, onOpenChange }: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <AppSheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-80">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent isMobile />
        </SheetContent>
      </AppSheet>
    </>
  );
}
