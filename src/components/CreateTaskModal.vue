<template>
  <v-dialog v-model="localDialogVisible" max-width="600px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5">Create New Task</span>
      </v-card-title>
      <v-card-text>
        <div class="field-input">
          <v-text-field
            label="Title"
            v-model="newTask.title"
            color="blue"
            variant="underlined"
          ></v-text-field>
        </div>
        <div class="field-input">
          <v-text-field
            label="Description"
            color="blue"
            variant="underlined"
            v-model="newTask.description"
            multi-line
          ></v-text-field>
        </div>
        <div class="field-input">
          <v-select
            v-model="newTask.selectedStatus"
            :items="items"
            label="Task Status"
            variant="underlined"
          ></v-select>
        </div>

        <div class="field-input">
          <v-combobox
            v-model="newTask.selectedTags"
            :items="availableTags"
            variant="underlined"
            label="Add Labels"
            multiple
            chips
            deletable-chips
            clearable
            color="blue"
          ></v-combobox>
        </div>
        <div class="time-picker field-input">
          <VueDatePicker
            v-model="newTask.selectedDate"
            placeholder="Estimated time"
            class="datetime-picker"
          ></VueDatePicker>
        </div>
        <div v-if="filePreviews.length > 0">
          <h4>Uploaded Files:</h4>
          <div class="image-preview-container">
            <div
              v-for="(file, index) in newTask.uploadedFiles"
              :key="file.name"
              class="image-preview"
            >
              <v-icon class="close-icon" @click="removeFile(file)"
                >mdi-close</v-icon
              >
              <img :src="filePreviews[index]" alt="Image Preview" />
            </div>
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
        <v-btn
          @click="triggerFileInput"
          icon="mdi-attachment"
          size="small"
          color="blue"
          variant="outlined"
        ></v-btn>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue " variant="outlined" text @click="closeDialog"
          >Close</v-btn
        >
        <v-btn color="blue " variant="outlined" text @click="addTask"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import "vue-datepicker-next/index.css";
import { useTaskStore } from "@/store/taskStore.js";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
export default {
  components: {
    VueDatePicker,
  },
  props: {
    dialogVisible: Boolean,
  },

  data() {
    return {
      localDialogVisible: this.dialogVisible,
      menu: false,
      filePreviews: [],
      newTask: {
        title: "",
        description: "",
        selectedStatus: "Pending",
        uploadedFiles: [],
        selectedDate: null,
        selectedTags: [],
      },
      items: ["Pending", "Processing", "Done"],
      availableTags: [],
    };
  },
  watch: {
    dialogVisible(newValue) {
      this.localDialogVisible = newValue;
    },
  },

  methods: {
    closeDialog() {
      this.$emit("update:dialogVisible", false);
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    uploadFile(event) {
      const files = event.target.files;
      if (files.length > 0) {
        const previews = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          const reader = new FileReader();

          reader.onload = (e) => {
            previews.push(e.target.result);
            if (previews.length === files.length) {
              this.newTask.uploadedFiles = Array.from(previews);
              this.filePreviews = previews;
              event.target.value = null;
            }
          };

          reader.readAsDataURL(file);
        }
      } else {
        this.newTask.uploadedFiles = [];
        this.filePreviews = [];
      }
    },
    removeFile(fileToRemove) {
      const index = this.newTask.uploadedFiles.indexOf(fileToRemove);
      if (index !== -1) {
        this.newTask.uploadedFiles.splice(index, 1);
        this.filePreviews.splice(index, 1);
      }
    },
    addTask() {
      const taskStore = useTaskStore();
      let formattedDate = null;

      const totalTasks = taskStore.boards.reduce(
        (count, board) => count + board.tasks.length,
        0
      );

      const newTaskId = totalTasks + 1;

      if (this.newTask.selectedDate) {
        const date = new Date(this.newTask.selectedDate);

        formattedDate = `${
          date.getMonth() + 1
        }/${date.getDate()}/${date.getFullYear()} ${String(
          date.getHours()
        ).padStart(2, "0")}:${String(date.getMinutes()).padStart(
          2,
          "0"
        )}:${String(date.getSeconds()).padStart(2, "0")}`;
      }

      const taskData = {
        id: newTaskId,
        title: this.newTask.title,
        description: this.newTask.description,
        date: formattedDate,
        status: this.newTask.selectedStatus,
        labels: this.newTask.selectedTags,
        files: this.newTask.uploadedFiles,
        comments: [],
      };
      this.clearData();
      taskStore.addTaskToBoard(taskData);
      this.$emit("update:dialogVisible", false);
    },
    openTimePicker() {
      this.timePickerVisible = true;
    },
    clearData() {
      this.newTask.title = "";
      this.newTask.description = "";
      this.newTask.selectedStatus = "Pending";
      this.newTask.uploadedFiles = [];
      this.newTask.selectedDate = null;
      this.newTask.selectedTags = [];

      this.filePreviews = [];
    },
    closeTimePicker() {
      this.timePickerVisible = false;
    },
    saveTime() {
      this.closeTimePicker();
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

.image-preview img {
  width: 50px;
  height: 50px;
  object-fit: cover;
}
.close-icon {
  position: absolute;
  top: -5px;
  right: -9px;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  padding: 4px;
  font-size: 14px;
}
.custom-datetimepicker-container {
  position: relative;
}

.custom-datetimepicker {
  color: blue;
  position: absolute;
  top: -200px;
}

.custom-datetimepicker::placeholder {
  color: gray;
}
.mx-datepicker {
  width: 100% !important;
}
.time-picker {
  margin-bottom: 20px;
  margin-top: 10px;
}
.field-input {
  min-height: 30px;
}
</style>
