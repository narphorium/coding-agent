import { createChatCompletion } from '@/src/agent';

export const dynamic = 'force-dynamic';

// You can also use edge runtime
// export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, sessionID, repositoryPath } = await req.json();
  return createChatCompletion(messages, sessionID, repositoryPath);
}