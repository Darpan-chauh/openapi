<template>
  <v-app>
    <v-container fluid>


      <!-- Header -->


      <h1 class="text-center mb-4" style="color: #FF5733; font-weight: bold; font-size: 2.5em;">
        .YAML File Uploader
      </h1>

      <v-row class="right-align-row">
        <v-col class="d-flex justify-end">
          <nuxt-link to="/gen" class="no-underline">
            <v-btn color="#FF5733" class="d-flex align-center me-1" elevation="2" rounded>
              <span class="me-2"> Gen-YAML </span>
              <v-icon>mdi-arrow-right</v-icon>
            </v-btn>
          </nuxt-link>
        </v-col>
      </v-row>




      <div class="d-flex justify-center mb-4">

        <v-file-input v-if="!apiUrl" label="Upload OpenAPI YAML File" accept=".yaml,.yml" @change="onFileChange"
          outlined class="mb-4"
          style="background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);"
          loading-text="Uploading..." />


        <v-text-field v-model="apiUrl" label="Enter URL" outlined class="mb-4"
          style="background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);"
          prepend-icon="mdi-link" @input="loadFromUrl" />
      </div>
      <!-- Main Content Card -->


      <v-card v-if="parsedContent" class="mt-5" elevation="10" style="border-radius: 15px; padding: 20px;">
        <v-card-text>

          <v-tabs v-model="activeSection" background-color="#f2f2f2" color="primary" class="rounded-0 px-2 py-1" dark>
            <v-tab value="ApiInfo" class="rounded font-weight-bold text-body-1">API Info</v-tab>
            <v-tab value="servers" class="rounded font-weight-bold text-body-1">Servers</v-tab>
            <v-tab value="paths" class="rounded font-weight-bold text-body-1">Paths</v-tab>
            <v-tab value="contacts" class="rounded font-weight-bold text-body-1">Contacts</v-tab>
            <v-tab value="tagGroups" class="rounded font-weight-bold text-body-1">Tag Groups</v-tab>
            <v-tab value="webhooks" class="rounded font-weight-bold text-body-1">Webhooks</v-tab>
            <v-tab value="code" class="rounded font-weight-bold text-body-1">Code</v-tab>
            <v-tab value="overview" class="rounded font-weight-bold text-body-1">Overview</v-tab>
          </v-tabs>
          <div v-if="activeSection === 'ApiInfo'">
            <v-card class="api-info-card" elevation="2">
              <v-card-text>

                <h3 style="color: #FF5733; text-align: center; font-weight: bold;">
                  <v-text-field v-model="apiInfo.title" label="API Title" outlined hide-details prepend-icon="mdi-api"
                    class="api-title" />
                </h3>


                <div class="api-info-row">
                  <strong>Version:</strong>
                  <v-text-field v-model="apiInfo.version" label="Version" outlined hide-details
                    prepend-icon="mdi-information-outline" class="api-version"></v-text-field>
                </div>


                <div class="api-info-row">
                  <strong>Description:</strong>

                  <div class="editor-toolbar">
                    <!-- Bold Button -->
                    <v-btn @click="applyFormat('b')" v-tooltip.top="'Bold'">
                      <v-icon left>mdi-format-bold</v-icon>
                    </v-btn>

                    <!-- Italic Button -->
                    <v-btn @click="applyFormat('i')" v-tooltip.bottom="'Italic'">
                      <v-icon left>mdi-format-italic</v-icon>
                    </v-btn>

                    <!-- Strikethrough Button -->
                    <v-btn @click="applyFormat('strike')" v-tooltip="'Strikethrough'">
                      <v-icon left>mdi-format-strikethrough</v-icon>
                    </v-btn>

                    <!-- Insert Link Button -->
                    <v-btn @click="applyFormat('link')" v-tooltip="'Insert Link'">
                      <v-icon left>mdi-link-variant</v-icon>
                    </v-btn>
                  </div>

                  <!-- Editable Content -->
                  <div ref="descriptionField" contenteditable="true" @blur="updateDescription"
                    class="description-editable" :innerHTML="apiInfo.description"
                    style="min-height: 150px; border: 3px solid #ccc; padding: 12px; white-space: pre-wrap;"></div>
                </div>
              </v-card-text>
            </v-card>
          </div>




          <div v-if="activeSection === 'servers'">
            <h2 class="text-h5" style="color: #FF5733;"></h2>

            <v-btn @click="showingAddServer = true" class="custom-btn mb-2">
              Add Server
            </v-btn>

            <!-- Add/Edit Server Dialog -->
            <v-dialog v-model="showingAddServer" max-width="600px" transition="dialog-bottom-transition">
              <v-card>
                <v-card-title class="headline" style="color: #FF5733; font-weight: bold; font-size: 1.5rem;">
                  <v-icon left v-if="isEditing">mdi-pencil</v-icon>
                  {{ isEditing ? 'Edit Server' : 'Add Server' }}
                </v-card-title>
                <v-card-text>
                  <v-text-field v-model="serverForm.url" label="Server URL" outlined dense
                    placeholder="Enter server URL" prepend-icon="mdi-link" clearable class="mb-3" />
                  <v-text-field v-model="serverForm.description" label="Description" outlined dense
                    placeholder="Enter description" prepend-icon="mdi-comment" clearable />
                </v-card-text>
                <v-card-actions>
                  <v-btn @click="isEditing ? updateServer() : addServer()" color="red" elevation="2"
                    style="border-radius: 25px; background-color: #FFCDD2; color: #FF5733; border: 1px solid #FFCDD2;">
                    <v-icon left v-if="isEditing">mdi-pencil</v-icon>
                    {{ isEditing ? 'Update Server' : 'Save Server' }}
                  </v-btn>
                  <v-btn @click="showingAddServer = false"
                    style="border-radius: 25px; background-color: #FF5733; color: white;">
                    <v-icon left>mdi-cancel</v-icon>
                    <span style="font-weight: bold;">Cancel</span>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>


            <v-snackbar v-model="snackbar" color="#FF5733" top right :timeout="3000" class="custom-snackbar">
              {{ snackbarMessage }}
              <v-btn @click="snackbar = false" icon size="small" class="close-button">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-snackbar>


            <!-- Server List -->
            <v-data-table :headers="serverHeaders" :items="servers" hide-default-footer class="elevation-1 mb-4" dense>
              <template v-slot:item.actions="{ item, index }">
                <button type="button" aria-label="Edit Server" @click="editServer(index)"
                  class="v-btn v-btn--icon v-btn--outlined v-btn--tile"
                  style="background-color: white; border-radius: 25px; color: #FF5733;">
                  <v-icon size="24">mdi-pencil</v-icon>
                </button>

                <button type="button" aria-label="Delete Server" @click="confirmRemoveServer(index)"
                  class="v-btn v-btn--icon v-btn--outlined v-btn--tile"
                  style="background-color: white; border-radius: 25px; color: #D32F2F; border: 0px solid #FFCDD2;">
                  <v-icon size="24">mdi-delete</v-icon>
                </button>
              </template>
            </v-data-table>


            <v-dialog v-model="confirmationDialog" max-width="400px">
              <v-card>
                <v-card-title class="headline">
                  <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon> Are you sure?
                </v-card-title>
                <v-card-text>
                  <v-icon color="grey darken-1" class="mr-2">mdi-information-outline</v-icon>
                  Do you really want to delete this server? This action cannot be undone.
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="justify-end">
                  <v-btn @click="confirmationDialog = false" color="grey darken-1" outlined>
                    <v-icon left>mdi-cancel</v-icon> Cancel
                  </v-btn>
                  <v-btn @click="removeServer" color="red" dark>
                    <v-icon left>mdi-delete</v-icon> Delete
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

          </div>


          <div class="d-flex justify-start mt-4">
            <!-- Toggle Preview Button -->
            <div class="d-flex justify-end mt-4" style="position: absolute; top: 1px; right: 55px;">
              <v-btn @click="togglePreview" class="mx-2"
                style="border-radius: 12px; box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.15); font-weight: 500; transition: all 0.3s ease-in-out;">
                <v-icon left>mdi-eye</v-icon> Preview
              </v-btn>
            </div>

            <!-- Dialog for API Documentation Preview -->
            <v-dialog v-model="isPreviewVisible" fullscreen persistent>
              <v-card class="d-flex flex-column"
                style="height: 100vh; width: 100vw; border-radius: 0; overflow: hidden;">

                <v-card-text class="flex-grow-1" style="overflow-y: auto; padding: 0;">
                  <div ref="redocContainer" class="redoc-container" style="height: 100%; position: relative;">
                    <!-- Documentation content here -->
                  </div>
                </v-card-text>



                <!-- Close Button -->
                <v-card-actions class="d-flex justify-center align-center"
                  style="position: absolute; bottom: 20px; width: 100%; z-index: 10;">
                  <v-btn color="red" @click="togglePreview" elevation="10"
                    style="border-radius: 50%; padding: 6px; box-shadow: 0px 6px 20px #FF5733; transition: all 0.3s ease-in-out;">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>




          </div>
          <v-btn icon @click="toggleFullScreen" style="position: absolute; top: 10px; right: 10px; z-index: 1000;"
            class="rounded-circle shadow-3">
            <v-icon>mdi-fullscreen</v-icon>
          </v-btn>

          <div v-if="activeSection === 'paths'" class="path-section">
            <h2 class="text-h5" style="color: #FF5733 ; margin-bottom: 15px;"></h2>

            <div v-for="(path, index) in apiPaths" :key="index"
              class="path-item mb-4 border rounded-lg p-4 shadow-lg bg-white">
              <div @click="togglePathDetails(index)" class="path-heading" style="cursor: pointer;">
                <strong>{{ path.name }}</strong>
                <v-icon>{{ activePathIndex === index ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </div>

              <div v-if="activePathIndex === index" class="path-details mt-3">
                <div v-for="(method, mIndex) in path.methods" :key="mIndex" class="method-item mb-2">
                  <!-- Dropdown for HTTP Method selection -->
                  <v-select v-model="method.method" :items="['GET', 'POST', 'PUT', 'DELETE', 'PATCH']"
                    label="HTTP Method" variant="outlined" :rules="[validateMethod]" outlined />

                  <!-- Description textarea -->
                  <v-textarea v-model="method.description" label="Description" variant="outlined" outlined
                    class="mt-2" />
                </div>


                <div class="mt-3">
                  <strong style="font-size: 1.2em; color: #333; font-weight: 600;">Query Parameters:</strong>
                  <div v-for="(param, paramIndex) in path.methods[0].query" :key="paramIndex" class="query-param mb-3">
                    <v-row align="center" no-gutters>
                      <!-- Parameter Name Input -->
                      <v-col cols="4">
                        <v-text-field v-model="param.name" label="Parameter Name" outlined dense color="primary"
                          class="my-2" :rules="[v => !!v || 'Required']" />
                      </v-col>

                      <!-- Parameter Type Dropdown -->
                      <v-col cols="3">
                        <v-select v-model="param.type" :items="queryParamTypes" label="Type" outlined dense
                          color="primary" class="my-2" />
                      </v-col>

                      <!-- Parameter Description Textarea -->
                      <v-col cols="4">
                        <v-textarea v-model="param.description" label="Description" outlined rows="1" dense
                          color="primary" class="my-2" />
                      </v-col>

                      <!-- Remove Button -->
                      <v-col cols="1" class="d-flex align-center">
                        <v-btn @click="removeQueryParam(index, paramIndex)" icon color="red" class="my-2">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Add Query Parameter Button -->
                  <v-btn @click="toggleAddQueryParamForm(index)" color=#FF5733 small outlined dense class="mt-3">
                    {{ showAddQueryParamForm[index] ? 'Cancel' : 'Add' }}
                  </v-btn>


                  <v-expand-transition>
                    <div v-if="showAddQueryParamForm[index]" class="mt-2">
                      <v-row align="center" no-gutters>
                        <!-- New Query Parameter Name -->
                        <v-col cols="4">
                          <v-text-field v-model="newQueryParam.name" label="Parameter Name" variant="outlined"
                            class="my-2" color="primary" />
                        </v-col>

                        <!-- New Query Parameter Type -->
                        <v-col cols="3">
                          <v-select v-model="newQueryParam.type" :items="queryParamTypes" label="Type"
                            variant="outlined" class="my-2" color="primary" />
                        </v-col>

                        <!-- New Query Parameter Description -->
                        <v-col cols="4">
                          <v-textarea v-model="newQueryParam.description" label="Description" variant="outlined"
                            rows="1" class="my-2" color="primary" />
                        </v-col>

                        <!-- Save Button -->
                        <v-col cols="1" class="d-flex align-center">
                          <v-btn @click="addQueryParam(index)" color="success" small class="my-2">
                            Save
                          </v-btn>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expand-transition>
                </div>

                <div class="mt-3">
                  <strong style="font-size: 1.2em; color: #333; font-weight: 600;">Headers :</strong>
                  <div v-for="(header, headerIndex) in path.methods[0].headers" :key="headerIndex"
                    class="header-item mb-2">
                    <v-row align="center" no-gutters>
                      <v-col cols="4">
                        <v-text-field v-model="header.name" label="Header Name" outlined dense color="primary"
                          class="my-2" :rules="[v => !!v || 'Required']" />
                      </v-col>
                      <v-col cols="3">
                        <v-select v-model="header.type" :items="headerTypes" label="Type" outlined dense color="primary"
                          class="my-2" />
                      </v-col>
                      <v-col cols="4">
                        <v-textarea v-model="header.description" label="Description" outlined dense color="primary"
                          class="my-2" />
                      </v-col>
                      <v-col cols="1" class="d-flex align-center">
                        <v-btn @click="removeHeader(index, headerIndex)" icon>
                          <v-icon style="color: #FF5733;">mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </div>

                  <v-btn @click="toggleAddHeaderForm(index)" style="background-color: #FF5733; color: white;" small>
                    {{ showAddHeaderForm[index] ? 'Cancel' : 'Add Header' }}
                  </v-btn>

                  <v-expand-transition>
                    <div v-if="showAddHeaderForm[index]" class="mt-2">
                      <v-row align="center" no-gutters>
                        <v-col cols="4">
                          <v-text-field v-model="newHeader.name" label="Header Name" variant="outlined" dense
                            color="primary" class="my-2" />
                        </v-col>
                        <v-col cols="3">
                          <v-select v-model="newHeader.type" :items="headerTypes" label="Type" variant="outlined" dense
                            color="primary" class="my-2" />
                        </v-col>
                        <v-col cols="4">
                          <v-textarea v-model="newHeader.description" label="Description" variant="outlined" dense
                            color="primary" class="my-2" />
                        </v-col>
                        <v-col cols="1" class="d-flex align-center">
                          <v-btn @click="addHeader(index)" color="success" small>
                            Save Header
                          </v-btn>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expand-transition>
                </div>


                <div class="mt-3">
                  <strong>Body:</strong>
                  <v-textarea v-model="path.methods[0].body" label="Body" outlined />
                </div>



                <v-btn @click.stop="removePath(index)" icon color="red" class="mt-2">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>

            <v-btn @click="toggleAddPath" style="background-color: #FF5733; color: white;" class="mb-2">
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
            <h2 class="text-h5" style="color: #FF5733 ;"></h2>
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
            <h2 class="text-h5" style="color: #FF5733;"></h2>
            <v-btn @click="toggleAddTagGroup" style="background-color: #FF5733; color: white;" class="mb-2">
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
            <h2 class="text-h5" style="color: #FF5733;"></h2>
            <v-btn @click="toggleAddWebhook" style="background-color: #FF5733; color: white;" class="mb-2">
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
            <v-btn @click="copyToClipboard" color="primary" class="mt-0 copy-btn" elevation="2"
              @mouseover="hovered = true" @mouseleave="hovered = false">
              <v-icon left>mdi-content-copy</v-icon>
              <span :class="{ 'font-weight-bold': hovered }">Copy YAML</span>
            </v-btn>

            <v-snackbar v-model="snackbarVisible" color="success" timeout="3000">
              YAML copied to clipboard!
              <v-btn color="white" @click="snackbarVisible = false">
                Close
              </v-btn>
            </v-snackbar>




            <v-tooltip bottom class="custom-tooltip">
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="downloadYamlFile" class="download-btn mt-2" fab v-bind="attrs" v-on="on">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>
              <span>Download</span>
            </v-tooltip>

            <!-- Monaco Editor -->
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
                <v-textarea v-model="apiInfo.description" outlined readonly rows="12"></v-textarea>
              </div>
              <div>

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
const queryParamTypes = ['array', 'integer', 'boolean', 'number', 'any'];
const headerTypes = ['string', 'number', 'array', 'integer', 'boolean', 'any'];
const showingAddPath = ref(false);
const activePathIndex = ref(null);



const isPreviewVisible = ref(false);
const apiUrl = ref('');
const scriptLoaded = ref(false);
const errorMessage = ref('');
const redocContainer = ref(null);



const togglePreview = () => {
  isPreviewVisible.value = !isPreviewVisible.value;
};

const loadRedoc = () => {
  if (scriptLoaded.value && window.Redoc) {
    initializeRedoc();
    return;
  }

  scriptLoaded.value = false; // Reset flag to allow reloading
  
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/redoc@2.0.0-alpha.10/bundles/redoc.standalone.js';

  script.onload = () => {
   // scriptLoaded.value = false;
    initializeRedoc();
  };

  script.onerror = (error) => {
    console.error('Failed to load ReDoc script:', error);
    errorMessage.value = 'Failed to load ReDoc script.';
    scriptLoaded.value = false;
  };

  document.body.appendChild(script);
};


const initializeRedoc = () => {
  const url = apiUrl.value || (rawYAML.value ? 'data:text/yaml;base64,' + btoa(rawYAML.value) : '');
  
  if (url && window.Redoc && redocContainer.value) {
  //  console.log('Initializing ReDoc with URL or raw YAML content:', url);
    redocContainer.value.innerHTML = '';
    window.Redoc.init(url, {
      title: 'API Documentation',
      nativeScrollbars: true,
      scrollYOffset: 50,
      tryItOutEnable: true,
    }, redocContainer.value);

  } else {
    console.error('ReDoc is not available or the container is missing.');
    errorMessage.value = 'ReDoc is not available or the container is missing.';
  }
};


const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      rawYAML.value = e.target.result;

      if (isPreviewVisible.value) {
        initializeRedoc();
      }
    };
    reader.readAsText(file);
  }
};



watch(isPreviewVisible, (newValue) => {
  if (newValue) {
    loadRedoc();
  }
});


const descriptionField = ref(null);

const applyFormat = (formatType) => {
  if (!descriptionField.value) return;


  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);


  const formattedText = document.createElement(formatType === 'link' ? 'a' : formatType);

  if (formatType === 'link') {
    const url = prompt('Enter the link URL:');
    if (!url) return;
    formattedText.setAttribute('href', url);
  }

  formattedText.appendChild(range.extractContents());
  range.insertNode(formattedText);


  updateDescription();
};

const updateDescription = () => {
  if (descriptionField.value) {
    apiInfo.value.description = descriptionField.value.innerHTML; // Sync content back to state
  }
};




// Function to load YAML from a URL
const loadFromUrl = async () => {
  if (apiUrl.value.trim() !== '') {
    try {
      const response = await fetch(apiUrl.value);
      if (!response.ok) throw new Error('Network response was not ok');
      rawYAML.value = await response.text();

    } catch (error) {
      console.error('Error loading from URL:', error);
    }
  }
}


const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error trying to enable fullscreen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};



const togglePathDetails = (index) => {

  activePathIndex.value = activePathIndex.value === index ? null : index;
};


const toggleAddPath = () => {
  showingAddPath.value = !showingAddPath.value;
};


const addQueryParam = (pathIndex) => {
  if (newQueryParam.value.name) {
    if (!apiPaths.value[pathIndex].methods[0].query) {
      apiPaths.value[pathIndex].methods[0].query = [];
    }
    apiPaths.value[pathIndex].methods[0].query.push({ ...newQueryParam.value });

    // Reset form
    newQueryParam.value = { name: '', type: 'str', description: '' };
    showAddQueryParamForm.value[pathIndex] = false;

    // Update YAML to reflect changes
    updateYAML();
  }
};

const removeQueryParam = (pathIndex, paramIndex) => {
  apiPaths.value[pathIndex].methods[0].query.splice(paramIndex, 1);
};


const addHeader = (pathIndex) => {
  // Validate new header fields
  if (!newHeader.value.name || !newHeader.value.type || !newHeader.value.description) {

    return;
  }

  // Validate path and method index
  if (!apiPaths.value[pathIndex] || !apiPaths.value[pathIndex].methods[0]) {

    return;
  }

  // Ensure headers is an array
  const method = apiPaths.value[pathIndex].methods[0];
  if (!Array.isArray(method.headers)) {

    method.headers = [];
  }

  // Add the new header
  method.headers.push({ ...newHeader.value });

  // Reset the header form
  newHeader.value = { name: '', type: 'str', description: '' };
  showAddHeaderForm.value[pathIndex] = false; // Hide the form
};





const removeHeader = (pathIndex, headerIndex) => {
  apiPaths.value[pathIndex].methods[0].headers.splice(headerIndex, 1);
};


const toggleAddQueryParamForm = (index) => {
  showAddQueryParamForm.value[index] = !showAddQueryParamForm.value[index];
};


const toggleAddHeaderForm = (index) => {
  showAddHeaderForm.value[index] = !showAddHeaderForm.value[index];
};

const resetNewPathForm = () => {
  newPath.value = { name: '', method: '', description: '', query: '', headers: '', body: '' };
};




const snackbarVisible = ref(false);


const copyToClipboard = () => {
  if (rawYAML.value) {
    navigator.clipboard.writeText(rawYAML.value)
      .then(() => {
        snackbarVisible.value = true;
        console.log("YAML copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  } else {
    console.warn("No YAML content to copy.");
  }
};


watch(apiInfo, () => {
  updateYAMLFromApiInfo();
}, { deep: true });



// Watch for changes in rawYAML to update parsedContent

watch(rawYAML, (newYAML) => {
  if (newYAML && typeof newYAML === 'string') {
    try {
      parsedContent.value = yaml.load(newYAML);
      parseAPIInfo(parsedContent.value);
      servers.value = parsedContent.value.servers || [];
      apiPaths.value = Object.entries(parsedContent.value.paths || {}).map(([path, methods]) => ({
        name: path,
        methods: Object.entries(methods).map(([method, details]) => ({
          method: method.toUpperCase(),
          description: details.description || '',
          query: details.parameters || [],
          headers: details.headers || {},
          body: details.requestBody || {},
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
  }
});



// Method to add a new path
const addPath = () => {
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
    // Reset the form
    resetNewPathForm();
    showingAddPath.value = false;

    // Update YAML after adding a new path
    updateYAML();
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
  updateYAML();
};


// Function to update YAML from API info
const updateYAMLFromApiInfo = () => {
  try {
    parsedContent.value.info = {
      ...parsedContent.value.info,
      title: apiInfo.value.title,
      version: apiInfo.value.version,
      description: apiInfo.value.description,
      contact: {
        name: apiInfo.value.contact.name,
        email: apiInfo.value.contact.email,
        url: apiInfo.value.contact.url
      },
      license: apiInfo.value.license || {}
    };
    // Convert parsedContent back to YAML
    rawYAML.value = yaml.dump(parsedContent.value);

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


const updateYAML = () => {
  try {
    const updatedContent = {
      ...parsedContent.value,
      paths: apiPaths.value.reduce((pathsAcc, path) => {
        pathsAcc[path.name] = path.methods.reduce((methodAcc, method) => {
          methodAcc[method.method.toLowerCase()] = {
            description: method.description,
            parameters: method.query || [],
            headers: method.headers || [],
          };
          return methodAcc;
        }, {});
        return pathsAcc;
      }, {})
    };

    // Update the raw YAML
    rawYAML.value = yaml.dump(updatedContent);

    // Trigger ReDoc re-render if preview is visible
    if (isPreviewVisible.value) {
      initializeRedoc();  // Manually reinitialize ReDoc
    }

  } catch (e) {
    console.error('Error updating YAML:', e);
  }
};


// Watch changes in apiPaths and keep YAML in sync
//watch(apiPaths, updateYAML, { deep: true });




const snackbar = ref(false);
const snackbarMessage = ref('');
const serverForm = ref({ url: '', description: '' });
const isEditing = ref(false);
let editingIndex = ref(null);

// Store for confirmation dialog
const confirmationDialog = ref(false);
const serverToDeleteIndex = ref(null);

// Function to add a new server
const addServer = () => {
  if (validateServerForm()) {
    servers.value.push({ ...serverForm.value });
    updateYAML();
    showingAddServer.value = false;
    resetServerForm();
    snackbarMessage.value = 'Server added in the section successfully!';
    snackbar.value = true;
  }
};

// Regular expression for URL validation
const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;

// Function to validate the server form
const validateServerForm = () => {
  if (!serverForm.value.url) {
    snackbarMessage.value = "The URL field is required! please fill it";
    snackbar.value = true;
    return false;
  }

  if (!urlRegex.test(serverForm.value.url)) {
    snackbarMessage.value = "Invalid URL format! Please enter a valid URL.";
    snackbar.value = true;
    return false;
  }

  return true;
};

// Function to confirm deletion of a server
const confirmRemoveServer = (index) => {
  serverToDeleteIndex.value = index;
  confirmationDialog.value = true;
};

// Function to remove a server after confirmation
const removeServer = () => {
  if (serverToDeleteIndex.value !== null) {
    servers.value.splice(serverToDeleteIndex.value, 1);
    updateYAMLFromApiInfo();
    snackbarMessage.value = 'Server deleted successfully!';
    snackbar.value = true;
  }
  confirmationDialog.value = false;
  serverToDeleteIndex.value = null;
};

// Function to edit a server
const editServer = (index) => {
  isEditing.value = true;
  editingIndex.value = index;
  serverForm.value = { ...servers.value[index] };
  showingAddServer.value = true;
};

// Function to update an existing server
const updateServer = () => {
  if (editingIndex.value !== null) {
    servers.value[editingIndex.value] = { ...serverForm.value };
    updateYAML(); // Update the OpenAPI YAML
    apiUrl.value = serverForm.value.url; // Update the API URL
    initializeRedoc(); // Reload ReDoc
    resetServerForm();
    showingAddServer.value = false;
  }
};

// Reset the server form for adding/editing
const resetServerForm = () => {
  serverForm.value = { url: '', description: '' };
  isEditing.value = false;
  editingIndex.value = null;
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

const downloadFile = (data, filename) => {
  const blob = new Blob([data], { type: 'application/x-yaml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const downloadYamlFile = () => {
  const filename = 'file.yaml';
  downloadFile(yamlData.value, filename);
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



// Define contact fields for reactive data
const contactFields = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'url', label: 'URL', type: 'url' }
];



</script>




<style scoped>
.redoc-container {
  background-color: #ffffff;
  padding: 0px;
  margin: 0;
  overflow-y: auto;
  border-radius: 0px;
  box-shadow: none;
}

.no-underline {
  text-decoration: none;
  /* Removes the underline */
}

h1.sc-jWBwVP.lppoWu {
  color: #df541d;
  /* Change the color */
  font-family: 'Arial', sans-serif;
  font-size: 2000rem;
  /* Adjust the size */
}

h1.sc-jWBwVP.lppoWu span {
  color: #6b7280;
  /* Style the (v1) */
  font-size: 1rem;
}



.monaco-textarea {
  font-family: 'Courier New', Courier, monospace;
  border-radius: 8px;
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.description-markdown :deep(.description-markdown) {
  font-size: 1.9em;
}

.description-markdown :deep(h1) {
  font-size: 1.4em;
}

.description-markdown :deep(h2) {
  font-size: 1.1em;
}

.description-markdown :deep(p) {
  font-size: 1em;
}


.v-tooltip__content {
  transform: translateY(-10px) !important;
  /* Adjust the vertical position of the tooltip */
}




.editor-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  padding: 10px 15px;
  background: linear-gradient(135deg, #ffffff, #f3f3f3);
  border: 1px solid #ddd;
  border-radius: 11px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  align-items: center;
}

.v-btn {
  margin-top: 0px;
}

.download-btn {
  position: absolute;
  /* Absolute positioning */
  top: 108px;
  /* Adjust distance from the top */
  right: 37px;
  /* Adjust distance from the right */
  background-color: #1a1b1b;
  /* Background color */
  color: rgb(94, 166, 248);
  /* Icon color */
  border-radius: 10%;
  /* Rounded button */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* Shadow */
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
  /* Transition effect */
  padding: 10px;
  /* Padding */
  cursor: pointer;
}

.download-btn .v-icon {
  font-size: 24px;
  /* Icon size */
}

.custom-tooltip .v-tooltip__content {
  background-color: #333;
  /* Tooltip background */
  color: white;
  /* Tooltip text color */
  font-size: 14px;
  /* Font size */
  border-radius: 4px;
  /* Rounded edges */
  padding: 8px 12px;
  /* Padding */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  /* Shadow for tooltip */
  opacity: 1;
  /* Ensure tooltip is visible */
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
  font-size: 15px;
  /* Larger font for the heading */
}



.custom-btn {
  background-color: #FF5733 !important;
  /* Use !important if Vuetify styles override */
  color: white;
  /* Change text color if needed */
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


.right-align-row {
  display: flex;
  justify-content: flex-end;
  /* Aligns content to the right */
  margin-left: 1500px;


}

/* Main Editor Container */
.vs-code-editor-container {
  background-color: #1e1e1e;
  border: 1px solid #141414;
  border-radius: 4px;
  overflow: hidden;
}

.custom-tabs {
  background-color: #FF5733 !important;
  /* Use !important if Vuetify styles are overriding */
}

.custom-btn {
  background-color: #FF5733;
  color: white;
  /* Adjust the text color if needed */
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





/* Main Content Card */
.content-card {
  border-radius: 15px;
  padding: 20px;
}

/* Tabs Navigation */
.tabs-navigation {
  border-radius: 8px;
  margin-bottom: 20px;
}

/* Individual Tab Styling */
.tab-item {
  font-weight: bold;
  font-size: 1.1em;
}

/* API Info Card Styling */
.api-info-card {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

/* Header Styling for Title */
.api-info-header {
  color: #ff5733;
  font-weight: bold;
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 20px;
}

/* Row Styling for Version and Description */
.api-info-row {
  margin: 15px 0;
  font-size: 1.1em;
}

.label {
  color: #666;
  font-weight: bold;
}

/* Markdown Description Styling */
.description-markdown {
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: inset 0px 4px 8px rgba(0, 0, 0, 0.05);
  font-size: 1.1em;
  color: #333;
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
