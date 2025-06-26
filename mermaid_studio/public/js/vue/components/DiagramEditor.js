const DiagramEditor = {
  template: `
  <div class="diagram-editor">
    <h1>{{ isNew ? 'Create New Diagram' : 'Edit Diagram' }}</h1>
    <p>ID: {{ id }}</p>
  </div>
  `,
  
  props: {
    id: String
  },
  
  computed: {
    isNew() {
      return !this.id;
    }
  }
}; 