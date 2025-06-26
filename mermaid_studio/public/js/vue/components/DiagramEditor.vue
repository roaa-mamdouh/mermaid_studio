<template>
  <div class="diagram-editor">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ isNew ? 'Create New Diagram' : 'Edit Diagram' }}</h1>
      <p class="mt-2 text-gray-600">{{ isNew ? 'Create a new Mermaid diagram' : `Editing: ${diagram.title || 'Untitled'}` }}</p>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>
    
    <!-- Editor content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left column: Form fields -->
      <div>
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Diagram Details</h2>
          </div>
          
          <div class="p-4 space-y-4">
            <!-- Title field -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                id="title" 
                type="text" 
                v-model="diagram.title" 
                placeholder="Diagram title" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
            </div>
            
            <!-- Diagram type -->
            <div>
              <label for="diagram_type" class="block text-sm font-medium text-gray-700 mb-1">Diagram Type</label>
              <select 
                id="diagram_type" 
                v-model="diagram.diagram_type" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="flowchart">Flowchart</option>
                <option value="sequence">Sequence</option>
                <option value="gantt">Gantt</option>
                <option value="class">Class</option>
                <option value="state">State</option>
                <option value="pie">Pie</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <!-- Options -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center">
                <input 
                  id="is_public" 
                  type="checkbox" 
                  v-model="diagram.is_public" 
                  class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                >
                <label for="is_public" class="ml-2 block text-sm text-gray-700">Make public</label>
              </div>
              
              <div class="flex items-center">
                <input 
                  id="is_template" 
                  type="checkbox" 
                  v-model="diagram.is_template" 
                  class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                >
                <label for="is_template" class="ml-2 block text-sm text-gray-700">Save as template</label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Code editor -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-900">Diagram Code</h2>
            <div class="flex gap-2">
              <button 
                @click="insertTemplate" 
                class="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
              >
                Insert Template
              </button>
            </div>
          </div>
          
          <div class="p-4">
            <textarea 
              v-model="diagram.diagram_code" 
              rows="15" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
              placeholder="Enter your Mermaid diagram code here..."
            ></textarea>
            
            <div class="mt-2 text-xs text-gray-500">
              <a href="https://mermaid.js.org/intro/syntax-reference.html" target="_blank" class="text-purple-600 hover:text-purple-800">
                Mermaid syntax reference
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right column: Preview -->
      <div>
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-24">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-900">Preview</h2>
            <button 
              @click="renderPreview" 
              class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Refresh Preview
            </button>
          </div>
          
          <div class="p-4">
            <div class="border border-gray-200 rounded-md bg-gray-50 p-4 min-h-[400px] flex items-center justify-center">
              <div v-if="!diagram.diagram_code" class="text-gray-500 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p class="mt-2">Enter diagram code to see preview</p>
              </div>
              <div v-else id="diagram-preview" class="w-full">
                <div class="mermaid">
                  {{ diagram.diagram_code }}
                </div>
              </div>
            </div>
            
            <div v-if="previewError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {{ previewError }}
            </div>
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="mt-6 flex justify-end space-x-3">
          <router-link to="/" class="btn btn-outline">
            Cancel
          </router-link>
          <button 
            @click="saveDiagram" 
            class="btn btn-primary"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save Diagram' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Template selection dialog -->
    <Dialog v-model="showTemplateDialog" title="Insert Template">
      <div class="p-4">
        <div v-if="loadingTemplates" class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
        
        <div v-else-if="templates.length === 0" class="text-center py-6">
          <p class="text-gray-500">No templates available</p>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            v-for="template in templates" 
            :key="template.name" 
            class="border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-50"
            @click="selectTemplate(template)"
          >
            <h3 class="font-medium text-gray-900">{{ template.title || 'Untitled' }}</h3>
            <div class="mt-1 text-xs text-gray-500">{{ template.diagram_type }}</div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end">
          <button @click="showTemplateDialog = false" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Dialog } from 'frappe-ui';

export default {
  name: 'DiagramEditor',
  components: {
    Dialog
  },
  props: {
    id: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    
    // State
    const diagram = ref({
      title: '',
      diagram_type: 'flowchart',
      diagram_code: '',
      is_public: false,
      is_template: false
    });
    const loading = ref(false);
    const saving = ref(false);
    const error = ref(null);
    const previewError = ref(null);
    const showTemplateDialog = ref(false);
    const templates = ref([]);
    const loadingTemplates = ref(false);
    
    // Computed
    const isNew = computed(() => !props.id);
    
    // Methods
    const fetchDiagram = async () => {
      if (!props.id) return;
      
      loading.value = true;
      error.value = null;
      
      try {
        const response = await frappe.call({
          method: 'mermaid_studio.api.diagram_api.get_diagram',
          args: {
            name: props.id
          }
        });
        
        if (response.message) {
          diagram.value = response.message;
        } else {
          error.value = 'Diagram not found';
        }
      } catch (err) {
        console.error('Error fetching diagram:', err);
        error.value = err.message || 'Failed to load diagram';
      } finally {
        loading.value = false;
      }
    };
    
    const saveDiagram = async () => {
      if (!diagram.value.title) {
        error.value = 'Please enter a title for the diagram';
        return;
      }
      
      if (!diagram.value.diagram_code) {
        error.value = 'Please enter diagram code';
        return;
      }
      
      saving.value = true;
      error.value = null;
      
      try {
        const method = isNew.value ? 'mermaid_studio.api.diagram_api.create_diagram' : 'mermaid_studio.api.diagram_api.update_diagram';
        const args = isNew.value ? diagram.value : { ...diagram.value, name: props.id };
        
        const response = await frappe.call({
          method,
          args
        });
        
        if (response.message) {
          // Redirect to the gallery
          router.push('/');
        } else {
          error.value = 'Failed to save diagram';
        }
      } catch (err) {
        console.error('Error saving diagram:', err);
        error.value = err.message || 'Failed to save diagram';
      } finally {
        saving.value = false;
      }
    };
    
    const renderPreview = () => {
      if (!diagram.value.diagram_code) return;
      
      previewError.value = null;
      
      // Clear previous preview
      const container = document.getElementById('diagram-preview');
      if (!container) return;
      
      try {
        // Load Mermaid if not already loaded
        if (!window.mermaid) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid@9.3.0/dist/mermaid.min.js';
          script.onload = () => {
            initMermaid();
            renderMermaid();
          };
          document.head.appendChild(script);
        } else {
          initMermaid();
          renderMermaid();
        }
      } catch (err) {
        console.error('Error rendering preview:', err);
        previewError.value = err.message || 'Failed to render preview';
      }
    };
    
    const initMermaid = () => {
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: { useMaxWidth: true }
        });
      }
    };
    
    const renderMermaid = () => {
      if (!window.mermaid) return;
      
      const container = document.getElementById('diagram-preview');
      if (!container) return;
      
      try {
        // Clear previous content
        container.innerHTML = `<div class="mermaid">${diagram.value.diagram_code}</div>`;
        
        // Render diagram
        window.mermaid.init(undefined, container.querySelectorAll('.mermaid'));
      } catch (err) {
        console.error('Error rendering diagram:', err);
        previewError.value = err.message || 'Failed to render diagram';
      }
    };
    
    const fetchTemplates = async () => {
      loadingTemplates.value = true;
      
      try {
        const response = await frappe.call({
          method: 'mermaid_studio.api.diagram_api.get_diagrams',
          args: {
            filters: { is_template: 1 },
            fields: ['name', 'title', 'diagram_type', 'diagram_code']
          }
        });
        
        templates.value = response.message || [];
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        loadingTemplates.value = false;
      }
    };
    
    const insertTemplate = () => {
      fetchTemplates();
      showTemplateDialog.value = true;
    };
    
    const selectTemplate = (template) => {
      diagram.value.diagram_code = template.diagram_code;
      showTemplateDialog.value = false;
      renderPreview();
    };
    
    // Initialize
    onMounted(() => {
      fetchDiagram();
    });
    
    // Watch for changes in diagram code to auto-render preview
    watch(() => diagram.value.diagram_code, () => {
      renderPreview();
    }, { immediate: true });
    
    return {
      diagram,
      loading,
      saving,
      error,
      previewError,
      isNew,
      saveDiagram,
      renderPreview,
      showTemplateDialog,
      templates,
      loadingTemplates,
      insertTemplate,
      selectTemplate
    };
  }
};
</script>

<style scoped>
/* Add component-specific styles here */
</style> 