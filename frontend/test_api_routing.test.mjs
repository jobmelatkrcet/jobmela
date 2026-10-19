import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Inspect api.js baseURL logic
const apiServicePath = path.join(__dirname, 'src', 'services', 'api.js');
const apiSource = fs.readFileSync(apiServicePath, 'utf8');

test('API Routing: getBaseURL returns same-origin /api without absolute host fallbacks', () => {
  assert.match(
    apiSource,
    /const getBaseURL\s*=\s*\(\)\s*=>\s*\{[\s\S]*?return\s+'\/api';/,
    'getBaseURL must default to same-origin /api'
  );
  assert.equal(
    apiSource.includes("return 'https://jobmela-z1tj.vercel.app/api';"),
    false,
    'getBaseURL must not hardcode absolute external backend URL'
  );
});

// 2. Inspect frontend/.env.production
const envProdPath = path.join(__dirname, '.env.production');
const envProdContent = fs.readFileSync(envProdPath, 'utf8');

test('API Routing: frontend/.env.production configures same-origin /api', () => {
  assert.match(
    envProdContent,
    /^VITE_API_URL=\/api$/m,
    '.env.production must configure VITE_API_URL=/api'
  );
});

// 3. Inspect vercel.json rewrites
const vercelJsonPath = path.join(__dirname, 'vercel.json');
const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

test('API Routing: frontend/vercel.json rewrites /api to backend service', () => {
  assert.ok(Array.isArray(vercelJson.rewrites), 'rewrites array must be defined');
  const apiRewrite = vercelJson.rewrites.find((r) => r.source === '/api');
  assert.ok(apiRewrite, 'Rewrite for /api must exist');
  assert.match(apiRewrite.destination, /https:\/\/jobmela-z1tj\.vercel\.app\/api\/?/);

  const wildcardRewrite = vercelJson.rewrites.find((r) => r.source.startsWith('/api/:path*'));
  assert.ok(wildcardRewrite, 'Wildcard rewrite for /api/:path* must exist');
});

// 4. Verify all frontend services enforce trailing slashes for Django compatibility
const servicesDir = path.join(__dirname, 'src', 'services');
const serviceFiles = [
  'authService.js',
  'applicationService.js',
  'companyService.js',
  'requirementsService.js',
  'roomService.js',
  'adminService.js',
];

test('API Routing: all service endpoints include trailing slashes to prevent 301/500 redirects', () => {
  for (const filename of serviceFiles) {
    const filePath = path.join(servicesDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');

    // Find all api.(get|post|put|delete) calls with string literals or template literals
    const apiCallRegex = /api\.(get|post|put|delete)\(\s*([`'"])(.*?)\2/g;
    let match;
    while ((match = apiCallRegex.exec(content)) !== null) {
      const url = match[3];
      // Skip query parameter strings before query '?'
      const pathOnly = url.split('?')[0];
      if (pathOnly && !pathOnly.endsWith('/')) {
        assert.fail(`Endpoint in ${filename} missing trailing slash: ${url}`);
      }
    }
  }
});

// 5. Verify no services manually set Content-Type: multipart/form-data
test('API Routing: no service manually sets multipart/form-data header', () => {
  for (const filename of serviceFiles) {
    const filePath = path.join(servicesDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.equal(
      content.includes('multipart/form-data'),
      false,
      `Service ${filename} should not manually specify Content-Type: multipart/form-data`
    );
  }
});
