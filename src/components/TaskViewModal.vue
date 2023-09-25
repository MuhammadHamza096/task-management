<template>
  <v-dialog v-model="localDialogVisible" max-width="600px" persistent>
    <v-card>
      <div class="icons-actions">
        <v-icon icon="mdi-delete" color="blue" @click="deleteTask"></v-icon>
        <v-icon icon="mdi-close" @click="closeModal"></v-icon>
      </div>
      <v-card-text>
        <v-text-field
          v-model="task.title"
          label="Title"
          color="blue"
          variant="underlined"
          @input="updateTaskValues"
        ></v-text-field>

        <v-text-field
          label="Description"
          color="blue"
          variant="underlined"
          v-model="task.description"
          multi-line
          @input="updateTaskValues"
        ></v-text-field>
        <div class="field">
          <p>Labels:</p>
          <template v-if="task.labels && task.labels.length > 0">
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
          </template>
          <template v-else>
            <p>-</p>
          </template>
        </div>
        <div class="field">
          <p>Estimated Time:</p>
          {{ task.date || "-" }}
        </div>
        <div class="field">
          <p>Status:</p>
          {{ task.status }}
        </div>
        <div class="field">
          <p>
            Attachments:
            <v-icon icon="mdi-attachment" @click="triggerFileInput"></v-icon>
          </p>
          <div class="image-preview-container">
            <div
              class="image-preview"
              v-for="image in task.files"
              :key="image.id"
            >
              <v-icon
                class="image-close-icon"
                icon="mdi-close"
                @click="removeFile(image)"
              ></v-icon>
              <img :src="image" @click="showFullImage(image)" />
            </div>
          </div>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            @change="uploadFile"
            multiple
            accept="image/*"
          />

          <div v-if="selectedImage" class="full-image-container">
            <img :src="selectedImage" @click="closeFullImage" />
          </div>
        </div>
        <div class="comment-section field">
          <p>Comments:</p>
          <v-text-field v-model="newComment" label="Add Comment"></v-text-field>
          <div class="comment-btn">
            <v-btn color="blue " variant="outlined" @click="addComment"
              >Comment</v-btn
            >
          </div>
          <div class="comments-container">
            <div
              v-for="comment in reversedComments"
              :key="comment.id"
              class="comment"
            >
              <div class="comment-header">
                <v-avatar size="20">
                  <v-icon>mdi-account-circle</v-icon>
                </v-avatar>
                <div class="user-name">User</div>
              </div>
              <div class="comment-text">{{ comment }}</div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { useTaskStore } from "@/store/taskStore.js";
export default {
  props: {
    taskViewDialogue: Boolean,
    taskId: String,
    id: String,
  },
  data() {
    return {
      localDialogVisible: true,
      task: {},
      newComment: "",
      selectedImage: null,
    };
  },
  computed: {
    reversedComments() {
      if (this.task && Array.isArray(this.task.comments)) {
        return this.task.comments.slice().reverse();
      } else {
        return [];
      }
    },
  },

  watch: {
    "$route.params.id": {
      immediate: true,
      handler(newTaskId, oldTaskId) {
        console.log("newTask::", newTaskId, oldTaskId);
        this.fetchTaskDetails();
      },
    },
  },

  methods: {
    showFullImage(image) {
      this.selectedImage = image;
    },
    uploadFile(event) {
      const files = event.target.files;
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();

          reader.onload = (e) => {
            const imageUrl = e.target.result;

            this.task.files.push(imageUrl);

            const taskStore = useTaskStore();
            taskStore.updateTask(this.task);

            if (i === files.length - 1) {
              event.target.value = null;
            }
          };
          reader.readAsDataURL(file);
        }
      }
    },

    removeFile(fileToRemove) {
      console.log("fileToRemove", fileToRemove);
      const index = this.task.files.indexOf(fileToRemove);
      if (index !== -1) {
        this.task.files.splice(index, 1);
        const taskStore = useTaskStore();
        taskStore.updateTask(this.task);
      }
    },
    closeFullImage() {
      this.selectedImage = null;
    },
    fetchTaskDetails() {
      const taskStore = useTaskStore();
      this.task = taskStore.getTaskById(this.$route.params.id);
    },
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
    addComment() {
      const taskStore = useTaskStore();
      taskStore.addCommentToTask(this.$route.params.id, this.newComment);
      this.newComment = "";
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    closeModal() {
      this.$emit("update:taskViewDialogue", false);
      this.$router.push({ name: "TasksBoard" });
    },
    deleteTask() {
      if (this.$route.params.id) {
        const taskStore = useTaskStore();
        taskStore.deleteTask(this.$route.params.id);

        this.$emit("update:taskViewDialogue", false);
        this.$router.push({ name: "TasksBoard" });
      }
    },

    updateTaskValues() {
      const taskStore = useTaskStore();
      taskStore.updateTask(this.task);
    },
  },
};
</script>

<style>
.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}
.image-preview {
  margin-right: 10px;
  max-width: 100px;
  text-align: center;
  position: relative;
  border: 1px solid lightgrey;
  margin-bottom: 10px;
}
.icons-actions {
  text-align: right;
  display: block;
  width: 100%;
  padding: 10px;
}
.field {
  min-height: 57px;
  margin-bottom: 20px;
  font-size: 12px;
}
.field p {
  font-weight: 600;
  font-size: 16px;
}

.full-image-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.full-image-container img {
  max-width: 80%;
  max-height: 80%;
  cursor: pointer;
}
.image-close-icon {
  position: absolute;
  top: -5px;
  right: -9px;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  padding: 4px;
  font-size: 14px;
}

.comment {
  border-left: 2px solid #2196f3;
  padding-left: 5px;
  margin-top: 30px;
}
.comment-header {
  display: flex;
  align-items: center;
}

.user-name {
  font-weight: bold;
  margin-left: 5px;
}
.comment-btn {
  text-align: right;
}

.comment-text {
  font-size: 14px;
  margin-left: 25px;
}
</style>
