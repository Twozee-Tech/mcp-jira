import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JiraClient } from "../jira-client.js";

export function registerProjectTools(server: McpServer, jira: JiraClient) {
  server.tool(
    "list_projects",
    "List all Jira projects",
    {},
    async () => {
      const projects = await jira.get<any[]>("/rest/api/2/project");
      const result = projects.map((p) => ({
        key: p.key,
        name: p.name,
        lead: p.lead?.displayName,
      }));
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_project",
    "Get details of a specific Jira project",
    { projectKey: z.string().describe("The project key (e.g. PROJ)") },
    async ({ projectKey }) => {
      const project = await jira.get<any>(`/rest/api/2/project/${encodeURIComponent(projectKey)}`);
      return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
    }
  );
}
