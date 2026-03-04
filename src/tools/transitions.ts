import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JiraClient } from "../jira-client.js";

export function registerTransitionTools(server: McpServer, jira: JiraClient) {
  server.tool(
    "get_transitions",
    "Get available transitions for a Jira issue",
    { issueKey: z.string().describe("The issue key (e.g. PROJ-123)") },
    async ({ issueKey }) => {
      const data = await jira.get<any>(
        `/rest/api/2/issue/${encodeURIComponent(issueKey)}/transitions`
      );
      const transitions = data.transitions.map((t: any) => ({
        id: t.id,
        name: t.name,
        to: t.to?.name,
      }));
      return { content: [{ type: "text", text: JSON.stringify(transitions, null, 2) }] };
    }
  );

  server.tool(
    "transition_issue",
    "Transition a Jira issue to a new status",
    {
      issueKey: z.string().describe("The issue key (e.g. PROJ-123)"),
      transitionId: z.string().describe("The transition ID (use get_transitions to find available IDs)"),
    },
    async ({ issueKey, transitionId }) => {
      await jira.post(
        `/rest/api/2/issue/${encodeURIComponent(issueKey)}/transitions`,
        { transition: { id: transitionId } }
      );
      return { content: [{ type: "text", text: `Issue ${issueKey} transitioned successfully.` }] };
    }
  );
}
