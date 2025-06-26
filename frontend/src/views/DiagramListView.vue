<template>
  <div class="diagram-list-view">
    <div class="header">
      <div class="header-title">
        <h1>Mermaid Studio</h1>
        <p>Your diagrams</p>
      </div>
      <div class="header-actions">
        <Button @click="showCreateModal = true">
          <i class="fa fa-plus mr-2"></i> New Diagram
        </Button>
      </div>
    </div>

    <div class="filters">
      <div class="search-bar">
        <i class="fa fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search diagrams..." 
          @input="debouncedSearch"
        />
      </div>

      <div class="filter-options">
        <div class="filter-group">
          <label>Folder:</label>
          <select v-model="selectedFolder">
            <option value="">All Folders</option>
            <option 
              v-for="folder in folders" 
              :key="folder.name" 
              :value="folder.name"
            >
              {{ folder.folder_name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Type:</label>
          <select v-model="selectedType">
            <option value="">All Types</option>
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence</option>
            <option value="gantt">Gantt</option>
            <option value="class">Class</option>
            <option value="state">State</option>
            <option value="pie">Pie</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Show:</label>
          <select v-model="showTemplates">
            <option :value="false">My Diagrams</option>
            <option :value="true">Templates</option>
          </select>
        </div>
      </div>
    </div>

    <div class="diagram-grid" v-if="!getDiagramsResource.loading">
      <div 
        v-for="diagram in diagrams" 
        :key="diagram.name"
        class="diagram-card"
        @click="openDiagram(diagram.name)"
      >
        <div class="diagram-thumbnail">
          <div v-if="diagram.thumbnail" class="thumbnail-image">
            <img :src="diagram.thumbnail" :alt="diagram.title" />
          </div>
          <div v-else class="thumbnail-placeholder">
            <i :class="getDiagramIcon(diagram.diagram_type)"></i>
          </div>
        </div>
        <div class="diagram-info">
          <h3>{{ diagram.title }}</h3>
          <div class="diagram-meta">
            <span class="diagram-type">
              <i :class="getDiagramIcon(diagram.diagram_type)"></i>
              {{ formatDiagramType(diagram.diagram_type) }}
            </span>
            <span class="diagram-date">
              {{ formatDate(diagram.modified) }}
            </span>
          </div>
        </div>
        <div class="diagram-actions">
          <button class="action-btn" @click.stop="editDiagram(diagram)">
            <i class="fa fa-edit"></i>
          </button>
          <button class="action-btn" @click.stop="deleteDiagram(diagram)">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>

      <div v-if="diagrams.length === 0" class="no-diagrams">
        <i class="fa fa-project-diagram"></i>
        <p>No diagrams found</p>
        <Button @click="showCreateModal = true">Create New Diagram</Button>
      </div>
    </div>

    <div v-else class="loading-container">
      <div class="spinner"></div>
      <p>Loading diagrams...</p>
    </div>

    <!-- Create Diagram Modal -->
    <div v-if="showCreateModal" class="modal-backdrop" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Create New Diagram</h3>
          <button class="close-btn" @click="showCreateModal = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
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
            <label for="diagram-folder">Folder</label>
            <select id="diagram-folder" v-model="newDiagram.folder">
              <option value="">None</option>
              <option 
                v-for="folder in folders" 
                :key="folder.name" 
                :value="folder.name"
              >
                {{ folder.folder_name }}
              </option>
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
        </div>
        <div class="modal-footer">
          <Button 
            variant="ghost" 
            @click="showCreateModal = false"
          >
            Cancel
          </Button>
          <Button 
            @click="createDiagram"
            :loading="createDiagramResource.loading"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createResource } from 'frappe-ui'
import { useToast } from 'frappe-ui'
import Button from '../components/Common/Button.vue'

const router = useRouter()
const toast = useToast()

// State
const diagrams = ref([])
const folders = ref([])
const searchQuery = ref('')
const selectedFolder = ref('')
const selectedType = ref('')
const showTemplates = ref(false)
const showCreateModal = ref(false)
const newDiagram = ref({
  title: '',
  diagram_type: 'flowchart',
  folder: '',
  is_template: false,
  diagram_code: ''
})

// Resources
const getDiagramsResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.diagram_api.get_diagrams',
  transform: (data) => data
})

const getFoldersResource = createResource({
  url: 'frappe.client.get_list',
  params: {
    doctype: 'Diagram Folder',
    fields: ['name', 'folder_name']
  },
  transform: (data) => data
})

const createDiagramResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.diagram_api.create_diagram',
  transform: (data) => data
})

const deleteDiagramResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.diagram_api.delete_diagram',
  transform: (data) => data
})

// Methods
async function loadDiagrams() {
  try {
    const params = {
      is_template: showTemplates.value ? 1 : 0
    }
    
    if (selectedFolder.value) {
      params.folder = selectedFolder.value
    }
    
    if (searchQuery.value) {
      params.search_text = searchQuery.value
    }
    
    const result = await getDiagramsResource.submit(params)
    diagrams.value = result
  } catch (error) {
    console.error('Error loading diagrams:', error)
    toast.error('Failed to load diagrams')
  }
}

async function loadFolders() {
  try {
    const result = await getFoldersResource.submit()
    folders.value = result
  } catch (error) {
    console.error('Error loading folders:', error)
    toast.error('Failed to load folders')
  }
}

function openDiagram(name) {
  router.push(`/diagram/${name}`)
}

function editDiagram(diagram) {
  router.push(`/diagram/${diagram.name}`)
}

async function deleteDiagram(diagram) {
  if (!confirm(`Are you sure you want to delete "${diagram.title}"?`)) {
    return
  }
  
  try {
    await deleteDiagramResource.submit({ name: diagram.name })
    toast.success('Diagram deleted successfully')
    loadDiagrams()
  } catch (error) {
    console.error('Error deleting diagram:', error)
    toast.error('Failed to delete diagram')
  }
}

async function createDiagram() {
  if (!newDiagram.value.title) {
    toast.error('Please enter a title for the diagram')
    return
  }
  
  try {
    // Set default diagram code based on type
    newDiagram.value.diagram_code = getDefaultDiagramCode(newDiagram.value.diagram_type)
    
    const result = await createDiagramResource.submit(newDiagram.value)
    
    toast.success('Diagram created successfully')
    showCreateModal.value = false
    
    // Reset form
    newDiagram.value = {
      title: '',
      diagram_type: 'flowchart',
      folder: '',
      is_template: false,
      diagram_code: ''
    }
    
    // Open the new diagram
    router.push(`/diagram/${result.name}`)
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
    case 'flowchart':
      return 'fa fa-project-diagram'
    case 'sequence':
      return 'fa fa-exchange-alt'
    case 'gantt':
      return 'fa fa-tasks'
    case 'class':
      return 'fa fa-cubes'
    case 'state':
      return 'fa fa-random'
    case 'pie':
      return 'fa fa-chart-pie'
    default:
      return 'fa fa-diagram-project'
  }
}

function formatDiagramType(type) {
  if (!type) return 'Unknown'
  
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Debounce search
let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadDiagrams()
  }, 300)
}

// Watch for filter changes
watch([selectedFolder, selectedType, showTemplates], () => {
  loadDiagrams()
})

// Lifecycle
onMounted(() => {
  loadDiagrams()
  loadFolders()
})
</script>

<style scoped>
.diagram-list-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-title h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  color: var(--gray-900);
}

.header-title p {
  font-size: 1rem;
  color: var(--gray-500);
  margin: 0.25rem 0 0 0;
}

.filters {
  margin-bottom: 2rem;
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-bar input:focus {
  border-color: var(--blue-400);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
}

.filter-group select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
}

.diagram-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.diagram-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
}

.diagram-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.diagram-thumbnail {
  height: 160px;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumbnail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--gray-400);
  background: linear-gradient(135deg, var(--gray-50), var(--gray-100));
}

.diagram-info {
  padding: 1rem;
}

.diagram-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--gray-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.diagram-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--gray-500);
}

.diagram-type {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.diagram-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.diagram-card:hover .diagram-actions {
  opacity: 1;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--gray-200);
  color: var(--gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: white;
  color: var(--blue-500);
  border-color: var(--blue-300);
}

.action-btn:last-child:hover {
  color: var(--red-500);
  border-color: var(--red-300);
}

.no-diagrams {
  grid-column: 1 / -1;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  gap: 1rem;
}

.no-diagrams i {
  font-size: 3rem;
  opacity: 0.5;
}

.loading-container {
  height: 300px;
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

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(3px);
}

.modal {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--gray-500);
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.form-group input[type="text"],
.form-group select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input[type="text"]:focus,
.form-group select:focus {
  border-color: var(--blue-400);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox input {
  width: 1rem;
  height: 1rem;
}

.checkbox label {
  margin: 0;
  cursor: pointer;
}

@media (max-width: 768px) {
  .diagram-list-view {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filter-options {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group select {
    flex: 1;
  }
  
  .diagram-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style> 