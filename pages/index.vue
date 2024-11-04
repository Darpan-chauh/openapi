<template>
  <v-app>
    <v-container fluid>
      <h1 class="text-center mb-4" style="color: #1976d2;">OpenAPI YAML File Uploader</h1>
      <v-file-input label="Upload OpenAPI YAML File" accept=".yaml,.yml" @change="onFileChange" outlined class="mb-4"
        style="background-color: #f5f5f5; border-radius: 8px;" />

      <v-card v-if="parsedContent" class="mt-5" elevation="10" style="border-radius: 15px;">
        <v-card-text>
          <v-tabs v-model="activeSection" background-color="white" color="primary" class="rounded-0" dark>
            <v-tab value="ApiInfo" class="rounded">API Info</v-tab>
            <v-tab value="servers" class="rounded">Servers</v-tab>
            <v-tab value="paths" class="rounded">Paths</v-tab>
            <v-tab value="contacts" class="rounded">Contacts</v-tab>
            <v-tab value="tagGroups" class="rounded">Tag Groups</v-tab>
            <v-tab value="webhooks" class="rounded">Webhooks</v-tab>
            <v-tab value="code" class="rounded">Code</v-tab>
            <v-tab value="overview" class="rounded">Overview</v-tab>


          </v-tabs>

          <!-- Editable section for API Information -->
          <div v-if="activeSection === 'ApiInfo'">
            <v-card class="api-info-card" elevation="2">
              <v-card-text>
                <h3 style="color: #1976d2; text-align: center; font-weight: bold;">
                  <v-text-field v-model="apiInfo.title" label="API Title" outlined hide-details prepend-icon="mdi-api"
                    class="api-title"></v-text-field>
                </h3>

                <div class="api-info-row">
                  <strong>Version:</strong>
                  <v-text-field v-model="apiInfo.version" label="Version" outlined hide-details
                    prepend-icon="mdi-information-outline" class="api-version"></v-text-field>
                </div>

                <div class="api-info-row">
                  <strong>Description:</strong>
                  <v-textarea v-model="apiInfo.description" label="Description" outlined hide-details rows="20"
                    class="api-description" prepend-icon="mdi-comment-text-outline"></v-textarea>
                </div>
              </v-card-text>
            </v-card>
          </div>


          <div v-if="activeSection === 'servers'">
  <h2 class="text-h5" style="color: #1976d2;">Servers</h2>

  <v-btn @click="showingAddServer = true" color="primary" class="mb-2">
    Add Server
  </v-btn>

  <!-- Dialog for Adding/Editing Server -->
  <v-dialog v-model="showingAddServer" max-width="600px" transition="dialog-bottom-transition">
    <v-card>
      <v-card-title class="headline" style="color: #1976d2; font-weight: bold; font-size: 1.5rem;">
        <v-icon left>{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
        {{ isEditing ? 'Edit Server' : 'Add Server' }}
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="serverForm.url"
          label="Server URL"
          outlined
          dense
          placeholder="Enter server URL"
          prepend-icon="mdi-link"
          clearable
          class="mb-3"
        />
        <v-text-field
          v-model="serverForm.description"
          label="Description"
          outlined
          dense
          placeholder="Enter description"
          prepend-icon="mdi-comment"
          clearable
        />
      </v-card-text>
      <v-card-actions>
        <!-- Update Server Button with Delete Button Styles -->
        <v-btn
          @click="isEditing ? updateServer() : addServer()"
          color="red"  
          elevation="2"
          style="border-radius: 25px; background-color: #FFCDD2; color: #D32F2F; border: 1px solid #FFCDD2;"
        >
          <v-icon left>{{ isEditing ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Update Server' : 'Save Server' }}
        </v-btn>
        <v-btn @click="showingAddServer = false" color="secondary" outlined style="border-radius: 25px;">
          <v-icon left>mdi-cancel</v-icon>
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-data-table :headers="serverHeaders" :items="servers" hide-default-footer class="elevation-1 mb-4" dense>
    <template v-slot:item.actions="{ item, index }">
      <!-- Updated Edit Button -->
      <button
        type="button"
        aria-label="Edit Server"
        @click="editServer(index)"
        class="v-btn v-btn--icon v-btn--outlined v-btn--tile"
        style="background-color: #BBDEFB; border-radius: 25px; color: #1976D2; border: 1px solid #BBDEFB;"
      >
        <v-icon size="24">mdi-pencil</v-icon>
      </button>

      <!-- Updated Delete Button -->
      <button
        type="button"
        aria-label="Delete Server"
        @click="removeServer(index)"
        class="v-btn v-btn--icon v-btn--outlined v-btn--tile"
        style="background-color: #FFCDD2; border-radius: 25px; color: #D32F2F; border: 1px solid #FFCDD2;"
      >
        <v-icon size="24">mdi-delete</v-icon>
      </button>
    </template>
  </v-data-table>
</div>




          <!-- Content for Paths -->
          <div v-if="activeSection === 'paths'" class="path-section">
            <h2 class="text-h5" style="color: #1976d2; margin-bottom: 20px;">Paths</h2>

            <div v-for="(path, index) in apiPaths" :key="index"
              class="path-item mb-4 border rounded-lg p-4 shadow-lg bg-white">

              <div @click="togglePathDetails(index)" class="path-heading" style="cursor: pointer;">
                <strong>{{ path.name }}</strong>
                <v-icon>{{ activePathIndex === index ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </div>

              <!-- Show details when the path is clicked -->
              <div v-if="activePathIndex === index" class="path-details mt-3">
                <strong>Methods:</strong>
                <div v-for="(method, mIndex) in path.methods" :key="mIndex" class="method-item mb-2">
                  <v-text-field v-model="method.method" label="HTTP Method" outlined :rules="[validateMethod]" />
                  <v-textarea v-model="method.description" label="Description" outlined class="mt-2" />
                </div>



                <!-- Query Parameters Section -->
                <div class="mt-3">
                  <strong>Query p:</strong>
                  <div v-for="(param, paramIndex) in path.methods[0].query" :key="paramIndex" class="query-param mb-2">
                    <v-row lang="center" no-gutters>
                      <v-col cols="4">
                        <v-text-field v-model="param.name" label="Parameter Name" outlined
                          :rules="[v => !!v || 'Required']" />
                      </v-col>
                      <v-col cols="3">
                        <v-select v-model="param.type" :items="queryParamTypes" label="Type" outlined />
                      </v-col>
                      <v-col cols="4">
                        <v-textarea v-model="param.description" label="Description" outlined rows="1" />
                      </v-col>
                      <v-col cols="1" class="d-flex align-center">
                        <v-btn @click="removeQueryParam(index, paramIndex)" icon>
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Button to show form for adding query parameter -->
                  <v-btn @click="toggleAddQueryParamForm(index)" color="primary" small>
                    {{ showAddQueryParamForm[index] ? 'Cancel' : 'Add Query ' }}
                  </v-btn>

                  <!-- Form to add new query parameter -->
                  <v-expand-transition>
                    <div v-if="showAddQueryParamForm[index]" class="mt-2">
                      <v-row align="center" no-gutters>
                        <v-col cols="4">
                          <v-text-field v-model="newQueryParam.name" label="Parameter Name" outlined />
                        </v-col>
                        <v-col cols="3">
                          <v-select v-model="newQueryParam.type" :items="queryParamTypes" label="Type" outlined />
                        </v-col>
                        <v-col cols="4">
                          <v-textarea v-model="newQueryParam.description" label="Description" outlined rows="1" />
                        </v-col>
                        <v-col cols="1" class="d-flex align-center">
                          <v-btn @click="addQueryParam(index)" color="success" small>
                            Save
                          </v-btn>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expand-transition>
                </div>

                <!-- Headers Section -->
                <div class="mt-3">
                  <strong>Headers:</strong>
                  <div v-for="(header, headerIndex) in path.methods[0].headers" :key="headerIndex"
                    class="header-item mb-2">
                    <v-text-field v-model="header.name" label="Header Name" outlined
                      :rules="[v => !!v || 'Required']" />
                    <v-select v-model="header.type" :items="headerTypes" label="Type" outlined />
                    <v-textarea v-model="header.description" label="Description" outlined />
                    <v-btn @click="removeHeader(index, headerIndex)" icon>
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </div>

                  <!-- Button to show form for adding header -->
                  <v-btn @click="toggleAddHeaderForm(index)" color="primary" small>
                    {{ showAddHeaderForm[index] ? 'Cancel' : 'Add Header' }}
                  </v-btn>

                  <!-- Form to add new header -->
                  <v-expand-transition>
                    <div v-if="showAddHeaderForm[index]" class="mt-2">
                      <v-text-field v-model="newHeader.name" label="Header Name" outlined />
                      <v-select v-model="newHeader.type" :items="headerTypes" label="Type" outlined />
                      <v-textarea v-model="newHeader.description" label="Description" outlined />
                      <v-btn @click="addHeader(index)" color="success" small>Save Header</v-btn>
                    </div>
                  </v-expand-transition>
                </div>

                <!-- Body Section -->
                <div class="mt-3">
                  <strong>Body:</strong>
                  <v-textarea v-model="path.methods[0].body" label="Body" outlined />
                </div>

                <!-- Delete Path Button -->
                <v-btn @click.stop="removePath(index)" icon color="red" class="mt-2">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Add Path Form -->
            <v-btn @click="toggleAddPath" color="primary" class="mb-2">
              {{ showingAddPath ? 'Cancel' : 'Add Path' }}
            </v-btn>

            <transition name="fade">
              <div v-if="showingAddPath" class="add-path-form border rounded-lg p-4 bg-white shadow-lg">
                <v-text-field v-model="newPath.name" label="Path Name" outlined :rules="[v => !!v || 'Required']" />
                <v-text-field v-model="newPath.method" label="HTTP Method" outlined :rules="[validateMethod]" />
                <v-textarea v-model="newPath.description" label="Description" outlined />

                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title><strong>Query Parameters:</strong></v-list-item-title>
                      <v-text-field v-model="newPath.query" label="Query Parameters (comma separated)" outlined />
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title><strong>Headers:</strong></v-list-item-title>
                      <v-textarea v-model="newPath.headers" label="Headers (JSON format)" outlined />
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title><strong>Body:</strong></v-list-item-title>
                      <v-textarea v-model="newPath.body" label="Body (JSON format)" outlined />
                    </v-list-item-content>
                  </v-list-item>
                </v-list>

                <v-btn @click="addPath" color="success" class="mt-2">Save Path</v-btn>
              </div>
            </transition>
          </div>







          <!-- Content for Contacts -->
          <div v-if="activeSection === 'contacts'">
            <h2 class="text-h5" style="color: #1976d2;">Contacts</h2>
            <v-card elevation="2" class="mb-3" style="border-radius: 10px;">
              <v-card-text>
                <v-row>
                  <v-col v-for="(field, index) in contactFields" :key="index" cols="4">
                    <v-text-field v-model="apiInfo.contact[field.name]" :label="field.label" outlined dense
                      @input="updateYAML" style="border-radius: 5px;" />
                  </v-col>
                </v-row>
                <div v-if="apiInfo.license.name">
                  <strong>License:</strong>
                  <v-text-field v-model="apiInfo.license.name" label="License Name" outlined dense @input="updateYAML"
                    style="border-radius: 5px;" />
                </div>
              </v-card-text>
            </v-card>
          </div>



          <!-- Content for Tag Groups -->
          <div v-if="activeSection === 'tagGroups'">
            <h2 class="text-h5" style="color: #1976d2;">Tag Groups</h2>
            <v-btn @click="toggleAddTagGroup" color="primary" class="mb-2">
              {{ showingAddTagGroup ? 'Cancel' : 'Add Tag Group' }}
            </v-btn>
            <div v-if="showingAddTagGroup" class="mb-3">
              <v-text-field v-model="newTagGroup.name" label="Tag Group Name" outlined />
              <v-text-field v-model="newTagGroup.tags" label="Tags (comma separated)" outlined class="mt-2" />
              <v-btn @click="addTagGroup" color="success" class="mt-2">Save Tag Group</v-btn>
            </div>
            <v-data-table :headers="tagGroupHeaders" :items="tagGroups" hide-default-footer class="elevation-1 mb-4"
              dense>
              <template v-slot:item.name="{ item }">
                <v-text-field v-model="item.name" outlined dense @input="updateYAML" />
              </template>
              <template v-slot:item.tags="{ item }">
                <v-text-field v-model="item.tags" outlined dense placeholder="comma separated" @input="updateYAML" />
              </template>
            </v-data-table>
          </div>

          <!-- Content for Webhooks -->
          <div v-if="activeSection === 'webhooks'">
            <h2 class="text-h5" style="color: #1976d2;">Webhooks</h2>
            <v-btn @click="toggleAddWebhook" color="primary" class="mb-2">
              {{ showingAddWebhook ? 'Cancel' : 'Add Webhook' }}
            </v-btn>
            <div v-if="showingAddWebhook" class="mb-3">
              <v-text-field v-model="newWebhook.name" label="Webhook Name" outlined />
              <v-text-field v-model="newWebhook.summary" label="Summary" outlined class="mt-2" />
              <v-btn @click="addWebhook" color="success" class="mt-2">Save Webhook</v-btn>
            </div>
            <v-data-table :headers="webhookHeaders" :items="webhooks" hide-default-footer class="elevation-1 mb-4"
              dense>
              <template v-slot:item.name="{ item }">
                <v-text-field v-model="item.name" outlined dense @input="updateYAML" />
              </template>
              <template v-slot:item.summary="{ item }">
                <v-text-field v-model="item.summary" outlined dense @input="updateYAML" />
              </template>
            </v-data-table>
          </div>

          <!-- Content for Code Section -->
          <div v-if="activeSection === 'code'" class="vs-code-editor-container mt-4">
            <!-- Copy to Clipboard Button -->
            <v-btn @click="copyToClipboard" color="primary" class="mt-2">
              <v-icon left>mdi-content-copy</v-icon>
              Copy YAML to Clipboard
            </v-btn>


            <Monaco v-model="rawYAML" :title="'code editor'" :idname="'yaml'" :key="'yaml'" language="yaml"
              height="40" />




          </div>

          <!-- Overview Tab -->
          <v-card v-if="activeSection === 'overview'" class="mt-5" elevation="10" style="border-radius: 18px;">
            <v-card-text>
              <h3 class="text-h5" style="color: #1976d2;">API Overview</h3>
              <p>This section provides an overview of the API, including key features, purpose, and any essential
                information
                needed to understand the scope of the API.</p>

              <!-- Basic Information -->
              <div>
                <strong>API Title:</strong> {{ apiInfo.title }}
              </div>
              <div>
                <strong>Version:</strong> {{ apiInfo.version }}
              </div>
              <div>
                <strong>Description:</strong>
                <v-textarea v-model="apiInfo.description" outlined readonly rows="5"></v-textarea>
              </div>
            </v-card-text>
          </v-card>

        </v-card-text>
      </v-card>
    </v-container>
  </v-app>

</template>






<script setup>

import { ref, watch } from 'vue';
import yaml from 'js-yaml';
import Monaco from '@/components/core/Monaco';



// Reactive variables
const parsedContent = ref('');
const activeSection = ref('code');
const showingAddServer = ref(false);
const servers = ref([]);
const newPath = ref({ name: '', method: '', description: '', query: '', headers: '', body: '' });
const rawYAML = ref('');
const apiInfo = ref({ title: '', version: '', description: '', contact: {}, license: {} });
const tagGroups = ref([]);
const newTagGroup = ref({ name: '', tags: '' });
const showingAddTagGroup = ref(false);
const webhooks = ref([]);
const newWebhook = ref({ name: '', summary: '' });
const showingAddWebhook = ref(false);
const apiPaths = ref([]);
const newQueryParam = ref({ name: '', type: 'string', description: '' });
const newHeader = ref({ name: '', type: 'string', description: '' });
const showAddQueryParamForm = ref([]);
const showAddHeaderForm = ref([]);
const queryParamTypes = ['array', 'integer', 'boolean', 'number', 'any']; // Example types
const headerTypes = ['string', 'number', 'array', 'integer', 'boolean', 'any']; // Example header types
const showingAddPath = ref(false);
const activePathIndex = ref(null);




// Watch for changes in rawYAML and update parsedContent
watch(rawYAML, (newVal) => {
  try {
    const parsedContent = yaml.load(newVal);
    console.log(parsedContent); // Handle parsed content
  } catch (e) {
    console.error('Error parsing YAML: ', e);
  }
});

const togglePathDetails = (index) => {
  // Toggle the active path index to show/hide details
  activePathIndex.value = activePathIndex.value === index ? null : index;
};


const toggleAddPath = () => {
  showingAddPath.value = !showingAddPath.value;
};

// Function to add a query parameter
const addQueryParam = (pathIndex) => {
  if (newQueryParam.value.name) {

    if (!apiPaths.value[pathIndex].methods[0].query) {
      apiPaths.value[pathIndex].methods[0].query = [];
    }
    apiPaths.value[pathIndex].methods[0].query.push({ ...newQueryParam.value });
    // Reset form
    newQueryParam.value = { name: '', type: 'str', description: '' };
    showAddQueryParamForm.value[pathIndex] = false; // Hide the form
  }
};


// Function to remove a query parameter
const removeQueryParam = (pathIndex, paramIndex) => {
  apiPaths.value[pathIndex].methods[0].query.splice(paramIndex, 1);
};


const addHeader = (pathIndex) => {
  if (newHeader.value.name) {

    if (!Array.isArray(apiPaths.value[pathIndex].methods[0].headers)) {
      console.error(`Expected headers to be an array, but found:`, apiPaths.value[pathIndex].methods[0].headers);
      apiPaths.value[pathIndex].methods[0].headers = []; // Initialize as an empty array if it's not
    }

    // Now safely push the new header
    apiPaths.value[pathIndex].methods[0].headers.push({ ...newHeader.value });

    // Reset form
    newHeader.value = { name: '', type: 'str', description: '' };
    showAddHeaderForm.value[pathIndex] = false; // Hide the form
  }
};



// Function to remove a header
const removeHeader = (pathIndex, headerIndex) => {
  apiPaths.value[pathIndex].methods[0].headers.splice(headerIndex, 1);
};

// Toggle function to show/hide the add query parameter form
const toggleAddQueryParamForm = (index) => {
  showAddQueryParamForm.value[index] = !showAddQueryParamForm.value[index];
};

// Toggle function to show/hide the add header form
const toggleAddHeaderForm = (index) => {
  showAddHeaderForm.value[index] = !showAddHeaderForm.value[index];
};

const resetNewPathForm = () => {
  newPath.value = { name: '', method: '', description: '', query: '', headers: '', body: '' };
};


// Watch for changes in apiPaths to update YAML
watch(apiPaths, () => {
  updateYAML();  // Call this function to update the YAML whenever apiPaths changes
}, { deep: true });


// Function to copy YAML to clipboard
const copyToClipboard = () => {
  if (rawYAML.value) {
    navigator.clipboard.writeText(rawYAML.value)
      .then(() => {
        console.log("YAML copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  } else {
    console.warn("No YAML content to copy.");
  }
};

// Watch for changes in apiInfo to update YAML
watch(apiInfo, () => {
  updateYAMLFromApiInfo();
}, { deep: true });



// Watch for changes in rawYAML to update parsedContent
watch(rawYAML, (newYAML) => {
  try {
    parsedContent.value = yaml.load(newYAML);
    console.log("Parsed YAML content:", parsedContent.value);
    parseAPIInfo(parsedContent.value);
    servers.value = parsedContent.value.servers || [];
    apiPaths.value = Object.entries(parsedContent.value.paths || {}).map(([path, methods]) => ({
      name: path,
      methods: Object.entries(methods).map(([method, details]) => ({
        method: method.toUpperCase(),
        description: details.description || '',
        query: details.parameters || [],
        headers: details.headers || {},
        body: details.requestBody || {}
      }))
    }));

    tagGroups.value = parsedContent.value['x-tagGroups'] || [];
    webhooks.value = Object.entries(parsedContent.value['x-webhooks'] || {}).map(([name, summary]) => ({
      name,
      summary
    }));
  } catch (e) {
    console.error("Error parsing YAML: ", e);
  }
});


// Function to handle file changes
const onFileChange = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    rawYAML.value = e.target.result;
  };
  if (file) {
    reader.readAsText(file);
  }
};


// Method to add a new path
const addPath = () => {
  console.log('addPath called', newPath.value); // Debug log
  if (newPath.value.name && validateMethod(newPath.value.method)) {
    apiPaths.value.push({
      name: newPath.value.name,
      methods: [{
        method: newPath.value.method,
        description: newPath.value.description,
        query: newPath.value.query,
        headers: newPath.value.headers,
        body: newPath.value.body
      }]
    });
    // Reset the newPath form
    resetNewPathForm();
    showingAddPath.value = false;
    updateYAML();  // Update YAML after adding a new path
  } else {
    console.warn("Invalid path data:", newPath.value);
  }
};


const validateMethod = (method) => {
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']; // Add your valid methods
  return validMethods.includes(method.toUpperCase()) || 'Invalid HTTP method';
};


// Method to remove a path
const removePath = (index) => {
  apiPaths.value.splice(index, 1);
  updateYAML();  // Update YAML after removing a path
};
// Method to save edited path details




// Function to update YAML from API info
const updateYAMLFromApiInfo = () => {
  try {
    parsedContent.value.info = {
      ...parsedContent.value.info,
      title: apiInfo.value.title,
      version: apiInfo.value.version,
      description: apiInfo.value.description,
      contact: {
        name: apiInfo.value.contact.name, // Ensure contact.name is being updated
        email: apiInfo.value.contact.email,
        url: apiInfo.value.contact.url
      },
      license: apiInfo.value.license || {}
    };
    // Convert parsedContent back to YAML
    rawYAML.value = yaml.dump(parsedContent.value);
    console.log('YAML updated with new API Info:', rawYAML.value);
  } catch (e) {
    console.error("Error updating YAML from API Info:", e);
  }
};


// Function to parse API information
const parseAPIInfo = (data) => {
  apiInfo.value.title = data.info?.title || '';
  apiInfo.value.version = data.info?.version || '';
  apiInfo.value.description = data.info?.description || '';

  // Assign contact fields individually to ensure reactivity
  apiInfo.value.contact.name = data.info?.contact?.name || '';
  apiInfo.value.contact.email = data.info?.contact?.email || '';
  apiInfo.value.contact.url = data.info?.contact?.url || '';

  apiInfo.value.license = data.info?.license || {};
};



// Function to update YAML after path or server changes
const updateYAML = () => {
  try {
    // Update the paths section in parsedContent
    parsedContent.value.paths = apiPaths.value.reduce((acc, path) => {
      acc[path.name] = path.methods.reduce((methodsAcc, method) => {
        methodsAcc[method.method.toLowerCase()] = {
          description: method.description,
          parameters: method.query,
          headers: method.headers,
          requestBody: method.body
        };
        return methodsAcc;
      }, {});
      return acc;
    }, {});

    // Convert parsedContent back to YAML
    rawYAML.value = yaml.dump(parsedContent.value);
    console.log('Updated YAML:', rawYAML.value);
  } catch (e) {
    console.error("Error updating YAML:", e);
  }
};

// Function to add a new server

const serverForm = ref({ url: '', description: '' });

const isEditing = ref(false);
let editingIndex = ref(null); // Store the index of the server being edited

const addServer = () => {
  console.log('Adding server:', serverForm.value); // Debug log
  if (validateServerForm()) {
    servers.value.push({ ...serverForm.value });
    console.log('Server added:', servers.value); // Debug log
    resetServerForm();
    updateYAML(); // Call your function to update YAML if needed
  } else {
    console.error('Please fill in all fields.'); // Optional: Show error message
  }
};


const validateServerForm = () => {
  return serverForm.value.url && serverForm.value.description; // Add any other required fields here
};

// Function to remove a server
const removeServer = (index) => {
  servers.value.splice(index, 1);
  updateYAML();
};



// Function to edit a server
const editServer = (index) => {
  isEditing.value = true;
  editingIndex.value = index;
  serverForm.value = { ...servers.value[index] }; // Populate the form with the server data
  showingAddServer.value = true; // Show the server form
};

// Function to update an existing server
const updateServer = () => {
  if (editingIndex.value !== null) {
    servers.value[editingIndex.value] = { ...serverForm.value }; // Update server data
    resetServerForm(); // Clear form and reset editing state
    updateYAML(); // Update YAML if necessary
  }
};

// Reset the server form for adding/editing
const resetServerForm = () => {
  serverForm.value = { url: '', description: '' };
  isEditing.value = false;
  editingIndex.value = null; // Clear editing index
};

// Function to add a new tag group
const addTagGroup = () => {
  if (newTagGroup.value.name) {
    tagGroups.value.push({
      name: newTagGroup.value.name,
      tags: newTagGroup.value.tags.split(',').map(tag => tag.trim())
    });
    newTagGroup.value = { name: '', tags: '' };
    updateYAML();
  }
};

// Function to toggle adding a tag group
const toggleAddTagGroup = () => {
  showingAddTagGroup.value = !showingAddTagGroup.value;
};

// Function to add a new webhook
const addWebhook = () => {
  if (newWebhook.value.name) {
    webhooks.value.push({ ...newWebhook.value });
    newWebhook.value = { name: '', summary: '' };
    updateYAML();
  }
};

// Function to toggle adding a webhook
const toggleAddWebhook = () => {
  showingAddWebhook.value = !showingAddWebhook.value;
};

// Define headers for tables
const serverHeaders = [
  { text: 'URL', value: 'url' },
  { text: 'Description', value: 'description' },
  { text: 'Actions', value: 'actions' }
];

const tagGroupHeaders = [
  { text: 'Tag Group Name', value: 'name' },
  { text: 'Tags', value: 'tags' }
];

const webhookHeaders = [
  { text: 'Webhook Name', value: 'name' },
  { text: 'Summary', value: 'summary' }
];

// Overview items for display
const overviewItems = ref([
  { title: 'File Upload', subtitle: 'Upload your OpenAPI YAML file to get started.', icon: 'mdi-upload' },
  { title: 'Server Management', subtitle: 'Add and manage your API servers.', icon: 'mdi-server' },
  { title: 'Paths Overview', subtitle: 'View and manage API paths and their methods.', icon: 'mdi-road' },
  { title: 'Webhooks', subtitle: 'Configure webhooks for your API.', icon: 'mdi-webhook' }
]);

// Define contact fields for reactive data
const contactFields = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'url', label: 'URL', type: 'url' }
];



</script>


<style scoped>
.monaco-textarea {
  font-family: 'Courier New', Courier, monospace;
  border-radius: 8px;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.monaco-textarea:focus {
  border-color: #1976d2;
  box-shadow: 0 0 10px rgba(25, 118, 210, 0.5);
}

.v-btn {
  box-shadow: 0 2px 5px rgba(83, 80, 80, 0.1);
}

.text-center {
  text-align: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.path-item {
  margin-bottom: 16px;
  border: 1px solid #1976d2;
  border-radius: 8px;
  padding: 10px;
  background-color: #fff;
}

.method {
  font-weight: bold;
  color: #1976d2;
}

/* Common button style */
.action-button {
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 8px;
}

.path-heading {
  font-size: 1rem;
  /* Larger font for the heading */
}

.path-details {
  font-size: 1rem;
  /* Default size for method details */
}


/* Edit button specific styles */
.edit-button {
  background-color: #5e9eff;
  /* Attractive blue */
  color: white;
  box-shadow: 0 2px 5px rgba(0, 123, 255, 0.3);
}

.edit-button:hover {
  background-color: #3d8bff;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.5);
}

/* Delete button specific styles */
.delete-button {
  background-color: #ff6f6f;
  /* Bright coral red */
  color: white;
  box-shadow: 0 2px 5px rgba(250, 192, 192, 0.3);
}

.delete-button:hover {
  background-color: #ddb3b3;
  box-shadow: 0 4px 10px rgba(255, 0, 0, 0.5);
}

.delete-button {
  margin-left: auto;
}

/* Main Editor Container */
.vs-code-editor-container {
  background-color: #1e1e1e;
  border: 1px solid #141414;
  border-radius: 4px;
  overflow: hidden;
}

/* VS Code-like Toolbar */
.vs-code-toolbar {
  background-color: #252526;
  color: #d4d4d4;
  padding-left: 10px;
}

.vs-code-title {
  font-size: 14px;
  font-weight: normal;
  margin-left: 8px;
}

/* Editor Wrapper with Line Numbers and Textarea */
.editor-wrapper {
  display: flex;
  position: relative;
}

/* Line Numbers Styling */
.line-numbers {
  background-color: #2d2d2d;
  color: #202020;
  font-family: monospace;
  text-align: right;
  padding: 10px 6px;
  user-select: none;
  border-right: 1px solid #3c3c3c;
}

.line-number {
  display: block;
  padding: 0 5px;
  line-height: 1.5;
}



/* Code Editor Textarea Styling */
.vs-code-textarea {
  background-color: #1e1e1e !important;
  color: #dcdcdc;
  font-size: 12px;
  line-height: 1.2;
  padding-left: 15px;
  /* Adjust for line numbers */
  border: none;
  white-space: pre;
  overflow-x: auto;
  caret-color: white;
  resize: none;
  height: 800px;
  outline: none;
}

.vs-code-textarea textarea {
  font-family: 'Fira Code', monospace;
  background-color: transparent !important;
  color: inherit;
}

/* Focus Effect for Textarea */
.vs-code-textarea:focus-within {
  border-left: 3px solid #007acc;
}

/* Scrollbar Styling */
.vs-code-textarea textarea::-webkit-scrollbar {
  width: 8px;
}

.vs-code-textarea textarea::-webkit-scrollbar-thumb {
  background-color: #212122;
  border-radius: 4px;
}

/* Optional Arrows/Decorative Features for VS Code-like experience */
.vs-code-textarea::before {
  content: '>';
  position: absolute;
  left: 5px;
  color: #2e2c2c;
  padding-right: 5px;
}

.api-title {
  margin-bottom: 16px;
}

.api-info-row {
  margin-bottom: 16px;
}

.v-text-field,
.v-textarea {
  transition: all 0.3s ease;
}

.v-text-field:focus,
.v-textarea:focus {
  border-color: #1976d2;
  box-shadow: 0 0 5px rgba(25, 118, 210, 0.5);
  /* Glow effect on focus */
}

.dialog-bottom-transition {
  transition: all 0.3s ease;
}

.dialog-bottom-enter-active,
.dialog-bottom-leave-active {
  opacity: 0;
  transform: translateY(20px);
}

.dialog-bottom-enter,
.dialog-bottom-leave-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
