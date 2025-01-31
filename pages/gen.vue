<template>
  <div class="container">
    <!-- Form Section -->
    <div class="form-container">
      <h2>Generate OpenAPI YAML</h2>
      <form @submit.prevent="generateYaml" class="form">
        <input
          v-model="connectorId"
          type="text"
          placeholder="Enter Connector ID"
          required
          class="input-field"
        />
        <v-btn
          @click="generateYaml"
          class="submit-btn"
          color="#FF5733"
          elevation="2"
          large
          :loading="isLoading"
        >
          <v-icon left>mdi-file-document</v-icon>
          Generate YAML
        </v-btn>
      </form>
    </div>

    <!-- YAML Editor Section -->
    <div v-if="yamlOutput || errorMessage" class="yaml-editor">
      <div class="yaml-header">
        <h3 v-if="yamlOutput">Generated OpenAPI YAML:</h3>
        <h3 v-if="errorMessage" class="error-text">Error:</h3>

        <!-- Buttons Container -->
        <div class="buttons-container">
          <!-- Download Button with Tooltip -->
          <v-btn
            v-if="yamlOutput"
            @click="downloadYaml"
            icon
            class="icon-btn"
            small
            v-tooltip.bottom="'Download'"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>

          <!-- Copy Button with Tooltip -->
          <v-btn
            v-if="yamlOutput"
            @click="copyToClipboard"
            icon
            class="icon-btn"
            small
            v-tooltip.bottom="'Copy YAML'"
          >
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Monaco Editor -->
      <Monaco
        v-model="rawYAML"
        language="yaml"
        class="monaco-editor"
        :options="{ automaticLayout: true }" 
      />

      <!-- Success Message -->
      <p v-if="copiedMessage" class="copy-message">{{ copiedMessage }}</p>

      <!-- Error Message -->
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Monaco from '@/components/core/Monaco';

// States
const connectorId = ref('');
const yamlOutput = ref(null);
const errorMessage = ref('');
const rawYAML = ref(''); // Initialize rawYAML for the Monaco Editor
const isLoading = ref(false);
const copiedMessage = ref(''); // State to show the copy message

// Function to generate YAML
const generateYaml = async () => {
  yamlOutput.value = null;
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const response = await axios.get(`/api/generate-yaml?connector_id=${connectorId.value}`);
    yamlOutput.value = response.data;
    rawYAML.value = response.data; // Update rawYAML for Monaco
  } catch (error) {
    console.error('Error generating YAML:', error);
    errorMessage.value = 'Failed to generate YAML. Please check your Connector ID and try again.';
  } finally {
    isLoading.value = false;
  }
};

// Function to download YAML
const downloadYaml = () => {
  const blob = new Blob([yamlOutput.value], { type: 'application/x-yaml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'openapi-spec.yaml';
  link.click();
};

// Function to copy YAML to clipboard
const copyToClipboard = () => {
  if (yamlOutput.value) {
    // Use the Clipboard API to copy the content
    navigator.clipboard.writeText(yamlOutput.value).then(() => {
      copiedMessage.value = 'Copied to clipboard!';
      // Hide the message after 3 seconds
      setTimeout(() => {
        copiedMessage.value = '';
      }, 3000);
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  }
};

// Watch yamlOutput to sync with rawYAML
watch(yamlOutput, (newValue) => {
  rawYAML.value = newValue || ''; // Sync the content of Monaco with yamlOutput
});
</script>

<style scoped>
/* General Container Styling */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(145deg, #ffffff, #ffffff);
  font-family: "Arial", sans-serif;
  color: #333;
}

/* Form Container */
.form-container {
  background: linear-gradient(145deg, #fac07e, #ffa4c6);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  text-align: center;
  transition: all 0.3s ease;
}

/* Form Heading */
h2 {
  font-size: 24px;
  margin-bottom: 1.5rem;
  color: #333;
}

/* Input Field Styling */
.input-field {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #4e8ef7;
  box-shadow: 0 0 5px rgba(78, 142, 247, 0.5);
}

/* Submit Button Styling */
.submit-btn {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
}

/* YAML Editor Styling */
.yaml-editor {
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  width: 100%;
  max-width: 900px;
  font-family: "Courier New", Courier, monospace;
  color: #333;
}

/* YAML Header Styling */
.yaml-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

/* Buttons Container */
.buttons-container {
  display: flex;
  gap: 10px; /* Adds space between buttons */
  align-items: center;
}

/* Error Text Styling */
.error-text {
  color: red;
}

/* Copy Button Styling */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4e8ef7;
  font-size: 18px;
  transition: color 0.3s ease;
}

.icon-btn:hover {
  color: #3c7bbf;
}

/* Copy Success Message Styling */
.copy-message {
  color: #f84545; /* Green color for success */
  font-weight: bold;
  font-size: 18px; /* Slightly larger text */
  text-align: center;
  margin-top: 1rem;
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgb(80, 77, 77);
  padding: 10px 20px;
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Soft shadow */
  opacity: 0;
  animation: fadeInOut 3s forwards; /* Fade-in and fade-out animation */
}

/* Keyframes for Fade-in and Fade-out Effect */
@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}


/* Download Button Styling */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fc5d5d;
  font-size: 18px;
  transition: color 0.3s ease;
}

.icon-btn:hover {
  color: #f44d4d;
}

.monaco-editor {
  max-width: 1100px;
  width: 100%;
  height: 850px; /* Adjust the height as needed */
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden; /* Ensures content stays inside */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto; /* Centers the editor horizontally */
}
</style>
