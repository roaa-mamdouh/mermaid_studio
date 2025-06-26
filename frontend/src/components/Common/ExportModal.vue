<template>
  <div class="export-modal-backdrop" @click="$emit('close')">
    <div class="export-modal" @click.stop>
      <div class="export-modal-header">
        <h3>
          <i class="fa fa-download mr-2"></i> Export Diagram
        </h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fa fa-times"></i>
        </button>
      </div>
      
      <div class="export-modal-body">
        <div class="export-options">
          <button 
            class="export-option"
            @click="exportSVG"
            :disabled="exportSvgResource.loading"
          >
            <div class="export-option-icon">
              <i class="fa fa-vector-square"></i>
            </div>
            <div class="export-option-content">
              <h4>SVG</h4>
              <p>Vector graphic, ideal for high-quality prints</p>
            </div>
            <div class="export-option-action">
              <i class="fa fa-arrow-right"></i>
            </div>
          </button>
          
          <button 
            class="export-option"
            @click="exportPNG"
            :disabled="exportPngResource.loading"
          >
            <div class="export-option-icon">
              <i class="fa fa-image"></i>
            </div>
            <div class="export-option-content">
              <h4>PNG</h4>
              <p>Raster image, good for web and documents</p>
            </div>
            <div class="export-option-action">
              <i class="fa fa-arrow-right"></i>
            </div>
          </button>
          
          <button 
            class="export-option"
            @click="exportPDF"
            :disabled="exportPdfResource.loading"
          >
            <div class="export-option-icon">
              <i class="fa fa-file-pdf"></i>
            </div>
            <div class="export-option-content">
              <h4>PDF</h4>
              <p>Document format, preserves vector quality</p>
            </div>
            <div class="export-option-action">
              <i class="fa fa-arrow-right"></i>
            </div>
          </button>
          
          <button 
            class="export-option"
            @click="exportMMD"
            :disabled="exportMmdResource.loading"
          >
            <div class="export-option-icon">
              <i class="fa fa-code"></i>
            </div>
            <div class="export-option-content">
              <h4>Mermaid (.mmd)</h4>
              <p>Raw Mermaid code for reuse in other tools</p>
            </div>
            <div class="export-option-action">
              <i class="fa fa-arrow-right"></i>
            </div>
          </button>
          
          <button 
            class="export-option"
            @click="exportJSON"
            :disabled="exportJsonResource.loading"
          >
            <div class="export-option-icon">
              <i class="fa fa-file-code"></i>
            </div>
            <div class="export-option-content">
              <h4>JSON</h4>
              <p>Complete diagram data including metadata</p>
            </div>
            <div class="export-option-action">
              <i class="fa fa-arrow-right"></i>
            </div>
          </button>
          
          <button 
            class="export-option"
            @click="copyCode"
          >
            <div class="export-option-icon">
              <i class="fa fa-copy"></i>
            </div>
            <div class="export-option-content">
              <h4>Copy Code</h4>
              <p>Copy Mermaid code to clipboard</p>
            </div>
            <div class="export-option-action">
              <i class="fa fa-arrow-right"></i>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createResource } from 'frappe-ui'
import { useToast } from 'frappe-ui'

const props = defineProps({
  diagram: {
    type: Object,
    default: () => ({})
  },
  diagramCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])
const toast = useToast()

// Resources
const exportSvgResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.export_api.export_as_svg',
  transform: (data) => data
})

const exportPngResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.export_api.export_as_png',
  transform: (data) => data
})

const exportPdfResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.export_api.export_as_pdf',
  transform: (data) => data
})

const exportMmdResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.export_api.export_as_mmd',
  transform: (data) => data
})

const exportJsonResource = createResource({
  url: 'mermaid_studio.mermaid_studio.api.export_api.export_as_json',
  transform: (data) => data
})

// Methods
async function exportSVG() {
  try {
    const result = await exportSvgResource.submit({
      diagram_name: props.diagram.name
    })
    
    // For now, we'll use client-side rendering
    // In a production environment, this would use server-side rendering
    const svgData = document.querySelector('.mermaid-output svg')
    if (svgData) {
      const svgBlob = new Blob([svgData.outerHTML], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(svgBlob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${props.diagram.title || 'diagram'}.svg`
      a.click()
      
      URL.revokeObjectURL(url)
      toast.success('SVG exported successfully')
      emit('close')
    } else {
      toast.error('Failed to export SVG')
    }
  } catch (error) {
    console.error('Error exporting SVG:', error)
    toast.error('Failed to export SVG')
  }
}

async function exportPNG() {
  try {
    const result = await exportPngResource.submit({
      diagram_name: props.diagram.name
    })
    
    toast.info('PNG export is being processed. It will be available in your downloads shortly.')
    emit('close')
  } catch (error) {
    console.error('Error exporting PNG:', error)
    toast.error('Failed to export PNG')
  }
}

async function exportPDF() {
  try {
    const result = await exportPdfResource.submit({
      diagram_name: props.diagram.name
    })
    
    toast.info('PDF export is being processed. It will be available in your downloads shortly.')
    emit('close')
  } catch (error) {
    console.error('Error exporting PDF:', error)
    toast.error('Failed to export PDF')
  }
}

async function exportMMD() {
  try {
    const result = await exportMmdResource.submit({
      diagram_name: props.diagram.name
    })
    
    if (result.file_url) {
      window.open(`/api/method/frappe.utils.file_manager.download_file?file_url=${result.file_url}`, '_blank')
      toast.success('MMD file exported successfully')
      emit('close')
    } else {
      toast.error('Failed to export MMD file')
    }
  } catch (error) {
    console.error('Error exporting MMD:', error)
    toast.error('Failed to export MMD file')
  }
}

async function exportJSON() {
  try {
    const result = await exportJsonResource.submit({
      diagram_name: props.diagram.name
    })
    
    if (result.file_url) {
      window.open(`/api/method/frappe.utils.file_manager.download_file?file_url=${result.file_url}`, '_blank')
      toast.success('JSON file exported successfully')
      emit('close')
    } else {
      toast.error('Failed to export JSON file')
    }
  } catch (error) {
    console.error('Error exporting JSON:', error)
    toast.error('Failed to export JSON file')
  }
}

function copyCode() {
  try {
    navigator.clipboard.writeText(props.diagramCode).then(() => {
      toast.success('Code copied to clipboard')
      emit('close')
    })
  } catch (error) {
    console.error('Error copying code:', error)
    toast.error('Failed to copy code')
  }
}
</script>

<style scoped>
.export-modal-backdrop {
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

.export-modal {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.export-modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.export-modal-header h3 {
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

.export-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.export-option:hover {
  background: var(--gray-100);
  border-color: var(--blue-300);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.export-option:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.export-option-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--blue-100);
  color: var(--blue-600);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.export-option-content {
  flex: 1;
}

.export-option-content h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--gray-800);
}

.export-option-content p {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin: 0;
}

.export-option-action {
  color: var(--gray-400);
  transition: color 0.2s;
}

.export-option:hover .export-option-action {
  color: var(--blue-500);
}
</style> 