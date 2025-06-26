<template>
  <div class="diagram-editor-view">
    <DiagramEditor :diagram-name="diagramName" v-if="diagramName" />
    <div v-else class="loading-container">
      <div class="spinner"></div>
      <p>Loading diagram...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DiagramEditor from '../components/DiagramEditor/DiagramEditor.vue'

const route = useRoute()
const diagramName = ref(null)

onMounted(() => {
  // Get diagram name from route params
  diagramName.value = route.params.id
})
</script>

<style scoped>
.diagram-editor-view {
  height: 100%;
  width: 100%;
}

.loading-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--blue-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
