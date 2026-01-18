// Email Agent Types

export interface UserProfile {
  name: string;
  email: string;
  designation?: string;
  phone?: string;
  company?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  source?: string; // e.g., "Gmail", "Corp Directory", "Google Contacts"
  avatar?: string;
  department?: string;
}

export interface EmailDraft {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  signature?: string;
}

export interface ParsedIntent {
  action: "DRAFT_EMAIL" | "REPLY_EMAIL" | "FORWARD_EMAIL" | "SEARCH_CONTACTS" | "OTHER";
  recipients?: string[];
  subject_hint?: string;
  content_hint?: string;
  tone?: "formal" | "casual" | "urgent" | "friendly";
}

export interface WorkflowInterrupt {
  type: "DISAMBIGUATION" | "DRAFT_REVIEW" | "NO_REPLY_WARNING" | "CONFIRMATION";
  data: DisambiguationData | DraftReviewData | NoReplyWarningData | ConfirmationData;
}

export interface DisambiguationData {
  ambiguousName: string;
  candidates: Contact[];
}

export interface DraftReviewData {
  draft: EmailDraft;
  suggestions?: string[];
}

export interface NoReplyWarningData {
  originalEmail: string;
  suggestedEmail?: string;
  foundInBody: boolean;
}

export interface ConfirmationData {
  action: string;
  details: string;
}

export interface WorkflowStep {
  id: string;
  protocol: "MCP" | "A2A" | "AGP" | "AP2" | "ANS" | "ACDP" | "TDF";
  action: string;
  status: "pending" | "active" | "complete" | "error" | "interrupted";
  details?: string;
  timestamp: Date;
}

export interface AgentResponse {
  type: "parse_email_intent" | "draft_email" | "refine_email" | "workflow_response" | "message";
  data: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  interrupt?: WorkflowInterrupt;
  metadata?: {
    intent?: ParsedIntent;
    draft?: EmailDraft;
  };
}
