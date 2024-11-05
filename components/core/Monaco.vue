<template>
  <div class="editor-wrapper">
    <div class="toolbar">
      <button class="theme-button" @click="toggleTheme">Theme</button>
      <div class="font-buttons">
        <button class="font-button" @click="increaseFontSize">+</button>
        <button class="font-button" @click="decreaseFontSize">-</button>
      </div>
    </div>
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
  padding: 10px;
  background: linear-gradient(90deg, #f09974, #e4a085); /* Gradient for the toolbar */
  border-bottom: 2px solid #d0d0d0;
}

.font-buttons {
  display: flex;
}

.theme-button, .font-button {
  margin-right: 10px;
  padding: 6px 10px; /* Adjusted padding for buttons */
  border: none;
  border-radius: 4px; /* Rounded corners */
  background: linear-gradient(90deg, #e7583e, #f0692a); /* Gradient background */
  color: white; /* Text color */
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* Increased shadow for depth */
}

.theme-button:hover, .font-button:hover {
  background: linear-gradient(90deg, #f36828, #e64f34); /* Darker gradient on hover */
  transform: translateY(-2px); /* Slight lift effect */
}

.theme-button:active, .font-button:active {
  background: linear-gradient(90deg, #f06423, #003d4d); /* Even darker gradient on click */
  transform: translateY(0); /* Reset lift effect */
}

.editor-container {
  height: 800px; /* Set desired height */
  width: 100%;
  border: 1px solid #ddd; /* Border around editor */
  border-radius: 4px; /* Rounded corners for the editor */
  overflow: hidden; /* Prevent overflow */
  background-color: #ffffff; /* White background for the editor */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}
</style>
