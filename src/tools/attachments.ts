import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { JiraClient } from "../jira-client.js";

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

export function registerAttachmentTools(server: McpServer, jira: JiraClient) {
  server.tool(
    "list_attachments",
    "List attachments on a Jira issue",
    { issueKey: z.string().describe("The issue key (e.g. PROJ-123)") },
    async ({ issueKey }) => {
      const issue = await jira.get<any>(
        `/rest/api/2/issue/${encodeURIComponent(issueKey)}?fields=attachment`
      );
      const attachments = (issue.fields.attachment || []).map((a: any) => ({
        id: a.id,
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
        created: a.created,
        author: a.author?.displayName,
      }));
      return { content: [{ type: "text", text: JSON.stringify(attachments, null, 2) }] };
    }
  );

  server.tool(
    "get_attachment",
    "Download and display an attachment image from a Jira issue",
    {
      issueKey: z.string().describe("The issue key (e.g. PROJ-123)"),
      attachmentId: z.string().optional().describe("Specific attachment ID. If not provided, returns the latest image attachment."),
      filename: z.string().optional().describe("Attachment filename to find. If not provided, returns the latest image attachment."),
    },
    async ({ issueKey, attachmentId, filename }) => {
      const issue = await jira.get<any>(
        `/rest/api/2/issue/${encodeURIComponent(issueKey)}?fields=attachment`
      );
      const attachments: any[] = issue.fields.attachment || [];

      if (attachments.length === 0) {
        return { content: [{ type: "text", text: "No attachments found on this issue." }] };
      }

      let target: any;

      if (attachmentId) {
        target = attachments.find((a: any) => a.id === attachmentId);
      } else if (filename) {
        target = attachments.find((a: any) => a.filename === filename);
      } else {
        // Latest image attachment
        target = [...attachments]
          .reverse()
          .find((a: any) => IMAGE_MIME_TYPES.has(a.mimeType));
      }

      if (!target) {
        const names = attachments.map((a: any) => `${a.filename} (id: ${a.id}, ${a.mimeType})`);
        return {
          content: [{ type: "text", text: `Attachment not found. Available:\n${names.join("\n")}` }],
        };
      }

      if (!IMAGE_MIME_TYPES.has(target.mimeType)) {
        return {
          content: [{ type: "text", text: `Attachment "${target.filename}" is ${target.mimeType}, not an image. Cannot display.` }],
        };
      }

      const imageBuffer = await jira.getBuffer(target.content);
      const base64 = imageBuffer.toString("base64");

      return {
        content: [
          { type: "text", text: `Attachment: ${target.filename} (${target.mimeType})` },
          { type: "image", data: base64, mimeType: target.mimeType },
        ],
      };
    }
  );
}
