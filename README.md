# 🌿 Urban Craft & Co. — Corporate Gifting Platform & Agent-Ready Web Architecture

<div align="center">

[![Domain](https://img.shields.io/badge/Domain-urbancraftgifts.com-2F3A2E?style=for-the-badge&logo=google-chrome&logoColor=D4AF37)](https://urbancraftgifts.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-shellinfosec%2Furbancraftgifts-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shellinfosec/urbancraftgifts)
[![cPanel Deployment](https://img.shields.io/badge/cPanel-Automated%20Deploy-FF6C2C?style=for-the-badge&logo=cpanel&logoColor=white)](https://cpanel.net)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js API](https://img.shields.io/badge/API-Express%20%2B%20Nodemailer-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Agent Ready](https://img.shields.io/badge/Agentic-RFC%209727%20%7C%20MCP%20%7C%20WebMCP-8C6D58?style=for-the-badge&logo=robot&logoColor=white)](https://agenticresourcediscovery.org)

**Production corporate gifting studio platform, interactive 2026 catalogue lookbook, hardened contact form module with backdate prevention, secure SMTP notification engine, zero-loss monthly JSON lead telemetry, and full Agent-Ready Discovery standards.**

[Live Website](https://urbancraftgifts.com) • [cPanel Deployment](#-cpanel-deployment-guide) • [Agent Discovery & Standards](#-agent-discovery--ai-standards) • [Local Development](#-local-development--build-commands)

</div>

---

## 📌 Project & Production Specifications

| Specification                 | Production Value                                                           |
| :---------------------------- | :------------------------------------------------------------------------- |
| **Production Domain**         | `https://urbancraftgifts.com` (and `https://www.urbancraftgifts.com`)      |
| **GitHub Repository**         | `https://github.com/shellinfosec/urbancraftgifts`                          |
| **Target Branch**             | `main`                                                                     |
| **cPanel Frontend Directory** | `/home/urbancraftgifts/public_html`                                        |
| **cPanel API Root Directory** | `/home/urbancraftgifts/urbancraftgifts-api`                                |
| **Port Assignment**           | Dynamic via cPanel Node.js Application Manager (Phusion Passenger)         |
| **Timezone Standard**         | **Indian Standard Time (IST, Asia/Kolkata, UTC+05:30)**                    |
| **Email Transport**           | Port 465 SSL over authenticated SMTP (`notifications@urbancraftgifts.com`) |

---

## 🏛 Architecture & Dual-Engine Deployment

Urban Craft & Co. deploys a decoupled, high-resilience architecture combining Apache's instant static file serving with Phusion Passenger's managed Node.js API runtime:

```mermaid
graph TD
    A[git push origin main] -->|cPanel Git Version Control| B[cPanel Automated Deployment]
    B -->|Executes .cpanel.yml| C{Deployment Dispatcher}
    C -->|Deploys Prerendered Static Build| D[/home/urbancraftgifts/public_html]
    C -->|Deploys Backend Code & Manifest| E[/home/urbancraftgifts/urbancraftgifts-api]
    C -->|Touches restart.txt| F[Phusion Passenger Live Reload]
    D -->|Apache Direct 0ms Delivery| G[Live Visitors / Browsers]
    D -->|Proxies /api & .well-known| E
    E -->|Express Hardened API| H[SMTP Dispatch & Monthly Leads JSON]
```

### Key Architectural Strengths

1. **Dynamic Port Management**: Never binds to hardcoded port numbers in production; integrates directly with cPanel Passenger's dynamically allocated pipes and environment sockets.
2. **Backdate Prevention**: All corporate gifting and contact forms enforce native calendar date constraints (`min={YYYY-MM-DD}`) and server-side Zod validation ensuring target dates cannot be set to past dates.
3. **Zero-Loss Atomic Persistence**: Every submission is written synchronously to append-only `.jsonl` files and queued atomically to monthly rotating lead databases (`data/november-2026-leads.json`).
4. **Branded Minimalist Light Emails**: Notifications render using Urban Craft brand guidelines (`#FAF8F5`, `#2F3A2E`, `#8C6D58`, `#C2A268`) with complete client telemetry (IP, ISP, Geolocation, Device, IST Timestamps).

---

## 🤖 Agent Discovery & AI Standards (AEO, GEO, Agentic-Ready)

This platform implements the complete suite of modern AI Agent Discovery standards:

| Standard / Goal                         | File / Endpoint                                  | Purpose                                                                           |
| :-------------------------------------- | :----------------------------------------------- | :-------------------------------------------------------------------------------- |
| **RFC 8288 Link Headers**               | `Link:` Response Header                          | Advertises API catalog, ARD manifest, MCP card, and skills                        |
| **RFC 9727 API Catalog**                | `/.well-known/api-catalog`                       | Standard linkset pointing to OpenAPI, docs, and health endpoints                  |
| **OpenAPI 3.1 Schema**                  | `/.well-known/openapi.json`                      | Full machine-readable API specification                                           |
| **ARD Capability Manifest**             | `/.well-known/ai-catalog.json`                   | Agentic Resource Discovery manifest with representative queries                   |
| **MCP Server Card (SEP-1649)**          | `/.well-known/mcp/server-card.json`              | Model Context Protocol tools definition (`search_catalogue`, `get_product`, etc.) |
| **Agent Skills Index (RFC v0.2.0)**     | `/.well-known/agent-skills/index.json`           | Registered agent skills with SHA-256 digest validation                            |
| **WebMCP Integration**                  | `src/lib/webmcp.ts`                              | Browser agent tool registration (`document.modelContext.registerTool`)            |
| **Markdown for Agents**                 | Content Negotiation (`Accept: text/markdown`)    | Token-efficient markdown representations of pages for LLM RAG pipelines           |
| **Content Signals**                     | `/robots.txt` (`Content-Signal: ai-train=no...`) | AI usage preferences declarations (contentsignals.org)                            |
| **DNS-AID Records**                     | `docs/DNS-AID-ZONE-RECORDS.md`                   | DNS-based agent entrypoints (`_index._agents.urbancraftgifts.com`)                |
| **OAuth / OIDC Metadata**               | `/.well-known/oauth-authorization-server`        | OAuth 2.0 authorization server metadata with `agent_auth` block                   |
| **OAuth Protected Resource (RFC 9728)** | `/.well-known/oauth-protected-resource`          | Resource identifier and scope declaration for AI agents                           |
| **Agent Auth Guidelines**               | `/auth.md`                                       | Non-interactive registration and inquiry guidelines                               |
| **Canonical XML Sitemap**               | `/sitemap.xml`                                   | Fully indexed list of all 29 routes and category lookbooks                        |

---

## 🚀 cPanel Deployment Guide

### Step 1: Git Version Control Setup

1. In cPanel, navigate to **Files** > **Git™ Version Control**.
2. Click **Create**:
   - **Clone URL**: `https://github.com/shellinfosec/urbancraftgifts.git`
   - **Repository Path**: `repositories/urbancraftgifts`
   - **Repository Name**: `urbancraftgifts`
   - Click **Create**.

### Step 2: Node.js Application Manager Setup

1. In cPanel, open **Setup Node.js App**.
2. Click **Create Application**:
   - **Node.js version**: `18.x` or `20.x`
   - **Application mode**: `Production`
   - **Application root**: `urbancraftgifts-api`
   - **Application startup file**: `cpanel-start.cjs`
   - **Application URL**: `api` (or leave default for passenger socket)
   - Click **Create**.
3. Under **Application configuration**, click **Run NPM Install** to install dependencies from `package.json`.
4. In cPanel **File Manager**, ensure `/home/urbancraftgifts/urbancraftgifts-api/.env` contains your production SMTP and Turnstile keys.

### Step 3: Deploy and Live Reload

1. Under **Git™ Version Control**, click **Manage** on `urbancraftgifts`.
2. Go to the **Pull or Deploy** tab.
3. Click **Update from Remote** and then **Deploy HEAD Commit**.
4. `.cpanel.yml` automatically moves `dist/` into `public_html/`, updates `urbancraftgifts-api/`, backs up lead databases, and touches `tmp/restart.txt` to trigger an instant zero-downtime reload!

---

## 💻 Local Development & Build Commands

```sh
# 1. Install dependencies
npm install

# 2. Run local dev server with API proxying
npm run dev

# 3. Execute Vitest test suite
npx vitest run

# 4. Verify TypeScript compilation
npx tsc --noEmit

# 5. Run ESLint validation
npm run lint

# 6. Build production static bundle and prerender all 29 routes
npm run build
```

---

## 🛡️ License

Proprietary © 2026 Urban Craft & Co. All rights reserved. Managed by Shell InfoSec.
