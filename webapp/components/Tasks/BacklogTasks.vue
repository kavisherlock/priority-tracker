<template>
  <div v-if="prioritiesData && Object.keys(prioritiesData).length > 0">
    <h2>Backlog</h2>
    <div v-for="projectId in Object.keys(backlogProjects).sort((a, b) => backlogProjects[a].createdAt - backlogProjects[b].createdAt)" :key="projectId">
      <div class="project-section" @click="selectProject(projectId)">
        <h3 class="project-name">
          {{ backlogProjects[projectId].name }}
        </h3>
        <div v-if="categoriesData[backlogProjects[projectId].category]" class="subTitle">
          {{ categoriesData[backlogProjects[projectId].category].name }}
        </div>
      </div>
      <collapsible :collapse="!selectedProjects[projectId] || backlogTasks[projectId] === undefined || backlogTasks[projectId].length === 0">
        <div class="task-list">
          <task-list
            :tasks="backlogTasks[projectId]"
            moveButtonText="Move To Up Next"
            :onMoveButtonClick="id => moveTaskToQueued(id)"
          />
        </div>
      </collapsible>
      <div class="complete-notice" v-if="noMoreTasks(projectId)">
        <p>This Project has no more tasks. Would you like to mark it as complete?</p>
        <button
          class="secondary icon-only complete"
          aria-label="Mark Project as Complete"
          @click="completeProject(projectId)"
        >
          <v-icon name="check"/>
        </button>
      </div>
    </div>
    <br />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import TaskList from './TaskList.vue';
import Collapsible from '../Collapsible.vue';

export default {
  components: {
    TaskList,
    Collapsible
},

  data() {
    return {
      selectedProjects: {},
    }
  },

  computed: {
    ...mapState({
      categoriesData: state => state.categories.categoriesData,
      prioritiesData: state => state.projects.prioritiesData,
      projectTasksData: state => state.tasks.projectTasksData,
      activeTasks: state => state.tasks.activeTasks,
      queuedTasks: state => state.tasks.queuedTasks,
    }),
    ...mapGetters('tasks', ['backlogTasks']),
    independentTasks() {
      return this.projectTasksData.none;
    },
    backlogProjects() {
      return Object.assign({}, this.prioritiesData, { none: { name: 'Other', id: 'none' } });
    },
  },

  methods: {
    selectProject (id) {
      if (this.selectedProjects[id]) {
        this.selectedProjects = { ...this.selectedProjects, [id]: false }
      } else {
        this.selectedProjects = { ...this.selectedProjects, [id]: true }
        this.$store.dispatch('tasks/getProjectTasks', id)
      }
    },
    completeProject (id) {
      this.$store.dispatch('projects/submitProject', { id, complete: true });
      this.selectedProjects = { ...this.selectedProjects, [id]: false }
    },
    moveTaskToQueued (id) {
      this.$store.dispatch('tasks/updateTaskStatus', { id, status: 'queued', value: true });
    },
    noMoreTasks(projectId) {
      const activeTasksInProject = this.activeTasks.filter(task => task.project === projectId).length > 0;
      const queuedTasksInProject = this.queuedTasks.filter(task => task.project === projectId).length > 0;
      return this.selectedProjects[projectId] && this.backlogTasks[projectId] && this.backlogTasks[projectId].length === 0 && !activeTasksInProject && !queuedTasksInProject
    }
  },
}
</script>

<style scoped>
h2 {
  border-radius: 20px;
  font-weight: 900 !important;
}

.project-section {
  cursor: pointer;
  background: var(--white);
  margin-top: 20px;
  margin-bottom: 1px;
  padding: 10px 15px;
  border-radius: 20px;
  box-shadow: var(--black-transparent) 2.95px 2.95px 3.6px, var(--dark-blue-transparenter) 0px 0px 2px 3px;
  display: flex;
  justify-content: space-between;
  transition: background-color 0.3s ease-in-out;
}

.project-name {
  transition: color 0.25s ease-in-out;
  color: var(--primary-color);
  font-weight: bold !important;
}

.project-section:hover {
  background: var(--white);
  box-shadow: var(--black-transparent) 2.95px 2.95px 3.6px, var(--dark-blue-transparent) 0px 0px 2px 3px;
}

.task-list {
  margin-left: 20px;
  margin-right: 3px;
}

@media only screen and (max-width: 600px) {
  .project-section {
    flex-direction: column;
  }

  .subTitle {
    margin-top: 2px;
    font-size: 0.8em;
    font-weight: 600 !important;
    text-transform: uppercase;
  }

  .task-list {
    margin-left: 20px;
  }
}

.complete-notice {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 10px;
  padding-left: 20px;
}
</style>