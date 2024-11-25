<template>
  <div class="editor-wrapper">
    <div class="toolbar">
      <!-- Theme Toggle Button -->
      <button
        class="theme-button"
        :class="{ 'dark-theme': isDarkTheme, 'light-theme': !isDarkTheme }"
        @click="toggleTheme"
      >
        <v-icon left class="theme-icon">{{ isDarkTheme ? 'mdi-sun' : 'mdi-moon' }}</v-icon>
        {{ isDarkTheme ? 'Light' : 'Dark' }} <!-- Button label toggles between 'Light' and 'Dark' -->
      </button>
      
      <div class="font-buttons">
        <button class="font-button" @click="increaseFontSize">+</button>
        <button class="font-button" @click="decreaseFontSize">-</button>
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

.theme-button {
  padding: 10px 1px; 
  border: none;
  border-radius: 12px; /* Rounded corners */
  background: linear-gradient(90deg, #e7583e, #f0692a); /* Gradient background */
  color: white; /* Text color */
  font-size: 18px; /* Slightly larger font for clarity */
  font-weight: 700; /* Bold text */
  cursor: pointer;
  transition: all 0.3s ease; /* Smooth transition for interactions */
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2); /* Increased shadow for depth */
  padding-right: 30px;
  padding-left: 1px;
}

.theme-button.dark-theme {
  background: linear-gradient(90deg, #303030, #616161); /* Darker background for dark theme */
  color: #ffffff;
}

.theme-button.light-theme {
  background: linear-gradient(90deg, #ffca6f, #ff914d); /* Lighter background for light theme */
}

.theme-button:hover {
  background: linear-gradient(90deg, #f36828, #e64f34); /* Darker gradient on hover */
  transform: translateY(-4px); /* Slight lift effect */
}

.theme-button:active {
  background: linear-gradient(90deg, #f06423, #003d4d); /* Even darker gradient on click */
  transform: translateY(0); /* Reset lift effect */
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
