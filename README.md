# 🌿 Urban Craft & Co. — Corporate Gifting Lookbook & Web Platform

<div align="center">

[![Domain](https://img.shields.io/badge/Domain-urbancraftgifts.com-2F3A2E?style=for-the-badge&logo=google-chrome&logoColor=D4AF37)](https://urbancraftgifts.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-shellinfosec%2Furbancraftgifts-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shellinfosec/urbancraftgifts)
[![cPanel Deployment](https://img.shields.io/badge/cPanel-Automated%20Deploy-FF6C2C?style=for-the-badge&logo=cpanel&logoColor=white)](https://cpanel.net)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js API](https://img.shields.io/badge/API-Express%20%2B%20Nodemailer-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Premium corporate gifting studio web application, interactive 2026 catalogue lookbook, secure validated contact form module, and automated cPanel deployment with Phusion Passenger API backend.**

[Live Website](https://urbancraftgifts.com) • [Deployment Guide](#-cpanel-deployment-guide) • [Architecture](#-architecture--deployment-pipeline) • [Local Development](#-local-development)

</div>

---

## 📌 Project & Deployment Variables

| Variable                         | Configured Value                                           |
| :------------------------------- | :--------------------------------------------------------- |
| **Project Domain**               | `urbancraftgifts.com` (and `demo.urbancraftgifts.com`)      |
| **GitHub Repository**            | `https://github.com/shellinfosec/urbancraftgifts`          |
| **cPanel Frontend Directory**    | `/home/urbancraftgifts/public_html`                        |
| **cPanel API Root Directory**    | `/home/urbancraftgifts/urbancraftgifts-api`                |
| **Deployment Mode**              | **Static SPA on Apache** + **Phusion Passenger Node.js API**|
| **Target Build Directory**       | `dist/`                                                    |
| **Author**                       | **Syed Haseeb Rizvi** (`syedhaseeb@shellinfosec.com`)      |
| **Target Branch**                | `main`                                                     |

---

## 🏛 Architecture & Deployment Pipeline

This application is built with React 19, Vite, and TanStack Router, prerendering every single page into clean static HTML and committed directly in the `dist/` directory.

```mermaid
graph LR
    A[Local Build: npm run build] -->|Compiles & Prerenders 29+ Pages| B[dist/ Directory]
    B -->|git commit & push| C[GitHub Repository: main]
    C -->|cPanel Git Version Control| D[cPanel Pull / Deploy]
    D -->|Executes .cpanel.yml| E[/home/urbancraftgifts/demo.urbancraftgifts.com]
    E -->|Apache Server| F[Live Website: demo.urbancraftgifts.com]
```

### Key Advantages of This Architecture

1. **Zero cPanel Server Overhead**: No background Node.js daemons, no Phusion Passenger processes to manage, and no runtime memory consumption on your cPanel account.
2. **Sub-second Loading Speed**: Apache delivers static HTML, WebP/PNG images, stylesheets, and JavaScript bundles directly with aggressive caching headers.
3. **Flawless Client-Side Routing**: The deployed `dist/.htaccess` routes any non-file URLs straight to `index.html`, ensuring page reloads and deep links never trigger 404s.
4. **Instant cPanel Git Deployment**: `.cpanel.yml` simply copies `dist/` directly into `/home/urbancraftgifts/demo.urbancraftgifts.com` via `/bin/cp -R dist/. $DEPLOYPATH/`.

---

## 🚀 cPanel Deployment Guide

Deploying updates to `demo.urbancraftgifts.com` requires only a single click in your cPanel dashboard:

### Step 1: Open Git™ Version Control in cPanel

1. Log into your **cPanel Account**.
2. Under **Files**, open **Git™ Version Control**.
3. If not already configured, click **Create**:
   - **Clone URL**: `https://github.com/shellinfosec/urbancraft-demo.git`
   - **Repository Path**: `repositories/urbancraft-demo`
   - **Repository Name**: `urbancraft-demo`
   - Click **Create**.

### Step 2: Deploy Head Commit

1. In **Git™ Version Control**, click **Manage** next to `urbancraft-demo`.
2. Select the **Pull or Deploy** tab.
3. Click **Update from Remote** (fetches latest commits from `main`).
4. Click **Deploy HEAD Commit**.

> [!NOTE]
> The automated `.cpanel.yml` script copies all production files from `dist/` into `/home/urbancraftgifts/demo.urbancraftgifts.com` in seconds. Your site is immediately live with all pages, media assets, and `.htaccess` routing rules active.

---

## 🔒 Security & Environment Variables

- **Strict Environment Protection**: All `.env`, `.env.*`, and `.dev.vars` files are strictly excluded via `.gitignore`.
- **Zero Sensitive Data**: No passwords, tokens, or credentials are committed to the repository history.
- **Client Safe**: All client configuration uses `VITE_` variables bundled during local compilation.

---

## 💻 Local Development & Build Commands

```sh
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Execute automated test suite (Vitest)
npm run test

# 4. Check code quality (ESLint)
npm run lint

# 5. Format code (Prettier)
npm run format

# 6. Production build (compiles assets & prerenders all static pages into dist/)
npm run build

# 7. Preview the build locally
npm run preview
```

---

## 📂 Repository Structure

```text
├── .cpanel.yml                # Automated deployment script for cPanel
├── dist/                      # Pre-compiled, production-ready static site (Committed)
│   ├── .htaccess              # Apache URL rewrite and caching rules
│   ├── index.html             # Homepage prerendered HTML shell
│   ├── catalogue.html         # 2026 Lookbook catalogue prerendered HTML
│   ├── products.html          # All products directory
│   ├── categories/            # 16 prerendered category pages
│   ├── assets/                # JS bundles, CSS, logos, and product photography
│   └── manifest.webmanifest   # Web application manifest
├── public/                    # Raw static assets
│   ├── .htaccess              # Base Apache rewrite rules
│   └── favicon.ico            # Favicon set
├── scripts/
│   └── prerender-spa.mjs      # Fast static HTML generator for 29+ routes
├── src/                       # Application source code
│   ├── components/            # UI components (catalog, brand, layout, inquiry)
│   ├── config/                # Business facts, navigation, categories, content
│   ├── data/                  # 327+ Normalized product catalogue (products.json)
│   └── routes/                # File-based application routes
├── package.json               # Dependencies and scripts
└── vite.config.ts             # Vite build configuration
```

---

## 👤 Author & Support

- **Author**: **Syed Haseeb Rizvi**
- **Email**: [syedhaseeb@shellinfosec.com](mailto:syedhaseeb@shellinfosec.com)
- **Organization**: Shell InfoSec / Urban Craft & Co.
