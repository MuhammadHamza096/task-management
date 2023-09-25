<template>
  <v-container color="grey">
    <div class="header">
      <h2>Progress</h2>
      <ProgressBar :tasks="allTasks" />
    </div>
    <v-row align="center">
      <v-col cols="5">
        <div>
          <div>
            <VueDatePicker
              v-model="date"
              @update:modelValue="updateDateRange"
              placeholder="Filter with Estimated Time"
              class="datetime-picker"
              range
            ></VueDatePicker>
          </div>
        </div>
      </v-col>
      <v-col cols="5">
        <div>
          <v-text-field
            label="Search"
            color="blue"
            variant="underlined"
            v-model="searchQuery"
          ></v-text-field>
        </div>
      </v-col>
      <v-col cols="2">
        <div>
          <v-btn
            prepend-icon="mdi-magnify"
            variant="outlined"
            color="blue"
            class="button"
            @click="openDialog"
          >
            <template v-slot:prepend>
              <v-icon></v-icon>
            </template>

            Add task
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="board in filteredBoards"
        :key="board.name"
        cols="4"
        @dragover.prevent
        @drop="handleDrop($event, board)"
      >
        <v-card>
          <v-card-title>{{ board.name }}</v-card-title>
          <v-card-text>
            <v-row
              class="item"
              v-for="task in board.tasks"
              :key="task.id"
              draggable="true"
              @dragstart="startDrag($event, task)"
              :class="{ 'dim-task': !matchesSearchQuery(task) }"
            >
              <router-link :to="`/task/${task.id}`" class="task-link">
                <template v-slot:default="{ navigate, href }">
                  <v-card class="mb-2 cards" @click="navigate" :href="href">
                    <div
                      class="card-header"
                      :style="{ 'background-color': board.color }"
                    >
                      <v-card-title>{{ task.title }}</v-card-title>
                      <div class="card-actions"></div>
                    </div>
                    <div class="card-description">
                      <div>
                        <p class="heading">Description:</p>
                        <p class="truncated-description">{{ task.description }}</p>
                      </div>
                      <div>
                        <p class="heading">Estimated Time:</p>
                        <p>{{ task.date }}</p>
                      </div>
                      <div>
                        <p class="heading">Labels:</p>
                        <v-chip
                          v-for="label in task.labels"
                          :key="label"
                          :color="getLabelColor(label)"
                          small
                          dark
                          class="chips"
                        >
                          {{ label }}
                        </v-chip>
                      </div>
                      <div>
                        <p class="heading">Attachments:</p>
                        <p>{{ task.files.length }}</p>
                      </div>
                    </div>
                  </v-card>
                </template>
              </router-link>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <CreateTask
      :dialogVisible="dialogVisible"
      @update:dialogVisible="dialogVisible = $event"
    />
    <!-- <TaskViewModal
      :taskViewDialogue="taskViewDialogue"
      @update:taskViewDialogue="taskViewDialogue = $event"
    /> -->
  </v-container>
</template>

<script>
import ProgressBar from "@/components/ProgressBarComponent.vue";
import CreateTask from "@/components/CreateTaskModal.vue";
import { useTaskStore } from "@/store/taskStore.js";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { dateFormat } from "@/utils";

export default {
  components: {
    ProgressBar, // Register the Progress Bar component
    CreateTask,
    VueDatePicker,
  },
  data() {
    return {
      searchQuery: "",
      selectedDate: null,
      dialogVisible: false,
      draggedTask: null,
      dateRange: { start: null, end: null },
      date: null,
      taskViewDialogue: false,
    };
  },

  computed: {
    filteredBoards() {
      if (!this.dateRange.start || !this.dateRange.end) {
        return this.boards;
      }

      const startDate = new Date(this.dateRange.start);
      const endDate = new Date(this.dateRange.end);

      return this.boards.map((board) => {
        const filteredTasks = board.tasks.filter((task) => {
          const taskDate = new Date(task.date);
          return taskDate >= startDate && taskDate <= endDate;
        });
        return { ...board, tasks: filteredTasks };
      });
    },
    boards() {
      const taskStore = useTaskStore();
      return taskStore.boards;
    },
    allTasks() {
      return this.boards.flatMap((board) => board.tasks);
    },
  },
  watch: {
    $route(to) {
      if (to.name === "TaskDetail") {
        this.openTaskViewDialog();
      }
    },
  },

  methods: {
    getLabelColor(label) {
      const colors = [
        "red",
        "blue",
        "green",
        "yellow",
        "pink",
        "orange",
        "purple",
      ];
      const index = Math.abs(this.hashCode(label)) % colors.length;
      return colors[index];
    },
    hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return hash;
    },
    openDialog() {
      this.dialogVisible = true;
    },
    openTaskViewDialog() {
      this.taskViewDialogue = true;
    },
    startDrag(event, task) {
      this.draggedTask = task;
      event.dataTransfer.effectAllowed = "move";
    },

    handleDrop(event, targetBoard) {
      const taskStore = useTaskStore();
      taskStore.moveTaskBetweenBoards(this.draggedTask, targetBoard.name);
      this.draggedTask = null;
    },

    matchesSearchQuery(task) {
      if (!this.searchQuery.trim()) {
        return true;
      }

      const searchString = this.searchQuery.toLowerCase().trim();
      const inTitle = task.title.toLowerCase().includes(searchString);
      const inDescription = task.description
        .toLowerCase()
        .includes(searchString);
      const inLabels = task.labels.some((label) =>
        label.toLowerCase().includes(searchString)
      );

      return inTitle || inDescription || inLabels;
    },
    updateDateRange(value) {
      if (value) {
        const start = dateFormat(value[0]);
        const end = dateFormat(value[1]);
        this.dateRange = { ...this.dateRange, start, end };
      } else {
        this.dateRange = { start: null, end: null };
      }
    },
  },
};
</script>
<style>
.button {
  margin-right: 10px;
}
.cards {
  width: 100%;
}
.header {
  margin-bottom: 20px;
  background-color: white;
  padding: 20px;
}
.card-header {
  display: flex;
  align-items: center;
  font-size: 12px !important;
  height: 20px;
  padding: 16px 0;
  justify-content: space-between;
}
.v-card-title {
  font-size: 15px !important;
  font-weight: bold;
}
.card-description {
  text-align: start;
  margin: 20px 7px;
  font-size: 12px;
  color: darkgray;
}
.heading {
  font-weight: bold;
  margin-top: 10px;
}
.chips {
  margin-right: 5px;
  margin-top: 10px;
  font-size: 10px !important;
}

.dim-task {
  opacity: 0.3;
}
.router-link-exact-active,
.router-link-active {
  display: block;
  width: 100% !important;
}
.task-link {
  text-decoration: none;
  width: 100% !important;
}
.datetime-picker {
  margin-bottom: 5px;
}
.datetime-picker input {
  background: transparent !important;
  border: none;
  border-bottom: 1px solid darkgrey;
}
.truncated-description {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* Set a maximum width to control the truncation width */
  max-width: 200px; /* Adjust the value as needed */
}
</style>
