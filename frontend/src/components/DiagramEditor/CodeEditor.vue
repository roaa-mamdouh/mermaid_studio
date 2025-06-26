<template>
  <div class="code-editor-container">
    <textarea
      ref="editorTextarea"
      class="code-editor"
      :value="modelValue"
      :readonly="readonly"
      spellcheck="false"
      @input="onInput"
      @keydown="onKeyDown"
      @scroll="onScroll"
      @click="updateCursorInfo"
      @keyup="updateCursorInfo"
      :placeholder="placeholder"
    ></textarea>
    <div class="syntax-highlighter" ref="highlighter" aria-hidden="true">
      <div v-html="highlightedCode"></div>
    </div>
    <div v-if="readonly" class="readonly-overlay">
      <div class="readonly-message">
        <i class="fa fa-lock mr-2"></i> Read-only mode
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Start typing your Mermaid diagram code here...\n\nExample:\ngraph TD\n    A[Start] --> B{Is it?}\n    B -->|Yes| C[OK]\n    B -->|No| D[End]'
  }
})

const emit = defineEmits(['update:modelValue', 'update:stats', 'cursor-position'])

const editorTextarea = ref(null)
const highlighter = ref(null)
const lineCount = ref(1)
const charCount = ref(0)
const cursorPosition = ref({ line: 1, column: 1, index: 0 })

// Keywords for syntax highlighting
const keywords = [
  'graph', 'flowchart', 'subgraph', 'end', 'sequenceDiagram', 'participant',
  'actor', 'note', 'loop', 'alt', 'else', 'opt', 'par', 'and', 'rect',
  'classDiagram', 'class', 'stateDiagram', 'state', 'gantt', 'section',
  'pie', 'journey', 'title', 'accTitle', 'accDescr'
]

// Highlight code with simple regex-based approach
const highlightedCode = computed(() => {
  if (!props.modelValue) return ''
  
  let code = props.modelValue
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  
  // Highlight keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g')
    code = code.replace(regex, `<span class="keyword">${keyword}</span>`)
  })
  
  // Highlight arrows
  code = code.replace(/-->/g, '<span class="arrow">--></span>')
  code = code.replace(/==>/g, '<span class="arrow">==></span>')
  code = code.replace(/-.->/g, '<span class="arrow">-..-></span>')
  code = code.replace(/--x/g, '<span class="arrow">--x</span>')
  code = code.replace(/-->>/g, '<span class="arrow">-->></span>')
  
  // Highlight strings
  code = code.replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
  
  // Highlight brackets and parentheses
  code = code.replace(/(\[|\]|\(|\)|\{|\})/g, '<span class="bracket">$1</span>')
  
  // Highlight comments
  code = code.replace(/%%(.*)$/gm, '<span class="comment">%%$1</span>')
  
  // Add line breaks
  code = code.replace(/\n/g, '<br>')
  
  // Add a trailing break to ensure proper scrolling
  code += '<br>'
  
  return code
})

// Handle input
function onInput(e) {
  const newValue = e.target.value
  emit('update:modelValue', newValue)
  updateStats(newValue)
}

// Handle keyboard shortcuts
function onKeyDown(e) {
  // Tab key
  if (e.key === 'Tab') {
    e.preventDefault()
    
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    
    // Insert tab at cursor position
    const newValue = props.modelValue.substring(0, start) + '    ' + props.modelValue.substring(end)
    emit('update:modelValue', newValue)
    
    // Move cursor after the inserted tab
    nextTick(() => {
      e.target.selectionStart = e.target.selectionEnd = start + 4
    })
  }
  
  // Auto-closing brackets and quotes
  const pairs = {
    '{': '}',
    '[': ']',
    '(': ')',
    '"': '"',
    "'": "'"
  }
  
  if (e.key in pairs && !props.readonly) {
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    
    // If text is selected, wrap it with the pair
    if (start !== end) {
      e.preventDefault()
      const selectedText = props.modelValue.substring(start, end)
      const newValue = props.modelValue.substring(0, start) + e.key + selectedText + pairs[e.key] + props.modelValue.substring(end)
      emit('update:modelValue', newValue)
      
      // Move cursor after the closing character
      nextTick(() => {
        e.target.selectionStart = e.target.selectionEnd = end + 2
      })
    }
  }
}

// Sync scroll between textarea and highlighter
function onScroll(e) {
  if (highlighter.value) {
    highlighter.value.scrollTop = e.target.scrollTop
    highlighter.value.scrollLeft = e.target.scrollLeft
  }
}

// Update stats
function updateStats(text = props.modelValue) {
  const lines = text ? text.split('\n').length : 1
  const chars = text ? text.length : 0
  
  lineCount.value = lines
  charCount.value = chars
  
  emit('update:stats', { lines, chars })
}

// Update cursor position
function updateCursorInfo() {
  if (!editorTextarea.value) return
  
  const textarea = editorTextarea.value
  const cursorIndex = textarea.selectionStart
  const textBeforeCursor = props.modelValue.substring(0, cursorIndex)
  const lines = textBeforeCursor.split('\n')
  const currentLine = lines.length
  const currentColumn = lines[lines.length - 1].length + 1
  
  cursorPosition.value = {
    line: currentLine,
    column: currentColumn,
    index: cursorIndex
  }
  
  emit('cursor-position', cursorPosition.value)
}

// Watch for external changes to model value
watch(() => props.modelValue, (newValue) => {
  updateStats(newValue)
})

// Initialize
onMounted(() => {
  updateStats()
  
  // Focus the editor if not readonly
  if (!props.readonly && editorTextarea.value) {
    editorTextarea.value.focus()
  }
})
</script>

<style scoped>
.code-editor-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.code-editor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  font-family: 'Fira Code', 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--gray-100);
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  z-index: 2;
  caret-color: var(--blue-400);
  tab-size: 4;
}

.syntax-highlighter {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  font-family: 'Fira Code', 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  background: var(--gray-900);
  color: var(--gray-100);
  overflow: auto;
  white-space: pre;
  z-index: 1;
  pointer-events: none;
  tab-size: 4;
}

.code-editor::placeholder {
  color: var(--gray-500);
  opacity: 0.6;
}

.readonly-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  pointer-events: none;
}

.readonly-message {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Syntax highlighting */
:deep(.keyword) {
  color: var(--purple-400);
  font-weight: 600;
}

:deep(.string) {
  color: var(--green-400);
}

:deep(.arrow) {
  color: var(--blue-400);
  font-weight: 600;
}

:deep(.bracket) {
  color: var(--amber-400);
}

:deep(.comment) {
  color: var(--gray-500);
  font-style: italic;
}
</style> 