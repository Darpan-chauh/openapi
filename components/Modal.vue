<template>
  <div>
    <!-- Button to open the preview -->
    <button @click="openPreview">Preview API Documentation</button>

    <!-- Modal for the ReDoc preview -->
    <div v-if="showPreview" class="modal">
      <div class="modal-content">
        <button @click="closePreview">Close</button>
        <div id="redoc-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const showPreview = ref(false);

const openPreview = () => {
  showPreview.value = true;
  loadReDoc(); // Load the ReDoc content
};

const closePreview = () => {
  showPreview.value = false;
};

const loadReDoc = async () => {
  try {
    // Fetch the OpenAPI YAML file
    const response = await axios.get('/path/to/your/openapi.yaml');
    
    // Ensure ReDoc is loaded via CDN or npm package
    if (window.Redoc) {
      Redoc.init(response.data, {}, document.getElementById('redoc-container'));
    } else {
      console.error('ReDoc is not loaded');
    }
  } catch (error) {
    console.error('Error loading OpenAPI spec:', error);
  }
};
</script>

<style scoped>
/* Modal styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal content styling */
.modal-content {
  background: white;
  padding: 20px;
  max-height: 80vh;
  max-width: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 10px;
}

button:hover {
  background-color: #0056b3;
}

/* Close button styling inside the modal */
button:hover {
  background-color: #ff4c4c;
  color: #fff;
}
</style>
