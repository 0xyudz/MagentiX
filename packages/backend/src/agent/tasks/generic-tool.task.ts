import { BaseTask } from './base-task';
import { TaskInput, TaskResult, TaskContext } from '../types';

export class GenericToolTask extends BaseTask {
  readonly type = 'generic_tool';
  readonly description = 'Execute any tool from any agent category dynamically';

  async execute(input: TaskInput, context: TaskContext): Promise<TaskResult> {
    try {
      this.log(`🔧 Executing tool: ${context.toolName}`);
      
      const result = await this.callTool(
        context.backendUrl,
        context.agentId,
        context.toolName,
        input,
        context.callerWallet,
        input.price || '1000000'
      );

      this.log(`✅ Tool executed successfully`);
      return { success: true, data: result };
      
    } catch (error: any) {
      this.log(`❌ Tool execution failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}