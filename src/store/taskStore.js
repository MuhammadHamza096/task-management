import { defineStore } from "pinia";

export const useTaskStore = defineStore({
  id: "task",
  state: () => ({
    boards: [
      { name: "Pending", color: "#ffcccb", tasks: [] },
      { name: "Processing", color: "#FFFFED", tasks: [] },
      { name: "Done", color: "#90EE90", tasks: [] },
    ],
  }),
  actions: {
    addTaskToBoard(task) {
      const board = this.boards.find((b) => b.name === task.status);
      if (board) {
        board.tasks.push(task);
      }
    },
    moveTaskBetweenBoards(task, targetStatus) {
      const sourceBoard = this.boards.find((b) => b.tasks.includes(task));
      const targetBoard = this.boards.find((b) => b.name === targetStatus);
      if (sourceBoard && targetBoard) {
        sourceBoard.tasks = sourceBoard.tasks.filter((t) => t !== task);
        task.status = targetBoard.name;
        targetBoard.tasks.push(task);
      }
    },
    getTaskById(taskId) {
      for (const board of this.boards) {
        const foundTask = board.tasks.find((task) => task.id == taskId);
        if (foundTask) {
          return foundTask;
        }
      }
      return null;
    },
    addCommentToTask(taskId, comment) {
      const task = this.getTaskById(taskId);
      if (task) {
        if (!task.comments) {
          task.comments = [];
        }
        task.comments.push(comment);
      }
    },
    updateTask(updatedTask) {
      for (const board of this.boards) {
        const taskIndex = board.tasks.findIndex(
          (task) => task.id === updatedTask.id
        );
        if (taskIndex !== -1) {
          Object.assign(board.tasks[taskIndex], updatedTask);
          break;
        }
      }
    },
    deleteTask(taskId) {
      for (const board of this.boards) {
        const taskIndex = board.tasks.findIndex((task) => task.id == taskId);
        if (taskIndex !== -1) {
          board.tasks.splice(taskIndex, 1);
          break;
        }
      }
    },
    taskExists(taskId) {
      for (const board of this.boards) {
        if (board.tasks.some((task) => task.id == taskId)) {
          return true;
        }
      }
      return false;
    },
  },
});
