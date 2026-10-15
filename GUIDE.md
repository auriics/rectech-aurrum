# Talent Insights / Aurrum CRM — Platform Documentation & Feature Guide

## Overview
**Talent Insights / Aurrum CRM** is an enterprise-grade recruitment, candidate pipeline management, and AI-powered talent intelligence platform built with React, Vite, Tailwind CSS, Express, and Google Cloud Firestore (`aurrum-production`). It features robust serverless Firebase Admin initialization, secure file upload verification, AI-driven resume parsing (Gemini AI waterfall parser), an AI-powered Job Discovery & Recommendation Engine, and comprehensive Role-Based Access Control (RBAC).

---

## 1. Key Features & Capabilities

### 1. AI-Powered Job Discovery & Recommendation Engine
- **Dedicated Navigation & Routing**:
  - Accessible via a dedicated primary **AI Job Discovery** menu item in the **Workspace** section of the sidebar navigation with a `Compass` icon, active tab highlight, and gold `AI` badge pill.
  - Dedicated route: `/ai-job-discovery`, with full SPA refresh, bookmark, and direct URL navigation support synchronized with `/dashboard`.
  - **Clean Profile Separation**: Completely decoupled from candidate CV detail pages, providing an independent, focused recruitment and career matching workspace.
- **7 Dynamic Recommendation Sections**:
  1. **Recommended for You**: Top opportunities ranked using candidate skills, verified experience, salary, and preferences with explainable match breakdown, match scores, and missing requirements.
  2. **Similar Jobs**: Adjacent roles and related positions based on selected or viewed jobs.
  3. **Jobs Based on Your Skills**: Filtered opportunities aligning directly with demonstrated candidate skills.
  4. **New Matches**: Newly published opportunities meeting candidate criteria.
  5. **Recently Viewed Jobs**: Browsing history with interaction tracking.
  6. **Saved Jobs**: Quick-access drawer for bookmarked positions.
  7. **Multi-Facet Search & Filtering**: Instant search by keywords, work arrangement (remote, hybrid, on-site), experience level, and salary range.
- **Interactive Actions & Modal**:
  - **View Job**: Comprehensive modal with full job overview, required/preferred skills, mandatory qualifications, and similar job suggestions.
  - **Save Job / Bookmark**: Instant save/unsave with non-blocking feedback toasts.
  - **Express Interest**: High-contrast interest submission with confirmation.
  - **Dismiss**: Remove non-relevant jobs from active recommendation feeds.
  - **Candidate Switcher**: Recruiter combobox to evaluate tailored recommendations for any candidate in the talent database.
- **Database Persistence & Seeding**:
  - Stored in Google Cloud Firestore collection `marketplace_jobs` in the `aurrum-production` database.
  - Automatic batch seeding on server startup ensures benchmark jobs exist across Full Stack, AI/ML, Frontend UX, DevOps, Project Management, and Enterprise Sales.
  - Fallback safety in `src/services/jobDiscoveryService.ts` ensures zero downtime if network or database connectivity is interrupted.

### 2. Robust Resume Upload, Validation & AI Parsing Pipeline
- **Multi-Format Support**: Securely processes PDF, DOCX, and DOC files via drag-and-drop or file picker.
- **Data URI & URL Ingestion**: Supports direct data URIs, secure external URLs (Cloud Storage, AWS S3, GitHub, WordPress webhooks), and robust fallback buffer handlers.
- **AI Waterfall Parser**: Integrates Gemini AI (`gemini-3.5-flash`) with advanced heuristic fallback and self-healing extraction for names, emails, phones, skills, work history, education, and certifications.
- **Duplicate Prevention & Retry Queues**: Automatically detects duplicates by email, phone, or LinkedIn URL, and manages failed parses cleanly in the `resume_import_queue` with retry logic.

### 3. Non-Blocking Success Feedback & Toast System
- **Centralized Toast Notifications**: Replaced intrusive modal popups with modern, non-blocking green success badges and toasts (`useToast` / `ToastContext`) with clear icons and messages.
- **Non-Interruptive Workflow**: Dispatches toasts across candidate creation, resume parsing, job bookmarking, invoice generation, and settings updates without locking the screen or requiring users to click "OK".
- **Confirmation Safety**: Preserves dedicated confirmation dialogs for irreversible or destructive actions (such as candidate deletions, invoice cancellations, or database purges).

### 4. Developer-Only Missing Details & Resume Re-Extraction
- Available exclusively to users with the **Developer** role.
- Identifies and highlights candidate profiles missing critical fields (Name, Email, Work Experience, Skills, Professional Summary).
- **Batch Reparse ("Reparse All Missing")**: Concurrent worker queue processing with real-time progress indicators.
- **Individual Re-Extract ("Re-Extract" / "Reparse Resume")**: One-click re-parsing per candidate using the local heuristic & Gemini parsing pipeline.

### 5. Role-Based Access Control (RBAC) & Security
- **Roles**: Admin, Team Leader, Recruiter, Client, Developer.
- **Security**: IP whitelist enforcement (`ALLOWED_IPS`), Firestore security rules (`firestore.rules`), and audit logging across all candidate actions.

### 6. Rectech Enterprise Invoice & Dynamic Fee Calculation Engine
- Centralized `getEffectiveSubtotal` and `getEffectiveTotal` calculation functions ensuring accurate calculation of placement fees, subtotals, taxes, and discounts without `$0.00` calculation bugs.
- Synchronized across interactive invoice modal, preview, A4 print layout (`handlePrintInvoice`), and PDF export (`handleDownloadPDF`).

### 7. Global Branding Engine
- System Settings integration for managing corporate identity assets globally for Light and Dark themes.
- Dynamic multi-surface application across Sidebar Navigation, Login Screen, and Invoices/Print/PDF views.

---

## 2. Core Architectural & Design Principles

### Unified Theme Parity (Light & Dark Mode)
- **Single Component Architecture:** Light Theme and Dark Theme share the exact same component structure, typography scale, padding, margin, border-radius, and interactive functionality.
- **Variable-Driven Custom Properties:** Theme switching toggles semantic CSS custom properties (`--bg-primary`, `--card-bg`, `--text-primary`, `--text-muted`, `--border-color`, etc.) smoothly in `200ms–300ms` transitions without page refresh, layout shifts, or component re-renders.
- **Elimination of Hardcoded CSS:** Component code MUST NOT use hardcoded light/dark Tailwind classes like `bg-slate-50`, `dark:bg-slate-900`, `text-indigo-600`, or `dark:text-indigo-400`. All styling must use semantic tokens like `bg-[var(--card-bg)]`, `text-[var(--text-primary)]`, `text-[var(--primary-gold)]`, and `.crm-btn-gold`.

---

## 3. Light Theme vs Dark Theme Standards

### Aurrum Light Theme Standards (Client-Ready & High Contrast)
- **Backgrounds:** Pure white (`#FFFFFF`) cards and modal surfaces layered on a crisp, soft neutral canvas (`#F8FAFC`).
- **Typography:** High-contrast solid dark navy typography (`#002D38` primary, `#003649` secondary, `#005472` muted). Faded gray text is strictly forbidden.
- **Borders & Elevation:** Crisp 1px borders (`#E2E8F0`) with subtle, refined elevation shadows.
- **Accents & Buttons:** Brand Primary Navy (`#003E5A`) and Primary Gold (`#BA9E6A`).

### Aurrum Dark Theme Standards (Modern & Comfortable)
- **Backgrounds:** Layered deep brand blue surfaces (`#002D38` canvas, `#003E51` cards) rather than harsh pure black (`#000000`).
- **Typography:** High-contrast off-white and pure white typography (`#FFFFFF` primary, `#E2E8F0` secondary, `#94A3B8` muted).
- **Borders & Elevation:** Subtle dark blue borders (`#005472`) and soft depth shadows.

---

## 4. Typography Specifications (Font: Poppins)
- **Primary Font Family:** **Poppins** across all modules (`font-sans`).
- **Hierarchy Rules:**
  - **Headings (H1 - H3):** Poppins 700-800 weight, tight tracking, high-contrast brand tokens (`var(--text-primary)`).
  - **Body Text:** Poppins 400-500 weight, 1.5–1.6 line height for effortless long-session reading.
  - **UI Labels, Badges & Buttons:** Poppins 600-700 weight, medium/tight tracking.
- **Accessibility & Contrast:** Minimum 4.5:1 contrast ratio for body text in both light and dark modes.

---

## 5. Official Brand Palette & CSS Token Architecture

### Primary Palette
- **Primary Aurrum Navy (`#003E5A`)**: Main brand color for primary actions, active headers, sidebar navigation, and focal points.
- **Darkest Navy (`#002D38` / `#002233`)**: Primary text token in light mode, primary background surface in dark mode.
- **Premium Gold Accent (`#BA9E6A`)**: Primary accent color, active state indicators, badges, borders, and gold button gradients (`#A98B56` to `#BC9B66`).

### CSS Token Mapping (`src/index.css`)

| Semantic Token | Light Theme Value | Dark Theme Value | Usage Description |
| :--- | :--- | :--- | :--- |
| `--bg-primary` | `#F8FAFC` | `#002D38` | Main application canvas background |
| `--bg-secondary` | `#EDF2F7` | `#003649` | Secondary containers, table headers, hover surfaces |
| `--card-bg` | `#FFFFFF` | `#003E51` | Surface for cards, modals, and drawers |
| `--card-hover-bg` | `#F1F5F9` | `#004564` | Row and card hover background |
| `--text-primary` | `#002233` | `#FFFFFF` | High-contrast main headings and body text |
| `--text-secondary` | `#00334A` | `#E2E8F0` | Subtitles, table cell secondary content |
| `--text-muted` | `#004C6D` | `#94A3B8` | Muted labels, placeholders, timestamps |
| `--border-color` | `#E2E8F0` | `#005472` | Card borders, table dividers, input borders |
| `--primary-gold` | `#BA9E6A` | `#BA9E6A` | Primary brand gold accent |

---

## 6. Core Component Library Standards

### Sidebar Navigation
- Premium collapsible navigation with structured section headers (**Workspace**, **Management** — admin/team_leader/developer and privileged roles only, **Preferences**).
- Featuring the Aurrum Gold Sparkle emblem, smooth collapse transitions, active tab left accent line (`#BA9E6A`), floating tooltips, and bottom user profile card.
- Mobile-responsive: below the `lg` breakpoint the sidebar renders as a full-screen slide-in drawer triggered by a hamburger button in the top header, with the same section structure and role-based item visibility as desktop.
- **AI Job Discovery Menu**: Prominently positioned under Workspace with `Compass` icon, dedicated routing (`/ai-job-discovery`), and an `AI` indicator badge.

### Buttons & Interactive Controls
- **Primary Gold Button (`.crm-btn-gold`)**: High-contrast gold gradient button (`#A98B56` -> `#BC9B66`) with active scale feedback.
- **Secondary Button (`.crm-btn-secondary`)**: Clean surface button with custom border and brand color text.
- **Form Inputs (`.crm-input`, `.crm-label`)**: Theme-aware input fields with high-contrast text labels and primary gold focus rings.

### Tables & Data Cards
- Standardized `.crm-table` and `.crm-card` styling across Candidate Repository, Pipeline, Invoice Management, and Analytics views.
- Sticky high-contrast table headers, comfortable padding, and standardized status badges (`.crm-badge-gold`, `.crm-badge-success`, `.crm-badge-warning`, `.crm-badge-error`, `.crm-badge-info`).
- Candidate table explicitly displays the **Uploaded By** attribute column for precise tracking.

---

## 7. Security Specifications & Data Invariants
1. **IP-Based Access Restriction:** Managed via `ALLOWED_IPS` environment variable with fail-closed security.
2. **Firestore Security Rules:** Strict rules enforcing authentication and requiring `uploadedBy` UID validation on candidate records.
3. **Client Portal Profile Safeguards:** Sensitive configuration panels such as Security & Password and Client Billing Configuration are hidden from client views to maintain a clean client experience.
4. **Settings Collection Access:** `match /settings/{settingId}` allows public read (`allow read: if true`) and write by any signed-in user (`allow write: if isSignedIn()`) to support dynamic branding and invoice design settings.

---

## 8. AI Resume Parsing Engine & JSON Resume Architecture
- **High-Capability AI Models:** Uses `gemini-3.5-flash` via `@google/genai` (with heuristic and regex fallback) to guarantee exhaustive, high-precision structured data extraction.
- **Queue-Based Bulk Processing & Enhanced Batch Limits:** Supports batch uploads with parallel workers, automatic retries with exponential backoff, and automatic secondary re-extraction/cross-reference fallback passes when any fields are missing.
- **Candidate Actions:**
  - **AI Re-Extract:** Authorized users (Admin and Developer) can trigger re-parsing of raw resume files to update profile fields, preserving manual edits.
  - **Download CV:** Recruiters, Admins, and Developers can download original uploaded resume files.
- **Persistent Extraction Storage:** Permanently stores original resumes, extracted raw text, parsed JSON, AI metadata, and file hashes to support efficient re-parsing without requiring re-upload.

---

## 9. Global Logo & Branding Engine

To ensure cohesive corporate identity across all customer touchpoints, the CRM implements a unified **Global Branding Engine**:

### Centralized Management
- **System Settings Integration:** Located under **System Settings → Global CRM Branding**, administrators can manage corporate identity assets globally.
- **Light & Dark Theme Parity:** Upload distinct logos or supply direct URLs for both **Light Theme** (optimized for white backgrounds) and **Dark Theme** (optimized for navy/dark blue backgrounds).
- **Format & Constraint Validation:** Supports drag-and-drop or file browsing (PNG, JPG, SVG, WebP up to 500KB) with instant preview frames of corresponding theme backgrounds.

### Automated Multi-Surface Application
Once configured globally in the database, the logos dynamically apply across all system surfaces with zero secondary configuration:
1. **Sidebar Navigation:** Automatically displays the appropriate active branding logo adapting to the user's selected global theme.
2. **Login Screen:** Welcomes users with the official global corporate branding in perfect high-contrast.
3. **Invoices Module:** All invoice templates, print sheets, and generated PDF structures automatically inherit the Light Theme logo to match the crisp white paper canvas layout.

---

## 10. Performance & Load Optimization Architecture

1. **Payload Separation (Firebase Storage):**
   - Original resume files are uploaded directly to Firebase Storage (`resumes/`), storing only lightweight metadata (`cvStorageUrl`, `cvFileName`, `cvSizeBytes`, `cvFileHash`) on Firestore candidate documents.
   - Eliminates multi-megabyte base64 payload bloat in Firestore document reads.

2. **Bounded Real-Time Listeners:**
   - All Firestore `onSnapshot` subscriptions use strict query boundaries (`orderBy`, `where`, and `limit(100)`), preventing unbounded collection-wide data transfers on every update.

3. **Optimized Derived State (`useMemo`) & Debounced Search:**
   - Complex sorting, status filtering, and search matching are wrapped in `useMemo` hooks keyed to raw query snapshots and filter parameters to avoid redundant re-renders.
   - Search-input queries are debounced to eliminate unnecessary CPU spikes.

4. **Instant Client-Side AI Search Fallbacks:**
   - The AI CV Search Assistant features an instant client-side heuristic fallback mechanism. If API rate limits (HTTP 429) or network timeouts occur, the search engine instantly processes candidate attributes locally to ensure zero downtime and uninterrupted recruiter workflows.

5. **Standardized Pagination:**
   - Large datasets (Candidates, Invoices, Activity Logs) feature robust client and server pagination controls (`15–50` items per page) with intuitive navigation.

---

## 11. Invoice Fee Calculation, Bank Account Instructions & Robust PDF Export Engine

1. **Per-Invoice Placement Fee Calculator:**
   - Annual CTC and Fee Percentage calculations (`calcCtc` and `calcFeePercent`) are bound to each unique invoice ID rather than shared globally. Edits made to one invoice do not overwrite or affect other invoices.
   - Every candidate profile includes an **Annual Salary (CTC)** property. Each client profile supports configurable placement billing rules: either **Percentage (%)** of CTC or **Fixed Amount ($)**.

2. **Official Aurrum Brand Logo & Invoice Design:**
   - Both **Custom Invoices** and **Dynamic/Consolidated Invoices** feature the official Aurrum branding: the golden sparkle emblem, `Aurrum CRM` title, and `Talent Insights & Recruitment Services` tagline.
   - Designed to maintain exact aspect ratios without stretching, blurring, or cropping across both light and dark print/preview modes.

3. **Bank Account Payment Instructions:**
   - Invoice receipts, printable views, and PDF exports automatically include complete **Bank Payment Instructions** (Payee Name, Bank Name, Branch, Account Number, and SWIFT/BIC Code) when configured.
   - Full editable input fields are provided in the invoice edit modal to update bank payment instructions per invoice.

4. **Streamlined Invoice Table & Summary Metrics:**
   - The main invoice table is optimized by focusing on essential columns (Invoice #, Client / Company, Total Amount, Due Date, Status, and Actions).
   - Dashboard and header badges display accurate **Total Pending Amount** for unpaid/pending statements.

5. **Robust PDF Generation Engine:**
   - Leverages `html2canvas` and `jspdf` to render pixel-perfect multi-page PDF statements with clean table layouts, embedded vector branding, and USD currency formatting for seamless production export and download.

---

## 12. Enterprise Notification System & Real-Time Alerts

1. **Client Candidate Assignment Notifications:**
   - When a recruiter or admin assigns a candidate to a client, an immediate Firestore notification is created targeting solely the assigned client user (`recipientId`), containing candidate name, assignment action, sender details, timestamp, and candidate reference ID.
   - Notifications appear instantly in the client's notification center without page refreshes, driven by bounded Firestore `onSnapshot` listeners.

2. **Comprehensive CRM Activity Alerts:**
   - Generates notifications for candidate assignments, status changes, client reviews, shortlists, feedback, and invoice updates.

3. **Duplicate Prevention & Non-Blocking Resilience:**
   - Built-in deduplication check verifies recipient, candidate reference, and notification type within a 30-second window before committing writes to prevent redundant alerts.
   - All notification dispatches are wrapped in non-blocking try/catch blocks; notification write failures never break or interrupt primary CRM actions.

4. **Unread Count & Badge Tracking:**
   - Real-time unread counter tracks unread notifications, decreases upon reading or batch marking ("Mark all as read"), and maintains strict user/role data segregation.

5. **CV Repository Bulk Download:**
   - The **CV Repository** features a dedicated **"Download All CVs (ZIP)"** action button that packages all candidate CV documents (PDF, Word DOCX) into a single structured archive (`Aurrum_CRM_All_CVs_YYYY-MM-DD.zip`), enabling recruiters and admins to download the entire talent pool instantly.

---

## 13. Client Portal Candidate Assignment Display
- **Assigned Client Visibility:** In the Client Portal (`ClientAssignedCandidates`, `ClientCvRepository`, and `ClientShortlist`), every candidate listing card and table row explicitly displays the **Assigned Client** name with a dedicated building icon badge.
- **Client Resolution Logic:** Automatically resolves client identification across `candidate.clientName`, lookup against the team list using `candidate.clientId` or `candidate.assignedToClient`, falling back to `candidate.clientEmail` or shortened ID.

---

## 14. Precision Experience Calculation & Overlap Merging Engine
- **Interval-Based Tenure Calculation (`src/utils/experienceUtils.ts`)**:
  - Parses start and end dates with month and year precision (e.g., "Jan 2020", "2021-05").
  - Automatically resolves **current/ongoing employment** ("Present", "Current", "Now", "Till Date").
  - **Overlap Merging**: Sorts and merges overlapping or contiguous employment date ranges to prevent artificial inflation or double-counting of simultaneous positions.
- **Integrity Guard**:
  - Correctly calculates fractional years with 1-decimal precision. Preserves `0 Years` only when a resume genuinely lacks work history or valid date information, without fabricating fake tenure.

---

## 15. Parser Quality Audit & Completeness Assurance
- **Quality Scoring Engine (`src/utils/parserQuality.ts`)**:
  - Evaluates parsed candidate records against original CV text for completeness (Full Name, Email, Work Experience, Education, Skills, Professional Summary).
  - Computes a **Quality Score (0–100)** and categorizes completeness (`high`, `medium`, `low`).
- **Automated Audit & Re-Parse (`/api/candidates/audit-and-reparse`)**:
  - Scans stored candidates for missing fields or zero experience despite valid resume text.
  - Automatically re-parses and updates records while preserving existing manual edits.
- **Database Details Maintenance Tools**:
  - Developers have access to dedicated management utilities in **Database Details**:
    - **Fix 0-Experience Resumes**: Instantly re-calculates experience for candidates showing 0 years.
    - **Audit & Re-Parse All Resumes**: Executes a full database quality audit and re-parses records requiring correction.

---

## 16. Website Leads → Parse Resume Flow & Firebase Admin Architecture
1. **WordPress CRM Integration**:
   - Automatically syncs inbound leads and resume attachments from the WordPress API (`aurrum.co/wp-json/aurrum/v1/crm-leads`).
2. **Interactive Website Lead Resume Cards**:
   - Displays file names, file types, secure download links, and real-time status indicators (*Not Parsed*, *Parsing...*, *Parsed*, *Failed (Queued for Retry)*).
3. **Server-Side Secure Parsing Flow**:
   - Clicking **Parse Resume** triggers `/api/wordpress/parse-lead-resume`.
   - Securely fetches and validates resume buffers, detects PDF/DOCX format, extracts raw text, processes through Gemini AI resume parser (with heuristic fallback), and validates data quality.
   - **Data URI Support (`src/services/leadWebhookService.ts`):** Supports inline `data:` URIs (base64-encoded) decoded directly to a buffer with 50-byte minimum size check. Remote fetch failures throw explicit `RESUME_FETCH_FAILED` errors.
4. **Deduplication & Candidate List Sync**:
   - Performs email and `resumeUrl` deduplication checks against existing candidate records in Firestore before creation or update.
   - Automatically synchronizes the main Candidate List and AI CV Finder without requiring manual page refreshes.
5. **Centralized Firebase Admin Initialization (`/src/services/firebaseAdmin.ts`)**:
   - Singleton Firebase Admin initialization layer explicitly binding to the `aurrum-production` database ID.
   - Protects serverless and background queue execution paths (Vercel / Cloud Run) from uninitialized database errors.

---

## 17. Invoice Design & Branding Editor (`src/components/InvoiceDesignEditor.tsx`)
1. **Visual Layout Customization:**
   - Dedicated design editor (launched from Invoices) for live tuning of generated PDF/print layouts: logo dimensions, header spacing, page margins, container padding, table row height, font sizes, line heights, and border thickness.
2. **Branding Controls:**
   - Configurable primary color, gold accent color, and text color used across the invoice template.
   - Watermark support with adjustable size, opacity, and position (`center`, `top-right`, `bottom-right`), plus signature alignment (`left`, `center`, `right`).
3. **Extended Invoice Branding Fields (`src/types.ts`):**
   - Supports `senderAddress`, `logoVariant` (`dark` | `white` | `custom`), `darkLogoUrl`, `whiteLogoUrl`, `logoUrl`, `watermarkUrl`, `watermarkText`, and `signatureUrl`.
4. **Persistence:**
   - Design configuration is saved to Firestore under the `settings` collection via `loadInvoiceDesign` / `setDoc`.

---

## 18. Development, Deployment & Infrastructure Architecture

### Environments & Live URLs
| Environment | URL | Target / Branch |
| :--- | :--- | :--- |
| **Cloud Development (Vercel)** | [https://rectech-development.vercel.app](https://rectech-development.vercel.app) | `rectech-development` / `development` branch |
| **Dedicated AI Job Discovery** | [https://rectech-development.vercel.app/ai-job-discovery](https://rectech-development.vercel.app/ai-job-discovery) | Direct SPA discovery route |
| **Local Development** | [http://localhost:3000](http://localhost:3000) | `npm start` / `npm run dev` |
| **GitHub Repository** | [https://github.com/auriics/rectech-aurrum.git](https://github.com/auriics/rectech-aurrum.git) | Branch: `development` |

### Build & Run Commands
- **Install Dependencies**: `npm install`
- **Development Server**: `npm run dev` (`tsx server.ts`)
- **Production Build**: `npm run build` (`vite build && esbuild server.ts ...`)
- **Production Start**: `npm start` (`node dist/server.js`)
- **Cloud Deployment**: `vercel --prod` (Linked project: `rectech-development`)
- **Deployment Exclusions**: Handled via `.vercelignore` to exclude local backups (`firestore_dump.json`) and temporary scripts.

---

## 19. Database Administration & Utility Scripts

1. **Admin User Creation (`scripts/create_admin_user.ts`)**:
   - Creates or updates a Firebase Auth user and corresponding Firestore `users/{uid}` document with specified role.
   - Usage: `npx tsx scripts/create_admin_user.ts <email> <password> [name] [role]`
   - Configurable via environment variables: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_ROLE`.

2. **Database Backup & Dump (`scripts/dump_database.ts`)**:
   - Performs a full extraction of the `aurrum-production` Firestore database using the Admin SDK.
   - Iterates through all root collections and writes documents to a local `firestore_dump.json` file for offline auditing and backup.
