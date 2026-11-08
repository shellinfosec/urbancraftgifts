/**
 * WebMCP (Web Model Context Protocol) Integration
 * Exposes site tools and capabilities to AI agents via the browser (RFC & W3C WebMCP draft).
 * https://webmachinelearning.github.io/webmcp/
 */
import { PRODUCTS, getProduct, type Product } from "./catalog";
import { BUSINESS } from "@/config/business";
import { submitContactForm, type ContactFormData } from "./inquiry-service";

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (params: any) => Promise<any> | any;
}

interface ModelContextAPI {
  registerTool: (tool: ToolDefinition, options?: { signal?: AbortSignal }) => Promise<void>;
  unregisterTool?: (name: string) => Promise<void>;
  tools?: Map<string, ToolDefinition>;
  listTools?: () => ToolDefinition[];
}

declare global {
  interface Document {
    modelContext?: ModelContextAPI;
  }
  interface Window {
    modelContext?: ModelContextAPI;
  }
}

/**
 * Initializes and registers WebMCP browser tools for AI agents.
 */
export function initWebMCP(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // Ensure document.modelContext exists
  const toolRegistry = new Map<string, ToolDefinition>();

  const polyfill: ModelContextAPI = {
    registerTool: async (tool: ToolDefinition, options?: { signal?: AbortSignal }) => {
      toolRegistry.set(tool.name, tool);
      if (options?.signal) {
        options.signal.addEventListener("abort", () => {
          toolRegistry.delete(tool.name);
        });
      }
    },
    unregisterTool: async (name: string) => {
      toolRegistry.delete(name);
    },
    tools: toolRegistry,
    listTools: () => Array.from(toolRegistry.values()),
  };

  const modelContext = document.modelContext || window.modelContext || polyfill;
  document.modelContext = modelContext;
  window.modelContext = modelContext;

  // 1. Tool: search_catalogue
  modelContext.registerTool({
    name: "search_catalogue",
    description:
      "Search corporate gifting collections across 16 categories, keywords, and specifications.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keyword (e.g. 'bottle', 'leather', 'diary')",
        },
        category: {
          type: "string",
          description: "Category slug (e.g. '3-in-1-gift-sets', 'employee-welcome-kits')",
        },
        limit: { type: "number", description: "Max results to return (default: 10)" },
      },
    },
    execute: async ({
      query = "",
      category,
      limit = 10,
    }: {
      query?: string;
      category?: string;
      limit?: number;
    }) => {
      const q = query.toLowerCase().trim();
      const results: Product[] = [];

      for (const p of PRODUCTS) {
        if (category && p.category !== category) continue;
        if (
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        ) {
          results.push(p);
          if (results.length >= limit) break;
        }
      }

      return {
        totalFound: results.length,
        products: results.map((p) => ({
          sku: p.sku,
          name: p.name,
          category: p.category,
          summary: p.summary,
          colors: p.color,
          materials: p.materials,
          customizationMethods: p.customization,
        })),
      };
    },
  });

  // 2. Tool: get_product_details
  modelContext.registerTool({
    name: "get_product_details",
    description: "Get full product specifications, image URLs, and customization methods by SKU.",
    inputSchema: {
      type: "object",
      required: ["sku"],
      properties: {
        sku: { type: "string", description: "Product SKU (e.g. 'GS-2IO-1')" },
      },
    },
    execute: async ({ sku }: { sku: string }) => {
      const product = getProduct(sku);
      if (!product) {
        return { error: `Product SKU '${sku}' not found.` };
      }
      return {
        sku: product.sku,
        name: product.name,
        category: product.category,
        summary: product.summary,
        color: product.color,
        materials: product.materials,
        customization: product.customization,
        useCases: product.useCases,
        occasions: product.occasions,
      };
    },
  });

  // 3. Tool: submit_corporate_inquiry
  modelContext.registerTool({
    name: "submit_corporate_inquiry",
    description: "Submit a corporate gifting enquiry or quotation request to Urban Craft & Co.",
    inputSchema: {
      type: "object",
      required: ["name", "email", "phone", "message"],
      properties: {
        name: { type: "string", description: "Client contact name" },
        email: { type: "string", description: "Corporate email" },
        phone: { type: "string", description: "Phone number (with country code)" },
        company: { type: "string", description: "Company name" },
        purpose: { type: "string", description: "Purpose of gifting" },
        quantity: { type: "string", description: "Quantity required" },
        date: {
          type: "string",
          description: "Target delivery deadline (YYYY-MM-DD, cannot be in the past)",
        },
        message: { type: "string", description: "Requirements notes" },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute: async (params: Record<string, any>) => {
      const payload: ContactFormData = {
        name: String(params["name"] || ""),
        email: String(params["email"] || ""),
        phone: String(params["phone"] || ""),
        company: params["company"] ? String(params["company"]) : undefined,
        purpose: params["purpose"] ? String(params["purpose"]) : "corporate-gifting",
        quantity: params["quantity"] ? String(params["quantity"]) : undefined,
        date: params["date"] ? String(params["date"]) : undefined,
        message: String(params["message"] || ""),
        _renderedAt: Date.now(),
      };
      return await submitContactForm(payload);
    },
  });

  // 4. Tool: get_company_contact
  modelContext.registerTool({
    name: "get_company_contact",
    description:
      "Get verified company contact details, addresses, business hours, and instant WhatsApp link.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    execute: async () => {
      return {
        name: BUSINESS.name,
        tagline: BUSINESS.tagline,
        phone: BUSINESS.phoneDisplay,
        email: BUSINESS.email,
        whatsapp: `https://wa.me/${BUSINESS.whatsappNumber}`,
        address: BUSINESS.addressLine,
        hours: BUSINESS.hours,
      };
    },
  });
}
