# PRD: Crafthink (Vibe Context Hub)

> **Version:** 1.0
> **Author:** Muhamad Qobala Ihromie
> **Created:** 3 Januari 2026
> **Updated:** 4 Januari 2026
> **Status:** 🟢 **LIVE**
> **URL:** [crafthink.vercel.app](https://crafthink.vercel.app)

---

## 1. Overview

**Crafthink** adalah personal productivity tool untuk UI/UX designer yang melakukan vibe coding dengan AI. Tool ini membantu create structured context (PRD, flowchart, wireframe) sebelum dan selama development, sehingga kolaborasi dengan AI menjadi lebih terarah dan konsisten.

### 1.1 One-Liner
> "Dari ide liar ke context terstruktur dalam hitungan menit"

### 1.2 Product Vision
Menjadi "second brain" untuk vibe coding workflow, di mana setiap project memiliki dokumentasi yang hidup dan selalu siap di-share ke AI assistant.

### 1.5 Value Proposition

**The Core Promise**
> "15 menit setup = AI yang 10x lebih efektif"

Crafthink mengubah chaos vibe coding menjadi workflow terstruktur yang tetap cepat.

#### Value Proposition Canvas

| Customer Jobs | Pains | Gains |
| :--- | :--- | :--- |
| Merealisasikan ide dengan AI | AI output tidak konsisten | Konsistensi antar session |
| Build MVP cepat | Scope creep tak terkendali | Scope terjaga dengan "parking lot" |
| Dokumentasi project | Tools existing terlalu complex | 15 menit untuk full context |
| Handoff ke AI assistant | Context hilang tiap session | One-click context bundle |

#### Value per Persona

**For Designers:**
*   **BEFORE:** "Ide di kepala" → AI guess → Inkonsisten → Frustrasi
*   **AFTER:** Wireframe + Flow → Clear context → Consistent output → Ship faster

**For Product Managers:**
*   **BEFORE:** PRD di Notion → Copy-paste manual → Kehilangan context
*   **AFTER:** Integrated PRD + visuals → One-click export → AI langsung paham

#### Key Differentiators

| What We Do | Why It Matters |
| :--- | :--- |
| **Unified workspace** (PRD + Flow + Wireframe) | Tidak perlu switch tools |
| **AI-optimized output** | Format yang AI mudah consume |
| **Scope Lock feature** | Mencegah fitur liar |
| **< 15 min workflow** | Low friction = actually used |
| **Lo-fi aesthetic** | Encourage iteration, not perfectionism |

#### The "Aha Moment"
Saat user paste context bundle ke AI dan langsung dapat output yang nyambung dengan project sebelumnya.

#### Product Philosophy: "Meet Users Where They Are"
Tidak masalah user datang dengan apa – kita bantu ekstrak dan struktur:

| User Comes With | We Help By |
| :--- | :--- |
| 💡 Ide mentah (belum jelas) | Extract structure dari brain dump |
| 📝 Problem jelas (belum ada solusi) | Sharpen & validate approach |
| 🎯 Solution ready (sudah tahu mau apa) | Format untuk AI consumption |

**Two Input Paths:**
1.  **Guided Form (Sudah Tahu)**: Fill step-by-step → Template generates PRD
2.  **Freeform Brain Dump (Belum Tersusun) ✨**: Tulis bebas → AI extracts structure → User validates

---

## 2. Problem Statement

### 2.1 Current Pain Points

| Pain Point | Impact |
| :--- | :--- |
| Langsung coding tanpa dokumentasi | Fitur berkembang liar tanpa arah |
| AI tidak punya context lengkap | Output inkonsisten antar session |
| Tidak ada tracking scope | Scope creep tidak terkontrol |
| Wireframe/flowchart terpisah dari PRD | Context terfragmentasi |
| Tools existing terlalu complex | Overhead tinggi, jarang dipakai |

### 2.2 Root Cause
Tidak ada tool yang cukup simple untuk quick documentation tapi cukup structured untuk jadi AI context yang efektif.

### 2.3 Opportunity
Tool yang memaksa minimal structure (5-15 menit input) tapi generate maximum value (comprehensive AI context).

---

## 3. Target Users

**Core Audience:** Non-Software Engineers yang Vibe Coding.
Tool ini ditargetkan untuk profesional non-engineering yang ingin merealisasikan ide mereka dengan bantuan AI coding tools, tanpa background programming formal.

### Persona 1: "The Designer Builder"

| Attribute | Description |
| :--- | :--- |
| **Role** | UI/UX Designer |
| **Background** | Visual design, tidak ada formal coding education |
| **Tools** | Figma, Antigravity/Cursor, ChatGPT/Claude |
| **Motivation** | Mau merealisasikan design sendiri tanpa tunggu engineer |
| **Behavior** | Visual thinker, suka eksperimen, skip documentation |
| **Frustration** | Ide berkembang liar, AI output inkonsisten |
| **Goal** | Ship working prototype yang polished |

> 💬 "Saya bisa design, sekarang saya mau build sendiri dengan AI"

### Persona 2: "The Product Maker"

| Attribute | Description |
| :--- | :--- |
| **Role** | Product Manager |
| **Background** | Business/product strategy, minimal technical |
| **Tools** | Notion, Miro, AI coding assistants |
| **Motivation** | Validate ideas cepat tanpa dependency ke engineering team |
| **Behavior** | Structured thinker, documentation-oriented tapi mau cepat |
| **Frustration** | Gap antara PRD dan actual implementation |
| **Goal** | From PRD to working MVP dalam days, bukan weeks |

> 💬 "Saya tahu mau build apa, tapi butuh bantuan translate ke context yang AI mengerti"

### Shared Characteristics
*   ✅ **Non-engineer**: Tidak punya CS degree atau formal coding training
*   ✅ **AI-powered**: Leverage AI tools untuk coding
*   ✅ **Idea-rich**: Banyak ide, sedikit waktu
*   ✅ **Speed-focused**: Mau iterate cepat
*   ❌ **Documentation-averse**: Cenderung skip docs karena "overhead"

### What They Need
*   **Guided structure** → Dipaksa minimal documentation
*   **Visual tools** → Flowchart & wireframe, bukan text-only
*   **AI-ready output** → Format yang optimal untuk AI consumption
*   **Low learning curve** → Familiar patterns, no coding required

---

## 4. Goals & Success Metrics

### 4.1 Goals
*   **G1**: Reduce time dari ide → structured context menjadi < 15 menit
*   **G2**: Setiap project punya PRD + flowchart + wireframe terintegrasi
*   **G3**: AI context yang dihasilkan meningkatkan konsistensi output AI

### 4.2 Success Metrics (MVP)
| Metric | Target |
| :--- | :--- |
| Time to create full context bundle | < 15 menit |
| Adoption rate (personal use) | Daily/weekly usage |
| Context bundle effectiveness | Subjective: AI output lebih konsisten |

---

## 5. Features

### 5.1 Core Features (MVP)

#### F1: Project Hub
*   Create/manage multiple projects
*   Quick switch antar project
*   Auto-save ke localStorage

#### F2: PRD Generator
| Sub-feature | Description |
| :--- | :--- |
| **Brain Dump Form** | Guided questions untuk capture ide |
| **Auto-Generate PRD** | Template-based generation dari form input |
| **Scope Lock** | Define "In Scope" vs "Parking Lot" |
| **Export** | Copy as Markdown, download .md file |

#### F3: Flowchart Editor
| Sub-feature | Description |
| :--- | :--- |
| **Drag-Drop Nodes** | Add nodes dari sidebar |
| **Node Types** | Screen, System, Database, Decision, Tech Stack, Start/End |
| **Connections** | Arrow connections dengan labels |
| **Auto-Layout** | One-click organize layout |
| **Export** | PNG image + JSON structure |

#### F4: Wireframe Builder (Infinite Canvas) ✅
| Sub-feature | Status | Description |
| :--- | :--- | :--- |
| **Infinite Canvas** | ✅ | Pan/Zoom, multi-artboard view |
| **Artboard Presets** | ✅ | Mobile (iPhone 14 Pro, SE, Android) & Desktop (1440, 1920, MacBook) |
| **Artboard Duplication** | ✅ | Cmd+D to duplicate artboard |
| **White Background** | ✅ | Clean white artboards |
| **Shapes** | ✅ | Rectangle, Circle, Line, Arrow |
| **UI Elements** | ✅ | Button, Input, Card, Text |
| **Styling** | ✅ | Color picker, stroke, opacity |
| **Auto Text Description** | ✅ | Generate text description for AI context |
| **Export** | 🔄 | PNG per artboard (in progress) |

#### F5: Context Bundle
| Sub-feature | Description |
| :--- | :--- |
| **Generate Bundle** | Combine PRD + Flowchart + Wireframes |
| **Wireframe Descriptions** | Include text descriptions for each wireframe |
| **File Structure Template** | Auto-suggest folder structure based on tech stack |
| **Copy to Clipboard** | One-click copy untuk paste ke AI |
| **Download ZIP** | All assets dalam satu file |

### 5.2 Nice-to-Have (Post-MVP)
*   AI-assisted PRD writing (OpenRouter integration)
*   Database Schema Field - Text-based schema outline di PRD form
*   Tech Stack Library - Predefined dropdown untuk tech selection
*   Real-time collaboration
*   Figma plugin untuk import designs
*   Version history per project
*   Templates library
*   Cloud sync (Supabase)

### 5.3 Out of Scope (Parking Lot)
*   ❌ Full design tool features (gradients, effects, prototyping)
*   ❌ Code generation dari wireframe
*   ❌ Mobile app version
*   ❌ Team management / permissions
*   ❌ Integration dengan issue trackers (Jira, Linear)

---

## 6. User Stories

### Epic 1: Project Management
*   **US-1.1**: Sebagai user, saya bisa create project baru dengan nama
*   **US-1.2**: Sebagai user, saya bisa melihat list semua project saya
*   **US-1.3**: Sebagai user, saya bisa switch antar project dengan cepat
*   **US-1.4**: Sebagai user, saya bisa delete project yang tidak diperlukan

### Epic 2: PRD Creation
*   **US-2.1**: Sebagai user, saya bisa mengisi form braindump dengan guided questions
*   **US-2.2**: Sebagai user, saya bisa define core features (max 5)
*   **US-2.3**: Sebagai user, saya bisa define out-of-scope items
*   **US-2.4**: Sebagai user, saya bisa generate PRD dari form input
*   **US-2.5**: Sebagai user, saya bisa edit generated PRD secara manual
*   **US-2.6**: Sebagai user, saya bisa copy PRD ke clipboard

### Epic 3: Flowchart
*   **US-3.1**: Sebagai user, saya bisa menambahkan nodes dengan drag-drop
*   **US-3.2**: Sebagai user, saya bisa menghubungkan nodes dengan arrows
*   **US-3.3**: Sebagai user, saya bisa mengedit label pada nodes
*   **US-3.4**: Sebagai user, saya bisa memilih tipe node (screen, system, dll)
*   **US-3.5**: Sebagai user, saya bisa export flowchart sebagai PNG

### Epic 4: Wireframe
*   **US-4.1**: Sebagai user, saya bisa membuat artboard baru
*   **US-4.2**: Sebagai user, saya bisa menambahkan shapes (rect, circle, text)
*   **US-4.3**: Sebagai user, saya bisa mengubah warna shape
*   **US-4.4**: Sebagai user, saya bisa resize dan move shapes
*   **US-4.5**: Sebagai user, saya bisa export artboard sebagai PNG
*   **US-4.6**: Sebagai user, saya bisa melihat auto-generated text description dari wireframe

### Epic 5: Context Bundle
*   **US-5.1**: Sebagai user, saya bisa generate context bundle dari semua modules
*   **US-5.2**: Sebagai user, saya bisa copy entire bundle ke clipboard
*   **US-5.3**: Sebagai user, saya bisa download bundle sebagai ZIP
*   **US-5.4**: Sebagai user, saya bisa melihat suggested file structure berdasarkan tech stack

---

## 7. Technical Requirements

### 7.1 Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **State** | Zustand |
| **Flowchart** | React Flow |
| **Canvas** | Konva.js |
| **Storage** | localStorage + IndexedDB |
| **Hosting** | Vercel |

### 7.2 Non-Functional Requirements
| Requirement | Target |
| :--- | :--- |
| **Load time** | < 2 seconds |
| **Offline support** | Full functionality offline |
| **Data persistence** | Auto-save setiap perubahan |
| **Browser support** | Chrome, Firefox, Safari (modern) |
| **Responsive** | Desktop-first, tablet-friendly |

### 7.3 Current Implementation Status (v1.0.0)
**Status:** 🟢 **LIVE** at [crafthink.vercel.app](https://crafthink.vercel.app)

#### Deployment Info
| Item | Value |
| :--- | :--- |
| **Hosting** | Vercel (Free Tier) |
| **URL** | https://crafthink.vercel.app |
| **Storage** | localStorage (client-side) |
| **Auto-Deploy** | Yes (on git push to main) |

#### Completed Features (as of 4 Jan 2026)
| Module | Feature | Status |
| :--- | :--- | :--- |
| **Project Hub** | Create/Switch/Auto-save | ✅ Complete |
| **PRD Generator** | Brain Dump Form + Markdown Gen | ✅ Complete |
| **Flowchart** | Nodes, Edges, Undo/Redo, Auto-Layout | ✅ Complete |
| **Wireframe** | Infinite Canvas + Presets + Duplication | ✅ Complete |
| **Context Bundle** | Generate + Copy to Clipboard + Download | ✅ Complete |
| **Deployment** | Vercel + Auto CI/CD | ✅ Complete |

#### Wireframe Keyboard Shortcuts
| Action | Windows/Linux | Mac |
| :--- | :--- | :--- |
| **Select Tool** | `V` | `V` |
| **Hand Tool** | `H` | `H` |
| **Frame Tool** | `F` | `F` |
| **Rectangle** | `R` | `R` |
| **Circle** | `O` | `O` |
| **Text** | `T` | `T` |
| **Line** | `L` | `L` |
| **Arrow** | `A` | `A` |
| **Toggle Grid** | `G` | `G` |
| **Pan Canvas** | `Space + Drag` | `Space + Drag` |
| **Duplicate Artboard** | `Ctrl + D` | `Cmd + D` |
| **Delete** | `Backspace` / `Del` | `Backspace` / `Del` |

#### Development Notes
- **Repo Structure**:
  - `src/modules/flowchart`: Flowchart logic (`@xyflow/react`).
  - `src/modules/wireframe`: Wireframe logic (`react-konva`).
  - `src/stores`: Zustand stores for global state.
- **Run Local**: `npm run dev`
- **Build**: `npm run build`
- **Deploy**: `git push origin main` (auto-deploy via Vercel)

---

## 8. Design Principles

*   **Speed over Features**: Setiap action harus fast (< 100ms response)
*   **Minimal Friction**: Reduce clicks, use smart defaults
*   **Export-First**: Semua data bisa di-export dalam format universal
*   **AI-Ready Output**: Format output optimized untuk AI consumption
*   **Sketchy Aesthetic**: Lo-fi look untuk encourage iteration (not precious)

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| Scope creep selama development | High | Strict adherence ke MVP scope |
| Learning curve React Flow/Konva | Medium | Start dengan basic features, iterate |
| localStorage limits | Low | Use IndexedDB untuk large assets |
| AI integration complexity | Medium | Make AI optional, template-first |

---

## 10. Timeline (Estimated)

| Phase | Duration | Deliverable |
| :--- | :--- | :--- |
| **Phase 1: Foundation** | Week 1 | Project setup, layout, storage |
| **Phase 2: PRD Module** | Week 1-2 | Form, generator, export |
| **Phase 3: Flowchart** | Week 2-3 | React Flow integration |
| **Phase 4: Wireframe** | Week 3-4 | Konva canvas, shapes |
| **Phase 5: Integration** | Week 4 | Bundle, polish, deploy |
| **Total** | | **~4 weeks (part-time development)** |

---

## 11. First-Run Experience

### Empty State
Saat pertama kali buka app, user melihat:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     👋 Welcome to Vibe Context Hub!                        │
│                                                             │
│     Mulai dari mana?                                        │
│                                                             │
│     ┌─────────────────────┐  ┌─────────────────────┐        │
│     │  📝 Saya sudah      │  │  💡 Saya punya ide  │        │
│     │     tahu mau apa    │  │     tapi belum jelas│        │
│     │                     │  │                     │        │
│     │  → Guided Form      │  │  → Brain Dump       │        │
│     └─────────────────────┘  └─────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Onboarding Flow
1.  Choose path (Guided/Brain Dump)
2.  Fill initial info (3-5 min)
3.  See generated PRD preview
4.  Prompt to add flowchart (optional)
5.  Prompt to add wireframe (optional)
6.  First context bundle ready!

---

## 12. Data & Storage

### Storage Strategy
| Data Type | Storage | Limit |
| :--- | :--- | :--- |
| Project metadata | localStorage | ~5MB total |
| Wireframe images | IndexedDB | ~50MB per project |
| Export cache | Temporary | Clear on export |

### Export Formats
| Format | Content | Use Case |
| :--- | :--- | :--- |
| **Markdown (.md)** | PRD + text descriptions | AI chat context |
| **JSON (.json)** | Full project structure | Backup/restore |
| **ZIP** | All assets + markdown | Complete package |
| **PNG** | Individual artboards | Visual reference |

---

## 13. Accessibility (Basic)
*   **Keyboard navigation**: Tab through all interactive elements
*   **Focus indicators**: Visible focus ring on all inputs
*   **Color contrast**: WCAG AA compliant
*   **Screen reader**: Semantic HTML, aria-labels on icons
*   **Reduced motion**: Respect prefers-reduced-motion

---

## 14. Open Questions
> 💭 Silakan tambahkan pertanyaan atau area yang perlu di-elaborate

*   **Naming**: Apakah "Vibe Context Hub" sudah final atau ada alternatif?
*   **Branding**: Warna/style seperti apa yang diinginkan?
*   **Node types**: Apakah 6 tipe node sudah cukup untuk flowchart?
*   **Wireframe components**: UI elements apa lagi yang essential?
*   **AI Integration**: Prioritas untuk MVP atau post-MVP?
*   **Collaboration**: Ada rencana sharing ke tim? Kapan?

---

## 15. Appendix

### A. Competitive Positioning

#### Market Landscape
```
HIGH COMPLEXITY
                         ↑
         ┌───────────────┼───────────────┐
         │               │               │
         │    Figma      │   Sketch      │
         │    Miro       │   Adobe XD    │
         │               │               │
  VISUAL ←───────────────┼───────────────→ TEXT-BASED
         │               │               │
         │  Excalidraw   │   Notion      │
         │  Whimsical    │   Coda        │
         │               │               │
         └───────────────┼───────────────┘
                         ↓
                   LOW COMPLEXITY
                   
         ★ VIBE CONTEXT HUB = Sweet spot:
           Visual + Low Complexity + AI-Optimized
```

#### Competitive Matrix
| Feature | Vibe Context Hub | Figma | Miro | Notion | Whimsical | Excalidraw |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PRD Generator** | ✅ Core | ❌ | ❌ | ✅ Manual | ❌ | ❌ |
| **Flowchart** | ✅ Simple | ⚠️ FigJam | ✅ Complex | ❌ | ✅ | ✅ |
| **Wireframe** | ✅ Lo-fi | ✅ Hi-fi | ❌ | ❌ | ✅ | ⚠️ |
| **AI Context Export** | ✅ Core | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Scope Lock** | ✅ Unique | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Learning Curve** | 🟢 5 min | 🟡 Hours | 🟡 Hours | 🟢 Easy | 🟢 Easy | 🟢 Easy |
| **Price** | Free | Freemium | Paid | Freemium | Paid | Free |

### B. Development Resources

**Context7 Documentation (AI-Optimized)**
Use Context7 untuk up-to-date documentation yang optimized untuk AI coding:

| Library | Context7 Link | Use For |
| :--- | :--- | :--- |
| **React Flow / Xyflow** | context7.com/xyflow | Flowchart Editor |
| **Konva.js** | context7.com/konva | Wireframe Builder |
| **Zustand** | context7.com/zustand | State management |
| **Shadcn/UI** | context7.com/shadcn-ui | UI components |

---

> **Last updated:** 4 Januari 2026
