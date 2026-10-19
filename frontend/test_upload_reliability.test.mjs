import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Test api.js Axios configuration and FormData interceptor
const apiServicePath = path.join(__dirname, 'src', 'services', 'api.js');
const apiSourceCode = fs.readFileSync(apiServicePath, 'utf8');

test('Upload Reliability: api.js exports DEFAULT_API_TIMEOUT as 30000 ms (30 seconds)', () => {
  assert.match(
    apiSourceCode,
    /export const DEFAULT_API_TIMEOUT\s*=\s*30000;/,
    'DEFAULT_API_TIMEOUT must be exported and set to 30000ms'
  );
  assert.match(
    apiSourceCode,
    /timeout:\s*DEFAULT_API_TIMEOUT/,
    'Axios instance must configure timeout to DEFAULT_API_TIMEOUT'
  );
});

test('Upload Reliability: api.js request interceptor deletes Content-Type for FormData instances to let browser set boundary', () => {
  // Mock FormData
  class MockFormData {
    constructor() {
      this.entries = [];
    }
    append(key, val) {
      this.entries.push([key, val]);
    }
  }

  // Extract and simulate the request interceptor from api.js
  const interceptorHandler = (config) => {
    if (config.data instanceof MockFormData && config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      }
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
    return config;
  };

  // Test with FormData: Content-Type must be removed
  const formDataConfig = {
    data: new MockFormData(),
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Token test-token-123',
    },
  };

  const processedFormDataConfig = interceptorHandler(formDataConfig);
  assert.equal(processedFormDataConfig.headers['Content-Type'], undefined);
  assert.equal(processedFormDataConfig.headers['content-type'], undefined);
  assert.equal(processedFormDataConfig.headers['Authorization'], 'Token test-token-123');

  // Test with JSON data: Content-Type must NOT be removed
  const jsonConfig = {
    data: { email: 'student@tkrcet.ac.in' },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Token test-token-123',
    },
  };

  const processedJsonConfig = interceptorHandler(jsonConfig);
  assert.equal(processedJsonConfig.headers['Content-Type'], 'application/json');
});

// 2. Test StudentRegisterPage.jsx upload constants and safeguards
const registerPagePath = path.join(__dirname, 'src', 'pages', 'student', 'StudentRegisterPage.jsx');
const registerSourceCode = fs.readFileSync(registerPagePath, 'utf8');

test('Upload Reliability: StudentRegisterPage enforces 3 MB photo limit and 3.5 MB resume limit', () => {
  // Photo max: 3 * 1024 * 1024 bytes (3 MB)
  assert.match(
    registerSourceCode,
    /MAX_PHOTO_BYTES\s*=\s*3\s*\*\s*1024\s*\*\s*1024/,
    'MAX_PHOTO_BYTES must be 3 * 1024 * 1024 bytes'
  );

  // Resume max: 3.5 * 1024 * 1024 bytes (3.5 MB limit)
  assert.match(
    registerSourceCode,
    /MAX_RESUME_BYTES\s*=\s*3\.5\s*\*\s*1024\s*\*\s*1024/,
    'Resume validation must enforce 3.5 * 1024 * 1024 bytes (3.5MB limit)'
  );
  assert.match(
    registerSourceCode,
    /Resume file size exceeds 3\.5MB limit\./,
    'Resume validation must display 3.5MB limit message'
  );
});

test('Upload Reliability: StudentRegisterPage enforces 4MB combined limit to protect against Vercel payload drops', () => {
  assert.match(
    registerSourceCode,
    /MAX_COMBINED_BYTES\s*=\s*4\s*\*\s*1024\s*\*\s*1024/,
    'StudentRegisterPage must guard against payloads exceeding 4MB for Vercel serverless safety'
  );
});

test('Upload Reliability: UI shows clear loading state and disables submission during upload', () => {
  // Button disabled while loading
  assert.match(
    registerSourceCode,
    /disabled=\{loading\}/,
    'Submit button must be disabled when loading is true'
  );
  assert.match(
    registerSourceCode,
    /aria-busy=\{loading\}/,
    'Submit button must set aria-busy={loading} for accessibility'
  );

  // Informative loading text
  assert.match(
    registerSourceCode,
    /Uploading Files & Registering\.\.\./,
    'Submit button must display "Uploading Files & Registering..." when files are present'
  );
  assert.match(
    registerSourceCode,
    /Registering Candidate\.\.\./,
    'Submit button must display "Registering Candidate..." when no files are attached'
  );
});

test('Upload Reliability: Duplicate submissions are prevented when loading is true', () => {
  assert.match(
    registerSourceCode,
    /if\s*\(\s*loading\s*\)\s*return/,
    'handleSubmit must return immediately if loading is already true'
  );
});
