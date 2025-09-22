import 'server-only';

import { Sandbox } from '@e2b/code-interpreter';
import { NextResponse } from 'next/server';

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

function extractRepoName(githubUrl: string): string {
  const match = githubUrl.match(/github\.com\/[^\/]+\/([^\/\.]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  return match[1];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionID, githubUrl } = body;

    if (!sessionID) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!githubUrl) {
      return NextResponse.json({ error: 'GitHub URL is required' }, { status: 400 });
    }

    if (!githubUrl.includes('github.com')) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }

    const repoName = extractRepoName(githubUrl);
    const sandbox = await getSandbox(sessionID);

    const commands = [
      'mkdir -p /home/user/repos',
      `cd /home/user/repos && git clone ${githubUrl} ${repoName}`,
      'git config --global user.email "test@example.com"',
      'git config --global user.name "Test User"',
    ];

    const results = [];
    for (const command of commands) {
      try {
        const execution = await sandbox.commands.run(command);
        results.push({
          command,
          stdout: execution.stdout,
          stderr: execution.stderr,
          error: execution.error,
          success: !execution.error
        });
      } catch (error) {
        results.push({
          command,
          stdout: '',
          stderr: error instanceof Error ? error.message : 'Unknown error',
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      sessionID,
      repoName,
      repositoryPath: `/home/user/repos/${repoName}`,
      results
    });

  } catch (error) {
    console.error('Git checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}