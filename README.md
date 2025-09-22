# Autonomous Coding Agent

An autonomous coding agent built on top of E2B Sandbox that can accomplish user-provided tasks on specified repositories. Think Codex, Jules, or Devin - this agent can clone repositories, explore codebases, read files, execute Python code, and perform complex coding tasks autonomously.

## Features

**Autonomous Operation**: The agent can work independently on coding tasks without constant human intervention

**Repository Management**: Clone and work with any GitHub repository in an isolated sandbox environment with an intuitive web interface

**Multi-Model Support**: Choose from multiple AI models:
- GPT-4o (most advanced with latest capabilities)
- GPT-4o Mini (compact version with high performance)
- GPT-4 Turbo (high-quality reasoning and analysis)
- GPT-3.5 Turbo (fast and efficient for most tasks)

**Enhanced Chat Interface**:
- Streaming chat with real-time responses
- Rich tool result visualization
- Repository status tracking
- Model selection during conversation

**Code Exploration**:
- Get full project directory structure
- Read and analyze any file in the repository
- Understand codebase organization and relationships
- File editing and writing capabilities

**Python Code Execution**:
- Execute Python code in a persistent Jupyter Notebook environment
- Maintain state between executions (variables, imports, functions persist)
- Full access to Python ecosystem and libraries

**Natural Language Interface**: Chat with the agent using natural language to describe tasks and goals

**Tool Integration**: The agent has access to specialized tools:
- `project_layout`: Explore repository structure
- `read_file`: Read and analyze any file
- `write_file`: Create new files
- `edit_file`: Modify existing files
- `execute_python_code`: Run Python code with persistent state
- `bash`: Execute shell commands

## Architecture

The agent is built with a modular architecture:

- **Frontend**: Next.js React app with streaming chat interface and modern UI components
- **Backend**: Next.js API routes handling tool execution and sandbox management
- **Sandbox**: E2B Code Interpreter with custom Docker environment for secure, isolated code execution
- **LLM**: Multiple OpenAI models (GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo) for natural language understanding and task planning
- **UI Components**: Shadcn/ui components with Tailwind CSS for modern interface design
- **Tools**: Specialized functions for repository operations, file manipulation, and code execution

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
E2B_API_KEY=your_e2b_api_key # Get one at https://e2b.dev/docs
OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open `http://localhost:3000` in your browser

## Usage

1. **Clone a Repository**: Enter a GitHub URL in the repository selector to clone it into the sandbox
2. **Select AI Model**: Choose your preferred model from the dropdown (GPT-4o, GPT-4o Mini, GPT-4 Turbo, or GPT-3.5 Turbo)
3. **Chat with the Agent**: Describe your coding task or goal in natural language
4. **Monitor Progress**: Watch real-time tool execution and results as the agent works
5. **View Results**: See file changes, code execution outputs, and task completion status

## Example Tasks

- "Analyze this codebase and explain its architecture"
- "Find all the API endpoints and create documentation"
- "Refactor the authentication system to use JWT tokens"
- "Add error handling to the user registration flow"
- "Create unit tests for the payment processing module"

## Technical Implementation

### Chat Interface (`app/page.tsx`)
Modern React component with streaming chat, repository cloning interface, model selection, and real-time tool result visualization.

### UI Components (`components/`)
- **RepoSelector**: GitHub repository cloning interface with validation and status feedback
- **ModelPicker**: Dropdown selector for choosing between different AI models
- **Chat Components**: Specialized displays for different tool results (file reading, code execution, etc.)
- **UI Library**: Shadcn/ui components for consistent, accessible interface design

### API Routes (`app/api/`)
- **Chat** (`app/api/chat/route.ts`): Handles chat messages, tool execution, and model switching
- **Git Checkout** (`app/api/git-checkout/route.ts`): Manages repository cloning into sandbox
- **Apply Edit** (`app/api/apply-edit/route.ts`): Handles file editing operations

### E2B Sandbox Configuration
- **Custom Dockerfile** (`e2b.Dockerfile`): Extended sandbox with git support and additional tools
- **Template Configuration** (`e2b.toml`): Sandbox template with persistent state and startup scripts

### Tool System
Comprehensive tool integration for autonomous operation:
- File system operations (read, write, edit)
- Code execution (Python, shell commands)
- Repository exploration and manipulation
- Real-time result streaming and visualization

The agent maintains session state across tool calls, allowing it to build understanding incrementally and perform complex multi-step tasks autonomously with full visibility into the process.
