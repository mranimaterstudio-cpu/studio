'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Cuboid, History, ScanSearch, Wand, Bot } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { href: '/visual-explanation', label: 'Visual Explanation', icon: Wand },
  { href: '/3d-visual-experience', label: '3D Visual Experience', icon: Cuboid },
  { href: '/image-analysis', label: 'Image Analysis', icon: ScanSearch },
  { href: '/history', label: 'History', icon: History },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
            className="data-[active=true]:shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
            suppressHydrationWarning
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
