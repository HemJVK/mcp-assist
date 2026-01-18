import { supabase } from "@/integrations/supabase/client";
import type { 
  UserProfile, 
  EmailDraft, 
  ParsedIntent, 
  AgentResponse,
  Contact 
} from "@/types/email-agent";

interface AgentContext {
  userProfile?: UserProfile;
  currentDraft?: EmailDraft;
  resolvedRecipients?: Contact[];
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Parse user intent from message
 */
export async function parseIntent(
  message: string,
  context?: AgentContext
): Promise<ParsedIntent> {
  const { data, error } = await supabase.functions.invoke<AgentResponse>("email-agent", {
    body: {
      messages: [{ role: "user", content: message }],
      type: "parse_intent",
      context,
    },
  });

  if (error) {
    console.error("parseIntent error:", error);
    throw new Error(error.message || "Failed to parse intent");
  }

  if (data?.type === "parse_email_intent") {
    return data.data as unknown as ParsedIntent;
  }

  // Default fallback
  return { action: "OTHER" };
}

/**
 * Generate email draft
 */
export async function generateDraft(
  conversationHistory: ConversationMessage[],
  context: AgentContext
): Promise<EmailDraft> {
  const { data, error } = await supabase.functions.invoke<AgentResponse>("email-agent", {
    body: {
      messages: conversationHistory,
      type: "draft_email",
      context,
    },
  });

  if (error) {
    console.error("generateDraft error:", error);
    throw new Error(error.message || "Failed to generate draft");
  }

  if (data?.type === "draft_email") {
    const draftData = data.data as Record<string, unknown>;
    return {
      to: (draftData.to as string[]) || [],
      subject: (draftData.subject as string) || "",
      body: (draftData.body as string) || "",
      signature: draftData.signature as string | undefined,
    };
  }

  throw new Error("Unexpected response from email agent");
}

/**
 * Refine existing email draft
 */
export async function refineDraft(
  feedback: string,
  conversationHistory: ConversationMessage[],
  context: AgentContext
): Promise<{ draft: EmailDraft; changes: string[] }> {
  const { data, error } = await supabase.functions.invoke<AgentResponse>("email-agent", {
    body: {
      messages: [
        ...conversationHistory,
        { role: "user", content: feedback }
      ],
      type: "refine_email",
      context,
    },
  });

  if (error) {
    console.error("refineDraft error:", error);
    throw new Error(error.message || "Failed to refine draft");
  }

  if (data?.type === "refine_email") {
    const refineData = data.data as Record<string, unknown>;
    return {
      draft: {
        to: context.currentDraft?.to || [],
        subject: (refineData.subject as string) || context.currentDraft?.subject || "",
        body: (refineData.body as string) || context.currentDraft?.body || "",
      },
      changes: (refineData.changes_made as string[]) || [],
    };
  }

  throw new Error("Unexpected response from email agent");
}

/**
 * Chat with agent for general workflow
 */
export async function chat(
  conversationHistory: ConversationMessage[],
  context?: AgentContext
): Promise<{ message: string; status: string; nextAction?: string }> {
  const { data, error } = await supabase.functions.invoke<AgentResponse>("email-agent", {
    body: {
      messages: conversationHistory,
      type: "chat",
      context,
    },
  });

  if (error) {
    console.error("chat error:", error);
    throw new Error(error.message || "Failed to chat with agent");
  }

  if (data?.type === "workflow_response") {
    const responseData = data.data as Record<string, unknown>;
    return {
      message: (responseData.message as string) || "",
      status: (responseData.workflow_status as string) || "PROCESSING",
      nextAction: responseData.next_action as string | undefined,
    };
  }

  if (data?.type === "message") {
    return {
      message: (data.data as Record<string, unknown>).content as string || "",
      status: "COMPLETE",
    };
  }

  throw new Error("Unexpected response from email agent");
}

/**
 * Simulate contact search (in production, would call Google Contacts MCP)
 */
export async function searchContacts(query: string): Promise<Contact[]> {
  // Simulated contacts for demo - in production this would call MCP
  const mockContacts: Contact[] = [
    { id: "1", name: "John Doe", email: "john.doe@gmail.com", source: "Gmail" },
    { id: "2", name: "John Smith", email: "john.smith@corp.com", source: "Corporate" },
    { id: "3", name: "John Williams", email: "jwilliams@example.com", source: "Google Contacts" },
    { id: "4", name: "Priya Sharma", email: "priya.sharma@gmail.com", source: "Gmail" },
    { id: "5", name: "Jane Doe", email: "jane.doe@company.com", source: "Corporate" },
  ];

  const normalizedQuery = query.toLowerCase();
  return mockContacts.filter(
    c => c.name.toLowerCase().includes(normalizedQuery) || 
         c.email.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Check if an email is a no-reply address
 */
export function isNoReplyAddress(email: string): boolean {
  const noReplyPatterns = [
    /^noreply@/i,
    /^no-reply@/i,
    /^donotreply@/i,
    /^do-not-reply@/i,
    /^notification@/i,
  ];
  return noReplyPatterns.some(pattern => pattern.test(email));
}

/**
 * Extract potential reply email from email body
 */
export function extractReplyEmail(body: string): string | null {
  const patterns = [
    /(contact|support|help|info|feedback)@[\w.-]+\.\w+/gi,
    /reply\s+to[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      // Extract just the email from the match
      const emailMatch = match[0].match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) return emailMatch[0];
    }
  }

  return null;
}
