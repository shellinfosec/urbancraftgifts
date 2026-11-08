---
agent_auth:
  skill: https://urbancraftgifts.com/auth.md
  register_uri: https://urbancraftgifts.com/auth.md
  claim_uri: https://urbancraftgifts.com/auth/agent/claim
  identity_endpoint: https://urbancraftgifts.com/auth/agent/identity
  claim_endpoint: https://urbancraftgifts.com/auth/agent/claim
  revocation_uri: https://urbancraftgifts.com/auth/agent/revoke
  revocation_endpoint: https://urbancraftgifts.com/auth/agent/revoke
  supported_identity_types:
    - anonymous
    - service_auth
    - id_jag
    - agent-credential
    - bearer-token
  identity_types_supported:
    - anonymous
    - service_auth
    - id_jag
    - agent-credential
    - bearer-token
  credential_types_supported:
    - bearer
    - api_key
    - oauth2_bearer
  credential_types:
    - bearer
    - api_key
    - oauth2_bearer
---

# Urban Craft & Co. - Agent Authentication & Access (auth.md)

Welcome, AI agents and automated integrators. Urban Craft & Co. provides open, high-performance programmatic interfaces for corporate gifting, custom quotation requests, and merchandise catalogue search.

---

## 1. Quick Start & Public Access (No Token Required)

The primary corporate gifting endpoints are open to AI agents for standard client inquiries and quote requests:

- **Corporate Inquiry:** `POST https://urbancraftgifts.com/api/contact`
- **Proposal Builder:** `POST https://urbancraftgifts.com/api/inquire`
- **Health Telemetry:** `GET https://urbancraftgifts.com/api/health`
- **Catalogue & Search:** Open access via static JSON and WebMCP tools.

### Public Inquiries

No API key or OAuth handshake is required for standard client inquiries. Agents should provide:

- Clean contact details (`name`, `email`, `phone`)
- Approximate quantity
- Valid target delivery deadline in the future (`date` in `YYYY-MM-DD` format)
- Purpose and notes

---

## 2. Agent Identity & Registration

For high-volume enterprise integrations, ERP synchronizations, and dedicated agentic runners:

| Property                       | Value                                                                |
| ------------------------------ | -------------------------------------------------------------------- |
| **Issuer**                     | `https://urbancraftgifts.com`                                        |
| **Protected Resource**         | `https://urbancraftgifts.com` (RFC 9728)                             |
| **Resource Metadata (PRM)**    | `https://urbancraftgifts.com/.well-known/oauth-protected-resource`   |
| **OAuth 2.0 Auth Server**      | `https://urbancraftgifts.com/.well-known/oauth-authorization-server` |
| **OpenID Discovery**           | `https://urbancraftgifts.com/.well-known/openid-configuration`       |
| **Supported Identity Types**   | `id_jag`, `agent-credential`, `bearer-token`                         |
| **Supported Credential Types** | `bearer`, `api_key`, `oauth2_bearer`                                 |
| **Registration URI**           | `https://urbancraftgifts.com/auth.md`                                |

### Registration Instructions

1. Submit an enterprise agent registration request via `POST https://urbancraftgifts.com/api/contact` with `purpose: "enterprise-agent-registration"`.
2. Include your agent's User-Agent string, public endpoint, and expected query volume.
3. Our security and enterprise team will review and provision dedicated agent credentials.

---

## 3. Rate Limits & Security Policies

- **Public Endpoints:** 30 requests per 15-minute sliding window per client IP.
- **Honeypot Traps:** Never populate the hidden `hp_website` parameter.
- **Timezone Standards:** All system telemetry, timestamps, and log persistence use **Indian Standard Time (IST, Asia/Kolkata, UTC+05:30)**.

---

## 4. MCP Server & Tool Capabilities

Urban Craft & Co. exposes its tool catalog via Model Context Protocol (SEP-1649):

- **MCP Server Card:** `https://urbancraftgifts.com/.well-known/mcp/server-card.json`
- **Agent Skills Discovery Index:** `https://urbancraftgifts.com/.well-known/agent-skills/index.json`
- **ARD Capability Manifest:** `https://urbancraftgifts.com/.well-known/ai-catalog.json`
