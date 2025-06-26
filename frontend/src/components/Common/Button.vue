<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      { 'btn-loading': loading, 'btn-icon': variant === 'icon' }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <div v-if="loading" class="btn-spinner"></div>
    <slot></slot>
  </button>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'ghost', 'icon'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  line-height: 1.5;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-primary {
  background: linear-gradient(135deg, var(--blue-500), var(--blue-600));
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--blue-600), var(--blue-700));
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: var(--gray-400);
}

.btn-danger {
  background: linear-gradient(135deg, var(--red-500), var(--red-600));
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--red-600), var(--red-700));
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.4);
}

.btn-ghost {
  background: transparent;
  color: var(--gray-600);
  border: 1px solid var(--gray-200);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--gray-50);
  color: var(--gray-800);
  border-color: var(--gray-300);
}

.btn-icon {
  padding: 0.5rem;
  min-width: 2rem;
  min-height: 2rem;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--gray-500);
}

.btn-icon:hover:not(:disabled) {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-loading {
  color: transparent !important;
}

.btn-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

.btn-ghost .btn-spinner,
.btn-secondary .btn-spinner,
.btn-icon .btn-spinner {
  border: 2px solid rgba(100, 116, 139, 0.3);
  border-top-color: var(--gray-500);
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
</style> 