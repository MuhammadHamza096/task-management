<template>
  <div>
    <v-progress-linear v-model="progressValue" color="green" height="25">
      <template v-slot:default="{ value }">
        <strong
          >{{ Math.ceil(value) }}% (Done {{ doneTasks }} out of
          {{ totalTasks }})</strong
        >
      </template>
    </v-progress-linear>
  </div>
</template>

<script>
export default {
  props: {
    tasks: Array,
  },
  data() {
    return {
      progressValue: 0,
    };
  },
  computed: {
    doneTasks() {
      return this.tasks.filter((task) => task.status === "Done").length;
    },
    totalTasks() {
      return this.tasks.length;
    },
  },
  methods: {
    updateProgressValue() {
      if (this.totalTasks === 0) {
        this.progressValue = 0;
      } else {
        this.progressValue = (this.doneTasks / this.totalTasks) * 100;
      }
    },
  },
  watch: {
    doneTasks: "updateProgressValue",
    totalTasks: "updateProgressValue",
  },
  created() {
    this.updateProgressValue();
  },
};
</script>
