# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a brand-new visitor opens the LLMO診断サイト, they arrive directly on the landing interface served by Next.js on Vercel. There is no formal sign-up or sign-in process in the initial MVP, so visitors can start using the tool immediately without creating an account. In future versions, an authentication layer will be added to allow users to register via email and password or through social login providers. When that feature is introduced, the landing page will display clear buttons for “Sign Up” and “Log In,” leading to dedicated forms for entering credentials. There will also be a “Forgot Password” link on the login form to initiate a password recovery flow via email. Until that time, all visitors remain anonymous and do not need credentials to run a diagnosis.

## Main Dashboard or Home Page

After arriving on the site, the user is greeted by a clean, stylish header that includes the site title and simple meta tags for SEO and social sharing. Below the header, the main dashboard consists of a single page layout with an input field labeled for a website URL and a button to start the diagnosis. There are no sidebars or additional navigation menus at this stage. The page integrates Google Analytics to track visitor metrics and Sentry to capture any runtime errors. As the user moves through the app, the header remains fixed at the top, while the body area updates dynamically to show loading states, results, or error notifications.

## Detailed Feature Flows and Page Transitions

When a user types or pastes a URL into the input field, the front end immediately validates the format using a regular expression. If the URL fails validation, an inline error message appears beneath the input box, prompting the user to correct the address. Once the URL passes this check and the user clicks the diagnosis button, the page enters a loading state. A spinner replaces the button text to indicate that the request is in progress.

Behind the scenes, the client code issues a POST request to the Vercel Edge Function located at `/api/diagnose`. This request contains a JSON payload with the URL. The Edge Function first queries Supabase for any cached diagnosis result created within the last 24 hours. If a matching entry is found, the function returns that cached result instantly, and the front end transitions from the loading spinner to displaying the saved report without invoking the Claude API.

If no cache entry exists or the entry is older than 24 hours, the Edge Function calls a lightweight web scraper implemented in `lib/scraper.ts`. This scraper fetches the raw HTML of the target URL, strips out scripts and styles, and extracts key elements like the page title, meta description, headings, and body text. If the built-in scraper fails due to Vercel limitations, the function falls back to an external API such as ScrapingBee. The resulting summary of up to 10,000 characters is then passed into the Anthropic Claude Sonnet 4 API.

Once the Claude API returns its analysis, the Edge Function stores the result as a JSON object in the `diagnosis_cache` table on Supabase, preserving the URL, the response payload, and the timestamp. The function then responds to the client with the diagnosis text. At that point, the front end stops the loading spinner and renders the output inside a styled result card component. The user sees the insights formatted clearly, with headings and paragraph breaks for readability.

If the user enters a new URL and repeats the process, the same sequence unfolds. Each transition from input to loading to result is handled on the single-page interface without full page reloads, giving the feel of a seamless application. The header remains visible, and the result card can be cleared or replaced by submitting a different URL.

## Settings and Account Management

In the current MVP there is no user account system, so there are no personal settings exposed to the visitor. All configuration of API keys, Supabase credentials, and scraping fallbacks is handled by environment variables in the development environment and configured securely in Vercel for deployment. In a future release, a settings page will allow authenticated users to view and modify their profile information, change notification preferences, and manage subscription billing if a paid tier is offered. That page will link back to the main diagnosis interface so users can return easily after updating their preferences.

## Error States and Alternate Paths

If the user’s URL fails client-side validation, an inline error message appears immediately and prevents the request from being sent. During the diagnosis process, if network connectivity drops or the fetch to the target site times out, the front end displays a retry prompt and an error notification powered by Sentry. When the Edge Function encounters an error calling the Claude API or inserting into Supabase, it returns an error response that the client catches and presents as a dismissible alert at the top of the page. In cases where the built-in scraper cannot retrieve content, the fallback path uses an external scraping API. If that also fails, the system falls back to sending the diagnosis prompt directly to Claude with minimal context, and the user is warned that results may be less accurate. At any point, the user can correct the URL or try again, restoring the normal flow without refreshing the browser.

## Conclusion and Overall App Journey

From start to finish, the visitor’s journey begins by landing on a single, clean page where they paste in a URL and click to diagnose. The app validates the input, enters a loading state, and either returns a cached result instantly or orchestrates scraping, LLM analysis, and caching behind the scenes. The user then sees a neatly formatted report without ever leaving the page. In the event of errors or connectivity issues, clear messages guide the user to retry or adjust their input. Looking ahead, this foundation will expand to include user authentication, personalized histories, billing settings, and advanced administration, but the core experience of instantly diagnosing any URL with LLM assistance remains the heart of the application.