import { CreateMessage, StreamData } from 'ai';

export const finishedTool = {
  type: 'function' as const,
  function: {
    name: 'finished',
    description: 'Call this when you have completed the task successfully. This signals that no more tool calls are needed.',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'A brief summary of what was accomplished',
        },
      },
      required: ['summary'],
    },
  },
};

export async function handleFinished(
  toolCall: any,
  data: StreamData,
  messages: any[],
  appendToolCallMessage: any,
  sandbox: any
): Promise<CreateMessage[]> {
  const summary = toolCall.func.arguments.summary as string;

  data.append({
    messageIdx: messages.length,
    function_name: "finished",
    parameters: {
      summary: summary
    },
    tool_call_id: toolCall.id,
    result: {
      success: true,
      message: `Task completed: ${summary}`
    }
  });

  const msgs = appendToolCallMessage({
    tool_call_id: toolCall.id,
    function_name: 'finished',
    tool_call_result: {
      success: true,
      message: `Task completed: ${summary}`,
    },
  });

  return msgs;
}