# Implementation plan

## Phase 1: Environment Setup

1. Step 1: Prevalidation — Check if current directory contains a Next.js project (`package.json` and `next.config.js`). If it does, skip initialization; otherwise proceed to Step 2. (PRD Section 1.1)
2. Step 2: Ensure Node.js v20.2.1 is installed. If not, install exactly Node.js v20.2.1.  
   **Validation**: Run `node -v` and confirm output is `v20.2.1`. (Tech Stack: Core Tools)
3. Step 3: Initialize git repository if none exists: `git init` in project root.  
   **Validation**: Confirm `.git` directory is created. (Tech Stack: Core Tools)
4. Step 4: Create a `.cursor/` directory in project root if it doesn’t exist. (Tech Stack: IDE: Cursor)
5. Step 5: Create `cursor_metrics.md` in project root. Add a note at top: “Refer to `cursor_project_rules.mdc` for metrics logging.” (Tech Stack: IDE: Cursor)
6. Step 6: In `.gitignore`, add entry `.cursor/mcp.json`. (Tech Stack: Supabase Integration)
7. Step 7: Create file `.cursor/mcp.json` with the following placeholder configuration:  
   macOS:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-postgres", "<connection-string>"]
       }
     }
   }
   ```
   Windows:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "cmd",
         "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-postgres", "<connection-string>"]
       }
     }
   }
   ```  
   (Tech Stack: Supabase Integration)
8. Step 8: Display the following link for the user to obtain their Supabase MCP connection string:  
   https://supabase.com/docs/guides/getting-started/mcp#connect-to-supabase-using-mcp  
   (Tech Stack: Supabase)
9. Step 9: After obtaining the connection string, replace `<connection-string>` in `.cursor/mcp.json`. (Tech Stack: Supabase Integration)
10. Step 10: In your IDE’s Cascade assistant, navigate to **Settings / MCP** and verify the Supabase server shows a green "active" status. (Tech Stack: Supabase)

## Phase 2: Frontend Development

11. Step 11: Initialize a Next.js 14 (App Router) TypeScript project in project root:  
    ```bash
    npx create-next-app@14 . --typescript --eslint --tailwind
    ```  
    **Note**: Must use Next.js 14 for best compatibility with LLM-driven IDEs. (Tech Stack: Frontend)
12. Step 12: Install Tailwind CSS dependencies (if not auto-installed):  
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```  
    (Frontend Docs: CSS Guidelines)
13. Step 13: Configure `tailwind.config.js` to scan all files under `app/` and `components/`, and add base styles in `app/globals.css`. (Frontend Docs: CSS Guidelines)
14. Step 14: Verify or create `tsconfig.json` per Next.js defaults. (Tech Stack: Frontend)
15. Step 15: In `app/layout.tsx`, add default `<Head>` metadata: title, description, Open Graph tags per PRD Section SEO requirements. (PRD Section 5.1)
16. Step 16: Create `components/DiagnoseForm.tsx` with:  
    - URL input field
    - Submit button
    - Client-side validation using regex `/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/`  
    (Q&A: Form Handling)  
    **File Path**: `/components/DiagnoseForm.tsx`  
    (PRD Section 2.1)
17. Step 17: Create `components/ResultDisplay.tsx` that accepts props `{ status: 'loading'|'success'|'error'; data?: DiagnosisResult; errorMsg?: string }` and renders accordingly with Tailwind CSS cards.  
    **File Path**: `/components/ResultDisplay.tsx`  
    (PRD Section 2.4)
18. Step 18: In `app/page.tsx`, import `DiagnoseForm` and `ResultDisplay`, manage state for loading/result/error, and wrap in main container with responsive styling. (App Flow: Step 1)
19. Step 19: Run `npm run dev` and open `http://localhost:3000` to confirm the form and empty result state load without errors.  
    **Validation**: Browser console has no errors. (App Flow: Step 1)

## Phase 3: Backend Development

20. Step 20: Create Edge Function at `app/api/diagnose/route.ts` with `export const runtime = 'edge';` and an async handler.  
    **File Path**: `/app/api/diagnose/route.ts`  
    (PRD Section 3.1)
21. Step 21: Define the PostgreSQL schema for `diagnosis_cache`:  
    ```sql
    CREATE TABLE public.diagnosis_cache (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url TEXT NOT NULL,
      result JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX ON public.diagnosis_cache(url, created_at DESC);
    ALTER TABLE public.diagnosis_cache ENABLE ROW LEVEL SECURITY;
    ```  
    (Tech Stack: Database)
22. Step 22: Use the MCP server to execute above SQL:  
    ```bash
    npx @modelcontextprotocol/server-postgres "<connection-string>" --execute "$(<schema.sql)"
    ```  
    (Tech Stack: Supabase)
23. Step 23: Install Supabase client:  
    ```bash
    npm install @supabase/supabase-js
    ```  
    (Tech Stack: Backend)
24. Step 24: Create `/lib/supabase.ts` exporting a Supabase client initialized with `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.  
    **File Path**: `/lib/supabase.ts`  
    (Backend Docs: Supabase Integration)
25. Step 25: Install Anthropic SDK:  
    ```bash
    npm install @anthropic-ai/sdk
    ```  
    (Tech Stack: AI Model)
26. Step 26: Create `/lib/anthropic.ts` exporting a function `diagnoseContent(text: string): Promise<string>` that calls Claude Sonnet 4 using `ANTHROPIC_API_KEY`.  
    **File Path**: `/lib/anthropic.ts`  
    (PRD Section 3.2)
27. Step 27: Create `/lib/scraper.ts` exporting a function `fetchHTML(url: string): Promise<string>` that attempts `fetch(url)` and falls back to ScrapingBee with `SCRAPINGBEE_KEY` if CORS error.  
    **File Path**: `/lib/scraper.ts`  
    (PRD Section 3.3)
28. Step 28: In `app/api/diagnose/route.ts`, implement logic to:  
    1. Parse `url` from request JSON.  
    2. Query `diagnosis_cache` via Supabase for a record <24h old.  
    3. If found, return cached `result`.  (PRD Section 3.1)
29. Step 29: Still in `route.ts`, if no cache hit:  
    1. Call `fetchHTML(url)` from `/lib/scraper.ts`  
    2. Extract `<title>`, `<meta name="description">`, headings, and body text via DOMParser.  
    3. Truncate combined text to remain under 12 000 tokens.  (Q&A: Token Limits)
30. Step 30: Still in `route.ts`, pass truncated text to `diagnoseContent()` from `/lib/anthropic.ts`, get `analysis`. (PRD Section 3.2)
31. Step 31: Insert `{ url, result: analysis }` into `diagnosis_cache` via Supabase client. (PRD Section 3.2)
32. Step 32: Return JSON `{ analysis }` to client with `200` status. (PRD Section 3.1)
33. Step 33: **Validation**: Run  
    ```bash
    curl -X POST http://localhost:3000/api/diagnose \
      -H 'Content-Type: application/json' \
      -d '{"url":"https://example.com"}'
    ```  
    Confirm JSON response with `analysis` field. (App Flow: Step 3)

## Phase 4: Integration

34. Step 34: Create `/src/services/api.ts` exporting `async function diagnose(url: string)` that calls `/api/diagnose` and returns parsed JSON.  
    **File Path**: `/src/services/api.ts`  
    (PRD Section 2.4)
35. Step 35: In `components/DiagnoseForm.tsx`, import `diagnose()`, call on submit, set loading state, and pass result to `ResultDisplay`.  
    (Frontend Docs: Data Fetching)
36. Step 36: In `app/page.tsx`, render `<ResultDisplay status={status} data={result} errorMsg={error} />`.  (App Flow: Step 4)
37. Step 37: **Validation**: In browser, submit a website URL and verify the AI analysis appears within the card without errors. (App Flow: Step 5)

## Phase 5: Deployment

38. Step 38: Create `vercel.json` in project root with:  
    ```json
    {
      "functions": {
        "api/diagnose/route.ts": {
          "runtime": "edge"
        }
      }
    }
    ```  
    (Tech Stack: Deployment)
39. Step 39: Commit code to a GitHub repository and push to remote origin.  
    **Validation**: Verify GitHub shows all files. (Tech Stack: CI/CD)
40. Step 40: In Vercel Dashboard, import repository and configure Environment Variables: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `SCRAPINGBEE_KEY`. (PRD Section 4.1)
41. Step 41: In Vercel project settings, set Region to `United States` or your preferred region for Edge Functions. (Tech Stack: Deployment)
42. Step 42: Configure Sentry and Google Analytics DSN/ID as additional environment variables: `SENTRY_DSN`, `NEXT_PUBLIC_GA_ID`. (Key Considerations: Analytics and Monitoring)
43. Step 43: Add a GitHub Actions workflow at `.github/workflows/ci.yml` to run `npm ci`, `npm run build`, `npm run test` on push to `main`.  
    **File Path**: `.github/workflows/ci.yml`  
    (Tech Stack: CI/CD)
44. Step 44: Enable automatic Vercel deploys on push to `main`.  
    **Validation**: Confirm a successful production deployment in Vercel. (Tech Stack: Deployment)
45. Step 45: **Validation**: Visit production URL, perform a diagnosis, and confirm end-to-end functionality. (Q&A: Pre-Launch Checklist)