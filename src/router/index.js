// src/router.js
import { createRouter, createWebHistory } from "vue-router";
import TasksBoard from "@/pages/TasksBoard.vue";
import { useTaskStore } from "@/store/taskStore.js";
import TaskViewModal from "@/components/TaskViewModal.vue"

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
      console.log("taskID::::::",taskId)
      const taskStore = useTaskStore(); 

      if (taskStore.taskExists(taskId)) {
        next();
      } else {
        console.log('nex')
        next({ name: "TasksBoard" });
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
