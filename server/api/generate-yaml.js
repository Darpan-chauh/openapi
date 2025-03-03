import axios from 'axios';
import yaml from 'js-yaml';


const CONNECTOR_ID = 'connector_id'; //b01b7a48-083d-478d-87a9-b83288e8bae9
const TOKEN = 'token';
const CONNECTOR_URL = "https://api-qa.fareyeconnect.com/setu/service?&sort=created,desc&page=0&size=20&q=connector.id%3D%22";

// Fetch data from a given URL and handle any HTTP errors
async function fetchDataFromUrl(url, headers) {
  try {
    console.log("URL: " + url)
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
 
    if (error.response && error.response.status === 401) {
      console.error('Token expired. Please authenticate again.');
      
      throw new Error('Token expired');
    }
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
}


// Clean and normalize schemas by recursively processing nested objects and arrays
function cleanSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;

  if (Array.isArray(schema.items)) {
    schema.items = schema.items[0];

  }

  // Recursively clean nested objects and arrays
  Object.keys(schema).forEach((key) => {
    schema[key] = cleanSchema(schema[key]);
  });

  return schema;
}

// Ensure schemas are parsed and cleaned, if necessary
function processSchemas(jsonData) {
  if (jsonData.config?.reqSchema) {
    jsonData.config.reqSchema = parseAndCleanSchema(jsonData.config.reqSchema);
  }

  if (jsonData.config?.resSchema) {
    jsonData.config.resSchema = parseAndCleanSchema(jsonData.config.resSchema);
  }
}

// Parse and clean individual schemas (convert strings to objects and clean)
function parseAndCleanSchema(schema) {
  if (typeof schema === 'string') {
    try {
      schema = JSON.parse(schema);
    } catch (error) {
      console.error('Invalid JSON in schema:', error);
      return {};
    }
  }

  return cleanSchema(schema);
}

// Create a path for OpenAPI specification dynamically from the provided data
function createPath(jsonData) {
  const name = jsonData.name || '';
  const method = jsonData.method?.toLowerCase() || '';
  const code = jsonData.code || '';
  const connectorCode = jsonData.connector?.code || '';

  const pathParameters = jsonData.pathParameters || [];
  const queryParameters = jsonData.queryParameters || [];

  const parameters = [
    ...pathParameters.map((param) => ({
      name: param.name,
      in: 'path',
      required: true,
      schema: { type: param.type || 'string' },
      description: param.description || `Path parameter: ${param.name}`,
    })),
    ...queryParameters.map((param) => ({
      name: param.name,
      in: 'query',
      required: param.required || false,
      schema: { type: param.type || 'string' },
      description: param.description || `Query parameter: ${param.name}`,
    })),
  ];

  return {
    [`/v1/${code}/${pathParameters.map((p) => `{${p.name}}`).join('/')}`]: {
      [method]: {
        operationId: code.toLowerCase(),
        summary: name,
        description: `The API provides functionality to ${name.toLowerCase()}.`,
        tags: [connectorCode],
        parameters,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: jsonData.config.reqSchema || {},
            },
          },
        },
        responses: createResponses(name, jsonData),
      },
    },
  };
}


// Create responses for the OpenAPI specification
function createResponses(name, jsonData) {
  return {
    '200': {
      description: `${name} successful response`,
      content: {
        'application/json': {
          schema: jsonData.config.resSchema || {},
        },
      },
    },
    '400': {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              status: {
                type: 'integer',
                description: 'Status Code',
              },
              error: {
                type: 'string',
                description: 'Error message',
              },
            },
          },
        },
      },
    },
  };
}

// Main function to generate OpenAPI specification
export default defineEventHandler(async (event) => {
  try {
    console.log("Starting the page")
    var queryParams = getQuery(event);
    let connectorId = queryParams[CONNECTOR_ID];
    console.log("Connector Id :" + connectorId)

    if (!connectorId) {
      console.error('Missing connector_id parameter');
      event.res.statusCode = 400;
      return { error: "Missing required 'connector_id' query parameter." };
    }


    let token = queryParams[TOKEN] || "6116516c-c541-48bc-b322-29cc8d0f677d";
    console.log("Token :" + token);

    let connectorUrl = CONNECTOR_URL + connectorId + "%22";
    console.log("Calling connector Url:" + connectorUrl);
    let headers = {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    };

    const paths = {};

    const connectorData = await fetchDataFromUrl(connectorUrl, headers);
    connectorData.content.forEach(ele => {
      processSchemas(ele);
      const path = createPath(ele);
      Object.assign(paths, path); // Merge the newly created path with existing paths
    })

    // Create OpenAPI specification
    const openApiSpec = createOpenApiSpec(paths);

    // Convert OpenAPI spec to YAML format
    const yamlString = yaml.dump(openApiSpec, {
      noRefs: true,
      skipInvalid: true,
      indent: 2,
      lineWidth: 80,
    });

    event.res.setHeader('Content-Type', 'text/yaml');
    return yamlString;
  } catch (error) {
    console.error('Error generating OpenAPI YAML:', error);
    event.res.statusCode = 500;
    return 'Error generating YAML';
  }
});

// Function to create the complete OpenAPI specification with paths
function createOpenApiSpec(paths) {
  return {
    openapi: '3.0.1',
    servers: [
      {
        url: 'https://api-staging.fareyeconnect.com',
        description: 'Staging',
      },
      {
        url: 'https://api-uat.fareyeconnect.com',
        description: 'UAT',
      },
      {
        url: 'https://api-us.fareyeconnect.com',
        description: 'US',
      },
      {
        url: 'https://api-eu.fareyeconnect.com',
        description: 'EU',
      },
      {
        url: 'https://api-sg.fareyeconnect.com',
        description: 'SG',
      },
      {
        url: 'https://api-au.fareyeconnect.com',
        description: 'AU',
      },
      {
        url: 'https://api-ca.fareyeconnect.com',
        description: 'CA',
      },
      {
        url: 'https://api-in.fareyeconnect.com',
        description: 'IN',
      },
    ],
    info: {
      title: 'FarEye API Specification',
      version: 'v1',
      description: `# Overview
This API document provides a comprehensive guide for integrating client systems with the FarEye delivery platform. It details the key APIs and their functions, aimed at optimizing delivery operations, improving visibility, enhancing efficiency, and ensuring cost-effectiveness. By clearly defining integration points, the document enables seamless communication and data exchange between client systems and the FarEye platform.

# Authentication
Raise a request on integration@fareye.com or submit a support query here to provide a bearer token.`,
      contact: {
        name: 'FarEye Integration Team',
        url: 'https://fareye.com/',
        email: 'integration@fareye.com',
      },
      'x-logo': {
        url: '../resources/Fareye-logo.jpg',
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    paths,
  };
}
