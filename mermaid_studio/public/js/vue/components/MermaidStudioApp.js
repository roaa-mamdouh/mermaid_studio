const MermaidStudioApp = {
  template: `
  <div class="mermaid-studio-app">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-md flex items-center justify-center">
              <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <span class="text-xl font-semibold text-gray-800">Mermaid Studio</span>
          </router-link>
          
          <nav class="hidden md:flex space-x-1">
            <router-link to="/" class="px-3 py-2 rounded-md text-sm font-medium" :class="[$route.name === 'home' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50']">
              Gallery
            </router-link>
            <router-link to="/templates" class="px-3 py-2 rounded-md text-sm font-medium" :class="[$route.name === 'templates' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50']">
              Templates
            </router-link>
          </nav>
        </div>
        
        <div class="flex items-center space-x-2">
          <router-link to="/editor" class="btn btn-primary">
            <span class="hidden sm:inline">New Diagram</span>
            <span class="sm:hidden">New</span>
          </router-link>
          
          <button class="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100" @click="toggleMobileMenu">
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white border-b border-gray-200 px-4 py-2">
        <router-link to="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" @click="mobileMenuOpen = false">
          Gallery
        </router-link>
        <router-link to="/templates" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" @click="mobileMenuOpen = false">
          Templates
        </router-link>
      </div>
    </header>
    
    <!-- Main content -->
    <main class="container mx-auto px-4 py-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-50 border-t border-gray-200 mt-auto">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-sm text-gray-500">
            &copy; {{ new Date().getFullYear() }} Mermaid Studio
          </div>
          <div class="flex space-x-4 mt-4 md:mt-0">
            <a href="https://mermaid.js.org/intro/" target="_blank" class="text-sm text-gray-500 hover:text-gray-700">
              Mermaid Docs
            </a>
            <a href="https://frappe.io" target="_blank" class="text-sm text-gray-500 hover:text-gray-700">
              Powered by Frappe
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
  `,
  
  data() {
    return {
      mobileMenuOpen: false
    };
  },
  
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    }
  }
}; 