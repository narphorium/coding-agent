import { CreateMessage, StreamData, Tool } from 'ai';

export const projectLayoutTool: Tool = {
  type: 'function',
  function: {
    name: 'project_layout',
    description: 'Get the full directory structure of the repository as text.',
    parameters: {
      type: 'object',
      properties: {
        rootPath: {
          type: 'string',
          description: 'Root directory of the target repository',
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum depth to traverse (default: 10)',
          default: 10,
        },
        includeHidden: {
          type: 'boolean',
          description: 'Include hidden files and directories (default: false)',
          default: false,
        },
      },
      required: ["rootPath"],
    },
  },
};

async function getDirectoryStructure(
  dirPath: string,
  sandbox: any,
  maxDepth: number = 10,
  includeHidden: boolean = false,
  currentDepth: number = 0,
  prefix: string = ''
): Promise<string> {
  if (currentDepth >= maxDepth) {
    return '';
  }

  let result = '';

  try {
    const items = await sandbox.files.list(dirPath);
    const filteredItems = includeHidden
      ? items
      : items.filter((item: any) => !item.name.startsWith('.'));

    const sortedItems = filteredItems.sort((a: any, b: any) => {
      // Directories first, then files, both alphabetically
      return a.name.localeCompare(b.name);
    });

    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i];
      const itemPath = dirPath === '/' ? `/${item.name}` : `${dirPath}/${item.name}`;
      const isLast = i === sortedItems.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isLast ? '    ' : '│   ');

      try {
        if (item.type === 'dir') {
          result += `${prefix}${connector}${item.name}/\n`;

          // Skip node_modules and other common large directories
          if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(item.name)) {
            result += await getDirectoryStructure(
              itemPath,
              sandbox,
              maxDepth,
              includeHidden,
              currentDepth + 1,
              newPrefix
            );
          }
        } else {
          result += `${prefix}${connector}${item.name}\n`;
        }
      } catch (error) {
        // Skip files/directories we can't access
        result += `${prefix}${connector}${item.name} (access denied)\n`;
      }
    }
  } catch (error) {
    return `${prefix}Error reading directory: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
  }

  return result;
}

export async function handleProjectLayout(
  toolCall: any,
  data: StreamData,
  messages: any[],
  appendToolCallMessage: any,
  sandbox: any
): Promise<CreateMessage[]> {
  try {
    const rootPath = toolCall.func.arguments.rootPath || '/';
    const maxDepth = toolCall.func.arguments.maxDepth || 10;
    const includeHidden = toolCall.func.arguments.includeHidden || false;

    const directoryStructure = await getDirectoryStructure(
      rootPath,
      sandbox,
      maxDepth,
      includeHidden
    );

    const result = `Directory Structure:\n${rootPath}/\n${directoryStructure}`;

    data.append({
      messageIdx: messages.length,
      function_name: "project_layout",
      parameters: {
        rootPath,
        maxDepth,
        includeHidden
      },
      tool_call_id: toolCall.id,
      result: {
        structure: result
      }
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'project_layout',
      tool_call_result: {
        structure: result,
      },
    });

    return msgs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error getting project layout';

    data.append({
      messageIdx: messages.length,
      function_name: "project_layout",
      parameters: toolCall.func.arguments,
      tool_call_id: toolCall.id,
      error: errorMessage
    });

    const msgs = appendToolCallMessage({
      tool_call_id: toolCall.id,
      function_name: 'project_layout',
      tool_call_result: {
        error: errorMessage,
      },
    });

    return msgs;
  }
}