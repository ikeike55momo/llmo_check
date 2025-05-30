# Project Requirements Document (PRD)

## 1. Project Overview

We are building “LLMO Checker,” a lightweight web tool that analyzes any public webpage URL and returns an AI-powered diagnosis of its content. Users simply paste a URL into a form, and behind the scenes a Vercel Edge Function fetches a condensed version of that page, sends it to Anthropic’s Claude Sonnet 4 API, caches the result in Supabase, and then shows the AI’s analysis on the screen. This gives anyone—from marketers to content creators—a quick assessment of a site’s structure, metadata, headings, and overall health without logging in or installing anything.

The main goals are speed, simplicity, and cost-efficiency. We want initial response times under 15 seconds for fresh lookups (and under 2 seconds for cached results), a minimal user interface in Japanese, built-in SEO metadata (Open Graph tags), and optional analytics (Google Analytics and Sentry). Success is measured by a working MVP deployed to Vercel, handling at least 1,000 diagnoses per month on free tiers, and laying groundwork for future login, history tracking, and rate-limiting features.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (MVP)

*   URL input form with client-side validation

*   Vercel Edge Function (Next.js API) to:

    *   Check Supabase cache (24-hour TTL)
    *   Fetch HTML content with a lightweight scraper (regex-based)
    *   Call Claude Sonnet 4 API for diagnosis
    *   Store fresh results in Supabase `diagnosis_cache` table

*   Result display component with loading and error states

*   Basic SEO and Open Graph metadata on main page

*   Deployment configuration (`vercel.json`, environment variables)

*   Analytics integration: Google Analytics and Sentry

*   Environment variable management for API keys

*   Simple, stylish Japanese UI using Tailwind CSS

### Out-of-Scope (Phase 2+)

*   User accounts or login (OAuth/email)
*   User-facing diagnosis history or dashboards
*   IP-based rate limiting or abuse prevention
*   Multi-language support (Japanese only)
*   Admin roles or prompt template editing
*   GDPR banners or advanced compliance features
*   Paid subscription or usage quotas
*   Deep DOM scraping (no Puppeteer or headless browser)

## 3. User Flow

When a visitor lands on the site, they see a clean header, a brief explanation in Japanese, and a single URL input field with a “診断開始” button. The page has server-rendered SEO and Open Graph tags so it looks good when shared on social media. No login or popups appear—just a straightforward prompt: “Enter the webpage URL you want to diagnose.”

After the user enters a valid URL and clicks “診断開始,” the form switches to a loading state. The frontend sends a POST request to `/api/diagnose`. The Edge Function first checks Supabase for a cached result (from the last 24 hours). If found, it immediately returns that. Otherwise, it fetches and parses the page’s HTML, trims it to 10,000 characters, sends it to Claude Sonnet 4, caches the response, and streams the JSON back. Once the response arrives in the browser, a result card component renders the AI’s findings or an error message with retry guidance.

## 4. Core Features

*   **URL Input & Validation**\
    A React form component that only accepts properly formatted URLs and shows inline errors if invalid.

*   **Vercel Edge Function (**`/api/diagnose`**)**

    *   Checks Supabase cache table (`diagnosis_cache`, 24h TTL).
    *   Fetches HTML via `fetch` with a fallback to ScrapingBee API.
    *   Extracts key elements (title, meta description, headings, body text) via regex.
    *   Calls Anthropic Claude Sonnet 4 API (`max_tokens=4000`).
    *   Inserts new cache entries in Supabase if no hit.

*   **Result Display**\
    A component that renders the AI’s diagnosis in a styled card, with handling for loading, success, and error states.

*   **Supabase Database**

    *   `diagnosis_cache` table with row-level security (RLS).
    *   Optional `diagnosis_history` table for future tracking.

*   **SEO & Social Sharing Metadata**\
    Next.js `<Head>` includes `<title>`, `<meta name="description">`, and Open Graph tags.

*   **Analytics & Error Monitoring**\
    Google Analytics snippet and Sentry SDK on the client for usage tracking and error reporting.

*   **Deployment Configuration**\
    `vercel.json` with Edge Function timeout, and secure environment variables for API keys.

## 5. Tech Stack & Tools

*   **Frontend Framework**: Next.js 14 (App Router) with TypeScript
*   **Styling**: Tailwind CSS
*   **Serverless Functions**: Vercel Edge Functions (runtime=‘edge’)
*   **Database & Auth**: Supabase (PostgreSQL + RLS)
*   **AI Model**: Anthropic Claude Sonnet 4 API
*   **Scraping Fallback**: ScrapingBee API (if direct fetch fails)
*   **Analytics**: Google Analytics
*   **Error Monitoring**: Sentry
*   **IDE / AI Assistant**: Cursor (real-time AI suggestions)
*   **Environment Variables**: `.env.local` and Vercel dashboard

## 6. Non-Functional Requirements

*   **Performance**

    *   Cached response <2s, cold call <15s.
    *   Support at least 1,000 monthly requests on free tiers.

*   **Security**

    *   Store API keys in environment variables only.
    *   Enable Supabase Row-Level Security on all tables.
    *   Sanitize user-provided URLs to prevent SSRF.

*   **Reliability**

    *   Retry logic for fetch failures (up to 2 attempts).
    *   Fallback to ScrapingBee if direct fetch fails.

*   **Usability**

    *   Clear Japanese UI text, accessible form fields, mobile-first design.
    *   Inline validation errors and toast/snackbar for server errors.

*   **Compliance**

    *   Prepare hooks for future GDPR consent banners.
    *   IP logging in `diagnosis_history` (future).

## 7. Constraints & Assumptions

*   **Edge Function Limits**: Vercel limits ~50 MB RAM, 30s max runtime.
*   **Supabase Free Tier**: 500 MB row limit, 2 GB bandwidth.
*   **Claude API Availability**: Depends on Anthropic service uptime.
*   **Scraping**: No headless browser; regex extraction only.
*   **No Login**: Anonymous access; no user accounts in MVP.
*   **Japanese-Only UI**: No translation needed initially.

## 8. Known Issues & Potential Pitfalls

*   **Large Pages**: Fetching huge HTML may time out or exceed token limits.\
    *Mitigation*: Truncate to 10k characters and extract only key parts.

*   **API Rate Limits**

    *   Claude Sonnet 4 may throttle under heavy use.\
        *Mitigation*: Use Supabase cache aggressively, monitor usage.

*   **Edge Runtime Restrictions**

    *   Certain Node APIs or large NPM modules aren’t allowed.\
        *Mitigation*: Keep scraper code minimal—no Puppeteer.

*   **CORS & SSRF**

    *   Fetching arbitrary URLs can be blocked or abused.\
        *Mitigation*: Validate URL hostnames, block private IP ranges.

*   **SEO Metadata Management**

    *   Dynamic Open Graph tags require server-side rendering.\
        *Mitigation*: Use Next.js `generateMetadata` API in layout.

This document outlines exactly what the AI model needs to build the first version of the LLMO Checker site on Vercel + Supabase, ensuring no ambiguity in features, user flow, technical choices, or constraints.
