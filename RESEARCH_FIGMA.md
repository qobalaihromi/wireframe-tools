# Research: Implementing Figma-Like Features (Frame, Object, Auto Layout)

## 1. Current State Analysis
We have analyzed the existing codebase to understand the gap between the current Vibe Designer and Figma's core capabilities.

### ✅ What We Have
*   **Recursive Data Structure**: `WireframeNode` already supports `children`, allowing infinite nesting (Groups/Frames).
*   **Recursive Rendering**: `NodeRenderer` correctly renders nested children using Konva `Group`.
*   **Basic Auto Layout**: A `LayoutConfig` interface exists (`vertical` | `horizontal`), and there is basic helper logic `enforceLayout` to stack items.

### ❌ What is Missing (The Gap)
1.  **True Frame Behavior (Clipping)**: currently, "Frames" are just Groups with a background rectangle. Content spilling outside the frame is visible. Figma Frames *clip* their content.
2.  **Reactive Auto Layout**: The current layout logic is "passive" (applied once on drop). Real Auto Layout needs to effectively "listen" to child changes and re-stack automatically.
3.  **Drag-to-Insert in Auto Layout**: You cannot currently drag a node *into* a specific position in an Auto Layout stack and see it snap into place (like the blue line indicator in Figma).
4.  **Resizing Constraints**: No "Left/Right/Scale/Center" constraints. Resizing a parent currently just scales or does nothing to children.

---

## 2. Technical Implementation Plan

### Feature A: True Frames (Clipping)
**Goal:** Visual parity with Figma Frames where content is contained.

**Implementation:**
In `NodeRenderer.tsx`, update the `Group` component for `frame` types to include the `clip` property.

```tsx
// NodeRenderer.tsx
<Group
    x={node.x}
    y={node.y}
    // Apply clipping only for Frames
    clipFunc={node.type === 'frame' ? (ctx) => {
        ctx.rect(0, 0, node.width, node.height);
    } : undefined}
>
    {/* ... content ... */}
</Group>
```
*   **Note:** Konva `clip` is relative to geometric origin. We need to ensure children are positioned relative to the frame's `(0,0)`.

### Feature B: Auto Layout Engine (Reactive Flexbox)
**Goal:** Children automatically stack and resize based on content.

**Implementation:**
1.  **Centralize Layout Logic**: Create a `useAutoLayout` hook or store middleware that triggers whenever:
    *   A node is added to a Frame with `layout`.
    *   A child of an Auto Layout Frame moves or resizes.
    *   The Frame itself resizes (if wrapping content).

2.  **Logic Update (`wireframeStore.ts`)**:
    Improve `enforceLayout` to handle **Alignment** and **Wrapping** (optional phase 2) more robustly.

    ```typescript
    // Pseudo-code for improved layout engine
    function calculateLayout(node: WireframeNode) {
        if (node.layout.type === 'vertical') {
             let yCursor = node.layout.padding;
             node.children.forEach(child => {
                 child.y = yCursor;
                 child.x = calculateAlignX(child, node); // align: start/center/end
                 yCursor += child.height + node.layout.gap;
             });
             // Auto-resize parent height if set to "Hug Contents"
        }
    }
    ```

3.  **Drag Interaction**:
    In `WireframeCanvas` `handleNodeDragMove`, detect if the target parent is an Auto Layout frame.
    *   **If yes**: Do not allow free XY positioning.
    *   **Instead**: Calculate the *index* based on the cursor position relative to siblings.
    *   **Visual Feedack**: Draw a Line (`<Line />`) between siblings to indicate drop position.

### Feature C: Resizing Constraints
**Goal:** Define how children behave when parent resizes (e.g., "Stick to Right", "Scale").

**Implementation:**
1.  Add `constraints` to `WireframeNode`:
    ```typescript
    interface WireframeNode {
        constraints?: {
            horizontal: 'left' | 'right' | 'center' | 'scale' | 'both';
            vertical: 'top' | 'bottom' | 'center' | 'scale' | 'both';
        }
    }
    ```
2.  Update `onResize` in `WireframeCanvas`:
    When a parent is resized, calculate the `scaleDelta` (e.g., width grew by 10%). Apply updates to children based on rules:
    *   `left`: x remains same.
    *   `right`: x moves by delta.
    *   `scale`: x and width multiply by percentage.

---

## 3. Recommended Roadmap

1.  **Phase 1: Visuals (Easy Win)**
    *   Implement `clipFunc` for Frames.
    *   Ensure Frame background renders correctly behind children.

2.  **Phase 2: The Engine (Complex)**
    *   Refactor `addNode` and `moveNode` in Store to trigger `enforceLayout`.
    *   Implement "Hug Contents" vs "Fixed" sizing flag.

3.  **Phase 3: Interaction**
    *   Implement Drag-to-Reorder inside Auto Layout.
