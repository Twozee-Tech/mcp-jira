import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JiraClient } from "../jira-client.js";

export function registerTempoTools(server: McpServer, jira: JiraClient) {
  server.tool(
    "log_work",
    "Log time spent on a Jira issue via Tempo Timesheets",
    {
      issueKey: z.string().describe("The issue key (e.g. PROJ-123)"),
      timeSpent: z.string().describe("Time spent (e.g. '1h', '30m', '1h 30m', '2h 15m')"),
      date: z.string().describe("Date of work (YYYY-MM-DD)"),
      comment: z.string().optional().describe("Work description"),
      worker: z.string().optional().describe("Username of worker (defaults to token owner)"),
    },
    async ({ issueKey, timeSpent, date, comment, worker }) => {
      const seconds = parseTimeToSeconds(timeSpent);
      if (seconds <= 0) {
        return { content: [{ type: "text", text: `Invalid time format: "${timeSpent}". Use e.g. "1h", "30m", "1h 30m".` }] };
      }

      const body: any = {
        originTaskId: issueKey,
        started: date,
        timeSpentSeconds: seconds,
      };
      if (comment) body.comment = comment;
      if (worker) body.worker = worker;

      const result = await jira.post<any>("/rest/tempo-timesheets/4/worklogs", body);
      const hours = Math.floor(result.timeSpentSeconds / 3600);
      const mins = Math.floor((result.timeSpentSeconds % 3600) / 60);
      return {
        content: [{
          type: "text",
          text: `Logged ${hours}h ${mins}m on ${result.originTaskId} (${date})${result.comment ? ` - "${result.comment}"` : ""}`,
        }],
      };
    }
  );

  server.tool(
    "get_worklogs",
    "Get Tempo worklogs for a date range",
    {
      from: z.string().describe("Start date (YYYY-MM-DD)"),
      to: z.string().describe("End date (YYYY-MM-DD)"),
      worker: z.string().optional().describe("Username to filter by (defaults to all)"),
      projectKey: z.string().optional().describe("Project key to filter by"),
      issueKey: z.string().optional().describe("Issue key to filter by"),
    },
    async ({ from, to, worker, projectKey, issueKey }) => {
      const body: any = { from, to };
      if (worker) body.worker = [worker];
      if (projectKey) body.projectKey = [projectKey];
      if (issueKey) body.taskKey = [issueKey];

      const data = await jira.post<any>("/rest/tempo-timesheets/4/worklogs/search", body);
      const results: any[] = data.results || data;

      // Collect unique issue IDs and resolve to keys
      const issueIds = [...new Set(results.map((w: any) => String(w.originTaskId)))];
      const idToKey: Record<string, string> = {};
      await Promise.all(
        issueIds.map(async (id) => {
          try {
            const issue = await jira.get<any>(`/rest/api/2/issue/${id}?fields=summary`);
            idToKey[id] = issue.key;
          } catch {
            idToKey[id] = id;
          }
        })
      );

      const worklogs = results.map((w: any) => ({
        id: w.tempoWorklogId,
        issue: idToKey[String(w.originTaskId)] || w.originTaskId,
        date: w.started,
        timeSpent: formatSeconds(w.timeSpentSeconds),
        worker: w.worker,
        comment: w.comment,
      }));
      return { content: [{ type: "text", text: JSON.stringify(worklogs, null, 2) }] };
    }
  );

  server.tool(
    "delete_worklog",
    "Delete a Tempo worklog entry",
    {
      worklogId: z.number().describe("The worklog ID (get it from get_worklogs)"),
    },
    async ({ worklogId }) => {
      await jira.delete(`/rest/tempo-timesheets/4/worklogs/${worklogId}`);
      return { content: [{ type: "text", text: `Worklog ${worklogId} deleted.` }] };
    }
  );
}

function parseTimeToSeconds(input: string): number {
  let total = 0;
  const hours = input.match(/(\d+)\s*h/i);
  const minutes = input.match(/(\d+)\s*m/i);
  if (hours) total += parseInt(hours[1]) * 3600;
  if (minutes) total += parseInt(minutes[1]) * 60;
  return total;
}

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 && m > 0 ? `${h}h ${m}m` : h > 0 ? `${h}h` : `${m}m`;
}
