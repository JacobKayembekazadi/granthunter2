
# Project: GrantHunter (The GovCon Factory)

## 🎯 Mission
To replace Government Contracting Proposal Teams with an Autonomous AI Swarm. GrantHunter automates the entire lifecycle: from scouting leads on SAM.gov to qualifying them via voice (Gemini Live) and generating 50+ page compliant technical proposals.

## 🏛 High-Level Architecture (The Swarm)
GrantHunter is built as a **Durable Orchestration System** rather than a simple chatbot. It uses a "Swarm of Specialists" coordinated via a central nervous system.

### 1. The Nervous System (Orchestration)
- **Framework:** Next.js (App Router) + Tailwind CSS.
- **Workflow Engine:** **Inngest**. Used for durable, long-running AI workflows (e.g., generating a 100-page proposal section-by-section without timing out).
- **Database/Persistence:** **Supabase**. Handles Auth, Postgres storage for leads, and Vector storage (pgvector) for "Past Performance" RAG (Retrieval Augmented Generation).

### 2. The Intelligence Swarm (Models)
- **The Scout (Gemini 3 Flash):** High-speed lead parsing. Scans thousands of RFP documents to find "matches."
- **The Architect (Gemini 3 Pro):** Heavy-duty reasoning. Used for compliance matrix generation and technical writing.
- **The Navigator (Gemini 2.5 Flash Native Audio):** Real-time voice interface for the "Live API." Used for qualifying leads through conversational intelligence.
- **The Editor (Gemini 3 Pro):** Final polish, tone adjustment, and FAR (Federal Acquisition Regulation) compliance checking.

## 🎨 Design Language (Spatial Dashboard)
- **Aesthetic:** "Spatial Computing" / Premium Dark Dashboard.
- **Palette:** Deep Space (#050505), Surface Grey (#1A1A1A), Volt Green (#B4FF00) for primary actions and "Neural Pings."
- **Geometry:** Ultra-high border-radius (2.5rem), soft-depth shadows, and "Glassmorphism" blur effects.
- **Vibe:** It should feel like a sovereign AI operating system, not a website.

## 🛠 Functional Modules
### [Hunter] - Autonomous Scouting
- Swarm agents monitor NAICS codes and keywords.
- AI provides "Autonomous Insights" on market saturation and historical win patterns.
- Integration: APIs for SAM.gov, GovWin, or custom scrapers.

### [Factory] - Proposal Generation
- Section-by-section drafting.
- Compliance Matrix matching (ensuring every RFP requirement is addressed).
- Output: Generation of structured `.docx` or `.pdf` files.

### [Navigator] - Voice Intelligence
- Direct low-latency voice link to the system.
- Capability: "Navigator, analyze the technical risks in the drone swarm RFP."

### [Vault] - Knowledge Base
- Repository of "Past Performance" and "Executive Bios."
- Used as context for the Factory to ensure the AI writes like the specific company it's representing.

## 📜 Cursor Instructions
- **Stay Spatial:** Always adhere to the high-radius, high-contrast visual style defined in `tailwind.config.ts`.
- **Durable Logic:** When building backend tasks, prefer Inngest workflows over simple API routes to handle long-running AI generations.
- **Agentic Tone:** UI text should be tactical, professional, and slightly futuristic (e.g., "Initializing Sovereign Search" instead of "Loading...").
- **Safety & Compliance:** The system must prioritize FAR/DFARS compliance in all generated text.
    