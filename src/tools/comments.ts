import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JiraClient } from "../jira-client.js";

export function registerCommentTools(server: McpServer, jira: JiraClient) {
  server.tool(
    "get_comments",
    "Get comments on a Jira issue",
    { issueKey: z.string().describe("The issue key (e.g. PROJ-123)") },
    async ({ issueKey }) => {
      const data = await jira.get<any>(
        `/rest/api/2/issue/${encodeURIComponent(issueKey)}/comment`
      );
      const comments = data.comments.map((c: any) => ({
        id: c.id,
        author: c.author?.displayName,
        body: c.body,
        created: c.created,
        updated: c.updated,
      }));
      return { content: [{ type: "text", text: JSON.stringify(comments, null, 2) }] };
    }
  );

  server.tool(
    "add_comment",
    "Add a comment to a Jira issue",
    {
      issueKey: z.string().describe("The issue key (e.g. PROJ-123)"),
      body: z.string().describe("Comment text"),
    },
    async ({ issueKey, body }) => {
      const result = await jira.post<any>(
        `/rest/api/2/issue/${encodeURIComponent(issueKey)}/comment`,
        { body }
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
