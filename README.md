# 💬 Discussion Thread — Real-Time Chat & Comment System

A feature-rich, Facebook-style discussion thread built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Zustand**. Supports threaded replies, rich markdown, syntax-highlighted code blocks, emoji reactions, file attachments, @mentions with infinite scroll, and full dark mode.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Functional Features](#-functional-features)
- [Non-Functional Features](#-non-functional-features)
- [Performance Optimizations](#-performance-optimizations)
- [Testing](#-testing)
- [Tech Stack](#-tech-stack)
- [Scripts](#-scripts)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Bun** (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd <project-dir>

# Install dependencies
bun install
# or: npm install

# Start development server
bun run dev
# or: npm run dev
```

The app runs at **http://localhost:8080**.

### Build for Production

```bash
bun run build
bun run preview
```

### Run Tests

```bash
bun run test
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Chat/                  # Core chat components
│   │   ├── ChatContainer.tsx  # Main container with infinite scroll
│   │   ├── Comment.tsx        # Individual comment with reactions, editing, replies
│   │   ├── CommentForm.tsx    # Comment input with formatting & file upload
│   │   ├── CommentList.tsx    # Renders a list of comments
│   │   ├── EmojiPicker.tsx    # Emoji picker (portal-based)
│   │   ├── FileUpload.tsx     # Drag-and-drop file upload with preview
│   │   ├── FormattingToolbar.tsx # Bold/italic/code/strike/link toolbar
│   │   ├── ReplyThread.tsx    # Threaded reply expand/collapse
│   │   ├── RichTextRenderer.tsx # Markdown + syntax highlighting renderer
│   │   ├── richTextParser.ts  # Legacy regex parser (kept for tests)
│   │   ├── TypingIndicator.tsx # Animated typing dots
│   │   ├── UserAvatar.tsx     # Initial-based colored avatar
│   │   └── UserMention.tsx    # @mention dropdown with infinite scroll
│   ├── CustomUI/              # Custom UI primitives
│   └── ui/                    # shadcn/ui components
├── data/
│   └── mockData.ts            # 300 users, 500 comments generator
├── hooks/
│   ├── useComments.ts         # Comment CRUD operations
│   ├── useEmojiReactions.ts   # Reaction toggle logic
│   ├── useFileUpload.ts       # File validation & preview
│   └── useUserMentions.ts     # Mention detection & filtering
├── services/
│   └── fileService.ts         # File attachment creation & validation
├── store/
│   └── chatStore.ts           # Zustand store with persistence
├── test/                      # Comprehensive test suite
│   ├── components/            # Component unit tests
│   ├── hooks/                 # Hook tests
│   ├── integration/           # End-to-end flow tests
│   ├── services/              # Service tests
│   ├── store/                 # Store tests
│   └── utils/                 # Utility function tests
├── types/                     # TypeScript interfaces
└── utils/                     # Pure utility functions
```

---

## ✅ Functional Features

### Comments & Threads
- **Create, edit, delete** comments with ownership checks
- **Nested reply threads** up to 3 levels deep
- **Expand/collapse** threads and reply visibility
- **Character counter** with configurable max length (500 default)
- **Auto-scroll** to new comments after posting

### Rich Text & Markdown
- Full **GitHub Flavored Markdown** (GFM) via `react-markdown` + `remark-gfm`
- **Headers** (h1–h3), **lists** (ordered/unordered), **blockquotes**
- **Bold**, *italic*, `inline code`, ~~strikethrough~~
- **Links** with target=_blank
- **Tables** with styled borders
- **Task lists** (checkboxes)
- **Horizontal rules**

### Code Syntax Highlighting
- Powered by **highlight.js** with tree-shaken language imports
- Supported languages: JavaScript, TypeScript, Python, CSS, HTML/XML, JSON, Bash/Shell, SQL
- Fenced code blocks with language detection (` ```js `, ` ```python `, etc.)
- GitHub Dark theme for code blocks

### Emoji Reactions
- **6 quick reactions**: 👍 ❤️ 😂 😮 😢 🔥
- Toggle reactions on/off per user
- **Reactors modal** showing who reacted with each emoji
- Reaction count badges on comments

### File Attachments
- **Drag-and-drop** file upload via `react-dropzone`
- **Image preview thumbnails** (inline in comments)
- **PDF & document** attachment links
- File validation: max 5MB, allowed types (JPEG, PNG, GIF, WebP, PDF)
- File size display with human-readable formatting

### @User Mentions
- **300+ mock users** with auto-generated profiles
- **Debounced search** (200ms) across username and display name
- **Infinite scroll** in mention dropdown (10 per page)
- Real-time result count display ("10 of 300")
- Mention notifications via toast

### Formatting Toolbar
- Visual buttons for Bold, Italic, Code, Strikethrough, Link
- **Keyboard shortcuts**: Ctrl+B, Ctrl+I, Ctrl+E, Ctrl+K, Ctrl+Shift+X
- Works with text selection (wraps selected text)

### Additional UI
- **Typing indicator** with animated dots (simulated)
- **Comment reporting** for non-owned comments
- **Reset to sample data** button
- **Keyboard shortcut** Ctrl+/ to focus comment input

---

## 🔒 Non-Functional Features

### Accessibility (a11y)
- ARIA roles: `region`, `feed`, `article`, `toolbar`, `menu`, `menuitem`, `list`
- ARIA labels on all interactive elements
- Keyboard navigation support throughout
- Focus management for modals and dropdowns
- Semantic HTML structure

### Responsiveness
- Fully responsive layout (max-width 2xl container)
- Mobile-friendly comment forms and dropdowns
- Scrollable areas with thin custom scrollbars
- Adaptive emoji picker positioning

### Dark Mode
- Complete dark mode theme via CSS custom properties
- All components use semantic design tokens (no hardcoded colors)
- Smooth theme transitions

### Data Persistence
- **Zustand persist middleware** saves comments & attachments to `localStorage`
- Survives page refreshes
- Reset capability to restore mock data

### Type Safety
- Full **TypeScript** strict mode
- Typed interfaces for Comment, User, Attachment
- Type-safe Zustand store with generics

### Security
- `rel="noopener noreferrer"` on all external links
- `target="_blank"` safety on links
- File type and size validation before upload
- Ownership checks on edit/delete operations

---

## ⚡ Performance Optimizations

### Rendering
| Optimization | Description |
|---|---|
| **Infinite scroll (comments)** | Only renders 20 root comments initially, loads more on scroll |
| **Infinite scroll (mentions)** | @mention dropdown loads 10 users at a time, loads more on scroll |
| **Image lazy loading** | All images use `loading="lazy"` (both markdown-rendered and attachment images) |
| **Debounced mention search** | 200ms debounce prevents excessive filtering on rapid typing |
| **Memoized computations** | `useMemo` for filtered user lists, reaction totals, and visible comment slices |
| **Callback memoization** | `useCallback` for scroll handlers and file operations |
| **Portal-based modals** | Emoji picker and reactors modal render via `createPortal` to avoid layout thrashing |

### Bundle Size
| Optimization | Description |
|---|---|
| **Tree-shaken highlight.js** | Only 8 language grammars imported instead of full 190+ language bundle |
| **Manual chunk splitting** | Vite config splits vendors into separate cached chunks: `vendor-react`, `vendor-ui`, `vendor-markdown`, `vendor-highlight`, `vendor-zustand` |
| **ESNext build target** | Skips unnecessary transpilation for modern browsers |
| **esbuild minification** | Fastest minifier for production builds |

### Data
| Optimization | Description |
|---|---|
| **Seeded random generator** | Deterministic mock data generation (no re-randomization on reload) |
| **Record-based lookups** | Comments and users stored as `Record<string, T>` for O(1) access by ID |
| **Selective persistence** | Only `comments` and `attachments` are persisted (not transient UI state) |
| **Auto-expand on new comment** | New comments immediately expand `visibleCount` to avoid invisible posts |

---

## 🧪 Testing

### Test Suite Overview

**108 tests** across **16 test files**, covering unit, integration, and component tests.

```bash
# Run all tests
bun run test

# Run with coverage
bunx vitest run --coverage
```

### Unit Tests
| Area | File | Tests |
|---|---|---|
| Date formatting | `dateUtils.test.ts` | 5 |
| File validation & sizing | `fileUtils.test.ts` | 14 |
| Mention parsing & rendering | `textUtils.test.ts` | 11 |
| Rich text parsing | `RichTextRenderer.test.ts` | 10 |
| File service | `fileService.test.ts` | 5 |
| Chat store (CRUD, reactions) | `chatStore.test.ts` | 18 |
| useComments hook | `useComments.test.ts` | 4 |
| useFileUpload hook | `useFileUpload.test.ts` | 7 |
| useEmojiReactions hook | `useEmojiReactions.test.ts` | 2 |
| useUserMentions hook | `useUserMentions.test.ts` | 5 |
| UserAvatar component | `UserAvatar.test.tsx` | 5 |
| TypingIndicator component | `TypingIndicator.test.tsx` | 3 |
| FormattingToolbar component | `FormattingToolbar.test.tsx` | 5 |
| CommentList component | `CommentList.test.tsx` | 3 |

### Integration Tests
| Flow | Tests |
|---|---|
| Comment submission lifecycle (create → edit → react → delete) | 3 |
| Reply thread nesting & deletion | 2 |
| User mention detection & storage | 1 |
| Data persistence across operations | 3 |
| File attachment process | 1 |

### Test Setup
- **Vitest** with jsdom environment
- **React Testing Library** for component tests
- **Date.now mocking** for deterministic ID generation
- Tests located in `src/test/` organized by category

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand (with persist middleware) |
| Markdown | react-markdown + remark-gfm |
| Syntax Highlighting | highlight.js (tree-shaken) |
| File Upload | react-dropzone |
| Routing | React Router v6 |
| Build Tool | Vite 5 (SWC) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint 9 |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server on port 8080 |
| `bun run build` | Production build with optimized chunks |
| `bun run build:dev` | Development build |
| `bun run preview` | Preview production build locally |
| `bun run lint` | Run ESLint |
| `bun run test` | Run test suite (108 tests) |
