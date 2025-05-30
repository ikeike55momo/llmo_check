# Tech Stack Document

This document explains, in simple terms, the technologies chosen for the LLMO診断サイト project built with Vercel and Supabase. It describes how each piece fits together to create a fast, reliable, and easy-to-use web application.

## Frontend Technologies

Our user interface (what you see and interact with) is built using the following tools:

- **Next.js (React framework)**
  - Provides page-based routing and server-side rendering for fast page loads and good SEO (search engine visibility).
  - Lets us embed Open Graph and meta tags so when you share a link on social media, the preview looks nice.
  - Handles both static pages (landing page) and dynamic pages (displaying results).

- **React**
  - A popular library for building interactive UI components (like forms and result cards).
  - Manages the state of the page (for example, showing a loading spinner while the diagnosis runs).

- **TypeScript**
  - A version of JavaScript that adds simple type checks (helps catch errors early).
  - Makes the code easier to understand and maintain.

- **Tailwind CSS**
  - A utility-first styling tool that lets us write concise styles directly in our components.
  - Ensures a clean, consistent, and stylish look without creating long custom CSS files.

## Backend Technologies

The behind-the-scenes logic and data storage use these server-side tools:

- **Vercel Edge Functions**
  - Serverless JavaScript functions running at the “edge,” close to the user, for very low latency.
  - Handles API requests (when you submit a URL to diagnose) without managing traditional servers.

- **Supabase (Hosted PostgreSQL)**
  - Provides a database to store recent diagnosis results as a cache and (optionally) a history of all diagnoses.
  - Automatically manages user roles and Row Level Security (RLS) rules for safe data access.
  - Offers an easy JavaScript client (`@supabase/supabase-js`) to read and write data.

- **Anthropic Claude Sonnet 4 API**
  - The large-language-model engine that performs the actual “diagnosis” of the web page content.
  - Accessed via secure API calls and keys stored in environment variables.

- **Web Content Fetcher (built-in scraper)**
  - A small utility that fetches page HTML with `fetch()`.
  - Extracts key elements (title, meta description, headings, main text) while respecting token limits.
  - Falls back to an external service (ScrapingBee) if direct fetch fails.

## Infrastructure and Deployment

How we host, deploy, and manage versions of our code:

- **Vercel Platform**  
  - Hosts both the frontend and Edge Functions in one place, with automatic SSL (secure HTTPS).
  - Provides a built-in deployment pipeline: pushing code to Git automatically triggers a new deployment.

- **Version Control: Git & GitHub**  
  - All source code is tracked in Git repositories on GitHub (or another Git provider).
  - Enables collaboration, code reviews, and rollback to earlier versions if needed.

- **CI/CD (Continuous Integration/Continuous Deployment)**  
  - Vercel’s integration with GitHub runs tests (if any) and builds the site on every code push.
  - Ensures that the live site is always up-to-date with the `main` branch.

- **Environment Variables**  
  - Keys and URLs (Anthropic API key, Supabase URL/keys, ScrapingBee key) are stored securely.
  - Vercel and local `.env.local` files keep credentials out of the public code.

## Third-Party Integrations

We connect with several external services to add functionality without building everything from scratch:

- **Anthropic Claude API**  
  - Provides the LLM “brain” for website analysis and diagnosis.
  - Billing is usage-based; we use caching to reduce repeated calls and control costs.

- **ScrapingBee API**  
  - An optional fallback service for fetching web page content when direct fetch fails.
  - Ensures reliable HTML retrieval without heavy libraries (Puppeteer) on serverless.

- **Google Analytics**  
  - Gathers anonymized visitor statistics (page views, user behavior) to help us improve the site.

- **Sentry**  
  - Captures and reports runtime errors in both frontend and Edge Functions.
  - Helps us fix bugs quickly and maintain a smooth experience.

- **Cursor IDE (Developer Tooling)**  
  - An AI-powered code editor that offers real-time suggestions to streamline development.

## Security and Performance Considerations

To keep data safe and the app snappy, we’ve put in place:

- **Data Protection**  
  - All API keys and credentials are kept in environment variables, never hard-coded.
  - Supabase’s Row Level Security (RLS) controls who can read or write cached results.

- **Edge-side Processing**  
  - Running our functions at the edge reduces network hops, lowering response times.

- **Result Caching**  
  - Supabase cache table stores each URL’s result for 24 hours.
  - Repeat requests return instantly, saving API calls and improving speed.

- **Error Handling & Monitoring**  
  - Sentry captures errors and alerts us so we can address issues before users notice.
  - The frontend displays friendly error messages if something goes wrong.

- **Planned Rate Limiting and Anti-Abuse**  
  - While not in the MVP, we plan to add per-IP limits or CAPTCHA to prevent misuse.

## Conclusion and Overall Tech Stack Summary

By combining Next.js on Vercel with Supabase, Claude API, and supporting tools, we achieve:

- A fully serverless architecture that scales automatically with demand.
- Fast, SEO-friendly pages and social-media previews via server-side rendering in Next.js.
- Low-latency API responses through Vercel Edge Functions.
- Cost-effective caching of results in Supabase to reduce repeated LLM calls.
- Simple styling and maintainable code with Tailwind CSS and TypeScript.
- Essential analytics and error monitoring (Google Analytics, Sentry) for continuous improvement.

This stack delivers a user-friendly, performant, and secure LLMO診断サイト that meets the project’s goals while staying flexible for future enhancements such as user accounts, rate limiting, and internationalization.