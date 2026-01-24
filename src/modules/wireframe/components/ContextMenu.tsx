import React, { useEffect, useRef } from 'react'

export interface ContextMenuAction {
    label: string
    action: string
    shortcut?: string
    disabled?: boolean
    danger?: boolean
}

interface ContextMenuProps {
    x: number
    y: number
    actions: ContextMenuAction[]
    onAction: (action: string) => void
    onClose: () => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, actions, onAction, onClose }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [onClose])

    if (actions.length === 0) return null

    return (
        <div
            ref={ref}
            className="fixed z-50 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[200px] py-1"
            style={{
                left: x,
                top: y,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
            }}
        >
            {actions.map((item, index) => (
                <button
                    key={index}
                    onClick={() => {
                        if (!item.disabled) {
                            onAction(item.action)
                            onClose()
                        }
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between
                        ${item.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'hover:bg-white/5 cursor-pointer text-gray-200'}
                        ${item.danger ? 'text-red-400 hover:text-red-300' : ''}
                    `}
                    disabled={item.disabled}
                >
                    <span>{item.label}</span>
                    {item.shortcut && (
                        <span className="text-xs text-gray-500 ml-4 font-mono">{item.shortcut}</span>
                    )}
                </button>
            ))}
        </div>
    )
}
