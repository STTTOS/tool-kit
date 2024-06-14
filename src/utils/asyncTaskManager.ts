import { EventEmitter } from "events";

type Task = () => Promise<void>;
class AsyncTaskManager extends EventEmitter {
  loading = false;
  // 最大并行执行任务
  concurrency = 3;
  taskQueue: Task[] = [];
  callback?: (loading: boolean) => void;

  addTask(task: Task) {
    this.taskQueue.push(task);
    this.processQueue();
  }

  processQueue() {
    if (this.loading) return;
    this.loading = true;

    (async () => {
      while (this.taskQueue.length > 0) {
        const task = this.taskQueue.splice(0, this.concurrency);
        this.callback?.(this.loading);
        // this.emit("start");
        try {
          this.callback?.(this.loading);
          await Promise.allSettled(task?.map((t) => t?.()));
        } catch {
          // nothing to do
        }
      }
      this.loading = false;
      this.callback?.(this.loading)
      // this.emit("end");
    })();
  }

  onStatusChange(callback: (loading: boolean) => void) {
    this.callback = callback;
  }
}

export default AsyncTaskManager;
