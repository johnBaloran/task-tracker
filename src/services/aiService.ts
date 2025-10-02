import OpenAI from "openai";
import { Task } from "../types/task";

/**
 * IMPROVED AI SERVICE
 *
 * Following principles:
 * - DRY: Shared error handling
 * - Performance: Caching and debouncing
 * - Resilience: Retry logic
 * - Security: API key validation
 */

// Singleton pattern - one instance
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_OPENAI_API_KEY environment variable is not set");
  }

  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
      // Production: Remove this, use backend proxy
    });
  }

  return openaiInstance;
}

// Cache for responses (prevent duplicate API calls)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(prefix: string, tasks: Task[]): string {
  // Generate cache key based on task state
  return `${prefix}-${tasks.length}-${tasks
    .map((t) => `${t.id}-${t.status}`)
    .join("-")}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Shared error handler (DRY principle)
function handleAIError(error: unknown, operation: string): never {
  console.error(`${operation} failed:`, error);

  if (error instanceof Error) {
    if (
      error.message.includes("API key") ||
      error.message.includes("VITE_OPENAI_API_KEY")
    ) {
      throw new Error(
        "AI features require an OpenAI API key. Add VITE_OPENAI_API_KEY to your .env.local file."
      );
    }
    if (error.message.includes("rate_limit")) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    if (error.message.includes("network") || error.message.includes("fetch")) {
      throw new Error("Network error. Check your internet connection.");
    }
    throw new Error(`${operation} error: ${error.message}`);
  }

  throw new Error(`${operation} failed. Please try again.`);
}

// Retry logic (resilience pattern)
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Don't retry auth errors
      if (error instanceof Error && error.message.includes("API key")) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Retry failed");
}

export interface TaskSummary {
  overview: string;
  totalTasks: number;
  byStatus: {
    todo: number;
    inProgress: number;
    done: number;
  };
  insights: string[];
}

export interface PrioritySuggestion {
  taskId: string;
  taskTitle: string;
  reason: string;
  suggestedPriority: "high" | "medium" | "low";
}

export interface AIAnalysis {
  summary: TaskSummary;
  prioritySuggestions: PrioritySuggestion[];
  recommendations: string[];
}

export async function summarizeTasks(tasks: Task[]): Promise<string> {
  try {
    if (!tasks || tasks.length === 0) {
      return "You don't have any tasks yet. Add some to get started!";
    }

    // Check cache first (performance optimization)
    const cacheKey = getCacheKey("summary", tasks);
    const cached = getFromCache<string>(cacheKey);
    if (cached) return cached;

    const openai = getOpenAIClient();

    const prompt = `You are a productivity assistant. Analyze these tasks and provide a brief, encouraging summary in 2-3 sentences.

Tasks:
${tasks
  .map(
    (t) =>
      `- [${t.status}] ${t.title}${t.description ? `: ${t.description}` : ""}`
  )
  .join("\n")}

Provide insights about:
- Overall progress
- What's being worked on
- Any patterns or suggestions

Keep it concise and positive.`;

    const result = await retryWithBackoff(async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful productivity assistant that provides concise, actionable insights.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const summary = response.choices[0]?.message?.content;
      if (!summary) throw new Error("No response from AI");
      return summary.trim();
    });

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return handleAIError(error, "Task summarization");
  }
}

export async function suggestPriority(
  tasks: Task[]
): Promise<PrioritySuggestion | null> {
  try {
    if (!tasks || tasks.length === 0) return null;

    const activeTasks = tasks.filter((t) => t.status !== "done");
    if (activeTasks.length === 0) return null;

    const cacheKey = getCacheKey("priority", tasks);
    const cached = getFromCache<PrioritySuggestion>(cacheKey);
    if (cached) return cached;

    const openai = getOpenAIClient();

    const prompt = `You are a productivity expert. Analyze these tasks and suggest which ONE task should be prioritized first.

Tasks:
${activeTasks
  .map(
    (t, i) =>
      `${i + 1}. [${t.status}] ${t.title}${
        t.description ? `: ${t.description}` : ""
      }`
  )
  .join("\n")}

Respond in JSON format:
{
  "taskNumber": <number>,
  "reason": "<brief explanation why this task is most important>",
  "priority": "high"
}

Consider:
- Tasks already in progress should often be completed first
- Blocking tasks should be prioritized
- Balance urgency and importance`;

    const result = await retryWithBackoff(async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a productivity expert. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      const parsed = JSON.parse(content);
      const taskIndex = parsed.taskNumber - 1;

      if (taskIndex < 0 || taskIndex >= activeTasks.length) {
        throw new Error("Invalid task selection");
      }

      const selectedTask = activeTasks[taskIndex];
      if (!selectedTask) throw new Error("Selected task not found");

      return {
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        reason: parsed.reason,
        suggestedPriority: parsed.priority || "high",
      };
    });

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return handleAIError(error, "Priority suggestion");
  }
}

export async function analyzeAllTasks(tasks: Task[]): Promise<AIAnalysis> {
  try {
    if (!tasks || tasks.length === 0) {
      return {
        summary: {
          overview: "No tasks yet. Start by adding your first task!",
          totalTasks: 0,
          byStatus: { todo: 0, inProgress: 0, done: 0 },
          insights: ["Add tasks to get AI insights"],
        },
        prioritySuggestions: [],
        recommendations: ["Create your first task to begin tracking progress"],
      };
    }

    const cacheKey = getCacheKey("analysis", tasks);
    const cached = getFromCache<AIAnalysis>(cacheKey);
    if (cached) return cached;

    const openai = getOpenAIClient();

    const byStatus = {
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "inProgress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };

    const prompt = `You are a productivity expert analyzing a task management board. Provide comprehensive analysis.

All Tasks:
${tasks
  .map(
    (t, i) =>
      `${i + 1}. [${t.status}] ${t.title}${
        t.description ? `: ${t.description}` : ""
      }`
  )
  .join("\n")}

Respond with JSON:
{
  "overview": "<2-3 sentence summary of overall progress>",
  "insights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "topPriorityTask": <task number or null>,
  "priorityReason": "<why this task should be prioritized>",
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>"]
}

Consider:
- Work in progress vs completed ratio
- Bottlenecks or blockers
- Balance across task types
- Completion patterns`;

    const result = await retryWithBackoff(async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a productivity expert. Provide actionable insights. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 400,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from AI");

      const parsed = JSON.parse(content);

      const prioritySuggestions: PrioritySuggestion[] = [];
      if (parsed.topPriorityTask) {
        const taskIndex = parsed.topPriorityTask - 1;
        if (taskIndex >= 0 && taskIndex < tasks.length) {
          const task = tasks[taskIndex];
          if (task) {
            prioritySuggestions.push({
              taskId: task.id,
              taskTitle: task.title,
              reason: parsed.priorityReason || "Recommended focus area",
              suggestedPriority: "high",
            });
          }
        }
      }

      return {
        summary: {
          overview: parsed.overview,
          totalTasks: tasks.length,
          byStatus,
          insights: parsed.insights || [],
        },
        prioritySuggestions,
        recommendations: parsed.recommendations || [],
      };
    });

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return handleAIError(error, "Task analysis");
  }
}
