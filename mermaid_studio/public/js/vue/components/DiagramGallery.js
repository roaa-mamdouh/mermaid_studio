const DiagramGallery = {
  template: `
  <div class="diagram-gallery">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Diagram Gallery</h1>
      <p class="mt-2 text-gray-600">Browse your diagrams or create a new one</p>
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
          <h3 class="text-sm font-medium text-red-800">Error loading diagrams</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- No diagrams -->
    <div v-else-if="diagrams.length === 0" class="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No diagrams found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new diagram.</p>
      <div class="mt-6">
        <router-link to="/editor" class="btn btn-primary">
          Create new diagram
        </router-link>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Filters and search -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="relative flex-grow">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search diagrams..." 
            class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          >
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div class="flex gap-2">
          <select 
            v-model="typeFilter" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Types</option>
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence</option>
            <option value="gantt">Gantt</option>
            <option value="class">Class</option>
            <option value="state">State</option>
            <option value="pie">Pie</option>
            <option value="other">Other</option>
          </select>
          
          <select 
            v-model="sortBy" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="modified desc">Newest</option>
            <option value="modified asc">Oldest</option>
            <option value="title asc">Name (A-Z)</option>
            <option value="title desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      <!-- Diagram grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="diagram in filteredDiagrams" 
          :key="diagram.name" 
          class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <!-- Diagram preview -->
          <div class="h-40 bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-center overflow-hidden">
            <div v-if="diagram.thumbnail" class="w-full h-full flex items-center justify-center">
              <img :src="diagram.thumbnail" :alt="diagram.title" class="max-w-full max-h-full object-contain">
            </div>
            <div v-else class="diagram-preview w-full h-full" :id="'diagram-' + diagram.name">
              <div v-if="diagram.diagram_code" class="mermaid-preview">
                {{ diagram.diagram_code }}
              </div>
              <div v-else class="flex items-center justify-center h-full">
                <svg class="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Diagram info -->
          <div class="p-4">
            <div class="flex justify-between items-start">
              <h3 class="text-lg font-medium text-gray-900 truncate">
                {{ diagram.title || 'Untitled' }}
              </h3>
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                :class="getTypeClass(diagram.diagram_type)"
              >
                {{ diagram.diagram_type || 'other' }}
              </span>
            </div>
            
            <div class="mt-2 flex items-center text-sm text-gray-500">
              <svg class="flex-shrink-0 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              <span>{{ formatDate(diagram.modified) }}</span>
            </div>
            
            <div class="mt-4 flex justify-between">
              <router-link :to="'/editor/' + diagram.name" class="btn btn-sm btn-outline">
                Edit
              </router-link>
              <router-link :to="'/view/' + diagram.name" class="btn btn-sm btn-outline">
                View
              </router-link>
              <button @click="shareDiagram(diagram)" class="btn btn-sm btn-outline">
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  
  data() {
    return {
      diagrams: [],
      loading: true,
      error: null,
      searchQuery: '',
      typeFilter: '',
      sortBy: 'modified desc',
      currentPage: 1,
      pageSize: 9
    };
  },
  
  computed: {
    filteredDiagrams() {
      let filtered = [...this.diagrams];
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(d => 
          (d.title && d.title.toLowerCase().includes(query)) || 
          (d.name && d.name.toLowerCase().includes(query))
        );
      }
      
      // Apply type filter
      if (this.typeFilter) {
        filtered = filtered.filter(d => d.diagram_type === this.typeFilter);
      }
      
      return filtered;
    }
  },
  
  mounted() {
    this.fetchDiagrams();
    
    // Load mermaid.js
    if (!window.mermaid) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@9.3.0/dist/mermaid.min.js';
      script.onload = () => {
        this.initMermaid();
      };
      document.head.appendChild(script);
    } else {
      this.initMermaid();
    }
  },
  
  methods: {
    async fetchDiagrams() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await frappe.call({
          method: 'mermaid_studio.api.diagram_api.get_diagrams',
          args: {
            filters: { is_template: 0 },
            fields: ['name', 'title', 'diagram_type', 'modified', 'owner', 'diagram_code']
          }
        });
        
        this.diagrams = response.message || [];
        
        // Render diagrams after they are loaded
        this.$nextTick(() => {
          this.renderPreviews();
        });
      } catch (err) {
        console.error('Error fetching diagrams:', err);
        this.error = err.message || 'Failed to load diagrams';
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
      return dayjs(dateString).fromNow();
    },
    
    getTypeClass(type) {
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
    },
    
    shareDiagram(diagram) {
      // Redirect to share page
      this.$router.push(`/share/${diagram.name}`);
    },
    
    initMermaid() {
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: { useMaxWidth: true }
        });
        
        this.renderPreviews();
      }
    },
    
    renderPreviews() {
      if (!window.mermaid) return;
      
      this.filteredDiagrams.forEach(diagram => {
        if (diagram.diagram_code) {
          const container = document.getElementById(`diagram-${diagram.name}`);
          if (container) {
            try {
              const element = container.querySelector('.mermaid-preview');
              if (element) {
                // Limit code length for preview
                const previewCode = diagram.diagram_code.length > 500 
                  ? diagram.diagram_code.substring(0, 500) 
                  : diagram.diagram_code;
                  
                window.mermaid.mermaidAPI.render(
                  `preview-${diagram.name}`, 
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
    }
  },
  
  watch: {
    filteredDiagrams() {
      this.$nextTick(() => {
        this.renderPreviews();
      });
    }
  }
}; 