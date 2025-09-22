import 'server-only';

import { Sandbox } from '@e2b/code-interpreter';
import { NextResponse } from 'next/server';
import { handleEditFile } from '@/src/tools/edit_file';
import { StreamData } from 'ai';

const E2B_API_KEY = process.env.E2B_API_KEY;
if (!E2B_API_KEY) {
  throw new Error('E2B_API_KEY environment variable not found');
}

const sandboxTimeout = 10 * 60 * 1000; // 10 minutes in ms

async function getSandbox(sessionID: string) {
  const sandboxes = await Sandbox.list();
  const sandboxID = sandboxes.find(sandbox => sandbox.metadata?.sessionID === sessionID)?.sandboxId;

  if (sandboxID) {
    const sandbox = await Sandbox.connect(sandboxID, {
      apiKey: E2B_API_KEY,
    });
    await sandbox.setTimeout(sandboxTimeout);
    return sandbox;
  } else {
    const sandbox = await Sandbox.create({
      apiKey: E2B_API_KEY,
      metadata: {
        sessionID,
      },
      timeoutMs: sandboxTimeout
    });
    return sandbox;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionID, filePath, editedContent, model, oldText, newText } = body;

    if (!sessionID) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Determine which mode to use based on provided parameters
    const useLLM = editedContent !== undefined;

    if (useLLM && editedContent === undefined) {
      return NextResponse.json({ error: 'Edited content is required for LLM mode' }, { status: 400 });
    }

    if (!useLLM && (!oldText || !newText)) {
      return NextResponse.json({ error: 'old_text and new_text are required for simple replacement mode' }, { status: 400 });
    }

    const sandbox = await getSandbox(sessionID);

    // Create a mock tool call object that matches the editFile tool interface
    const toolCall = {
      id: 'api-call-' + Date.now(),
      func: {
        arguments: {
          path: filePath,
          use_llm: useLLM,
          ...(useLLM ? {
            edited_content: editedContent,
            model: model || 'gpt-4-turbo'
          } : {
            old_text: oldText,
            new_text: newText
          })
        }
      }
    };

    // Create a mock StreamData object
    const data = new StreamData();
    let capturedResult: any = null;

    // Mock appendToolCallMessage function
    const appendToolCallMessage = (params: any) => {
      capturedResult = params.tool_call_result;
      return [];
    };

    // Use the editFile tool handler
    await handleEditFile(toolCall, data, [], appendToolCallMessage, sandbox);

    // Close the stream data
    await data.close();

    if (capturedResult?.error) {
      return NextResponse.json(
        { error: capturedResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionID,
      filePath,
      ...capturedResult
    });

  } catch (error) {
    console.error('Apply edit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}