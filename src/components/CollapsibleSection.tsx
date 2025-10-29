'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
  icon?: React.ReactNode
}

export function CollapsibleSection({ 
  title, 
  subtitle, 
  defaultOpen = true, 
  children,
  icon 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="space-y-4">
      {/* Header with toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors group"
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="p-2 bg-primary-600 rounded-lg">
              {icon}
            </div>
          )}
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
          )}
        </div>
      </button>

      {/* Collapsible content with smooth animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'max-h-[10000px] opacity-100 pointer-events-auto overflow-visible' 
            : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'
        }`}
      >
        <div className={isOpen ? 'animate-fadeIn' : ''}>
          {children}
        </div>
      </div>
    </div>
  )
}

