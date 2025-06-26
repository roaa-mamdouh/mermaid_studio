<template>
  <div class="mermaid-studio">
    <!-- Main Layout -->
    <div class="studio-layout">
      <!-- Sidebar -->
      <div class="studio-sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="logo-section">
            <i class="fa fa-project-diagram text-xl"></i>
            <h1 v-show="!sidebarCollapsed">Mermaid Studio</h1>
          </div>
          <button @click="toggleSidebar" class="collapse-btn">
            <i :class="sidebarCollapsed ? 'fa fa-chevron-right' : 'fa fa-chevron-left'"></i>
          </button>
        </div>

        <!-- Gallery Section -->
        <div v-show="!sidebarCollapsed" class="gallery-section">
          <div class="gallery-header">
            <div class="search-bar">
              <i class="fa fa-search"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search diagrams..." 
                @input="debouncedSearch"
              />
            </div>
            <div class="filter-controls">
              <select v-model="selectedType" class="filter-select">
                <option value="">All Types</option>
                <option value="flowchart">Flowchart</option>
                <option value="sequence">Sequence</option>
                <option value="gantt">Gantt</option>
                <option value="class">Class</option>
                <option value="state">State</option>
                <option value="pie">Pie</option>
              </select>
              <button @click="showCreateModal = true" class="btn-new">
                <i class="fa fa-plus"></i>
                <span>New</span>
              </button>
            </div>
          </div>

          <div class="diagrams-list">
            <div 
              v-for="diagram in filteredDiagrams" 
              :key="diagram.name"
              class="diagram-card"
              :class="{ 'active': selectedDiagram?.name === diagram.name }"
              @click="selectDiagram(diagram)"
            >
              <div class="diagram-preview">
                <div v-if="diagram.thumbnail" class="thumbnail">
                  <img :src="diagram.thumbnail" :alt="diagram.title">
                </div>
                <div v-else class="placeholder">
                  <i :class="getDiagramIcon(diagram.diagram_type)"></i>
                </div>
              </div>
              <div class="diagram-info">
                <h3>{{ diagram.title || 'Untitled' }}</h3>
                <div class="diagram-meta">
                  <span class="diagram-type">
                    <i :class="getDiagramIcon(diagram.diagram_type)"></i>
                    {{ formatDiagramType(diagram.diagram_type) }}
                  </span>
                  <span class="diagram-date">{{ formatDate(diagram.modified) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" :class="{ 'collapsed': sidebarCollapsed }">
          <button @click="showTemplates = true" class="action-btn" :title="sidebarCollapsed ? 'Templates' : ''">
            <i class="fa fa-th-large"></i>
            <span v-if="!sidebarCollapsed">Templates</span>
          </button>
          <button @click="showExportModal = true" class="action-btn" :title="sidebarCollapsed ? 'Export' : ''">
            <i class="fa fa-download"></i>
            <span v-if="!sidebarCollapsed">Export</span>
          </button>
          <button @click="showShareDialog = true" class="action-btn" :title="sidebarCollapsed ? 'Share' : ''">
            <i class="fa fa-share-alt"></i>
            <span v-if="!sidebarCollapsed">Share</span>
          </button>
        </div>
      </div>

      <!-- Main Editor Area -->
      <div class="studio-main">
        <div v-if="selectedDiagram" class="editor-container">
          <DiagramEditor 
            :diagram-name="selectedDiagram.name"
            @update:diagram="handleDiagramUpdate"
          />
        </div>
        <div v-else class="empty-state">
          <div class="empty-content">
            <i class="fa fa-project-diagram text-6xl mb-4 text-gray-400"></i>
            <h2>Welcome to Mermaid Studio</h2>
            <p>Select a diagram from the gallery or create a new one to get started</p>
            <button @click="showCreateModal = true" class="btn-primary mt-4">
              Create New Diagram
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Diagram Modal -->
    <Dialog v-model="showCreateModal" title="Create New Diagram">
      <div class="p-6">
        <div class="form-group">
          <label for="diagram-title">Title</label>
          <input 
            type="text" 
            id="diagram-title" 
            v-model="newDiagram.title" 
            placeholder="Enter diagram title"
          />
        </div>
        <div class="form-group">
          <label for="diagram-type">Type</label>
          <select id="diagram-type" v-model="newDiagram.diagram_type">
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence</option>
            <option value="gantt">Gantt</option>
            <option value="class">Class</option>
            <option value="state">State</option>
            <option value="pie">Pie</option>
          </select>
        </div>
        <div class="form-group">
          <div class="checkbox">
            <input 
              type="checkbox" 
              id="is-template" 
              v-model="newDiagram.is_template"
            />
            <label for="is-template">Save as template</label>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showCreateModal = false" class="btn-secondary">
            Cancel
          </button>
          <button 
            @click="createDiagram"
            :disabled="createDiagramResource.loading"
            class="btn-primary"
          >
            Create
          </button>
        </div>
      </div>
    </Dialog>

    <!-- Share Dialog -->
    <Dialog v-model="showShareDialog" title="Share Diagram">
      <div v-if="selectedDiagram" class="p-6">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Share link</label>
          <div class="flex">
            <input 
              type="text" 
              readonly 
              :value="shareUrl" 
              class="share-input"
            />
            <button 
              @click="copyShareUrl" 
              class="btn-copy"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Share with email</label>
          <div class="flex">
            <input 
              type="email" 
              v-model="shareEmail" 
              placeholder="Enter email address" 
              class="share-input"
            />
            <button 
              @click="shareWithEmail" 
              class="btn-share"
              :disabled="!shareEmail || shareEmailSending"
            >
              {{ shareEmailSending ? 'Sending...' : 'Share' }}
            </button>
          </div>
          <p v-if="shareEmailError" class="mt-1 text-sm text-red-600">{{ shareEmailError }}</p>
          <p v-if="shareEmailSuccess" class="mt-1 text-sm text-green-600">{{ shareEmailSuccess }}</p>
        </div>
      </div>
    </Dialog>

    <!-- Templates Sidebar -->
    <TemplateLibrary
      v-if="showTemplates"
      @select-template="applyTemplate"
      @close="showTemplates = false"
    />

    <!-- Export Modal -->
    <ExportModal
      v-if="showExportModal"
      :diagram="selectedDiagram"
      @close="showExportModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { createResource, useToast } from 'frappe-ui'
import { Dialog } from 'frappe-ui'
import DiagramEditor from '../components/DiagramEditor/DiagramEditor.vue'
import TemplateLibrary from '../components/Templates/TemplateLibrary.vue'
import ExportModal from '../components/Common/ExportModal.vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const toast = useToast()

// State
const sidebarCollapsed = ref(false)
const diagrams = ref([])
const selectedDiagram = ref(null)
const searchQuery = ref('')
const selectedType = ref('')
const showCreateModal = ref(false)
const showShareDialog = ref(false)
const showTemplates = ref(false)
const showExportModal = ref(false)
const shareUrl = ref('')
const copied = ref(false)
const shareEmail = ref('')
const shareEmailSending = ref(false)
const shareEmailError = ref('')
const shareEmailSuccess = ref('')

const newDiagram = ref({
  title: '',
  diagram_type: 'flowchart',
  is_template: false,
  diagram_code: ''
})

// Resources
const getDiagramsResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.diagram_api.get_diagrams',
  transform: (data) => data
})

const createDiagramResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.diagram_api.create_diagram',
  transform: (data) => data
})

// Computed
const filteredDiagrams = computed(() => {
  let filtered = [...diagrams.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(d => 
      (d.title && d.title.toLowerCase().includes(query)) || 
      (d.name && d.name.toLowerCase().includes(query))
    )
  }
  
  if (selectedType.value) {
    filtered = filtered.filter(d => d.diagram_type === selectedType.value)
  }
  
  return filtered
})

// Methods
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

async function loadDiagrams() {
  try {
    const result = await getDiagramsResource.submit({
      is_template: 0
    })
    diagrams.value = result
  } catch (error) {
    console.error('Error loading diagrams:', error)
    toast.error('Failed to load diagrams')
  }
}

function selectDiagram(diagram) {
  selectedDiagram.value = diagram
}

function handleDiagramUpdate(updatedDiagram) {
  const index = diagrams.value.findIndex(d => d.name === updatedDiagram.name)
  if (index !== -1) {
    diagrams.value[index] = updatedDiagram
  }
}

async function createDiagram() {
  if (!newDiagram.value.title) {
    toast.error('Please enter a title for the diagram')
    return
  }
  
  try {
    newDiagram.value.diagram_code = getDefaultDiagramCode(newDiagram.value.diagram_type)
    const result = await createDiagramResource.submit(newDiagram.value)
    
    toast.success('Diagram created successfully')
    showCreateModal.value = false
    
    // Add new diagram to list and select it
    await loadDiagrams()
    const created = diagrams.value.find(d => d.name === result.name)
    if (created) {
      selectDiagram(created)
    }
    
    // Reset form
    newDiagram.value = {
      title: '',
      diagram_type: 'flowchart',
      is_template: false,
      diagram_code: ''
    }
  } catch (error) {
    console.error('Error creating diagram:', error)
    toast.error('Failed to create diagram')
  }
}

function getDefaultDiagramCode(type) {
  switch (type) {
    case 'flowchart':
      return 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Process]\n    B -->|No| D[Alternative]\n    C --> E[End]\n    D --> E'
    case 'sequence':
      return 'sequenceDiagram\n    participant A as Alice\n    participant B as Bob\n    A->>B: Hello Bob, how are you?\n    B-->>A: Great thanks!'
    case 'gantt':
      return 'gantt\n    title Project Timeline\n    dateFormat YYYY-MM-DD\n    section Planning\n    Research :done, 2024-01-01, 2024-01-15'
    case 'class':
      return 'classDiagram\n    class Animal {\n        +String name\n        +makeSound()\n    }\n    class Dog\n    Animal <|-- Dog'
    case 'state':
      return 'stateDiagram-v2\n    [*] --> Idle\n    Idle --> Loading\n    Loading --> Success\n    Loading --> Error'
    case 'pie':
      return 'pie title Distribution\n    "A" : 40\n    "B" : 30\n    "C" : 30'
    default:
      return 'graph TD\n    A[Start] --> B[End]'
  }
}

function getDiagramIcon(type) {
  switch (type) {
    case 'flowchart': return 'fa fa-project-diagram'
    case 'sequence': return 'fa fa-exchange-alt'
    case 'gantt': return 'fa fa-tasks'
    case 'class': return 'fa fa-cubes'
    case 'state': return 'fa fa-random'
    case 'pie': return 'fa fa-chart-pie'
    default: return 'fa fa-diagram-project'
  }
}

function formatDiagramType(type) {
  if (!type) return 'Unknown'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatDate(dateString) {
  if (!dateString) return ''
  return dayjs(dateString).fromNow()
}

function copyShareUrl() {
  navigator.clipboard.writeText(shareUrl.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

async function shareWithEmail() {
  if (!shareEmail.value || !selectedDiagram.value) return
  
  shareEmailSending.value = true
  shareEmailError.value = ''
  shareEmailSuccess.value = ''
  
  try {
    await frappe.call({
      method: 'mermaid_studio.api.diagram_api.share_diagram',
      args: {
        diagram: selectedDiagram.value.name,
        email: shareEmail.value
      }
    })
    
    shareEmailSuccess.value = `Diagram shared with ${shareEmail.value}`
    shareEmail.value = ''
  } catch (err) {
    console.error('Error sharing diagram:', err)
    shareEmailError.value = err.message || 'Failed to share diagram'
  } finally {
    shareEmailSending.value = false
  }
}

function applyTemplate(templateCode) {
  // Handle template application
  console.log('Applying template:', templateCode)
}

// Search debouncing
let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadDiagrams()
  }, 300)
}

// Watch for changes
watch([searchQuery, selectedType], () => {
  loadDiagrams()
})

// Initialize
onMounted(() => {
  loadDiagrams()
})
</script>

<style scoped>
.mermaid-studio {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--gray-50);
}

.studio-layout {
  display: flex;
  height: 100%;
}

/* Sidebar */
.studio-sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--gray-200);
  background: linear-gradient(135deg, var(--blue-500), var(--purple-500));
  color: white;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-section h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Gallery Section */
.gallery-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gallery-header {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-200);
}

.search-bar {
  position: relative;
  margin-bottom: 0.75rem;
}

.search-bar i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}

.search-bar input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-bar input:focus {
  border-color: var(--blue-400);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.btn-new {
  padding: 0.5rem 1rem;
  background: var(--blue-500);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-new:hover {
  background: var(--blue-600);
}

/* Diagrams List */
.diagrams-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.diagram-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.diagram-card:hover {
  border-color: var(--blue-300);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.diagram-card.active {
  border-color: var(--blue-500);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.diagram-preview {
  height: 120px;
  background: var(--gray-50);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--gray-200);
}

.thumbnail {
  width: 100%;
  height: 100%;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  font-size: 2rem;
  color: var(--gray-400);
}

.diagram-info {
  padding: 0.75rem;
}

.diagram-info h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-900);
}

.diagram-meta {
  margin-top: 0.25rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--gray-500);
}

/* Quick Actions */
.quick-actions {
  padding: 1rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 0.5rem;
}

.quick-actions.collapsed {
  flex-direction: column;
  padding: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  color: var(--gray-700);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--gray-100);
  border-color: var(--gray-300);
}

.quick-actions.collapsed .action-btn {
  padding: 0.75rem;
}

.quick-actions.collapsed .action-btn span {
  display: none;
}

/* Main Editor Area */
.studio-main {
  flex: 1;
  overflow: hidden;
  background: var(--gray-100);
}

.editor-container {
  height: 100%;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.empty-content p {
  color: var(--gray-500);
  margin-bottom: 1.5rem;
}

/* Form Elements */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.375rem;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-group input[type="text"]:focus,
.form-group input[type="email"]:focus,
.form-group select:focus {
  border-color: var(--blue-400);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Share Dialog */
.share-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 6px 0 0 6px;
  font-size: 0.875rem;
}

.btn-copy,
.btn-share {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-left: none;
  border-radius: 0 6px 6px 0;
  background: var(--gray-50);
  color: var(--gray-700);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-share {
  background: var(--blue-500);
  color: white;
  border-color: var(--blue-500);
}

.btn-copy:hover {
  background: var(--gray-100);
}

.btn-share:hover {
  background: var(--blue-600);
}

/* Buttons */
.btn-primary {
  padding: 0.5rem 1rem;
  background: var(--blue-500);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--blue-600);
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--gray-50);
}

/* Responsive */
@media (max-width: 768px) {
  .studio-sidebar {
    position: fixed;
    z-index: 100;
    height: 100%;
    transform: translateX(0);
  }
  
  .sidebar-collapsed {
    transform: translateX(-100%);
  }
  
  .studio-main {
    margin-left: 0;
  }
}
</style>
