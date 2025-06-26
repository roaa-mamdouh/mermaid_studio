<template>
  <div 
    class="diagram-preview-container" 
    :class="{ 'centered': renderSettings.centerDiagram }"
    @mousedown="startDrag"
    @wheel="handleWheel"
  >
    <div class="loading" v-if="isRendering">
      <div class="spinner"></div>
      <span>Rendering diagram...</span>
    </div>
    
    <div 
      class="preview-wrapper" 
      ref="previewWrapper"
      :style="previewStyle"
    >
      <div class="mermaid-output" ref="mermaidOutput"></div>
    </div>
    
    <div class="error-message" v-if="error">
      <i class="fa fa-exclamation-triangle mr-2"></i>
      <span>{{ error }}</span>
    </div>
    
    <div class="empty-state" v-if="!diagramCode.trim() && !isRendering && !error">
      <i class="fa fa-project-diagram"></i>
      <p>Your diagram will appear here</p>
      <small>Start typing in the editor to see live preview</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import mermaid from 'mermaid'

const props = defineProps({
  diagramCode: {
    type: String,
    default: ''
  },
  renderSettings: {
    type: Object,
    default: () => ({
      theme: 'default',
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      centerDiagram: true,
      showGrid: true
    })
  }
})

const emit = defineEmits(['update:render-status', 'pan'])

const mermaidOutput = ref(null)
const previewWrapper = ref(null)
const isRendering = ref(false)
const error = ref(null)
const renderTimeout = ref(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// Initialize Mermaid
onMounted(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: props.renderSettings.theme,
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'cardinal'
    },
    sequence: {
      useMaxWidth: true,
      wrap: true
    },
    gantt: {
      useMaxWidth: true
    }
  })
  
  // Initial render
  if (props.diagramCode.trim()) {
    renderDiagram()
  }
})

// Computed styles for preview wrapper
const previewStyle = computed(() => {
  return {
    transform: `scale(${props.renderSettings.zoom}) translate(${props.renderSettings.pan.x}px, ${props.renderSettings.pan.y}px)`
  }
})

// Watch for changes to diagram code
watch(() => props.diagramCode, (newCode) => {
  // Debounce rendering
  clearTimeout(renderTimeout.value)
  renderTimeout.value = setTimeout(() => {
    if (newCode.trim()) {
      renderDiagram()
    } else {
      error.value = null
      isRendering.value = false
      if (mermaidOutput.value) {
        mermaidOutput.value.innerHTML = ''
      }
      emit('update:render-status', { status: 'Empty', type: 'empty' })
    }
  }, 300)
})

// Watch for changes to render settings
watch(() => props.renderSettings.theme, (newTheme) => {
  mermaid.initialize({
    ...mermaid.getConfig(),
    theme: newTheme
  })
  
  if (props.diagramCode.trim()) {
    renderDiagram()
  }
})

// Render the diagram
async function renderDiagram() {
  if (!mermaidOutput.value) return
  
  isRendering.value = true
  error.value = null
  emit('update:render-status', { status: 'Rendering...', type: 'rendering' })
  
  try {
    // Clear previous content
    mermaidOutput.value.innerHTML = ''
    
    // Generate unique ID for this render
    const uniqueId = 'diagram-' + Date.now()
    
    // Render the diagram
    const { svg } = await mermaid.render(uniqueId, props.diagramCode)
    mermaidOutput.value.innerHTML = svg
    
    isRendering.value = false
    emit('update:render-status', { status: 'Ready', type: 'ready' })
  } catch (err) {
    console.error('Mermaid rendering error:', err)
    error.value = err.message || 'Failed to render diagram'
    isRendering.value = false
    emit('update:render-status', { status: 'Error', type: 'error' })
  }
}

// Pan functions
function startDrag(e) {
  if (props.renderSettings.zoom <= 1) return
  
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - props.renderSettings.pan.x,
    y: e.clientY - props.renderSettings.pan.y
  }
  
  // Add event listeners for dragging
  document.addEventListener('mousemove', drag)
  document.addEventListener('mouseup', endDrag)
  
  e.preventDefault()
}

function drag(e) {
  if (!isDragging.value || props.renderSettings.zoom <= 1) return
  
  const newPan = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y
  }
  
  emit('pan', newPan)
}

function endDrag() {
  if (!isDragging.value) return
  
  isDragging.value = false
  
  // Remove event listeners
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', endDrag)
}

// Wheel zoom
function handleWheel(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    const oldZoom = props.renderSettings.zoom
    let newZoom = oldZoom
    
    if (e.deltaY < 0) {
      // Zoom in
      newZoom = Math.min(5.0, oldZoom + 0.1)
    } else {
      // Zoom out
      newZoom = Math.max(0.1, oldZoom - 0.1)
    }
    
    // Adjust pan to zoom towards mouse position
    const zoomDiff = newZoom - oldZoom
    if (zoomDiff !== 0) {
      const newPan = { ...props.renderSettings.pan }
      newPan.x -= mouseX * zoomDiff / newZoom
      newPan.y -= mouseY * zoomDiff / newZoom
      
      emit('pan', newPan)
    }
    
    // Update zoom
    emit('update:render-settings', { ...props.renderSettings, zoom: newZoom })
  }
}

// Cleanup
onBeforeUnmount(() => {
  clearTimeout(renderTimeout.value)
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', endDrag)
})
</script>

<style scoped>
.diagram-preview-container {
  flex: 1;
  padding: 1.875rem;
  overflow: auto;
  background: linear-gradient(45deg, var(--gray-50) 25%, transparent 25%), 
              linear-gradient(-45deg, var(--gray-50) 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, var(--gray-50) 75%), 
              linear-gradient(-45deg, transparent 75%, var(--gray-50) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  display: flex;
  position: relative;
}

.diagram-preview-container.centered {
  align-items: center;
  justify-content: center;
}

.preview-wrapper {
  transform-origin: center center;
  transition: transform 0.2s ease;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mermaid-output {
  max-width: 100%;
  max-height: 100%;
  background: white;
  padding: 1.25rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  color: var(--gray-600);
  background: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--gray-200);
  border-top: 2px solid var(--blue-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, var(--red-50), var(--red-100));
  color: var(--red-600);
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--red-200);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  max-width: 80%;
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--gray-500);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9375rem;
  z-index: 10;
}

.empty-state i {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-state small {
  font-size: 0.875rem;
  color: var(--gray-400);
}
</style> 