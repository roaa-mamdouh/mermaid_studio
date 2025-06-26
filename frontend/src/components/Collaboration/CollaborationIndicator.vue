<template>
  <div class="collaboration-indicator" v-if="activeUsers.length > 1">
    <div class="active-users">
      <div 
        v-for="(user, index) in displayUsers" 
        :key="user.user"
        class="user-avatar"
        :style="{ backgroundColor: getUserColor(user.user), zIndex: activeUsers.length - index }"
        :title="user.full_name"
      >
        {{ getUserInitials(user.full_name) }}
      </div>
      
      <div v-if="moreUsersCount > 0" class="more-users" :title="moreUsersTooltip">
        +{{ moreUsersCount }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  activeUsers: {
    type: Array,
    default: () => []
  },
  cursorPositions: {
    type: Object,
    default: () => ({})
  }
})

// Display only the first 3 users
const MAX_DISPLAY_USERS = 3

// Computed properties
const displayUsers = computed(() => {
  // Filter out current user
  const otherUsers = props.activeUsers.filter(user => user.user !== frappe.session.user)
  return otherUsers.slice(0, MAX_DISPLAY_USERS)
})

const moreUsersCount = computed(() => {
  // Filter out current user
  const otherUsers = props.activeUsers.filter(user => user.user !== frappe.session.user)
  return Math.max(0, otherUsers.length - MAX_DISPLAY_USERS)
})

const moreUsersTooltip = computed(() => {
  // Filter out current user and already displayed users
  const otherUsers = props.activeUsers.filter(user => user.user !== frappe.session.user)
  const hiddenUsers = otherUsers.slice(MAX_DISPLAY_USERS)
  
  return hiddenUsers.map(user => user.full_name).join(', ')
})

// Methods
function getUserInitials(fullName) {
  if (!fullName) return '?'
  
  const names = fullName.split(' ')
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
}

function getUserColor(userId) {
  // Generate a consistent color based on the user ID
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#6366f1', // indigo
    '#84cc16'  // lime
  ]
  
  // Simple hash function to get a consistent index
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  
  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
</script>

<style scoped>
.collaboration-indicator {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 50;
}

.active-users {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: var(--blue-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: -0.5rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-avatar:first-child {
  margin-left: 0;
}

.more-users {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: var(--gray-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: -0.5rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 