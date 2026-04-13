import { BaseTask } from '../types';
import { GenericToolTask } from './generic-tool.task';
import { BookFlightTask } from './book-flight.task';

// Task Registry
const taskRegistry = new Map<string, new () => BaseTask>();

export function registerTask(taskClass: new () => BaseTask) {
  const instance = new taskClass();
  taskRegistry.set(instance.type, taskClass);
  console.log(`🔧 Registered task handler: ${instance.type}`);
}

export function getTaskHandler(taskType: string): BaseTask | null {
  const TaskClass = taskRegistry.get(taskType);
  if (!TaskClass) return null;
  return new TaskClass();
}

export function listAvailableTasks(): { type: string; description: string }[] {
  return Array.from(taskRegistry.values()).map(C => {
    const instance = new C();
    return { type: instance.type, description: instance.description };
  });
}

// Auto-register built-in tasks
registerTask(BookFlightTask);
registerTask(GenericToolTask); // Fallback for all other tools

console.log(`✅ Task registry initialized with ${taskRegistry.size} handlers`);