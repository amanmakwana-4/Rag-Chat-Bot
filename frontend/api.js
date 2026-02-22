/**
 * Healthcare GenAI SaaS - API Service
 * Handles all backend communication using Axios
 */

import axios from 'axios';

// API base URL - uses Vite proxy in development
const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for LLM generation
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    console.error('[API] Response error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Generate a medical document
 * @param {Object} params - Generation parameters
 * @param {string} params.document_type - Type of document to generate
 * @param {string} params.topic - Topic/subject for the document
 * @param {string} [params.disease_name] - Specific disease name (for Disease Overview)
 * @param {string} [params.hospital_id] - Hospital identifier (default: demo_hospital)
 * @param {string} [params.patient_id] - Patient ID (required for Medical Certificate)
 * @returns {Promise<Object>} Generated document with documentId and content
 */
export const generateDocument = async ({ document_type, topic, disease_name = null, hospital_id = 'demo_hospital', patient_id = null }) => {
  const payload = {
    document_type,
    topic,
    hospital_id,
  };

  // Only include disease_name if provided (for Disease Overview)
  if (disease_name) {
    payload.disease_name = disease_name;
  }

  // Only include patient_id if provided (for Medical Certificate)
  if (patient_id) {
    payload.patient_id = patient_id;
  }

  const response = await apiClient.post('/generate', payload);
  return response.data;
};

/**
 * Retrieve a document by its unique Document ID
 * @param {string} documentId - Unique document identifier
 * @returns {Promise<Object>} Retrieved document
 */
export const getDocument = async (documentId) => {
  const response = await apiClient.get(`/document/${documentId}`);
  return response.data;
};

/**
 * Get available document types
 * @returns {Promise<Object>} List of document types with requirements
 */
export const getDocumentTypes = async () => {
  const response = await apiClient.get('/document-types');
  return response.data;
};

/**
 * Create a new patient (for demo/testing purposes)
 * @param {Object} params - Patient parameters
 * @param {string} params.patient_id - Unique patient identifier
 * @param {string} params.name - Patient name
 * @param {string} [params.hospital_id] - Hospital identifier
 * @returns {Promise<Object>} Created patient
 */
export const createPatient = async ({ patient_id, name, hospital_id = 'demo_hospital' }) => {
  const response = await apiClient.post('/patients', {
    patient_id,
    name,
    hospital_id,
  });
  return response.data;
};

/**
 * List patients for a hospital
 * @param {string} hospitalId - Hospital identifier
 * @returns {Promise<Object>} List of patients
 */
export const listPatients = async (hospitalId = 'demo_hospital') => {
  const response = await apiClient.get(`/patients/${hospitalId}`);
  return response.data;
};

/**
 * Health check
 * @returns {Promise<Object>} API status
 */
export const healthCheck = async () => {
  const response = await apiClient.get('/');
  return response.data;
};

export default {
  generateDocument,
  getDocument,
  getDocumentTypes,
  createPatient,
  listPatients,
  healthCheck,
};
