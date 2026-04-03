import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface ShellProps {
  sidebar: React.ReactNode
  appName?: string
  children: React.ReactNode
}

export function Shell({ sidebar, appName = 'App', children }: ShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_minmax(0,1fr)] bg-background">
      <aside className="hidden md:block border-r border-border bg-card">
        <div className="sticky top-0 h-screen overflow-y-auto p-4">
          {sidebar}
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setIsSidebarOpen(false)}>
          <aside
            className="w-72 h-full bg-card border-r border-border p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-sm">{appName}</span>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="min-w-0">
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary/60 transition-colors"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <span className="font-semibold text-sm">{appName}</span>
        </div>
        {children}
      </main>
    </div>
  )
}
