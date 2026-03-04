import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JiraClient } from "../jira-client.js";

export function registerBoardTools(server: McpServer, jira: JiraClient) {
  server.tool(
    "list_boards",
    "List all Jira boards (Scrum/Kanban)",
    {},
    async () => {
      const data = await jira.get<any>("/rest/agile/1.0/board");
      const boards = data.values.map((b: any) => ({
        id: b.id,
        name: b.name,
        type: b.type,
      }));
      return { content: [{ type: "text", text: JSON.stringify(boards, null, 2) }] };
    }
  );

  server.tool(
    "get_sprints",
    "Get sprints for a Jira board",
    { boardId: z.number().describe("The board ID") },
    async ({ boardId }) => {
      const data = await jira.get<any>(`/rest/agile/1.0/board/${boardId}/sprint`);
      const sprints = data.values.map((s: any) => ({
        id: s.id,
        name: s.name,
        state: s.state,
        startDate: s.startDate,
        endDate: s.endDate,
      }));
      return { content: [{ type: "text", text: JSON.stringify(sprints, null, 2) }] };
    }
  );
}
