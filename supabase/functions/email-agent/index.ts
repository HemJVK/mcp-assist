import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for structured output
const tools = [
  {
    type: "function",
    function: {
      name: "parse_email_intent",
      description: "Parse user intent for email-related actions",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["DRAFT_EMAIL", "REPLY_EMAIL", "FORWARD_EMAIL", "SEARCH_CONTACTS", "OTHER"],
            description: "The primary action the user wants to perform"
          },
          recipients: {
            type: "array",
            items: { type: "string" },
            description: "List of recipient names or email addresses"
          },
          subject_hint: {
            type: "string",
            description: "Subject line hint or topic"
          },
          content_hint: {
            type: "string",
            description: "Brief description of what the email should contain"
          },
          tone: {
            type: "string",
            enum: ["formal", "casual", "urgent", "friendly"],
            description: "Desired tone of the email"
          }
        },
        required: ["action"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "draft_email",
      description: "Generate a complete email draft based on context",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "array",
            items: { type: "string" },
            description: "Recipient email addresses"
          },
          subject: {
            type: "string",
            description: "Email subject line"
          },
          body: {
            type: "string",
            description: "Email body content"
          },
          signature: {
            type: "string",
            description: "Email signature"
          }
        },
        required: ["to", "subject", "body"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "refine_email",
      description: "Refine an existing email draft based on user feedback",
      parameters: {
        type: "object",
        properties: {
          subject: {
            type: "string",
            description: "Updated email subject line"
          },
          body: {
            type: "string",
            description: "Updated email body content"
          },
          changes_made: {
            type: "array",
            items: { type: "string" },
            description: "List of changes made to the email"
          }
        },
        required: ["subject", "body", "changes_made"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "workflow_response",
      description: "Generate a conversational response to the user",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The response message to the user"
          },
          workflow_status: {
            type: "string",
            enum: ["NEEDS_INFO", "PROCESSING", "AWAITING_CONFIRMATION", "COMPLETE", "ERROR"],
            description: "Current workflow status"
          },
          next_action: {
            type: "string",
            description: "What the agent will do next"
          }
        },
        required: ["message", "workflow_status"],
        additionalProperties: false
      }
    }
  }
];

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: ConversationMessage[];
  type: "parse_intent" | "draft_email" | "refine_email" | "chat";
  context?: {
    userProfile?: {
      name: string;
      email: string;
      designation?: string;
      phone?: string;
    };
    currentDraft?: {
      to: string[];
      subject: string;
      body: string;
    };
    resolvedRecipients?: Array<{
      name: string;
      email: string;
    }>;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages, type, context }: RequestBody = await req.json();
    console.log("Processing request:", { type, messageCount: messages.length });

    // Build the system prompt based on request type
    let systemPrompt = `You are an intelligent email assistant that helps users draft, edit, and manage emails.
You are part of a multi-agent system that follows the MCP (Model Context Protocol) and A2A (Agent-to-Agent) protocols.

Current user context:
${context?.userProfile ? `
- Name: ${context.userProfile.name}
- Email: ${context.userProfile.email}
- Designation: ${context.userProfile.designation || "Not specified"}
` : "No user profile available"}

${context?.resolvedRecipients?.length ? `
Resolved recipients:
${context.resolvedRecipients.map(r => `- ${r.name}: ${r.email}`).join("\n")}
` : ""}

${context?.currentDraft ? `
Current draft:
To: ${context.currentDraft.to.join(", ")}
Subject: ${context.currentDraft.subject}
Body: ${context.currentDraft.body}
` : ""}

Guidelines:
1. Be concise and professional
2. If recipient information is ambiguous, request clarification
3. Always include a proper signature based on user profile
4. For urgent emails, use appropriate language and formatting
5. Detect and warn about no-reply addresses
`;

    // Determine which tool to use based on request type
    let toolChoice: { type: "function"; function: { name: string } } | undefined;
    
    switch (type) {
      case "parse_intent":
        toolChoice = { type: "function", function: { name: "parse_email_intent" } };
        systemPrompt += "\n\nParse the user's message to understand their email intent.";
        break;
      case "draft_email":
        toolChoice = { type: "function", function: { name: "draft_email" } };
        systemPrompt += "\n\nGenerate a complete email draft based on the conversation.";
        break;
      case "refine_email":
        toolChoice = { type: "function", function: { name: "refine_email" } };
        systemPrompt += "\n\nRefine the current email draft based on user feedback.";
        break;
      case "chat":
        toolChoice = { type: "function", function: { name: "workflow_response" } };
        break;
    }

    const body: Record<string, unknown> = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      tools,
    };

    if (toolChoice) {
      body.tool_choice = toolChoice;
    }

    console.log("Calling AI gateway with tool:", toolChoice?.function?.name);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data).slice(0, 500));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      console.log("Tool result:", { functionName, functionArgs });

      return new Response(
        JSON.stringify({
          type: functionName,
          data: functionArgs,
          raw: data
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback to message content
    const content = data.choices?.[0]?.message?.content || "";
    return new Response(
      JSON.stringify({
        type: "message",
        data: { content },
        raw: data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
