You are acting as a **senior software architect, application security auditor, performance engineer, UX/UI reviewer, product engineer, DevOps engineer, and technical product strategist**.

Your task is to perform a **deep, exhaustive, production-grade audit of the entire Readixon project** currently opened in the Antigravity workspace.

Readixon is a modern digital literature and content platform. Your goal is not merely to find syntax errors or obvious bugs. You must understand the project as a complete product, understand how its architecture and features work together, identify weaknesses and risks, and determine what needs to be changed to make the platform **secure, fast, reliable, scalable, maintainable, visually polished, and genuinely production-ready**.

Treat this as a **full technical and product audit performed before a major production launch**.

---

# 1. IMPORTANT OPERATING RULES

Before making any conclusions, inspect the actual project.

Do NOT rely on assumptions about how the project works.

Do NOT assume that a feature is correctly implemented simply because the UI exists.

Do NOT assume that something is secure because it appears to work.

Do NOT make recommendations based solely on generic best practices. Whenever possible, connect every finding to the actual code, configuration, architecture, dependency, database structure, API flow, or UI implementation found in the project.

You must inspect the project **holistically**, not file-by-file in isolation.

First understand:

* What the application does
* Its architecture
* Its technology stack
* Its main modules
* Authentication and authorization
* Database structure
* Data flow
* API structure
* Frontend architecture
* Backend architecture
* External services
* Payment integrations
* Storage
* File uploads
* User-generated content
* Admin functionality
* Deployment assumptions
* Environment configuration
* Security boundaries
* Performance bottlenecks
* UX/UI structure
* Responsive behavior
* Error handling
* Logging
* Monitoring
* Scalability characteristics

Then perform the detailed audit.

---

# 2. DO NOT MODIFY THE PROJECT YET

For this task, your primary objective is **analysis and reporting**.

Do not make destructive or broad code changes during the audit.

Do not rewrite architecture merely because you prefer another implementation.

Do not refactor large parts of the application before documenting the findings.

You may run safe diagnostic commands, builds, tests, linters, dependency checks, type checks, static analysis, and other non-destructive inspections when appropriate.

If you discover something that would require modification, document it clearly in the final report.

The final deliverable of this task is a **detailed Turkish Markdown audit report**.

---

# 3. FIRST: BUILD A COMPLETE UNDERSTANDING OF THE PROJECT

Before auditing individual areas, map the project.

Inspect:

* Full directory structure
* package.json / package-lock / yarn.lock / pnpm-lock if present
* Framework configuration
* TypeScript configuration
* Build configuration
* Environment configuration
* Firebase configuration
* Firestore structure and access patterns
* Authentication implementation
* API routes
* Server-side logic
* Client-side logic
* Components
* Hooks
* Utilities
* Services
* Database access layer
* Storage implementation
* Image handling
* File upload logic
* Payment systems
* Email systems
* Third-party APIs
* Admin tools
* Background jobs
* Cron tasks
* Analytics
* SEO implementation
* Metadata
* Error boundaries
* Logging
* Caching
* State management
* Routing
* Middleware
* Security rules
* Deployment configuration
* CI/CD if present
* Documentation
* Tests

Identify the architecture explicitly.

For example, determine:

* Which parts execute on the client
* Which parts execute on the server
* Which data is public
* Which data is private
* Which operations require authentication
* Which operations require elevated privileges
* Which operations interact directly with Firestore
* Which operations go through server APIs
* Which secrets exist
* Where secrets are expected to exist
* How users are identified
* How roles/permissions are enforced
* How user-generated content is stored and displayed

Do not simply describe the architecture. Evaluate whether it is appropriate for Readixon's current and future scale.

---

# 4. SECURITY AUDIT — EXTREMELY THOROUGH

Perform a comprehensive security assessment.

Look for both obvious and subtle vulnerabilities.

Audit at minimum:

## Authentication

Check:

* Authentication flow
* Session handling
* Token handling
* Authentication persistence
* Password handling if applicable
* Password reset mechanisms
* Email verification
* OAuth/social login if present
* Authentication state synchronization
* Authentication bypass possibilities
* Account takeover scenarios
* Session invalidation
* Logout behavior
* Multi-device sessions
* Sensitive actions requiring re-authentication

## Authorization

Determine whether authorization is enforced correctly.

Check:

* Role-based access
* Admin access
* Author access
* User-owned resources
* Resource ownership validation
* IDOR vulnerabilities
* Privilege escalation
* Client-side-only authorization
* Server-side authorization
* Firestore authorization rules
* API authorization
* Hidden admin routes
* Unauthorized modification/deletion of other users' data

For every authorization mechanism, ask:

> "Could a malicious user bypass this by manually constructing a request?"

## Firestore / Database Security

Inspect:

* Firestore Security Rules
* Read permissions
* Write permissions
* Update permissions
* Delete permissions
* Field-level validation
* Ownership validation
* Role validation
* Query constraints
* Abuse possibilities
* Data leakage
* Enumeration
* Cost-abuse vectors
* Unbounded reads
* Unbounded writes
* Denormalized data risks
* Missing validation

Pay particular attention to situations where the frontend may be trusted when it should not be.

## API Security

Inspect every API endpoint.

For each endpoint determine:

* Who can access it
* What input it accepts
* Whether input validation exists
* Whether authorization exists
* Whether rate limiting exists
* Whether abuse is possible
* Whether sensitive information is returned
* Whether errors leak internal information
* Whether requests can be manipulated
* Whether mass assignment is possible
* Whether parameter tampering is possible
* Whether replay/duplicate requests are possible

## Injection & XSS

Look for:

* XSS
* Stored XSS
* Reflected XSS
* DOM XSS
* HTML injection
* Markdown injection
* User-generated content injection
* Dangerous HTML rendering
* dangerouslySetInnerHTML
* Unsafe URL handling
* JavaScript URL injection
* SVG-based attacks
* Image/script injection
* CSS injection

Readixon is a user-generated-content platform, so treat **content rendering as a major security surface**.

## File & Image Upload Security

Inspect:

* Upload validation
* MIME validation
* Extension validation
* File size limits
* Image dimensions
* Malicious files
* SVG handling
* Executable file risks
* Storage permissions
* Public/private storage exposure
* Path traversal
* Filename handling
* Content-type spoofing
* Image processing
* Upload abuse
* Storage cost abuse

## Secrets & Environment Variables

Search the entire repository for:

* API keys
* Firebase credentials
* private keys
* access tokens
* service-account credentials
* secrets
* passwords
* hardcoded credentials
* accidentally exposed environment variables

Distinguish between:

* genuinely public client configuration
* credentials that must remain server-side

Do not expose actual secrets in your report. Redact sensitive values.

## Common Web Security Risks

Check for relevant risks including:

* CSRF
* SSRF
* CORS misconfiguration
* Open redirects
* Clickjacking
* CSP weaknesses
* Missing security headers
* HTTP security issues
* Cookie security
* Rate-limit weaknesses
* Brute force
* Enumeration
* Abuse automation
* Bot abuse
* Spam
* Resource exhaustion
* Denial-of-service vectors
* Race conditions
* Replay attacks

Use recognized security principles such as OWASP methodology where applicable, but base findings on the actual implementation.

---

# 5. PERFORMANCE AUDIT — FRONTEND + BACKEND + DATABASE

Perform a serious performance review.

Do not simply say "use caching" or "optimize images."

Find the actual performance risks.

Audit:

## Frontend

Check:

* JavaScript bundle size
* Dependency weight
* Code splitting
* Lazy loading
* Dynamic imports
* Image optimization
* Font loading
* Client-side rendering
* Server-side rendering
* Hydration cost
* Unnecessary re-renders
* Large component trees
* Expensive hooks
* State management
* Memoization where appropriate
* Infinite scrolling
* Virtualization
* List rendering
* Media rendering
* Video loading
* Animation performance
* Layout shifts
* Main-thread blocking
* Network waterfalls

Pay special attention to:

* home/feed
* discover pages
* literary/content pages
* profile pages
* media-heavy sections
* infinite-scroll interfaces
* admin interfaces

## Backend / Server

Check:

* API response times
* expensive operations
* repeated database requests
* N+1 patterns
* server-side rendering cost
* inefficient data transformations
* redundant API calls
* missing caching
* unnecessary computation
* concurrency risks

## Firestore / Database

Analyze:

* Query complexity
* Number of reads
* Number of writes
* Query frequency
* Index requirements
* Pagination
* Cursor-based pagination
* Collection structure
* Document size
* Denormalization
* Fan-out writes
* Aggregations
* Real-time listeners
* Listener lifetime
* Duplicate queries
* Unbounded queries
* Cost implications

Consider not only speed, but also **Firestore cost at scale**.

Estimate what could happen if the platform grows from:

* 100 users
* 1,000 users
* 10,000 users
* 100,000 users

Identify features that may work fine in development but become expensive or slow at scale.

---

# 6. SCALABILITY AUDIT

Evaluate whether the current architecture can realistically support Readixon's growth.

Ask:

* What breaks first when traffic increases?
* What becomes expensive first?
* What database structures become problematic?
* What operations become bottlenecks?
* Which features need architectural changes before scale?
* Which parts can scale horizontally?
* Which parts depend on a single bottleneck?
* What should be redesigned now versus later?

Create a practical scalability roadmap.

---

# 7. CODE QUALITY & ARCHITECTURE AUDIT

Review the codebase as a senior software architect.

Look for:

* duplicated logic
* dead code
* unused components
* unused imports
* outdated implementations
* inconsistent patterns
* poor naming
* unnecessary complexity
* tightly coupled modules
* circular dependencies
* oversized components
* business logic inside UI components
* poor separation of concerns
* weak abstraction boundaries
* technical debt
* inconsistent error handling
* fragile code
* hidden side effects
* race conditions
* poor async handling
* inconsistent typing
* excessive any usage
* weak type safety
* missing null/undefined handling

Identify architectural patterns that should be standardized.

---

# 8. TYPESCRIPT / JAVASCRIPT QUALITY

Perform a dedicated TypeScript/JavaScript review.

Check:

* any usage
* unsafe type assertions
* weak interfaces
* duplicated types
* inconsistent types
* nullable data
* runtime assumptions
* error typing
* API response typing
* form typing
* database model typing
* missing validation schemas
* type mismatches between frontend and backend

Determine where runtime validation is necessary even when TypeScript types exist.

---

# 9. UI / UX / VISUAL DESIGN AUDIT

Evaluate Readixon as a real commercial product, not just as software.

Inspect the entire user experience.

Analyze:

## Visual Design

Check:

* visual hierarchy
* spacing
* typography
* font hierarchy
* color usage
* contrast
* consistency
* iconography
* border radius
* shadows
* cards
* buttons
* forms
* navigation
* empty states
* loading states
* error states
* modal behavior
* responsiveness
* visual consistency between pages

Determine whether the interface feels:

* modern
* premium
* literary
* elegant
* calm
* distinctive
* cohesive

Identify areas that feel generic, outdated, inconsistent, crowded, empty, or unfinished.

## UX

Evaluate:

* onboarding
* registration
* login
* profile completion
* content creation
* reading experience
* discovering content
* interacting with authors
* comments
* likes/reactions
* saves/bookmarks
* notifications
* search
* discoverability
* navigation
* settings
* account management
* subscription flows
* donation flows
* payment flows

Ask:

> Can a new user understand what Readixon is within the first minute?

Ask:

> Can a user accomplish important tasks without unnecessary friction?

Ask:

> Does the product have a distinct identity compared with generic social networks and writing platforms?

---

# 10. ACCESSIBILITY AUDIT

Inspect:

* keyboard navigation
* semantic HTML
* ARIA usage
* focus states
* screen-reader compatibility
* color contrast
* text sizing
* interactive element accessibility
* forms
* error messaging
* modal accessibility
* image alt text
* reduced motion support

Identify important accessibility failures.

---

# 11. RESPONSIVE DESIGN AUDIT

Evaluate layouts for:

* mobile
* tablet
* laptop
* large desktop

Look for:

* overflow
* broken grids
* inaccessible buttons
* excessive whitespace
* collapsed navigation problems
* typography issues
* image problems
* modal issues
* touch-target problems

Do not assume desktop correctness means mobile correctness.

---

# 12. SEO AUDIT

Inspect:

* metadata
* title strategy
* descriptions
* canonical URLs
* Open Graph
* Twitter/X metadata
* structured data
* sitemap
* robots.txt
* indexing strategy
* dynamic routes
* content discoverability
* semantic HTML
* SSR/SSG implications
* duplicate content
* URL structure

Especially evaluate SEO for:

* author pages
* literary works
* public profiles
* categories
* discover pages
* content detail pages

Explain what prevents Readixon from being properly indexed and discovered by search engines.

---

# 13. ERROR HANDLING & RELIABILITY

Inspect:

* API errors
* frontend errors
* network failures
* authentication failures
* database failures
* payment failures
* upload failures
* timeout handling
* retry behavior
* loading states
* optimistic updates
* rollback behavior
* error boundaries
* user-facing error messages

Look for situations where the application can enter an inconsistent state.

---

# 14. PAYMENT / MONETIZATION AUDIT

Readixon may contain or integrate with payment/subscription/donation functionality.

Inspect every related flow.

Pay attention to:

* payment validation
* webhook verification
* transaction integrity
* duplicate payments
* replay attacks
* subscription state
* entitlement verification
* client-side payment manipulation
* server-side verification
* payment status synchronization
* refunds/cancellations
* race conditions
* currency/amount manipulation

The client must never be trusted to determine a user's paid entitlement.

---

# 15. USER-GENERATED CONTENT & SOCIAL FEATURES

Because Readixon contains user-generated literary/social content, inspect:

* posting
* comments
* reactions
* profiles
* media
* reporting
* moderation
* blocking
* abuse prevention
* spam prevention
* content deletion
* account deletion
* content ownership
* privacy
* inappropriate content vectors

Also identify missing infrastructure that will become important as the platform grows.

---

# 16. PRIVACY & DATA PROTECTION

Inspect what user information is collected and how it is handled.

Check:

* personally identifiable information
* email addresses
* profile information
* analytics
* user preferences
* logs
* IP-related data if applicable
* account deletion
* data retention
* unnecessary data collection
* exposure through APIs
* privacy-related architecture

Identify privacy risks and recommend improvements.

Do not provide legal conclusions. Flag technical/data-handling concerns that may require legal review.

---

# 17. DEPENDENCY & SUPPLY-CHAIN AUDIT

Inspect dependencies carefully.

Check:

* outdated packages
* vulnerable packages
* unnecessary packages
* duplicate packages
* abandoned dependencies
* risky libraries
* package scripts
* postinstall behavior
* dependency bloat

Use available package-manager/security tooling where appropriate.

Clearly distinguish:

* confirmed vulnerabilities
* potentially risky dependencies
* general maintenance concerns

---

# 18. TESTING AUDIT

Determine:

* whether tests exist
* test coverage areas
* missing critical tests
* broken tests
* integration tests
* unit tests
* end-to-end tests
* security tests
* API tests
* payment tests
* authentication tests

Identify the most important missing tests.

Do not focus only on coverage percentage. Prioritize tests based on business and security risk.

---

# 19. DEVOPS / DEPLOYMENT / PRODUCTION READINESS

Inspect:

* build process
* environment handling
* deployment configuration
* production variables
* staging vs production separation
* logging
* monitoring
* backups
* rollback strategy
* migration safety
* error monitoring
* CI/CD
* dependency updates
* secret management

Determine whether the current project is genuinely production-ready.

---

# 20. PRODUCT QUALITY & DIFFERENTIATION

Now switch perspective from engineer to product strategist.

Study the actual product implementation and ask:

> What would make Readixon feel exceptional rather than merely functional?

Identify:

* memorable product moments
* opportunities for delight
* friction that should be eliminated
* features that could be elevated
* areas where the current product feels generic
* opportunities for stronger brand identity
* opportunities to improve retention
* opportunities to improve content discovery
* opportunities to improve author engagement
* opportunities to improve reader engagement
* opportunities to increase monetization without harming UX

Do NOT invent random features just to make the product larger.

Prioritize improvements that strengthen Readixon's actual identity and business model.

---

# 21. "MAKE READIXON EXCEPTIONAL" SECTION

Create a dedicated section titled:

## Readixon'u Olağanüstü Hale Getirecek Noktalar

This section should identify the most meaningful improvements that could elevate Readixon from:

**"iyi çalışan bir platform"**

to:

**"gerçekten güçlü ve kendine özgü bir dijital edebiyat ürünü."**

Think deeply about:

* product identity
* visual identity
* reading experience
* writing experience
* discovery
* social interaction
* personalization
* performance
* trust
* security
* premium feel
* emotional experience
* author ecosystem
* reader ecosystem

Recommendations must be realistic and connected to the existing product.

---

# 22. FINDINGS MUST BE EVIDENCE-BASED

For every meaningful issue, provide:

### Problem

What is wrong?

### Location

Which file/module/component/API/rule is involved?

### Why It Matters

Why does this matter technically, operationally, financially, from a security perspective, or from a UX perspective?

### Risk

What could happen?

### Severity

Use:

* CRITICAL
* HIGH
* MEDIUM
* LOW
* INFORMATIONAL

### Evidence

Reference the relevant implementation, logic, configuration, or code path.

### Recommended Solution

Explain what should change.

### Implementation Direction

Explain how the solution should ideally be implemented.

### Priority

Classify as:

* P0 — Immediate
* P1 — Very Important
* P2 — Important
* P3 — Improvement
* P4 — Nice to Have

Do not inflate severity.

Do not label something "critical" without a defensible reason.

---

# 23. DISTINGUISH CONFIRMED ISSUES FROM POTENTIAL ISSUES

This is extremely important.

Clearly differentiate:

**Confirmed**
The repository provides sufficient evidence that the issue exists.

**Potential**
The architecture or implementation suggests a risk, but additional runtime verification would be required.

**Recommendation**
This is an improvement rather than an actual defect.

Never present assumptions as confirmed bugs.

---

# 24. CREATE A PRIORITIZED MASTER PLAN

At the end of the report, create a prioritized remediation roadmap.

Structure it approximately as:

### Phase 0 — Emergency Security / Data Risks

Things that should be addressed immediately.

### Phase 1 — Production Stability

Critical bugs, authentication, authorization, data integrity, payment integrity, reliability.

### Phase 2 — Performance

Frontend, Firestore, APIs, caching, media, bundle size.

### Phase 3 — UX / UI

Visual consistency, responsiveness, accessibility, onboarding, flows.

### Phase 4 — Architecture

Refactoring and scalability improvements.

### Phase 5 — Product Excellence

Improvements that make Readixon significantly better and more distinctive.

For each item include:

* problem
* affected area
* priority
* estimated complexity: Small / Medium / Large
* dependencies
* expected impact

---

# 25. CREATE AN EXECUTIVE SUMMARY

The report must begin with a concise but meaningful executive summary.

Include:

* Overall architectural assessment
* Major security concerns
* Major performance concerns
* Major UX/UI concerns
* Scalability concerns
* Production readiness assessment
* Most important immediate actions

Do not assign a simplistic numeric score such as "8/10" unless there is a very strong objective reason to do so.

Prefer a factual summary over a vanity score.

---

# 26. CREATE A RISK TABLE

Include a clear table similar to:

| ID | Area | Finding | Severity | Priority | Confidence | Location |
| -- | ---- | ------- | -------- | -------- | ---------- | -------- |

Include every significant finding.

---

# 27. CREATE A "TOP 20 ACTIONS" SECTION

Create a section containing the **20 most important actions** that should be taken after this audit.

Order them by practical priority, not by alphabetical order.

For each action provide:

* action
* reason
* affected area
* impact
* complexity

---

# 28. FINAL REPORT REQUIREMENTS

Create a Markdown file in the project workspace.

Preferred filename:

`READIXON_COMPREHENSIVE_AUDIT_TR.md`

The report itself MUST be written in **Turkish**.

Technical terms may remain in English where appropriate.

The report should be detailed enough that another senior developer could take it and begin fixing the project without needing to repeat the entire audit.

Include:

* Table of Contents
* Executive Summary
* Project Architecture Overview
* Security Audit
* Authentication & Authorization
* Database / Firestore Audit
* API Audit
* Performance Audit
* Scalability Audit
* Code Quality Audit
* TypeScript Audit
* UI/UX Audit
* Accessibility Audit
* Responsive Design Audit
* SEO Audit
* Payment / Monetization Audit
* User-Generated Content Audit
* Privacy / Data Handling Audit
* Dependency Audit
* Testing Audit
* DevOps / Production Readiness
* Product Experience Audit
* Readixon'u Olağanüstü Hale Getirecek Noktalar
* Risk Matrix
* Prioritized Remediation Roadmap
* Top 20 Actions
* Final Technical Assessment

---

# 29. QUALITY BAR

Do not rush.

Do not produce a generic checklist.

Do not write filler.

Do not praise the project without evidence.

Do not criticize the project without evidence.

Do not stop after discovering the first few issues.

Continue until you have examined all major areas of the codebase.

Search broadly across the repository.

Trace important flows from:

**UI → state → API → server → database → response → UI**

where applicable.

For security-sensitive flows, trace:

**user input → validation → authorization → processing → persistence → output**

where applicable.

For payments, trace:

**user action → payment creation → provider → verification → server state → entitlement**

where applicable.

For uploaded content, trace:

**upload → validation → storage → retrieval → rendering**

where applicable.

---

# 30. FINAL VERIFICATION BEFORE COMPLETING

Before finalizing the Markdown report:

1. Confirm that you actually inspected the repository rather than relying on assumptions.
2. Confirm that findings reference real project locations wherever possible.
3. Confirm that confirmed issues and potential risks are clearly separated.
4. Confirm that security findings are prioritized realistically.
5. Confirm that performance recommendations are connected to actual implementation.
6. Confirm that UX/UI recommendations are connected to the actual interface.
7. Confirm that scalability concerns consider Firestore/read-write cost where relevant.
8. Confirm that payment and authorization flows have been examined carefully.
9. Confirm that the report is entirely in Turkish except for necessary technical terminology.
10. Confirm that `READIXON_COMPREHENSIVE_AUDIT_TR.md` exists in the project workspace.
11. Confirm that the Markdown file is readable, organized, and sufficiently detailed.

At the very end of your response, provide a concise summary of:

* how thoroughly you inspected the project
* how many significant findings you identified
* how many CRITICAL / HIGH / MEDIUM / LOW findings exist
* the three most urgent areas
* the location of the generated Markdown report

Your objective is to produce a **serious, evidence-based, senior-level audit of Readixon**, not a superficial code review.

Think like the person responsible for keeping Readixon secure, fast, scalable, maintainable, and excellent for years.

# LOCAL ENVIRONMENT & PRODUCTION SAFETY — ABSOLUTE RULES

The Readixon project is currently **LIVE in production** and actively serving users.

Your entire audit must be performed against the **LOCAL DEVELOPMENT COPY of the project only**.

This is a strict safety requirement.

## NEVER TOUCH PRODUCTION

Under no circumstances:

* deploy the application
* push code to production
* modify production infrastructure
* modify production Firestore data
* create, update, or delete production users
* create, update, or delete production content
* modify production authentication settings
* modify production storage
* trigger real payment transactions
* trigger real payment webhooks
* send real emails, notifications, or messages
* modify production environment variables
* execute destructive database commands
* run migrations against production
* modify DNS, hosting, domains, CDN, or other production infrastructure
* perform any action that could affect live users

Do not assume that a local `.env` file is safe.

Before running commands that interact with Firebase, Firestore, Storage, Authentication, payment providers, APIs, or other external services, inspect the relevant environment/configuration and determine whether the command could reach production.

If a command could potentially interact with production resources, **do not run it unless it can be safely isolated to a local emulator, mock, test environment, or read-only operation.**

## LOCAL-FIRST APPROACH

Prefer:

* local source-code inspection
* static analysis
* linting
* type checking
* local builds
* local tests
* local development server
* Firebase Emulator Suite
* mocked APIs
* test fixtures
* local databases
* isolated test environments

When runtime testing is useful, use a **local or isolated environment**.

Do not use real customer/user data for testing.

## DATABASE SAFETY

When analyzing Firestore or other databases:

* inspect the schema
* inspect queries
* inspect security rules
* inspect indexes
* inspect access patterns
* inspect code paths

However, do not mutate production data.

Do not create test documents in production collections.

Do not delete or update existing production documents.

Do not intentionally generate large numbers of reads/writes against production.

If runtime verification requires database access, use the local emulator or another isolated test environment.

## PAYMENT SAFETY

Payment-related code must be analyzed carefully, but no real transaction must be initiated.

Use mocks, test credentials, sandbox environments, or static code analysis.

Never perform a real charge.

Never issue a real refund.

Never trigger a real payment callback against production.

## EXTERNAL SERVICES

For every external service, determine whether the project is connected to:

* production
* staging
* sandbox
* emulator
* mock

If there is uncertainty about which environment a service points to, treat it as **production-risk** and do not execute the operation.

## DEPLOYMENT SAFETY

Do not run commands such as deployment, release, migration, infrastructure modification, or production synchronization unless they are explicitly required for the audit — and even then, do not execute them.

Examples include, but are not limited to:

* `firebase deploy`
* production deployment commands
* database migrations against production
* hosting uploads
* production synchronization scripts
* infrastructure provisioning
* DNS changes

The goal is to **audit the project, not deploy or modify it**.

## IF A SECURITY TEST COULD CAUSE DAMAGE

Do not perform an aggressive test against production.

Instead:

1. identify the vulnerability from source code/configuration
2. explain how it could potentially be exploited
3. reproduce it only in a safe local/test environment when possible
4. document the evidence
5. recommend remediation

Never turn a security audit into an active attack against the live Readixon system.

## FINAL SAFETY CHECK

Before executing any command that could interact with an external service, ask internally:

> "Could this command modify, delete, expose, charge, notify, or otherwise affect a real Readixon production user or production resource?"

If the answer is **yes or uncertain**, do not execute it.

The audit must remain **LOCAL / SAFE / NON-DESTRUCTIVE / NON-PRODUCTION** from beginning to end.
