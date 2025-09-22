# Autonomous Coding Agent

An autonomous coding agent built on top of E2B Sandbox that can accomplish user-provided tasks on specified repositories. Think Codex, Jules, or Devin - this agent can clone repositories, explore codebases, read files, execute Python code, and perform complex coding tasks autonomously.

## Features

**Autonomous Operation**: The agent can work independently on coding tasks without constant human intervention

**Repository Management**: Clone and work with any GitHub repository in an isolated sandbox environment

**Code Exploration**: 
- Get full project directory structure
- Read and analyze any file in the repository
- Understand codebase organization and relationships

**Python Code Execution**: 
- Execute Python code in a persistent Jupyter Notebook environment
- Maintain state between executions (variables, imports, functions persist)
- Full access to Python ecosystem and libraries

**Natural Language Interface**: Chat with the agent using natural language to describe tasks and goals

**Tool Integration**: The agent has access to specialized tools:
- `project_layout`: Explore repository structure
- `read_file`: Read and analyze any file
- `execute_python_code`: Run Python code with persistent state

## Architecture

The agent is built with a modular architecture:

- **Frontend**: Next.js React app with streaming chat interface
- **Backend**: Next.js API routes handling tool execution and sandbox management
- **Sandbox**: E2B Code Interpreter for secure, isolated code execution
- **LLM**: OpenAI GPT-4 Turbo for natural language understanding and task planning
- **Tools**: Specialized functions for repository operations and code execution

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

3. Start the development server:
```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser

## Usage

1. **Clone a Repository**: Enter a GitHub URL to clone a repository into the sandbox
2. **Chat with the Agent**: Describe your coding task or goal in natural language
3. **Watch the Agent Work**: The agent will autonomously explore the codebase, read files, and execute code to accomplish your task

## Example Tasks

- "Analyze this codebase and explain its architecture"
- "Find all the API endpoints and create documentation"
- "Refactor the authentication system to use JWT tokens"
- "Add error handling to the user registration flow"
- "Create unit tests for the payment processing module"

## Technical Implementation

### Agent Core (`src/agent.ts`)
The main agent logic that orchestrates tool calls and maintains conversation state with the LLM.

### Code Interpreter (`src/codeInterpreter.ts`)
Manages E2B sandbox lifecycle and Python code execution with persistent state.

### Tools
- **Project Layout** (`src/tools/project_layout.ts`): Generates directory structure trees
- **Read File** (`src/tools/read_file.ts`): Reads file contents from the sandbox filesystem
- **Execute Python** (`src/tools/execute_python_code.ts`): Executes Python code in Jupyter environment

### Repository Management (`app/api/git-checkout/route.ts`)
Handles cloning GitHub repositories into the sandbox environment.

The agent maintains session state across tool calls, allowing it to build understanding incrementally and perform complex multi-step tasks autonomously.
