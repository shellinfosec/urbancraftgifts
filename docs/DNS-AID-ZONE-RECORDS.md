# DNS for AI Discovery (DNS-AID) Zone Configuration Guide

To enable autonomous agent discovery via DNS (RFC 9460 & draft-mozleywilliams-dnsop-dnsaid), add the following DNS records to your domain zone in **cPanel > Zone Editor** or **Cloudflare DNS**:

## 1. HTTPS / SVCB Records (Primary Agent Entrypoints)

```text
; DNS-AID Primary Catalog Entrypoint
_index._agents.urbancraftgifts.com. 300 IN HTTPS 1 urbancraftgifts.com. alpn="h2,h3" port="443" endpoint="/.well-known/ard.json"

; Agent-to-Agent (A2A) MCP Entrypoint
_a2a._agents.urbancraftgifts.com.   300 IN HTTPS 1 urbancraftgifts.com. alpn="h2,h3" port="443" endpoint="/.well-known/mcp/server-card.json"
```

### Cloudflare DNS Dashboard Setup (if managed via Cloudflare)

1. Go to **DNS > Records > Add Record**.
2. **Type:** `HTTPS` (or `SVCB`)
3. **Name:** `_index._agents`
4. **Target:** `urbancraftgifts.com`
5. **Priority:** `1`
6. **Value / Parameters:** `alpn="h2,h3" port="443" endpoint="/.well-known/ard.json"`

## 2. TXT Fallback Record (Universal Compatibility)

For DNS resolvers or scanners that query TXT fallbacks:

```text
_agents.urbancraftgifts.com. 300 IN TXT "v=dnsaid1; ard=https://urbancraftgifts.com/.well-known/ard.json; skills=https://urbancraftgifts.com/.well-known/agent-skills/index.json; mcp=https://urbancraftgifts.com/.well-known/mcp/server-card.json"
```

## 3. DNSSEC Verification

Ensure DNSSEC is enabled in your cPanel Zone Editor or Cloudflare Dashboard (**DNS > Settings > Enable DNSSEC**) so validating resolvers can cryptographically authenticate the DNS-AID discovery records without tampering.
