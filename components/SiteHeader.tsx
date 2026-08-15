'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Parser' },
  { href: '/history', label: 'Saved' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="mb-10">
      <Link href="/" className="mb-8 flex items-center justify-center gap-3">
        <img
          src="/qoty.png"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded-full"
        />
        <span className="type-brand">Qoty</span>
      </Link>
      <nav className="flex justify-center gap-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`type-button rounded-xl border px-5 py-2 ${
                active
                  ? 'border-amber-400 bg-amber-400 text-black'
                  : 'border-gray-300 text-gray-700 hover:border-amber-400'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
