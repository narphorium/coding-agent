import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface ApplyEditRequest {
  originalContent: string;
  editedContent: string;
  filePath: string;
}

export interface ApplyEditResponse {
  success: boolean;
  finalContent: string;
  error?: string;
  changesApplied?: string[];
}

export async function applyEditWithLLM(
  originalContent: string,
  editedContent: string,
  filePath: string,
  model: string = 'gpt-4-turbo'
): Promise<ApplyEditResponse> {
  try {
    const systemPrompt = `You are an expert code editor that applies changes intelligently. You will be given:
1. Original file content
2. Edited file content showing desired changes

Your task is to analyze the differences and apply the changes appropriately. Consider:
- Preserve existing code structure and formatting where unchanged
- Apply only the intended modifications
- Maintain proper syntax and indentation
- Handle line number changes gracefully
- Preserve comments and whitespace where appropriate

Respond with ONLY the final file content that should be written to the file. Do not include any explanations, markdown formatting, or additional text.`;

    const userPrompt = `File: ${filePath}

ORIGINAL CONTENT:
\`\`\`
${originalContent}
\`\`\`

EDITED CONTENT (showing desired changes):
\`\`\`
${editedContent}
\`\`\`

Apply the changes from the edited content to produce the final file content:`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // Low temperature for consistent, precise edits
      max_tokens: 8000,
    });

    const finalContent = completion.choices[0]?.message?.content;

    if (!finalContent) {
      return {
        success: false,
        finalContent: originalContent,
        error: 'LLM did not return any content'
      };
    }

    // Simple change detection by comparing lengths and basic diff
    const changesApplied = detectChanges(originalContent, finalContent);

    return {
      success: true,
      finalContent,
      changesApplied
    };

  } catch (error) {
    return {
      success: false,
      finalContent: originalContent,
      error: error instanceof Error ? error.message : 'Unknown error during LLM edit application'
    };
  }
}

function detectChanges(original: string, final: string): string[] {
  const changes: string[] = [];

  const originalLines = original.split('\n');
  const finalLines = final.split('\n');

  // Simple line-by-line comparison for basic change detection
  const maxLines = Math.max(originalLines.length, finalLines.length);
  let addedLines = 0;
  let removedLines = 0;
  let modifiedLines = 0;

  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i];
    const finalLine = finalLines[i];

    if (originalLine === undefined && finalLine !== undefined) {
      addedLines++;
    } else if (originalLine !== undefined && finalLine === undefined) {
      removedLines++;
    } else if (originalLine !== finalLine) {
      modifiedLines++;
    }
  }

  if (addedLines > 0) changes.push(`Added ${addedLines} lines`);
  if (removedLines > 0) changes.push(`Removed ${removedLines} lines`);
  if (modifiedLines > 0) changes.push(`Modified ${modifiedLines} lines`);

  if (changes.length === 0) {
    changes.push('No changes detected');
  }

  return changes;
}