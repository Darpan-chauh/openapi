<template>
  <div class="editor-wrapper">
    <div class="toolbar">
      <!-- Theme Toggle Button -->
      <v-btn 
    :color="isDarkTheme ? 'grey-darken-4' : 'amber-darken-2'" 
    variant="flat" 
    class="theme-toggle-btn"
    @click="toggleTheme"
  >
    <v-icon class="me-2">{{ isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    {{ isDarkTheme ? 'Light' : 'Dark' }}
  </v-btn>
  <div class="font-buttons">
    <v-btn @click="increaseFontSize" color="orange" icon>
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-btn @click="decreaseFontSize" color="orange" icon>
      <v-icon>mdi-minus</v-icon>
    </v-btn>
  </div>
    </div>
    
    <!-- Monaco Editor Container -->
    <div class="editor-container" ref="editorContainer"></div>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineEmits, defineProps } from 'vue';

const editorContainer = ref(null);
let editorInstance = null;
let monaco = null;
const emit = defineEmits();
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

watch(() => props.modelValue, (newValue) => {
  if (editorInstance && newValue !== editorInstance.getValue()) {
    editorInstance.setValue(newValue);
  }
});

const isDarkTheme = ref(false);
const fontSize = ref(14);

onMounted(async () => {
  if (typeof window !== 'undefined') {
    monaco = await import('monaco-editor/esm/vs/editor/editor.api');

    // Register custom themes
    monaco.editor.defineTheme('myCustomThemeLight', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
      },
    });

    monaco.editor.defineTheme('myCustomThemeDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#FFFFFF',
      },
    });

    // Set initial theme
    monaco.editor.setTheme(getCurrentTheme());

    editorInstance = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: 'yaml',
      theme: getCurrentTheme(),
      wordWrap: 'on',
      fontSize: fontSize.value,
    });

    editorInstance.onDidChangeModelContent(() => {
      const newValue = editorInstance.getValue();
      emit('update:modelValue', newValue);
    });
  }
});

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
  }
});

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  monaco.editor.setTheme(getCurrentTheme());
};

const increaseFontSize = () => {
  fontSize.value += 1;
  editorInstance.updateOptions({ fontSize: fontSize.value });
};

const decreaseFontSize = () => {
  fontSize.value = Math.max(10, fontSize.value - 1);
  editorInstance.updateOptions({ fontSize: fontSize.value });
};

function getCurrentTheme() {
  return isDarkTheme.value ? 'myCustomThemeDark' : 'myCustomThemeLight';
}
</script>

<style scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5; /* Light background for the editor wrapper */
}

.toolbar {
  display: flex;
  justify-content: space-between; /* Space between buttons */
  align-items: center; /* Center vertically */
  padding: 5px;
  background: linear-gradient(90deg, #f09974, #e4a085); /* Gradient for the toolbar */
  border-bottom: 2px solid #d0d0d0;
}

.font-buttons {
  display: flex;
  gap: 10px;
}





.font-button {
  padding: 12px 16px; /* Spacious buttons */
  border: none;
  border-radius: 50%; /* Circular buttons */
  background: linear-gradient(90deg, #e9b457, #f5a623); /* Gradient background */
  color: white; /* Text color */
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); /* Subtle shadow */
  margin-right: 8px; /* Space between buttons */
}

.font-button:hover {
  background: linear-gradient(90deg, #ffbb4c, #f57d2e); /* Hover effect */
  transform: scale(1.1); /* Slightly enlarge on hover */
}

.font-button:active {
  background: linear-gradient(90deg, #ff9933, #d9742d); /* Active state darker gradient */
  transform: scale(1); /* Reset scale */
}

.editor-container {
  height: 800px; /* Set desired height */
  width: 100%;
  border: 1px solid #ddd; /* Border around editor */
  border-radius: 8px; /* Rounded corners for the editor */
  overflow: hidden; /* Prevent overflow */
  background-color: #ffffff; /* White background for the editor */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}
</style>
