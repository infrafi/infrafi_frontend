'use client'

import { useState, useEffect } from 'react'

export type TabId = 'protocol' | 'user'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
  badge?: string | number
}

interface TabNavigationProps {
  tabs: Tab[]
  defaultTab?: TabId
  onTabChange?: (tabId: TabId) => void
  children: (activeTab: TabId) => React.ReactNode
}

const TAB_STORAGE_KEY = 'infrafi_active_tab'

export function TabNavigation({ tabs, defaultTab = 'protocol', onTabChange, children }: TabNavigationProps) {
  // Start with defaultTab to avoid hydration mismatch
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab)
  const [isClient, setIsClient] = useState(false)

  // Mark as client-side after mount to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
    // Load saved tab from localStorage after mount
    const savedTab = localStorage.getItem(TAB_STORAGE_KEY)
    if (savedTab && (savedTab === 'protocol' || savedTab === 'user')) {
      setActiveTab(savedTab as TabId)
    }
  }, [])

  // Save to localStorage whenever tab changes (only after client-side mounting)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(TAB_STORAGE_KEY, activeTab)
    }
  }, [activeTab, isClient])

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-1 -mb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                group inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm transition-all
                ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className={`mr-2 ${activeTab === tab.id ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                {tab.icon}
              </span>
              <span className="text-lg">{tab.label}</span>
              {tab.badge && (
                <span
                  className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {children(activeTab)}
      </div>
    </div>
  )
}

