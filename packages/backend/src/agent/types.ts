// Agent Task Types

export interface TaskInput {
  [key: string]: any;
}

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface TaskContext {
  agentId: string;
  toolName: string;
  input: TaskInput;
  callerWallet: string;
  backendUrl: string;
}

export abstract class BaseTask {
  abstract readonly type: string;
  abstract readonly description: string;
  
  abstract execute(input: TaskInput, context: TaskContext): Promise<TaskResult>;
  
  validate?(input: TaskInput): boolean;
}