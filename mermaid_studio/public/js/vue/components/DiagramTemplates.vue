<template>
  <div class="diagram-templates">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Diagram Templates</h1>
      <p class="mt-2 text-gray-600">Browse and use templates to create new diagrams quickly</p>
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
          <h3 class="text-sm font-medium text-red-800">Error loading templates</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>
    
    <!-- No templates -->
    <div v-else-if="templates.length === 0" class="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
      <p class="mt-1 text-sm text-gray-500">Create a diagram and save it as a template to get started.</p>
      <div class="mt-6">
        <router-link to="/editor" class="btn btn-primary">
          Create new diagram
        </router-link>
      </div>
    </div>
    
    <!-- Templates grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="template in templates" 
        :key="template.name" 
        class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
      >
        <!-- Template preview -->
        <div class="h-40 bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-center overflow-hidden">
          <div v-if="template.thumbnail" class="w-full h-full flex items-center justify-center">
            <img :src="template.thumbnail" :alt="template.title" class="max-w-full max-h-full object-contain">
          </div>
          <div v-else class="diagram-preview w-full h-full" :id="`template-${template.name}`">
            <div v-if="template.diagram_code" class="mermaid-preview">
              {{ template.diagram_code }}
            </div>
            <div v-else class="flex items-center justify-center h-full">
              <svg class="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Template info -->
        <div class="p-4">
          <div class="flex justify-between items-start">
            <h3 class="text-lg font-medium text-gray-900 truncate">
              {{ template.title || 'Untitled Template' }}
            </h3>
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
              :class="getTypeClass(template.diagram_type)"
            >
              {{ template.diagram_type || 'other' }}
            </span>
          </div>
          
          <div class="mt-2 flex items-center text-sm text-gray-500">
            <svg class="flex-shrink-0 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>By {{ template.owner }}</span>
          </div>
          
          <div class="mt-4 flex justify-between">
            <button @click="useTemplate(template)" class="btn btn-sm btn-primary">
              Use Template
            </button>
            <router-link :to="`/view/${template.name}`" class="btn btn-sm btn-outline">
              Preview
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'DiagramTemplates',
  setup() {
    const router = useRouter();
    
    // State
    const templates = ref([]);
    const loading = ref(true);
    const error = ref(null);
    
    // Fetch templates
    const fetchTemplates = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        const response = await frappe.call({
          method: 'mermaid_studio.api.diagram_api.get_diagrams',
          args: {
            filters: { is_template: 1 },
            fields: ['name', 'title', 'diagram_type', 'modified', 'owner', 'thumbnail', 'diagram_code']
          }
        });
        
        templates.value = response.message || [];
      } catch (err) {
        console.error('Error fetching templates:', err);
        error.value = err.message || 'Failed to load templates';
      } finally {
        loading.value = false;
      }
    };
    
    // Get CSS class for diagram type
    const getTypeClass = (type) => {
      const typeClasses = {
        flowchart: 'bg-blue-100 text-blue-800',
        sequence: 'bg-green-100 text-green-800',
        gantt: 'bg-yellow-100 text-yellow-800',
        class: 'bg-purple-100 text-purple-800',
        state: 'bg-indigo-100 text-indigo-800',
        pie: 'bg-pink-100 text-pink-800',
        other: 'bg-gray-100 text-gray-800'
      };
      
      return typeClasses[type] || typeClasses.other;
    };
    
    // Use template to create new diagram
    const useTemplate = (template) => {
      router.push({
        path: '/editor',
        query: { template: template.name }
      });
    };
    
    // Initialize mermaid for previews
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
    
    // Render diagram previews
    const renderPreviews = () => {
      if (!window.mermaid) return;
      
      templates.value.forEach(template => {
        if (template.diagram_code) {
          const container = document.getElementById(`template-${template.name}`);
          if (container) {
            try {
              const element = container.querySelector('.mermaid-preview');
              if (element) {
                // Limit code length for preview
                const previewCode = template.diagram_code.length > 500 
                  ? template.diagram_code.substring(0, 500) 
                  : template.diagram_code;
                  
                window.mermaid.mermaidAPI.render(
                  `preview-template-${template.name}`, 
                  previewCode, 
                  (svg) => {
                    element.innerHTML = svg;
                  }
                );
              }
            } catch (err) {
              console.error('Error rendering preview:', err);
            }
          }
        }
      });
    };
    
    // Load mermaid.js
    const loadMermaid = () => {
      if (window.mermaid) {
        initMermaid();
        renderPreviews();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@9.3.0/dist/mermaid.min.js';
      script.onload = () => {
        initMermaid();
        renderPreviews();
      };
      document.head.appendChild(script);
    };
    
    // Fetch templates on mount
    onMounted(() => {
      fetchTemplates().then(() => {
        // Load mermaid after templates are loaded
        setTimeout(loadMermaid, 100);
      });
    });
    
    return {
      templates,
      loading,
      error,
      getTypeClass,
      useTemplate
    };
  }
};
</script>

<style scoped>
.diagram-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.mermaid-preview {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mermaid-preview svg {
  max-width: 100%;
  max-height: 100%;
}
</style> 