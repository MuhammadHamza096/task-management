import { createRouter, createWebHashHistory } from "vue-router";
import TasksBoard from "@/pages/TasksBoard.vue";
import { useTaskStore } from "@/store/taskStore.js";
import TaskViewModal from "@/components/TaskViewModal.vue";

const routes = [
  {
    path: "/",
    name: "TasksBoard",
    component: TasksBoard,
  },
  {
    path: "/task/:id",
    name: "TaskDetail",
    component: TaskViewModal,
    beforeEnter: (to, from, next) => {
      const taskId = to.params.id;
      const taskStore = useTaskStore();

      if (taskStore.taskExists(taskId)) {
        next();
      } else {
        next({ name: "TasksBoard" });
      }
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
