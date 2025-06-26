<template>
  <div class="diagram-editor-container">
    <!-- Header -->
    <div class="editor-header">
      <div class="logo-section">
        <div class="logo-icon">
          <i class="fa fa-project-diagram"></i>
        </div>
        <div class="logo-text">
          <h1>{{ diagram?.title || 'Untitled Diagram' }}</h1>
          <p>{{ diagram?.diagram_type || 'flowchart' }}</p>
        </div>
      </div>
      <div class="header-actions">
        <Button
          v-if="!isEditing && canEdit"
          variant="primary"
          @click="startEditing"
          :loading="startEditingSessionResource.loading"
        >
          <i class="fa fa-edit mr-2"></i> Edit
        </Button>
        <Button
          v-if="isEditing"
          variant="danger"
          @click="saveAndEndEditing"
          :loading="updateDiagramResource.loading || endEditingSessionResource.loading"
        >
          <i class="fa fa-save mr-2"></i> Save & Exit
        </Button>
        <Button
          variant="secondary"
          @click="showTemplates = !showTemplates"
        >
          <i class="fa fa-th-large mr-2"></i> Templates
        </Button>
        <Button
          variant="secondary"
          @click="openExportModal"
        >
          <i class="fa fa-download mr-2"></i> Export
        </Button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <div class="view-toggle">
          <button
            :class="{ active: currentView === 'split' }"
            @click="setView('split')"
          >
            <i class="fa fa-columns mr-2"></i> Split
          </button>
          <button
            :class="{ active: currentView === 'code' }"
            @click="setView('code')"
          >
            <i class="fa fa-code mr-2"></i> Code
          </button>
          <button
            :class="{ active: currentView === 'preview' }"
            @click="setView('preview')"
          >
            <i class="fa fa-eye mr-2"></i> Preview
          </button>
        </div>
        <div class="editor-stats">
          <span>Lines: {{ lineCount }}</span>
          <span>Characters: {{ charCount }}</span>
          <span :class="statusClass">{{ status }}</span>
        </div>
      </div>
      <div class="toolbar-right">
        <Button
          v-if="isEditing"
          variant="secondary"
          @click="formatCode"
        >
          <i class="fa fa-magic mr-2"></i> Format
        </Button>
        <Button
          v-if="isEditing"
          variant="secondary"
          @click="confirmClear"
        >
          <i class="fa fa-trash mr-2"></i> Clear
        </Button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="editor-main-content">
      <!-- Editor Panel -->
      <div
        v-show="currentView !== 'preview'"
        class="editor-panel"
        :style="{ display: currentView === 'preview' ? 'none' : 'flex' }"
      >
        <div class="editor-header">
          <h3><i class="fa fa-code mr-2"></i> Mermaid Code</h3>
          <div class="editor-stats">
            <span>{{ lineCount }} line{{ lineCount !== 1 ? 's' : '' }}</span>
            <span>{{ charCount }} chars</span>
          </div>
        </div>
        <CodeEditor
          v-model="localDiagramCode"
          :readonly="!isEditing"
          @update:stats="updateStats"
          @cursor-position="updateCursorPosition"
        />
      </div>

      <!-- Preview Panel -->
      <div
        v-show="currentView !== 'code'"
        class="preview-panel"
        :style="{ display: currentView === 'code' ? 'none' : 'flex' }"
      >
        <div class="preview-header">
          <h3><i class="fa fa-eye mr-2"></i> Live Preview</h3>
          <div class="preview-controls">
            <div class="zoom-controls">
              <Button
                variant="icon"
                @click="zoomOut"
                :disabled="renderSettings.zoom <= 0.1"
              >
                <i class="fa fa-search-minus"></i>
              </Button>
              <span class="zoom-level">{{ Math.round(renderSettings.zoom * 100) }}%</span>
              <Button
                variant="icon"
                @click="zoomIn"
                :disabled="renderSettings.zoom >= 5.0"
              >
                <i class="fa fa-search-plus"></i>
              </Button>
              <Button
                variant="icon"
                @click="resetZoom"
              >
                <i class="fa fa-undo"></i>
              </Button>
            </div>
            <div class="view-controls">
              <Button
                variant="secondary"
                @click="toggleCentered"
              >
                <i :class="renderSettings.centerDiagram ? 'fa fa-expand-alt' : 'fa fa-compress-alt'"></i>
                {{ renderSettings.centerDiagram ? 'Expand' : 'Center' }}
              </Button>
              <Button
                variant="secondary"
                @click="toggleFullscreen"
              >
                <i class="fa fa-expand"></i> Fullscreen
              </Button>
            </div>
          </div>
        </div>
        <DiagramPreview
          :diagram-code="localDiagramCode"
          :render-settings="renderSettings"
          @update:render-status="updateRenderStatus"
          @pan="updatePan"
        />
      </div>

      <!-- Templates Sidebar -->
      <TemplateLibrary
        v-if="showTemplates"
        @select-template="applyTemplate"
        @close="showTemplates = false"
      />
    </div>

    <!-- Export Modal -->
    <ExportModal
      v-if="showExportModal"
      :diagram="diagram"
      :diagram-code="localDiagramCode"
      @close="showExportModal = false"
    />

    <!-- Collaboration Indicators -->
    <CollaborationIndicator
      v-if="diagram"
      :active-users="collaborationState.activeUsers"
      :cursor-positions="collaborationState.cursorPositions"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDiagramStore } from '../../stores/diagram'
import { useToast } from 'frappe-ui'
import CodeEditor from './CodeEditor.vue'
import DiagramPreview from './DiagramPreview.vue'
import TemplateLibrary from '../Templates/TemplateLibrary.vue'
import ExportModal from '../Common/ExportModal.vue'
import CollaborationIndicator from '../Collaboration/CollaborationIndicator.vue'
import Button from '../Common/Button.vue'

const props = defineProps({
  diagramName: {
    type: String,
    required: true
  }
})

const toast = useToast()
const diagramStore = useDiagramStore()

// Local state
const currentView = ref('split')
const showTemplates = ref(false)
const showExportModal = ref(false)
const lineCount = ref(0)
const charCount = ref(0)
const status = ref('Loading...')
const statusClass = ref('status-loading')
const localDiagramCode = ref('')
const collaborationInterval = ref(null)

// Computed properties
const diagram = computed(() => diagramStore.currentDiagram)
const isEditing = computed(() => diagramStore.isEditing)
const canEdit = computed(() => diagramStore.canEdit)
const renderSettings = computed(() => diagramStore.renderSettings)
const collaborationState = computed(() => diagramStore.collaborationState)

// Resources
const getDiagramResource = computed(() => diagramStore.getDiagramResource)
const updateDiagramResource = computed(() => diagramStore.updateDiagramResource)
const startEditingSessionResource = computed(() => diagramStore.startEditingSessionResource)
const endEditingSessionResource = computed(() => diagramStore.endEditingSessionResource)

// Methods
async function loadDiagram() {
  try {
    status.value = 'Loading...'
    statusClass.value = 'status-loading'
    
    await diagramStore.loadDiagram(props.diagramName)
    localDiagramCode.value = diagramStore.diagramCode
    
    status.value = 'Ready'
    statusClass.value = 'status-ready'
    
    // Start collaboration polling
    startCollaborationPolling()
  } catch (error) {
    console.error('Error loading diagram:', error)
    status.value = 'Error'
    statusClass.value = 'status-error'
    toast.error('Failed to load diagram')
  }
}

function updateStats(stats) {
  lineCount.value = stats.lines
  charCount.value = stats.chars
}

function updateRenderStatus(newStatus) {
  status.value = newStatus.status
  statusClass.value = `status-${newStatus.type}`
}

function setView(view) {
  currentView.value = view
}

async function startEditing() {
  try {
    const result = await diagramStore.startEditingSession(props.diagramName)
    
    if (result.success) {
      toast.success('Editing session started')
    } else {
      toast.error(result.message)
    }
  } catch (error) {
    console.error('Error starting editing session:', error)
    toast.error('Failed to start editing session')
  }
}

async function saveAndEndEditing() {
  try {
    // First save the changes
    await diagramStore.updateDiagram({
      name: props.diagramName,
      diagram_code: localDiagramCode.value
    })
    
    // Then end the editing session
    await diagramStore.endEditingSession(props.diagramName)
    
    toast.success('Changes saved successfully')
  } catch (error) {
    console.error('Error saving changes:', error)
    toast.error('Failed to save changes')
  }
}

function formatCode() {
  // Basic formatting logic
  const code = localDiagramCode.value
  const lines = code.split('\n')
  let formatted = []
  let indentLevel = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) {
      formatted.push('')
      return
    }
    
    // Decrease indent for closing braces or end keywords
    if (trimmed.includes('}') || trimmed.includes('end')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }
    
    // Add formatted line with proper indentation
    formatted.push('    '.repeat(indentLevel) + trimmed)
    
    // Increase indent for opening braces or start keywords
    if (trimmed.includes('{') || trimmed.includes('subgraph') || 
        trimmed.includes('section') || trimmed.includes('class')) {
      indentLevel++
    }
  })
  
  localDiagramCode.value = formatted.join('\n')
}

function confirmClear() {
  if (confirm('Are you sure you want to clear the editor?')) {
    localDiagramCode.value = ''
    updateStats({ lines: 0, chars: 0 })
  }
}

function applyTemplate(templateCode) {
  if (isEditing.value) {
    localDiagramCode.value = templateCode
    showTemplates.value = false
  } else {
    toast.error('You need to start editing to apply a template')
  }
}

function zoomIn() {
  if (renderSettings.value.zoom < 5.0) {
    diagramStore.updateRenderSettings({
      zoom: Math.min(5.0, renderSettings.value.zoom + 0.1)
    })
  }
}

function zoomOut() {
  if (renderSettings.value.zoom > 0.1) {
    diagramStore.updateRenderSettings({
      zoom: Math.max(0.1, renderSettings.value.zoom - 0.1)
    })
  }
}

function resetZoom() {
  diagramStore.updateRenderSettings({
    zoom: 1.0,
    pan: { x: 0, y: 0 }
  })
}

function toggleCentered() {
  diagramStore.updateRenderSettings({
    centerDiagram: !renderSettings.value.centerDiagram
  })
}

function toggleFullscreen() {
  const previewPanel = document.querySelector('.preview-panel')
  if (previewPanel) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      previewPanel.requestFullscreen()
    }
  }
}

function updatePan(pan) {
  diagramStore.updateRenderSettings({ pan })
}

function updateCursorPosition(position) {
  // In a real implementation, this would send the cursor position to the server
  console.log('Cursor position:', position)
}

function openExportModal() {
  showExportModal.value = true
}

function startCollaborationPolling() {
  // Poll for active users every 10 seconds
  collaborationInterval.value = setInterval(async () => {
    if (diagram.value) {
      await diagramStore.loadActiveUsers(props.diagramName)
    }
  }, 10000)
}

// Watch for changes to the diagram code
watch(() => diagramStore.diagramCode, (newCode) => {
  if (newCode !== localDiagramCode.value) {
    localDiagramCode.value = newCode
  }
})

// Watch for local changes to update the store
watch(localDiagramCode, (newCode) => {
  if (isEditing.value) {
    diagramStore.updateDiagramCode(newCode)
  }
})

// Lifecycle hooks
onMounted(() => {
  loadDiagram()
})

onBeforeUnmount(() => {
  // Clean up
  diagramStore.cleanup()
  
  // Clear collaboration polling
  if (collaborationInterval.value) {
    clearInterval(collaborationInterval.value)
  }
})
</script>

<style scoped>
.diagram-editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-white);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.editor-header {
  background: linear-gradient(135deg, var(--blue-500), var(--purple-500));
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.125rem;
}

.logo-text p {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
}

.editor-toolbar {
  background: white;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-xs);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.view-toggle {
  display: flex;
  background: var(--gray-50);
  border-radius: 0.75rem;
  padding: 0.25rem;
  border: 1px solid var(--gray-200);
}

.view-toggle button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.view-toggle button.active {
  background: white;
  color: var(--blue-500);
  box-shadow: var(--shadow-xs);
}

.editor-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--gray-600);
}

.toolbar-right {
  display: flex;
  gap: 0.75rem;
}

.editor-main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--gray-900);
  position: relative;
}

.editor-panel .editor-header {
  background: var(--gray-800);
  color: white;
  padding: 0.75rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gray-700);
}

.editor-panel .editor-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
}

.editor-panel .editor-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  opacity: 0.8;
  color: white;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-left: 1px solid var(--gray-200);
}

.preview-header {
  background: var(--gray-50);
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.zoom-level {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-700);
  min-width: 2.5rem;
  text-align: center;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--gray-200);
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

/* Status classes */
.status-loading {
  color: var(--amber-500);
}

.status-ready {
  color: var(--green-500);
}

.status-error {
  color: var(--red-500);
}

.status-rendering {
  color: var(--amber-500);
}

/* Responsive styles */
@media (max-width: 768px) {
  .editor-main-content {
    flex-direction: column;
  }
  
  .editor-panel,
  .preview-panel {
    flex: none;
    height: 50vh;
  }
  
  .editor-toolbar {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .toolbar-left {
    width: 100%;
    justify-content: space-between;
  }
  
  .toolbar-right {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 