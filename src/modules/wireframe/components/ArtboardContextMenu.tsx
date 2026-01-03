import { useState, useEffect } from 'react'

interface ContextMenuItem {
    label: string
    icon?: string
    onClick: () => void
    danger?: boolean
}

interface ArtboardContextMenuProps {
    x: number
    y: number
    artboardId: string
    artboardName: string
    onClose: () => void
    onRename: (artboardId: string, newName: string) => void
    onDuplicate: (artboardId: string) => void
    onDelete: (artboardId: string) => void
}

export function ArtboardContextMenu({
    x,
    y,
    artboardId,
    artboardName,
    onClose,
    onRename,
    onDuplicate,
    onDelete,
}: ArtboardContextMenuProps) {
    // Close on click outside
    useEffect(() => {
        const handleClickOutside = () => onClose()
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        // Delay to avoid immediate close
        setTimeout(() => {
            window.addEventListener('click', handleClickOutside)
            window.addEventListener('keydown', handleEscape)
        }, 0)

        return () => {
            window.removeEventListener('click', handleClickOutside)
            window.removeEventListener('keydown', handleEscape)
        }
    }, [onClose])

    const handleRename = () => {
        const newName = prompt('Rename Artboard:', artboardName)
        if (newName && newName.trim()) {
            onRename(artboardId, newName.trim())
        }
        onClose()
    }

    const handleDuplicate = () => {
        onDuplicate(artboardId)
        onClose()
    }

    const handleDelete = () => {
        if (confirm(`Delete "${artboardName}"?`)) {
            onDelete(artboardId)
        }
        onClose()
    }

    const items: ContextMenuItem[] = [
        { label: 'Rename', onClick: handleRename },
        { label: 'Duplicate', onClick: handleDuplicate },
        { label: 'Delete', onClick: handleDelete, danger: true },
    ]

    return (
        <div
            className="fixed z-50 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{ left: x, top: y }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={item.onClick}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#333] transition-colors
                        ${item.danger ? 'text-red-400 hover:text-red-300' : 'text-white'}`}
                >
                    {item.label}
                </button>
            ))}
        </div>
    )
}
