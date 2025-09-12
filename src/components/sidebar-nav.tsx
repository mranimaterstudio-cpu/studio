'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Cuboid, History, ScanSearch, Wand, Bot, Film } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { href: '/image-generation', label: 'Video Generation', icon: Film },
  { href: '/video-generation', label: 'Visual Explanation', icon: Wand },
  { href: '/3d-visual-explanation', label: '3D Visual Explanation', icon: Cuboid },
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
