'use client'

import { usePathname } from 'next/navigation'

/**
 * Forces a re-render of children whenever the pathname changes.
 */
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return <main key={pathname}>{children}</main>
}