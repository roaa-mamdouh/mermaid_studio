import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createResource } from 'frappe-ui'

export const useDiagramStore = defineStore('diagram', () => {
  // State
  const currentDiagram = ref(null)
  const diagramCode = ref('')
  const isEditing = ref(false)
  const renderSettings = ref({
    theme: 'default',
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    centerDiagram: true,
    showGrid: true
  })
  const collaborationState = ref({
    activeUsers: [],
    cursorPositions: {},
    editingSessions: {}
  })
  const diagramVersions = ref([])
  const diagramComments = ref([])
  const diagramTags = ref([])

  // Resources
  const getDiagramResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.diagram_api.get_diagram',
    transform: (data) => {
      return data
    }
  })

  const getDiagramsResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.diagram_api.get_diagrams',
    transform: (data) => {
      return data
    }
  })

  const createDiagramResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.diagram_api.create_diagram',
    transform: (data) => {
      return data
    }
  })

  const updateDiagramResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.diagram_api.update_diagram',
    transform: (data) => {
      return data
    }
  })

  const deleteDiagramResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.diagram_api.delete_diagram',
    transform: (data) => {
      return data
    }
  })

  const getDiagramVersionsResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.diagram_api.get_diagram_versions',
    transform: (data) => {
      return data
    }
  })

  const getCommentsResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.collaboration_api.get_comments',
    transform: (data) => {
      return data
    }
  })

  const addCommentResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.collaboration_api.add_comment',
    transform: (data) => {
      return data
    }
  })

  const getActiveUsersResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.collaboration_api.get_active_users',
    transform: (data) => {
      return data
    }
  })

  const startEditingSessionResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.collaboration_api.start_editing_session',
    transform: (data) => {
      return data
    }
  })

  const endEditingSessionResource = createResource({
    url: 'mermaid_studio.mermaid_studio.api.collaboration_api.end_editing_session',
    transform: (data) => {
      return data
    }
  })

  // Actions
  async function loadDiagram(diagramName) {
    try {
      const result = await getDiagramResource.submit({ name: diagramName })
      currentDiagram.value = result
      diagramCode.value = result.diagram_code
      
      // Load versions, comments, and collaboration state
      await loadDiagramVersions(diagramName)
      await loadDiagramComments(diagramName)
      await loadActiveUsers(diagramName)
      
      return result
    } catch (error) {
      console.error('Error loading diagram:', error)
      throw error
    }
  }

  async function loadDiagrams(params = {}) {
    try {
      return await getDiagramsResource.submit(params)
    } catch (error) {
      console.error('Error loading diagrams:', error)
      throw error
    }
  }

  async function createDiagram(diagramData) {
    try {
      const result = await createDiagramResource.submit(diagramData)
      return result
    } catch (error) {
      console.error('Error creating diagram:', error)
      throw error
    }
  }

  async function updateDiagram(diagramData) {
    try {
      const result = await updateDiagramResource.submit(diagramData)
      
      // Update current diagram if it's the one being updated
      if (currentDiagram.value && currentDiagram.value.name === diagramData.name) {
        currentDiagram.value = result
        
        // Only update code if it's explicitly changed
        if (diagramData.diagram_code !== undefined) {
          diagramCode.value = diagramData.diagram_code
        }
      }
      
      return result
    } catch (error) {
      console.error('Error updating diagram:', error)
      throw error
    }
  }

  async function deleteDiagram(diagramName) {
    try {
      const result = await deleteDiagramResource.submit({ name: diagramName })
      
      // Clear current diagram if it's the one being deleted
      if (currentDiagram.value && currentDiagram.value.name === diagramName) {
        currentDiagram.value = null
        diagramCode.value = ''
      }
      
      return result
    } catch (error) {
      console.error('Error deleting diagram:', error)
      throw error
    }
  }

  async function loadDiagramVersions(diagramName) {
    try {
      const versions = await getDiagramVersionsResource.submit({ diagram_name: diagramName })
      diagramVersions.value = versions
      return versions
    } catch (error) {
      console.error('Error loading diagram versions:', error)
      throw error
    }
  }

  async function loadDiagramComments(diagramName) {
    try {
      const comments = await getCommentsResource.submit({ diagram_name: diagramName })
      diagramComments.value = comments
      return comments
    } catch (error) {
      console.error('Error loading diagram comments:', error)
      throw error
    }
  }

  async function addComment(diagramName, text, position = null) {
    try {
      const comment = await addCommentResource.submit({
        diagram_name: diagramName,
        text,
        position: position ? JSON.stringify(position) : null
      })
      
      // Refresh comments
      await loadDiagramComments(diagramName)
      
      return comment
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  async function loadActiveUsers(diagramName) {
    try {
      const users = await getActiveUsersResource.submit({ diagram_name: diagramName })
      collaborationState.value.activeUsers = users
      return users
    } catch (error) {
      console.error('Error loading active users:', error)
      throw error
    }
  }

  async function startEditingSession(diagramName) {
    try {
      const result = await startEditingSessionResource.submit({ diagram_name: diagramName })
      
      if (result.success) {
        isEditing.value = true
      }
      
      return result
    } catch (error) {
      console.error('Error starting editing session:', error)
      throw error
    }
  }

  async function endEditingSession(diagramName) {
    try {
      const result = await endEditingSessionResource.submit({ diagram_name: diagramName })
      
      if (result.success) {
        isEditing.value = false
      }
      
      return result
    } catch (error) {
      console.error('Error ending editing session:', error)
      throw error
    }
  }

  // Update diagram code locally (without saving to server)
  function updateDiagramCode(newCode) {
    diagramCode.value = newCode
  }

  // Update render settings
  function updateRenderSettings(settings) {
    renderSettings.value = { ...renderSettings.value, ...settings }
  }

  // Computed
  const canEdit = computed(() => {
    if (!currentDiagram.value) return false
    
    // Check if user is the owner
    const isOwner = currentDiagram.value.owner === frappe.session.user
    
    // TODO: Check if user has write permissions through sharing
    
    return isOwner
  })

  // Cleanup function
  function cleanup() {
    // End editing session when component is unmounted
    if (isEditing.value && currentDiagram.value) {
      endEditingSession(currentDiagram.value.name)
    }
    
    // Reset state
    currentDiagram.value = null
    diagramCode.value = ''
    isEditing.value = false
    diagramVersions.value = []
    diagramComments.value = []
    collaborationState.value = {
      activeUsers: [],
      cursorPositions: {},
      editingSessions: {}
    }
  }

  return {
    // State
    currentDiagram,
    diagramCode,
    isEditing,
    renderSettings,
    collaborationState,
    diagramVersions,
    diagramComments,
    diagramTags,
    
    // Resources
    getDiagramResource,
    getDiagramsResource,
    createDiagramResource,
    updateDiagramResource,
    deleteDiagramResource,
    
    // Actions
    loadDiagram,
    loadDiagrams,
    createDiagram,
    updateDiagram,
    deleteDiagram,
    loadDiagramVersions,
    loadDiagramComments,
    addComment,
    loadActiveUsers,
    startEditingSession,
    endEditingSession,
    updateDiagramCode,
    updateRenderSettings,
    
    // Computed
    canEdit,
    
    // Cleanup
    cleanup
  }
}) 