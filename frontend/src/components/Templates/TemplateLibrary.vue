<template>
  <div class="templates-sidebar">
    <div class="templates-header">
      <h3>
        <i class="fa fa-th-large mr-2"></i> Templates
      </h3>
      <button class="close-btn" @click="$emit('close')">
        <i class="fa fa-times"></i>
      </button>
    </div>
    
    <div class="templates-search">
      <div class="search-input">
        <i class="fa fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search templates..." 
          @input="filterTemplates"
        />
      </div>
      
      <div class="template-categories">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>
    </div>
    
    <div class="templates-list">
      <div 
        v-for="template in filteredTemplates" 
        :key="template.id"
        class="template-item"
        @click="selectTemplate(template)"
      >
        <h4>{{ template.name }}</h4>
        <p>{{ template.description }}</p>
        <div class="template-preview">
          <pre>{{ template.previewCode }}</pre>
        </div>
      </div>
      
      <div v-if="filteredTemplates.length === 0" class="no-templates">
        <i class="fa fa-search mr-2"></i>
        No templates found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { createResource } from 'frappe-ui'

const emit = defineEmits(['select-template', 'close'])

// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const templates = ref([])
const isLoading = ref(false)

// Categories
const categories = [
  { id: 'all', name: 'All' },
  { id: 'flowchart', name: 'Flowchart' },
  { id: 'sequence', name: 'Sequence' },
  { id: 'gantt', name: 'Gantt' },
  { id: 'class', name: 'Class' },
  { id: 'state', name: 'State' },
  { id: 'pie', name: 'Pie' }
]

// Resources
const getDiagramsResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.diagram_api.get_diagrams',
  transform: (data) => data
})

// Computed
const filteredTemplates = computed(() => {
  let filtered = templates.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(template => template.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(template => 
      template.name.toLowerCase().includes(query) || 
      template.description.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
function selectCategory(categoryId) {
  selectedCategory.value = categoryId
}

function filterTemplates() {
  // This is handled by the computed property
}

function selectTemplate(template) {
  emit('select-template', template.code)
}

async function loadTemplates() {
  isLoading.value = true
  
  try {
    // Load templates from server
    const result = await getDiagramsResource.submit({ is_template: 1 })
    
    // Transform to our format
    templates.value = result.map(diagram => ({
      id: diagram.name,
      name: diagram.title,
      description: diagram.description || `${diagram.diagram_type} diagram template`,
      category: diagram.diagram_type,
      code: diagram.diagram_code,
      previewCode: diagram.diagram_code.length > 100 
        ? diagram.diagram_code.substring(0, 100) + '...' 
        : diagram.diagram_code
    }))
    
    // If no templates from server, use built-in templates
    if (templates.value.length === 0) {
      templates.value = getBuiltInTemplates()
    }
  } catch (error) {
    console.error('Error loading templates:', error)
    templates.value = getBuiltInTemplates()
  } finally {
    isLoading.value = false
  }
}

function getBuiltInTemplates() {
  return [
    {
      id: 'flowchart-basic',
      name: 'Basic Flowchart',
      description: 'Simple decision flow diagram',
      category: 'flowchart',
      code: `graph TD
    A[Start] --> B{Decision Point}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style B fill:#fff3e0`,
      previewCode: 'graph TD\nA[Start] --> B{Decision}\nB -->|Yes| C[Process]\nB -->|No| D[Alternative]'
    },
    {
      id: 'sequence-basic',
      name: 'Sequence Diagram',
      description: 'Show interactions over time',
      category: 'sequence',
      code: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    participant C as Charlie
    
    A->>B: Hello Bob, how are you?
    B-->>A: Great thanks!
    B->>C: How about you Charlie?
    C-->>B: Excellent!
    
    Note over A,C: This is a note
    
    A->>B: Let's meet tomorrow
    B->>C: Charlie, join us?
    C-->>A: Sure!`,
      previewCode: 'sequenceDiagram\nparticipant A as Alice\nparticipant B as Bob\nA->>B: Hello\nB-->>A: Hi!'
    },
    {
      id: 'gantt-basic',
      name: 'Gantt Chart',
      description: 'Project timeline visualization',
      category: 'gantt',
      code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Research           :done, research, 2024-01-01, 2024-01-15
    Requirements       :done, req, 2024-01-10, 2024-01-25
    section Development
    Backend Development :active, backend, 2024-01-20, 2024-02-20
    Frontend Development: frontend, 2024-02-01, 2024-03-01
    section Testing
    Unit Testing       : testing, 2024-02-15, 2024-03-15
    Integration Testing: integration, 2024-03-01, 2024-03-20`,
      previewCode: 'gantt\ntitle Project Timeline\ndateFormat YYYY-MM-DD\nsection Planning\nResearch :done, 2024-01-01, 2024-01-15'
    },
    {
      id: 'class-basic',
      name: 'Class Diagram',
      description: 'Object-oriented design',
      category: 'class',
      code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
        +move()
    }
    
    class Dog {
        +String breed
        +bark()
        +wagTail()
    }
    
    class Cat {
        +Boolean indoor
        +meow()
        +purr()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat
    
    class Owner {
        +String name
        +feedAnimal()
    }
    
    Owner --> Animal : owns`,
      previewCode: 'classDiagram\nclass Animal {\n  +String name\n  +makeSound()\n}\nclass Dog\nAnimal <|-- Dog'
    },
    {
      id: 'state-basic',
      name: 'State Diagram',
      description: 'State machine visualization',
      category: 'state',
      code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : start
    Loading --> Success : data loaded
    Loading --> Error : failed
    Success --> Idle : reset
    Error --> Loading : retry
    Error --> Idle : cancel
    
    state Success {
        [*] --> DisplayData
        DisplayData --> Processing
        Processing --> DisplayData
    }`,
      previewCode: 'stateDiagram-v2\n[*] --> Idle\nIdle --> Loading\nLoading --> Success\nLoading --> Error'
    },
    {
      id: 'pie-basic',
      name: 'Pie Chart',
      description: 'Data distribution chart',
      category: 'pie',
      code: `pie title Popular Programming Languages
    "JavaScript" : 35
    "Python" : 25
    "Java" : 20
    "TypeScript" : 12
    "Other" : 8`,
      previewCode: 'pie title Languages\n"JavaScript" : 35\n"Python" : 25\n"Java" : 20'
    }
  ]
}

// Lifecycle
onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.templates-sidebar {
  width: 300px;
  background: white;
  border-left: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.templates-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.templates-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-700);
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

.templates-search {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-200);
}

.search-input {
  position: relative;
  margin-bottom: 1rem;
}

.search-input i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}

.search-input input {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--gray-200);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input input:focus {
  border-color: var(--blue-400);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.template-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.template-categories button {
  padding: 0.25rem 0.5rem;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s;
}

.template-categories button.active {
  background: var(--blue-100);
  border-color: var(--blue-200);
  color: var(--blue-700);
}

.templates-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.template-item {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-item:hover {
  background: var(--gray-100);
  border-color: var(--blue-300);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.template-item h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--gray-700);
}

.template-item p {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin: 0 0 0.75rem 0;
}

.template-preview {
  background: white;
  border-radius: 0.25rem;
  padding: 0.5rem;
  font-family: monospace;
  font-size: 0.6875rem;
  color: var(--gray-600);
  border: 1px solid var(--gray-200);
  max-height: 100px;
  overflow: hidden;
}

.template-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-templates {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--gray-500);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .templates-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    width: 280px;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  }
}
</style> 