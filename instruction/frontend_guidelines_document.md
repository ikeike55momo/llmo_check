# Frontend Guideline Document

This document outlines the frontend setup for the LLMO診断サイト. It describes the architecture, design principles, styling, component structure, state management, routing, performance strategies, testing approach, and overall summary. Everyone—from designers to new developers—should find it clear and actionable.

## 1. Frontend Architecture

**Frameworks and Libraries**
- **Next.js 14 (App Router)** with built-in support for server and client components. We leverage its file-based routing and edge-optimized rendering.
- **React** (with TypeScript) for building interactive UI components.
- **Tailwind CSS** for utility-first styling and rapid prototyping.

**How It Supports Our Goals**
- **Scalability**: Next.js scales seamlessly on Vercel. Edge Functions handle API requests close to the user, and static assets are served from the global CDN.
- **Maintainability**: TypeScript enforces types across components. The App Router’s clear file structure and Tailwind’s utility classes reduce CSS bloat.
- **Performance**: Automatic code splitting, server-side rendering (SSR) for initial load, and edge caching minimize latency. Tailwind’s Just-in-Time compiler only includes used styles.

## 2. Design Principles

1. **Usability**
   - Simple, minimal form for entering URLs.
   - Clear validation feedback (error messages under inputs).
2. **Accessibility**
   - Proper ARIA labels on form fields.
   - Keyboard-navigable components.
   - Sufficient color contrast.
3. **Responsiveness**
   - Mobile-first layout using Tailwind’s responsive utilities.
   - Fluid typography and spacing.
4. **Clarity**
   - Clean visual hierarchy: prominent input form, concise results area.
   - Japanese UI copy that’s straightforward and polite.

We apply these by:
- Using semantic HTML (`<form>`, `<label>`, `<button>`).
- Testing with screen-reader tools.
- Designing breakpoints for small/mobile, medium/tablet, and large/desktop.

## 3. Styling and Theming

**Approach**
- Utility-first with **Tailwind CSS**. No separate CSS files except for global resets.
- No complex BEM or SMACSS: Tailwind’s class names handle structure.

**Theme & Look**
- Style: Flat, modern, minimal. Slight glassmorphism touches on result cards (semi-translucent backgrounds with subtle blur).
- Consistent use of rounded corners and soft shadows for inputs and cards.

**Color Palette**
- Primary: `#4F46E5` (Indigo-600)
- Primary Light: `#A5B4FC` (Indigo-300)
- Secondary: `#10B981` (Emerald-500)
- Neutral Dark: `#111827` (Gray-900)
- Neutral Light: `#F3F4F6` (Gray-100)
- Accent/Error: `#EF4444` (Red-500)

**Fonts**
- Base: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Japanese fallback: `'Noto Sans JP', sans-serif` for clear Japanese characters.

## 4. Component Structure

**Directory Layout**
```
app/           # Next.js App Router
  ├─ layout.tsx   # Common header/meta/footer
  └─ page.tsx     # Main landing + form + results
components/    # Reusable UI pieces
  ├─ DiagnoseForm.tsx
  └─ ResultDisplay.tsx
lib/           # Utility functions & API clients
  ├─ anthropic.ts
  ├─ supabase.ts
  └─ scraper.ts
types/         # TypeScript interfaces
  └─ diagnosis.ts
api/           # Vercel Edge Function routes
  └─ diagnose/route.ts
```

**Reusability**
- Each component lives in its own file.
- Props interfaces defined in `types/` to ensure consistent usage.
- Shared UI pieces (buttons, inputs) can be added to `components/ui/` as the project grows.

**Why Component-Based?**
- Encapsulation: Styles and logic confined to each component.
- Testability: Small units are easier to test.
- Scalability: New features slot in by composing existing components.

## 5. State Management

**Approach**
- Local component state (e.g., URL input, loading status, error flags) via React `useState`.
- **SWR** (stale-while-revalidate) for data fetching: caching, revalidation, and built-in loading states.

**Sharing State**
- Global app state is minimal—no user auth or complex domain data.
- If needed, React Context can manage theme or analytics settings.

## 6. Routing and Navigation

- **File-based routing** under `app/`:
  - `/` shows the main form and results area.
- No multi-page navigation beyond the single input/response view.
- Meta tags (Open Graph, Twitter Card) injected in `layout.tsx` using Next.js `<Head>` component for SEO and social sharing.

## 7. Performance Optimization

1. **Lazy Loading**
   - Dynamically import heavy components (e.g., charts) with `next/dynamic`.
2. **Code Splitting**
   - Next.js splits bundles by route automatically.
3. **Edge Caching**
   - Static assets and SSR pages cached on Vercel’s edge nodes.
4. **Asset Optimization**
   - SVG icons and small PNGs compressed.
   - No large image dependencies.
5. **Tailwind JIT**
   - Generates only used CSS classes in production.
6. **Form Debounce**
   - Prevent excessive API calls during typing (200ms debounce).

These measures keep our initial page load under 2 seconds and maintain responsive interactions.

## 8. Testing and Quality Assurance

**Unit Tests**
- **Jest** + **React Testing Library** for component logic and rendering tests.
- Sample tests:
  - Form validation (valid and invalid URLs).
  - ResultDisplay renders AI output correctly.

**Integration Tests**
- Mock Supabase and Claude API calls to test end-to-end data flow within the frontend.

**End-to-End Tests**
- **Cypress** or **Playwright** to simulate user entering a URL, submitting, and viewing results.

**Linting & Formatting**
- **ESLint** with `eslint-plugin-react`, `eslint-plugin-jsx-a11y`.
- **Prettier** for consistent code style.

**Error Monitoring**
- Sentry SDK integrated in `_app.tsx` (or `layout.tsx`) to catch runtime errors.

## 9. Conclusion and Overall Frontend Summary

The LLMO診断サイト frontend uses Next.js 14, React, and Tailwind CSS to deliver a fast, maintainable, and accessible tool. Its component-based structure, clear design principles, and performance optimizations ensure a smooth user experience. State is managed locally with React hooks and SWR for data fetching. Routing is simple thanks to Next.js App Router. Testing spans unit, integration, and end-to-end layers, while Sentry and Google Analytics provide monitoring and insights. 

This setup aligns with our goals of speed, clarity, and cost efficiency—making it easy for marketers and content creators to get instant AI-powered diagnoses of any webpage URL.