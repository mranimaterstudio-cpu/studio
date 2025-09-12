'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { MessageSquare, ImageIcon, History, Bot } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/chat', label: 'Chatbot', icon: MessageSquare },
  { href: '/image-generation', label: 'Image Generation', icon: ImageIcon },
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
