import type { WireframeNode } from '../../../../stores/wireframeStore'

export interface ComponentTemplate {
    id: string
    name: string
    category: 'mobile' | 'desktop' | 'common'
    subcategory: string
    icon: string  // Lucide icon name
    description: string
    defaultWidth: number
    defaultHeight: number
    nodes: Omit<WireframeNode, 'id'>[]  // Pre-configured nodes (id will be generated)
}

// Helper to create a rectangle node
const rect = (x: number, y: number, w: number, h: number, opts: Partial<WireframeNode> = {}): Omit<WireframeNode, 'id'> => ({
    type: 'rect',
    name: opts.name || 'Rectangle',
    x, y, width: w, height: h,
    rotation: 0, opacity: 1, visible: true, locked: false,
    fill: opts.fill || '#e5e5e5',
    stroke: opts.stroke || '#333',
    strokeWidth: opts.strokeWidth || 2,
    borderRadius: opts.borderRadius || 0,
    children: [],
    ...opts,
})

// Helper to create a text node
const text = (x: number, y: number, content: string, opts: Partial<WireframeNode> = {}): Omit<WireframeNode, 'id'> => ({
    type: 'text',
    name: opts.name || 'Text',
    x, y, width: opts.width || 100, height: opts.height || 24,
    rotation: 0, opacity: 1, visible: true, locked: false,
    text: content,
    fontSize: opts.fontSize || 14,
    fill: opts.fill || '#333',
    children: [],
    ...opts,
})

// Helper to create a circle node
const circle = (x: number, y: number, size: number, opts: Partial<WireframeNode> = {}): Omit<WireframeNode, 'id'> => ({
    type: 'circle',
    name: opts.name || 'Circle',
    x, y, width: size, height: size,
    rotation: 0, opacity: 1, visible: true, locked: false,
    fill: opts.fill || '#e5e5e5',
    stroke: opts.stroke || '#333',
    strokeWidth: opts.strokeWidth || 2,
    children: [],
    ...opts,
})

// Helper to create a line node
const line = (x: number, y: number, length: number, opts: Partial<WireframeNode> = {}): Omit<WireframeNode, 'id'> => ({
    type: 'line',
    name: opts.name || 'Line',
    x, y, width: length, height: 2,
    rotation: 0, opacity: 1, visible: true, locked: false,
    stroke: opts.stroke || '#333',
    strokeWidth: opts.strokeWidth || 2,
    points: [0, 0, length, 0],
    children: [],
    ...opts,
})

// ==========================================
// MOBILE COMPONENTS
// ==========================================

export const mobileComponents: ComponentTemplate[] = [
    // Navigation
    {
        id: 'mobile-status-bar',
        name: 'Status Bar',
        category: 'mobile',
        subcategory: 'Navigation',
        icon: 'Signal',
        description: 'iOS/Android status bar with time, signal, battery',
        defaultWidth: 375,
        defaultHeight: 44,
        nodes: [
            rect(0, 0, 375, 44, { name: 'Status Bar BG', fill: '#f5f5f5' }),
            text(165, 12, '9:41', { name: 'Time', fontSize: 14, width: 45 }),
            rect(320, 15, 24, 12, { name: 'Battery', borderRadius: 3 }),
            rect(295, 17, 16, 8, { name: 'Signal', borderRadius: 2 }),
        ]
    },
    {
        id: 'mobile-header',
        name: 'Header / Nav Bar',
        category: 'mobile',
        subcategory: 'Navigation',
        icon: 'Menu',
        description: 'Top navigation bar with title and back button',
        defaultWidth: 375,
        defaultHeight: 56,
        nodes: [
            rect(0, 0, 375, 56, { name: 'Header BG', fill: '#f5f5f5' }),
            text(16, 18, '←', { name: 'Back', fontSize: 20, width: 30 }),
            text(140, 18, 'Page Title', { name: 'Title', fontSize: 18, width: 100 }),
            text(335, 18, '⋮', { name: 'Menu', fontSize: 20, width: 30 }),
        ]
    },
    {
        id: 'mobile-tab-bar',
        name: 'Tab Bar',
        category: 'mobile',
        subcategory: 'Navigation',
        icon: 'LayoutGrid',
        description: 'Bottom tab navigation (5 tabs)',
        defaultWidth: 375,
        defaultHeight: 83,
        nodes: [
            rect(0, 0, 375, 83, { name: 'Tab Bar BG', fill: '#fafafa' }),
            // Tab icons (circles as placeholders)
            circle(22, 12, 24, { name: 'Tab 1 Icon' }),
            text(10, 42, 'Home', { name: 'Tab 1 Label', fontSize: 10, width: 55 }),
            circle(97, 12, 24, { name: 'Tab 2 Icon' }),
            text(85, 42, 'Search', { name: 'Tab 2 Label', fontSize: 10, width: 55 }),
            circle(172, 12, 24, { name: 'Tab 3 Icon' }),
            text(160, 42, 'Add', { name: 'Tab 3 Label', fontSize: 10, width: 55 }),
            circle(247, 12, 24, { name: 'Tab 4 Icon' }),
            text(235, 42, 'Inbox', { name: 'Tab 4 Label', fontSize: 10, width: 55 }),
            circle(322, 12, 24, { name: 'Tab 5 Icon' }),
            text(310, 42, 'Profile', { name: 'Tab 5 Label', fontSize: 10, width: 55 }),
        ]
    },
    // Forms
    {
        id: 'mobile-text-input',
        name: 'Text Input',
        category: 'mobile',
        subcategory: 'Forms',
        icon: 'TextCursor',
        description: 'Single line text input field',
        defaultWidth: 343,
        defaultHeight: 48,
        nodes: [
            rect(0, 0, 343, 48, { name: 'Input BG', borderRadius: 8, fill: '#fff' }),
            text(16, 14, 'Placeholder text...', { name: 'Placeholder', fill: '#999', width: 200 }),
        ]
    },
    {
        id: 'mobile-button',
        name: 'Button',
        category: 'mobile',
        subcategory: 'Forms',
        icon: 'Square',
        description: 'Primary action button',
        defaultWidth: 343,
        defaultHeight: 48,
        nodes: [
            rect(0, 0, 343, 48, { name: 'Button BG', borderRadius: 8, fill: '#333' }),
            text(140, 14, 'Button', { name: 'Button Label', fill: '#fff', fontSize: 16, width: 70 }),
        ]
    },
    {
        id: 'mobile-checkbox',
        name: 'Checkbox',
        category: 'mobile',
        subcategory: 'Forms',
        icon: 'CheckSquare',
        description: 'Checkbox with label',
        defaultWidth: 200,
        defaultHeight: 24,
        nodes: [
            rect(0, 2, 20, 20, { name: 'Checkbox', borderRadius: 4 }),
            text(30, 2, 'Checkbox label', { name: 'Label', width: 150 }),
        ]
    },
    {
        id: 'mobile-toggle',
        name: 'Toggle Switch',
        category: 'mobile',
        subcategory: 'Forms',
        icon: 'ToggleRight',
        description: 'On/off toggle switch',
        defaultWidth: 51,
        defaultHeight: 31,
        nodes: [
            rect(0, 0, 51, 31, { name: 'Toggle Track', borderRadius: 16, fill: '#34c759' }),
            circle(22, 2, 27, { name: 'Toggle Thumb', fill: '#fff' }),
        ]
    },
    // Lists
    {
        id: 'mobile-list-item',
        name: 'List Item',
        category: 'mobile',
        subcategory: 'Lists',
        icon: 'List',
        description: 'Single list item with avatar and chevron',
        defaultWidth: 375,
        defaultHeight: 64,
        nodes: [
            rect(0, 0, 375, 64, { name: 'Item BG', fill: '#fff' }),
            circle(16, 12, 40, { name: 'Avatar' }),
            text(72, 14, 'Title', { name: 'Title', fontSize: 16, width: 200 }),
            text(72, 36, 'Subtitle text here', { name: 'Subtitle', fontSize: 13, fill: '#666', width: 200 }),
            text(345, 22, '›', { name: 'Chevron', fontSize: 20, width: 20 }),
            line(16, 63, 343, { name: 'Divider', stroke: '#eee' }),
        ]
    },
    {
        id: 'mobile-card',
        name: 'Card',
        category: 'mobile',
        subcategory: 'Lists',
        icon: 'CreditCard',
        description: 'Content card with image and text',
        defaultWidth: 343,
        defaultHeight: 280,
        nodes: [
            rect(0, 0, 343, 280, { name: 'Card BG', borderRadius: 12, fill: '#fff' }),
            rect(0, 0, 343, 180, { name: 'Image Placeholder', fill: '#ddd', borderRadius: 12 }),
            text(16, 196, 'Card Title', { name: 'Title', fontSize: 18, width: 300 }),
            text(16, 224, 'Card description text goes here...', { name: 'Description', fontSize: 14, fill: '#666', width: 300 }),
        ]
    },
    // Modals
    {
        id: 'mobile-alert',
        name: 'Alert Dialog',
        category: 'mobile',
        subcategory: 'Modals',
        icon: 'AlertCircle',
        description: 'Alert modal with buttons',
        defaultWidth: 270,
        defaultHeight: 142,
        nodes: [
            rect(0, 0, 270, 142, { name: 'Alert BG', borderRadius: 14, fill: '#fff' }),
            text(80, 20, 'Alert Title', { name: 'Title', fontSize: 17, width: 120 }),
            text(35, 50, 'This is the alert message text.', { name: 'Message', fontSize: 13, fill: '#666', width: 200 }),
            line(0, 98, 270, { name: 'Divider H', stroke: '#ddd' }),
            line(135, 98, 0, { name: 'Divider V', stroke: '#ddd' }),
            text(45, 110, 'Cancel', { name: 'Cancel', fontSize: 17, fill: '#007aff', width: 60 }),
            text(175, 110, 'OK', { name: 'OK', fontSize: 17, fill: '#007aff', width: 30 }),
        ]
    },
    {
        id: 'mobile-bottom-sheet',
        name: 'Bottom Sheet',
        category: 'mobile',
        subcategory: 'Modals',
        icon: 'PanelBottomOpen',
        description: 'Bottom sheet with handle',
        defaultWidth: 375,
        defaultHeight: 300,
        nodes: [
            rect(0, 0, 375, 300, { name: 'Sheet BG', borderRadius: 16, fill: '#fff' }),
            rect(158, 8, 60, 5, { name: 'Handle', borderRadius: 3, fill: '#ddd' }),
            text(16, 40, 'Sheet Title', { name: 'Title', fontSize: 18, width: 200 }),
        ]
    },
    // New Mobile Components
    {
        id: 'mobile-keyboard',
        name: 'Keyboard (QWERTY)',
        category: 'mobile',
        subcategory: 'Forms',
        icon: 'Keyboard',
        description: 'On-screen QWERTY keyboard',
        defaultWidth: 375,
        defaultHeight: 216,
        nodes: [
            rect(0, 0, 375, 216, { name: 'Keyboard BG', fill: '#d1d5db' }),
            // Row 1
            ...['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((k, i) =>
                rect(3 + i * 37, 6, 34, 42, { name: `Key ${k}`, borderRadius: 4, fill: '#fff' })
            ),
            // Row 2
            ...['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((k, i) =>
                rect(22 + i * 37, 56, 34, 42, { name: `Key ${k}`, borderRadius: 4, fill: '#fff' })
            ),
            // Row 3
            rect(3, 106, 48, 42, { name: 'Shift', borderRadius: 4, fill: '#adb5bd' }),
            ...['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((k, i) =>
                rect(59 + i * 37, 106, 34, 42, { name: `Key ${k}`, borderRadius: 4, fill: '#fff' })
            ),
            rect(324, 106, 48, 42, { name: 'Backspace', borderRadius: 4, fill: '#adb5bd' }),
            // Row 4
            rect(3, 160, 90, 42, { name: '123', borderRadius: 4, fill: '#adb5bd' }),
            rect(100, 160, 175, 42, { name: 'Space', borderRadius: 4, fill: '#fff' }),
            rect(282, 160, 90, 42, { name: 'Return', borderRadius: 4, fill: '#adb5bd' }),
        ]
    },
    {
        id: 'mobile-fab',
        name: 'Floating Action Button',
        category: 'mobile',
        subcategory: 'Navigation',
        icon: 'PlusCircle',
        description: 'Material Design FAB',
        defaultWidth: 56,
        defaultHeight: 56,
        nodes: [
            circle(0, 0, 56, { name: 'FAB BG', fill: '#3b82f6', stroke: 'transparent' }),
            text(13, 10, '+', { name: 'Icon', fontSize: 36, fill: '#fff', width: 30 }),
        ]
    },
    {
        id: 'mobile-segmented-control',
        name: 'Segmented Control',
        category: 'mobile',
        subcategory: 'Forms',
        icon: 'ToggleLeft',
        description: 'Segmented toggle switch',
        defaultWidth: 300,
        defaultHeight: 32,
        nodes: [
            rect(0, 0, 300, 32, { name: 'Control BG', borderRadius: 8, fill: '#e5e7eb' }),
            rect(2, 2, 148, 28, { name: 'Selected Segment', borderRadius: 6, fill: '#fff', stroke: '#e5e7eb' }),
            text(0, 6, 'Option 1', { name: 'Option 1', fontSize: 13, width: 150, fill: '#000' }),
            text(150, 6, 'Option 2', { name: 'Option 2', fontSize: 13, width: 150, fill: '#6b7280' }),
        ]
    },
    {
        id: 'mobile-slider',
        name: 'Slider',
        category: 'mobile',
        subcategory: 'Forms',
        icon: 'Sliders',
        description: 'Range slider',
        defaultWidth: 280,
        defaultHeight: 24,
        nodes: [
            line(0, 12, 280, { name: 'Track', stroke: '#e5e7eb', strokeWidth: 4 }),
            line(0, 12, 140, { name: 'Filled Track', stroke: '#3b82f6', strokeWidth: 4 }),
            circle(128, 0, 24, { name: 'Thumb', fill: '#fff', stroke: '#e5e5e5', strokeWidth: 1 }),
        ]
    },
    {
        id: 'mobile-toast',
        name: 'Toast / Snackbar',
        category: 'mobile',
        subcategory: 'Modals',
        icon: 'MoreHorizontal',
        description: 'Temporary notification',
        defaultWidth: 343,
        defaultHeight: 48,
        nodes: [
            rect(0, 0, 343, 48, { name: 'Toast BG', borderRadius: 8, fill: '#333' }),
            text(16, 14, 'Action successful', { name: 'Message', fontSize: 14, fill: '#fff', width: 250 }),
            text(290, 14, 'UNDO', { name: 'Action', fontSize: 14, fill: '#60a5fa', width: 50 }),
        ]
    },
    {
        id: 'mobile-numpad',
        name: 'Numpad',
        category: 'mobile',
        subcategory: 'Forms',
        icon: 'Calculator',
        description: 'Numeric keypad',
        defaultWidth: 375,
        defaultHeight: 250,
        nodes: [
            rect(0, 0, 375, 250, { name: 'BG', fill: '#f5f5f5' }),
            // Row 1
            rect(0, 0, 125, 62, { name: 'Key 1', fill: '#fff', stroke: '#eee' }), text(62, 21, '1', { fontSize: 24, width: 20 }),
            rect(125, 0, 125, 62, { name: 'Key 2', fill: '#fff', stroke: '#eee' }), text(187, 21, '2', { fontSize: 24, width: 20 }),
            rect(250, 0, 125, 62, { name: 'Key 3', fill: '#fff', stroke: '#eee' }), text(312, 21, '3', { fontSize: 24, width: 20 }),
            // Row 2
            rect(0, 62, 125, 62, { name: 'Key 4', fill: '#fff', stroke: '#eee' }), text(62, 83, '4', { fontSize: 24, width: 20 }),
            rect(125, 62, 125, 62, { name: 'Key 5', fill: '#fff', stroke: '#eee' }), text(187, 83, '5', { fontSize: 24, width: 20 }),
            rect(250, 62, 125, 62, { name: 'Key 6', fill: '#fff', stroke: '#eee' }), text(312, 83, '6', { fontSize: 24, width: 20 }),
            // Row 3
            rect(0, 124, 125, 62, { name: 'Key 7', fill: '#fff', stroke: '#eee' }), text(62, 145, '7', { fontSize: 24, width: 20 }),
            rect(125, 124, 125, 62, { name: 'Key 8', fill: '#fff', stroke: '#eee' }), text(187, 145, '8', { fontSize: 24, width: 20 }),
            rect(250, 124, 125, 62, { name: 'Key 9', fill: '#fff', stroke: '#eee' }), text(312, 145, '9', { fontSize: 24, width: 20 }),
            // Row 4
            rect(0, 186, 125, 62, { name: 'Key .', fill: '#e5e5e5', stroke: '#eee' }), text(62, 207, '.', { fontSize: 24, width: 20 }),
            rect(125, 186, 125, 62, { name: 'Key 0', fill: '#fff', stroke: '#eee' }), text(187, 207, '0', { fontSize: 24, width: 20 }),
            rect(250, 186, 125, 62, { name: 'Key Del', fill: '#e5e5e5', stroke: '#eee' }), text(312, 207, '⌫', { fontSize: 24, width: 20 }),
            line(0, 0, 375, { name: 'Top Border', stroke: '#ddd' }),
        ]
    },
    {
        id: 'mobile-date-picker',
        name: 'Date Picker',
        category: 'mobile',
        subcategory: 'Forms',
        icon: 'Calendar',
        description: 'Scrollable date picker',
        defaultWidth: 375,
        defaultHeight: 216,
        nodes: [
            rect(0, 0, 375, 216, { name: 'Picker BG', fill: '#fff' }),
            // Selection overlay
            rect(0, 90, 375, 36, { name: 'Selection', fill: '#f5f5f5', opacity: 0.5 }),
            line(0, 90, 375, { name: 'Top Line', stroke: '#ddd' }),
            line(0, 126, 375, { name: 'Bottom Line', stroke: '#ddd' }),
            // Month
            text(40, 60, 'September', { name: 'Month Prev', fill: '#bbb', fontSize: 16, width: 100 }),
            text(40, 98, 'October', { name: 'Month Selected', fill: '#000', fontSize: 18, width: 100 }),
            text(40, 136, 'November', { name: 'Month Next', fill: '#bbb', fontSize: 16, width: 100 }),
            // Day
            text(180, 60, '03', { name: 'Day Prev', fill: '#bbb', fontSize: 16, width: 40 }),
            text(180, 98, '04', { name: 'Day Selected', fill: '#000', fontSize: 18, width: 40 }),
            text(180, 136, '05', { name: 'Day Next', fill: '#bbb', fontSize: 16, width: 40 }),
            // Year
            text(280, 60, '2023', { name: 'Year Prev', fill: '#bbb', fontSize: 16, width: 60 }),
            text(280, 98, '2024', { name: 'Year Selected', fill: '#000', fontSize: 18, width: 60 }),
            text(280, 136, '2025', { name: 'Year Next', fill: '#bbb', fontSize: 16, width: 60 }),
        ]
    },
]

// ==========================================
// DESKTOP COMPONENTS
// ==========================================

export const desktopComponents: ComponentTemplate[] = [
    // Navigation
    {
        id: 'desktop-top-nav',
        name: 'Top Navigation',
        category: 'desktop',
        subcategory: 'Navigation',
        icon: 'Menu',
        description: 'Horizontal navigation bar',
        defaultWidth: 1200,
        defaultHeight: 64,
        nodes: [
            rect(0, 0, 1200, 64, { name: 'Nav BG', fill: '#fff' }),
            rect(32, 16, 120, 32, { name: 'Logo', borderRadius: 4, fill: '#333' }),
            text(200, 22, 'Home', { name: 'Nav 1', width: 50 }),
            text(270, 22, 'Products', { name: 'Nav 2', width: 70 }),
            text(360, 22, 'About', { name: 'Nav 3', width: 50 }),
            text(430, 22, 'Contact', { name: 'Nav 4', width: 60 }),
            rect(1050, 16, 100, 32, { name: 'CTA Button', borderRadius: 6, fill: '#333' }),
            text(1070, 22, 'Sign Up', { name: 'CTA Label', fill: '#fff', width: 60 }),
        ]
    },
    {
        id: 'desktop-sidebar',
        name: 'Sidebar',
        category: 'desktop',
        subcategory: 'Navigation',
        icon: 'PanelLeft',
        description: 'Vertical sidebar navigation',
        defaultWidth: 240,
        defaultHeight: 600,
        nodes: [
            rect(0, 0, 240, 600, { name: 'Sidebar BG', fill: '#f5f5f5' }),
            rect(16, 16, 48, 48, { name: 'Logo', borderRadius: 8, fill: '#333' }),
            text(80, 32, 'App Name', { name: 'App Name', fontSize: 16, width: 140 }),
            line(16, 80, 208, { name: 'Divider', stroke: '#ddd' }),
            // Nav items
            rect(8, 96, 224, 40, { name: 'Nav Item 1 BG', borderRadius: 6, fill: '#e0e0e0' }),
            text(48, 106, 'Dashboard', { name: 'Nav 1', width: 160 }),
            text(48, 150, 'Analytics', { name: 'Nav 2', width: 160 }),
            text(48, 190, 'Projects', { name: 'Nav 3', width: 160 }),
            text(48, 230, 'Settings', { name: 'Nav 4', width: 160 }),
        ]
    },
    {
        id: 'desktop-breadcrumb',
        name: 'Breadcrumb',
        category: 'desktop',
        subcategory: 'Navigation',
        icon: 'ChevronRight',
        description: 'Breadcrumb navigation path',
        defaultWidth: 400,
        defaultHeight: 24,
        nodes: [
            text(0, 0, 'Home', { name: 'Crumb 1', fill: '#666', width: 50 }),
            text(50, 0, '/', { name: 'Sep 1', fill: '#999', width: 15 }),
            text(70, 0, 'Products', { name: 'Crumb 2', fill: '#666', width: 70 }),
            text(140, 0, '/', { name: 'Sep 2', fill: '#999', width: 15 }),
            text(160, 0, 'Current Page', { name: 'Crumb 3', fill: '#333', width: 100 }),
        ]
    },
    // Forms
    {
        id: 'desktop-text-input',
        name: 'Text Input',
        category: 'desktop',
        subcategory: 'Forms',
        icon: 'TextCursor',
        description: 'Text input field with label',
        defaultWidth: 320,
        defaultHeight: 68,
        nodes: [
            text(0, 0, 'Label', { name: 'Label', fontSize: 14, width: 100 }),
            rect(0, 24, 320, 40, { name: 'Input BG', borderRadius: 6, fill: '#fff' }),
            text(12, 36, 'Placeholder...', { name: 'Placeholder', fill: '#999', width: 200 }),
        ]
    },
    {
        id: 'desktop-dropdown',
        name: 'Dropdown Select',
        category: 'desktop',
        subcategory: 'Forms',
        icon: 'ChevronDown',
        description: 'Dropdown select field',
        defaultWidth: 320,
        defaultHeight: 68,
        nodes: [
            text(0, 0, 'Label', { name: 'Label', fontSize: 14, width: 100 }),
            rect(0, 24, 320, 40, { name: 'Select BG', borderRadius: 6, fill: '#fff' }),
            text(12, 36, 'Select option...', { name: 'Placeholder', fill: '#999', width: 200 }),
            text(290, 36, '▼', { name: 'Arrow', fontSize: 12, width: 20 }),
        ]
    },
    {
        id: 'desktop-search',
        name: 'Search Bar',
        category: 'desktop',
        subcategory: 'Forms',
        icon: 'Search',
        description: 'Search input with icon',
        defaultWidth: 400,
        defaultHeight: 44,
        nodes: [
            rect(0, 0, 400, 44, { name: 'Search BG', borderRadius: 22, fill: '#f5f5f5' }),
            text(20, 12, '🔍', { name: 'Icon', fontSize: 16, width: 24 }),
            text(50, 12, 'Search...', { name: 'Placeholder', fill: '#999', width: 300 }),
        ]
    },
    // Cards
    {
        id: 'desktop-product-card',
        name: 'Product Card',
        category: 'desktop',
        subcategory: 'Cards',
        icon: 'ShoppingBag',
        description: 'E-commerce product card',
        defaultWidth: 280,
        defaultHeight: 380,
        nodes: [
            rect(0, 0, 280, 380, { name: 'Card BG', borderRadius: 12, fill: '#fff' }),
            rect(0, 0, 280, 240, { name: 'Image', borderRadius: 12, fill: '#ddd' }),
            text(16, 256, 'Product Name', { name: 'Title', fontSize: 16, width: 240 }),
            text(16, 284, 'Short description here', { name: 'Description', fontSize: 13, fill: '#666', width: 240 }),
            text(16, 320, '$99.00', { name: 'Price', fontSize: 18, width: 80 }),
            rect(16, 340, 248, 36, { name: 'Button', borderRadius: 6, fill: '#333' }),
            text(95, 348, 'Add to Cart', { name: 'Button Label', fill: '#fff', width: 100 }),
        ]
    },
    {
        id: 'desktop-stats-card',
        name: 'Stats Card',
        category: 'desktop',
        subcategory: 'Cards',
        icon: 'TrendingUp',
        description: 'Dashboard statistics card',
        defaultWidth: 240,
        defaultHeight: 120,
        nodes: [
            rect(0, 0, 240, 120, { name: 'Card BG', borderRadius: 12, fill: '#fff' }),
            text(20, 20, 'Total Users', { name: 'Label', fontSize: 13, fill: '#666', width: 100 }),
            text(20, 50, '12,345', { name: 'Value', fontSize: 28, width: 150 }),
            text(20, 90, '↑ 12% from last month', { name: 'Change', fontSize: 12, fill: '#22c55e', width: 180 }),
        ]
    },
    {
        id: 'desktop-user-card',
        name: 'User Card',
        category: 'desktop',
        subcategory: 'Cards',
        icon: 'User',
        description: 'User profile card',
        defaultWidth: 320,
        defaultHeight: 100,
        nodes: [
            rect(0, 0, 320, 100, { name: 'Card BG', borderRadius: 12, fill: '#fff' }),
            circle(16, 18, 64, { name: 'Avatar' }),
            text(100, 24, 'User Name', { name: 'Name', fontSize: 16, width: 200 }),
            text(100, 50, 'user@email.com', { name: 'Email', fontSize: 13, fill: '#666', width: 200 }),
            text(100, 72, 'Admin', { name: 'Role', fontSize: 12, fill: '#999', width: 100 }),
        ]
    },
    // Tables
    {
        id: 'desktop-table-header',
        name: 'Table Header',
        category: 'desktop',
        subcategory: 'Tables',
        icon: 'Table',
        description: 'Table header row',
        defaultWidth: 800,
        defaultHeight: 48,
        nodes: [
            rect(0, 0, 800, 48, { name: 'Header BG', fill: '#f5f5f5' }),
            text(16, 14, 'Name', { name: 'Col 1', fontSize: 13, width: 180 }),
            text(216, 14, 'Email', { name: 'Col 2', fontSize: 13, width: 200 }),
            text(436, 14, 'Status', { name: 'Col 3', fontSize: 13, width: 100 }),
            text(556, 14, 'Date', { name: 'Col 4', fontSize: 13, width: 120 }),
            text(696, 14, 'Actions', { name: 'Col 5', fontSize: 13, width: 80 }),
        ]
    },
    {
        id: 'desktop-table-row',
        name: 'Table Row',
        category: 'desktop',
        subcategory: 'Tables',
        icon: 'Rows3',
        description: 'Table data row',
        defaultWidth: 800,
        defaultHeight: 56,
        nodes: [
            rect(0, 0, 800, 56, { name: 'Row BG', fill: '#fff' }),
            circle(16, 12, 32, { name: 'Avatar' }),
            text(60, 18, 'John Doe', { name: 'Name', width: 140 }),
            text(216, 18, 'john@email.com', { name: 'Email', fill: '#666', width: 200 }),
            rect(436, 16, 60, 24, { name: 'Status Badge', borderRadius: 12, fill: '#dcfce7' }),
            text(448, 20, 'Active', { name: 'Status', fontSize: 12, fill: '#16a34a', width: 40 }),
            text(556, 18, 'Jan 1, 2024', { name: 'Date', fill: '#666', width: 120 }),
            text(716, 18, '•••', { name: 'Actions', width: 40 }),
            line(0, 55, 800, { name: 'Divider', stroke: '#eee' }),
        ]
    },
    {
        id: 'desktop-pagination',
        name: 'Pagination',
        category: 'desktop',
        subcategory: 'Tables',
        icon: 'ArrowLeftRight',
        description: 'Pagination controls',
        defaultWidth: 400,
        defaultHeight: 40,
        nodes: [
            rect(0, 0, 36, 36, { name: 'Prev', borderRadius: 6, fill: '#f5f5f5' }),
            text(12, 8, '←', { name: 'Prev Icon', width: 20 }),
            rect(44, 0, 36, 36, { name: 'Page 1', borderRadius: 6, fill: '#333' }),
            text(56, 8, '1', { name: 'Page 1 Num', fill: '#fff', width: 20 }),
            rect(88, 0, 36, 36, { name: 'Page 2', borderRadius: 6, fill: '#f5f5f5' }),
            text(100, 8, '2', { name: 'Page 2 Num', width: 20 }),
            rect(132, 0, 36, 36, { name: 'Page 3', borderRadius: 6, fill: '#f5f5f5' }),
            text(144, 8, '3', { name: 'Page 3 Num', width: 20 }),
            rect(176, 0, 36, 36, { name: 'Next', borderRadius: 6, fill: '#f5f5f5' }),
            text(188, 8, '→', { name: 'Next Icon', width: 20 }),
        ]
    },
    // New Desktop Components
    {
        id: 'desktop-tabs',
        name: 'Tabs (Horizontal)',
        category: 'desktop',
        subcategory: 'Navigation',
        icon: 'LayoutGrid',
        description: 'Tabbed navigation content',
        defaultWidth: 600,
        defaultHeight: 48,
        nodes: [
            rect(0, 0, 600, 48, { name: 'Tab Bar BG', fill: '#f5f5f5' }),
            rect(0, 0, 150, 48, { name: 'Active Tab', fill: '#fff' }),
            line(0, 0, 600, { name: 'Border Bottom', stroke: '#e5e7eb', y: 48 }),
            text(40, 16, 'Tab 1', { name: 'Tab 1', width: 70, fill: '#000' }),
            text(190, 16, 'Tab 2', { name: 'Tab 2', width: 70, fill: '#666' }),
            text(340, 16, 'Tab 3', { name: 'Tab 3', width: 70, fill: '#666' }),
            text(490, 16, 'Tab 4', { name: 'Tab 4', width: 70, fill: '#666' }),
            line(0, 48, 150, { name: 'Active Indicator', stroke: '#3b82f6', strokeWidth: 3 }),
        ]
    },
    {
        id: 'desktop-accordion',
        name: 'Accordion',
        category: 'desktop',
        subcategory: 'Navigation',
        icon: 'ListTree',
        description: 'Collapsible content sections',
        defaultWidth: 400,
        defaultHeight: 200,
        nodes: [
            // Item 1 (Expanded)
            rect(0, 0, 400, 40, { name: 'Header 1', fill: '#f5f5f5', borderRadius: 4 }),
            text(10, 12, '▼  Section 1 Title', { name: 'Title 1', width: 300 }),
            rect(0, 40, 400, 80, { name: 'Content 1', fill: '#fff', stroke: '#e5e7eb' }),
            text(16, 56, 'Content for section 1 goes here...', { name: 'Text 1', fill: '#666', width: 360 }),
            // Item 2 (Collapsed)
            rect(0, 130, 400, 40, { name: 'Header 2', fill: '#f5f5f5', borderRadius: 4 }),
            text(10, 142, '▶  Section 2 Title', { name: 'Title 2', width: 300 }),
            // Item 3 (Collapsed)
            rect(0, 175, 400, 40, { name: 'Header 3', fill: '#f5f5f5', borderRadius: 4 }),
            text(10, 187, '▶  Section 3 Title', { name: 'Title 3', width: 300 }),
        ]
    },
    {
        id: 'desktop-tooltip',
        name: 'Tooltip',
        category: 'desktop',
        subcategory: 'Modals',
        icon: 'MousePointerClick',
        description: 'Info popup on hover',
        defaultWidth: 120,
        defaultHeight: 32,
        nodes: [
            rect(0, 0, 120, 32, { name: 'Tooltip BG', fill: '#1f2937', borderRadius: 4 }),
            text(10, 8, 'Tooltip text', { name: 'Text', fill: '#fff', fontSize: 12, width: 100 }),
            // Arrow (simulated with small square rotated? or just omitted for simplicity of wireframe)
            // Konva doesn't do rotation of rect easily in this template system without transforming points.
            // Using a small rect at bottom center
            rect(55, 28, 10, 10, { name: 'Arrow', fill: '#1f2937' }), // Needs rotation 45deg to look real, but square is okay for wireframe
        ]
    },
    {
        id: 'desktop-progress-bar',
        name: 'Progress Bar',
        category: 'desktop',
        subcategory: 'Forms',
        icon: 'Sliders',
        description: 'Linear progress indicator',
        defaultWidth: 300,
        defaultHeight: 8,
        nodes: [
            rect(0, 0, 300, 8, { name: 'Track', fill: '#e5e7eb', borderRadius: 4 }),
            rect(0, 0, 180, 8, { name: 'Progress', fill: '#3b82f6', borderRadius: 4 }),
        ]
    },
    {
        id: 'desktop-tree-view',
        name: 'Tree View',
        category: 'desktop',
        subcategory: 'Navigation',
        icon: 'FolderTree', // Need to make sure FolderTree is imported? Using ListTree from import
        description: 'Hierarchical list interface',
        defaultWidth: 250,
        defaultHeight: 200,
        nodes: [
            text(0, 0, '▼ 📂 Project Alpha', { name: 'Root', width: 200 }),
            text(20, 30, '▶ 📂 src', { name: 'Folder 1', width: 180 }),
            text(20, 60, '▼ 📂 public', { name: 'Folder 2', width: 180 }),
            text(40, 90, '📄 index.html', { name: 'File 1', width: 180, fill: '#666' }),
            text(40, 120, '📄 robots.txt', { name: 'File 2', width: 180, fill: '#666' }),
            text(20, 150, '📄 package.json', { name: 'File 3', width: 200 }),
        ]
    },
]

// ==========================================
// COMMON COMPONENTS (Works for both)
// ==========================================

export const commonComponents: ComponentTemplate[] = [
    {
        id: 'common-placeholder-image',
        name: 'Image Placeholder',
        category: 'common',
        subcategory: 'Media',
        icon: 'Image',
        description: 'Placeholder for images',
        defaultWidth: 200,
        defaultHeight: 150,
        nodes: [
            rect(0, 0, 200, 150, { name: 'Image BG', fill: '#ddd', borderRadius: 8 }),
            text(60, 65, '🖼️ Image', { name: 'Label', fill: '#666', width: 80 }),
        ]
    },
    {
        id: 'common-avatar',
        name: 'Avatar',
        category: 'common',
        subcategory: 'Media',
        icon: 'User',
        description: 'User avatar placeholder',
        defaultWidth: 48,
        defaultHeight: 48,
        nodes: [
            circle(0, 0, 48, { name: 'Avatar' }),
        ]
    },
    {
        id: 'common-icon-placeholder',
        name: 'Icon Placeholder',
        category: 'common',
        subcategory: 'Media',
        icon: 'Smile',
        description: 'Placeholder for icons',
        defaultWidth: 24,
        defaultHeight: 24,
        nodes: [
            circle(0, 0, 24, { name: 'Icon' }),
        ]
    },
    {
        id: 'common-divider',
        name: 'Divider',
        category: 'common',
        subcategory: 'Layout',
        icon: 'Minus',
        description: 'Horizontal divider line',
        defaultWidth: 200,
        defaultHeight: 1,
        nodes: [
            line(0, 0, 200, { name: 'Divider', stroke: '#ddd' }),
        ]
    },
    {
        id: 'common-text-block',
        name: 'Text Block',
        category: 'common',
        subcategory: 'Content',
        icon: 'AlignLeft',
        description: 'Paragraph text placeholder',
        defaultWidth: 300,
        defaultHeight: 60,
        nodes: [
            rect(0, 0, 300, 12, { name: 'Line 1', fill: '#ddd', borderRadius: 4 }),
            rect(0, 20, 280, 12, { name: 'Line 2', fill: '#ddd', borderRadius: 4 }),
            rect(0, 40, 200, 12, { name: 'Line 3', fill: '#ddd', borderRadius: 4 }),
        ]
    },
    {
        id: 'common-heading',
        name: 'Heading',
        category: 'common',
        subcategory: 'Content',
        icon: 'Heading',
        description: 'Large heading text',
        defaultWidth: 300,
        defaultHeight: 32,
        nodes: [
            text(0, 0, 'Heading Text', { name: 'Heading', fontSize: 24, width: 300, height: 32 }),
        ]
    },
    // New Common Components
    {
        id: 'common-bar-chart',
        name: 'Bar Chart',
        category: 'common',
        subcategory: 'Data Viz',
        icon: 'BarChart3',
        description: 'Simple bar chart',
        defaultWidth: 300,
        defaultHeight: 200,
        nodes: [
            line(20, 180, 280, { name: 'X Axis', strokeWidth: 1 }),
            line(20, 20, 20, { name: 'Y Axis', height: 160, strokeWidth: 1, points: [0, 0, 0, 160] }),
            rect(40, 80, 40, 100, { name: 'Bar 1', fill: '#3b82f6' }),
            rect(100, 40, 40, 140, { name: 'Bar 2', fill: '#8b5cf6' }),
            rect(160, 100, 40, 80, { name: 'Bar 3', fill: '#10b981' }),
            rect(220, 60, 40, 120, { name: 'Bar 4', fill: '#f59e0b' }),
        ]
    },
    {
        id: 'common-pie-chart',
        name: 'Pie Chart',
        category: 'common',
        subcategory: 'Data Viz',
        icon: 'PieChart',
        description: 'Pie chart placeholder',
        defaultWidth: 200,
        defaultHeight: 200,
        nodes: [
            circle(0, 0, 200, { name: 'Pie BG', fill: '#e5e7eb', stroke: '#fff', strokeWidth: 2 }),
            line(100, 100, 100, { name: 'Line 1', points: [0, 0, 0, -100], stroke: '#fff', strokeWidth: 2 }),
            line(100, 100, 100, { name: 'Line 2', points: [0, 0, 86, 50], stroke: '#fff', strokeWidth: 2 }),
            line(100, 100, 100, { name: 'Line 3', points: [0, 0, -86, 50], stroke: '#fff', strokeWidth: 2 }),
        ]
    },
    {
        id: 'common-video-player',
        name: 'Video Player',
        category: 'common',
        subcategory: 'Media',
        icon: 'Video',
        description: 'Video player with controls',
        defaultWidth: 400,
        defaultHeight: 225,
        nodes: [
            rect(0, 0, 400, 225, { name: 'Video BG', fill: '#000' }),
            circle(200, 112, 60, { name: 'Play Circle', fill: 'rgba(255,255,255,0.2)' }),
            text(194, 98, '▶', { name: 'Play Icon', fontSize: 30, fill: '#fff', width: 40 }),
            rect(0, 221, 400, 4, { name: 'Progress BG', fill: '#333' }),
            rect(0, 221, 150, 4, { name: 'Progress Filled', fill: '#ef4444' }),
            text(10, 195, '03:45 / 10:00', { name: 'Time', fontSize: 12, fill: '#fff', width: 100 }),
        ]
    },
]

// Export all components grouped
export const allComponents = [...mobileComponents, ...desktopComponents, ...commonComponents]

// Get components by category
export const getComponentsByCategory = (category: 'mobile' | 'desktop' | 'common') => {
    return allComponents.filter(c => c.category === category)
}

// Get unique subcategories for a category
export const getSubcategories = (category: 'mobile' | 'desktop' | 'common') => {
    const components = getComponentsByCategory(category)
    return [...new Set(components.map(c => c.subcategory))]
}

// Generate unique IDs for nodes from a template and wrap in a Group
export const generateNodesFromTemplate = (template: ComponentTemplate): WireframeNode[] => {
    const timestamp = Date.now()
    const groupId = `${template.id}_${timestamp}_group`

    // Create a group node containing all template nodes
    const groupNode: WireframeNode = {
        id: groupId,
        type: 'group',
        name: template.name,
        x: 0,
        y: 0,
        width: template.defaultWidth,
        height: template.defaultHeight,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        children: template.nodes.map((node, index) => ({
            ...node,
            id: `${template.id}_${timestamp}_${index}`,
        })) as WireframeNode[]
    }

    return [groupNode]
}
