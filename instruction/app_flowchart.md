flowchart TD
    A[User] --> B[Nextjs Frontend]
    B --> C[DiagnoseForm Component]
    C --> D[Vercel Edge Function API Route]
    D --> E{Cache Hit}
    E -->|Yes| F[Return Cached Result]
    E -->|No| G[Fetch Webpage Content]
    G -->|Success| H[Analyze with Claude API]
    G -->|Fail| I[ScrapingBee Fallback]
    I --> H
    H --> J[Store Result in Supabase]
    J --> K[Return Diagnosis]
    F --> K
    K --> L[ResultDisplay Component]