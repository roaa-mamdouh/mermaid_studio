// Initialize the Vue app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create router
  const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory('/mermaid-studio'),
    routes: [
      { 
        path: '/', 
        component: DiagramGallery,
        name: 'home' 
      },
      { 
        path: '/editor/:id?', 
        component: DiagramEditor,
        name: 'editor',
        props: true
      },
      { 
        path: '/view/:id', 
        component: DiagramView,
        name: 'view',
        props: true
      },
      { 
        path: '/templates', 
        component: DiagramTemplates,
        name: 'templates' 
      },
      { 
        path: '/share/:id', 
        component: DiagramSharing,
        name: 'share',
        props: true
      }
    ]
  });

  // Create and mount the Vue app
  const app = Vue.createApp(MermaidStudioApp);
  
  // Use router
  app.use(router);
  
  // Mount the app
  app.mount('#mermaid-studio-app');
}); 