# MCP Jira Server

MCP (Model Context Protocol) server for Jira Server/Data Center integration. Allows Claude to browse and manage Jira projects, issues, boards and sprints through natural language.

## Requirements

- Node.js >= 18
- Jira Server/Data Center instance with REST API enabled
- Jira Personal Access Token (PAT)

## Installation

### From GitHub

```bash
npm install -g git+https://github.com/Twozee-Tech/mcp-jira.git
```

### From source

```bash
git clone https://github.com/Twozee-Tech/mcp-jira.git
cd mcp-jira
npm install
npm run build
npm install -g .
```

## Jira Personal Access Token

1. Log in to your Jira instance
2. Go to **Profile** → **Personal Access Tokens**
3. Click **Create token**
4. Give it a name and click **Create**
5. Copy the token - you will need it for configuration

## Configuration

### Windows (Claude Desktop)

Claude Desktop on Windows can run MCP servers through WSL2 or directly via Node.

**Option A: WSL2 (recommended)**

Install Node.js and mcp-jira inside WSL2:

```bash
# In WSL2 terminal
npm install -g git+https://github.com/Twozee-Tech/mcp-jira.git
```

Open Claude Desktop config file:

```
%APPDATA%\Claude\claude_desktop_config.json
```

Add the following:

```json
{
  "mcpServers": {
    "jira": {
      "command": "wsl",
      "args": ["mcp-jira"],
      "env": {
        "JIRA_BASE_URL": "https://jira.your-company.com",
        "JIRA_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

**Option B: Windows native (Node.js for Windows)**

Install Node.js for Windows from https://nodejs.org, then in PowerShell:

```powershell
npm install -g git+https://github.com/Twozee-Tech/mcp-jira.git
```

Config:

```json
{
  "mcpServers": {
    "jira": {
      "command": "mcp-jira",
      "env": {
        "JIRA_BASE_URL": "https://jira.your-company.com",
        "JIRA_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

### Linux / macOS

```bash
npm install -g git+https://github.com/Twozee-Tech/mcp-jira.git
```

Config location:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "jira": {
      "command": "mcp-jira",
      "env": {
        "JIRA_BASE_URL": "https://jira.your-company.com",
        "JIRA_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_projects` | List all Jira projects |
| `get_project` | Get project details |
| `search_issues` | Search issues using JQL |
| `get_issue` | Get full issue details + auto-downloads image attachments |
| `create_issue` | Create a new issue |
| `update_issue` | Update an existing issue |
| `get_comments` | Get comments on an issue |
| `add_comment` | Add a comment to an issue |
| `get_transitions` | Get available status transitions |
| `transition_issue` | Change issue status |
| `list_attachments` | List attachments on an issue |
| `get_attachment` | Download and display a specific image attachment |
| `list_boards` | List Scrum/Kanban boards |
| `get_sprints` | Get sprints for a board |

## Usage Examples

After configuring Claude Desktop, restart it and try:

- "Show me all Jira projects"
- "Search for open bugs in project MYAPP"
- "Create a task in MYAPP: Fix login page timeout"
- "What are the comments on MYAPP-42?"
- "Move MYAPP-42 to In Progress"
- "Show me active sprints on board 1"
- "Analyze bug MYAPP-99" (Claude automatically sees attached screenshots)
- "What attachments are on MYAPP-42?"

## Troubleshooting

**Server not showing up in Claude Desktop**
- Make sure you restarted Claude Desktop after editing the config
- Verify the config JSON is valid (no trailing commas)
- Check that `mcp-jira` is accessible from the command line

**Authentication errors**
- Verify your PAT is valid and not expired
- Make sure `JIRA_BASE_URL` has no trailing slash
- Ensure your Jira instance allows REST API access

**WSL2 issues on Windows**
- Run `wsl mcp-jira` in PowerShell to verify it works
- Make sure Node.js is installed inside WSL2, not just on Windows
