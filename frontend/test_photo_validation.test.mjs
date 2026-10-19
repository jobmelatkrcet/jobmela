import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load and transform StudentRegisterPage.jsx
const componentPath = path.join(__dirname, 'src', 'pages', 'student', 'StudentRegisterPage.jsx');
const sourceCode = fs.readFileSync(componentPath, 'utf8');
const transformed = esbuild.transformSync(sourceCode, { loader: 'jsx', format: 'cjs' });

const moduleExports = {};
const mod = { exports: moduleExports };
const fakeRequire = (m) => ({
  useState: () => [null, () => {}],
  useRef: () => ({ current: null }),
  useNavigate: () => () => {},
  useAuth: () => ({ login: () => {} }),
  authService: {},
  motion: { div: () => null },
  AnimatePresence: ({ children }) => children,
});

const executeModule = new Function('require', 'exports', 'module', transformed.code);
executeModule(fakeRequire, moduleExports, mod);

const {
  MAX_PHOTO_BYTES,
  PHOTO_SIZE_ERROR_MESSAGE,
  VALID_PHOTO_TYPES,
  validatePhotoFile,
} = mod.exports;

test('Frontend Validation: MAX_PHOTO_BYTES is configured to exactly 200 KB (204,800 bytes)', () => {
  assert.equal(MAX_PHOTO_BYTES, 200 * 1024);
});

test('Frontend Validation: PHOTO_SIZE_ERROR_MESSAGE matches exact required text', () => {
  assert.equal(
    PHOTO_SIZE_ERROR_MESSAGE,
    'Photo file size exceeds 200KB limit.'
  );
});

test('Frontend Validation: A photo below 200 KB (e.g. 50 KB, 150 KB) is accepted', () => {
  const photo50kb = { name: 'photo.jpg', type: 'image/jpeg', size: 50 * 1024 };
  const photo150kb = { name: 'photo.png', type: 'image/png', size: 150 * 1024 };
  const photoSmallWebp = { name: 'photo.webp', type: 'image/webp', size: 25000 };

  assert.equal(validatePhotoFile(photo50kb), null);
  assert.equal(validatePhotoFile(photo150kb), null);
  assert.equal(validatePhotoFile(photoSmallWebp), null);
});

test('Frontend Validation: A photo exactly at 200 KB limit (204,800 bytes) is accepted', () => {
  const photoExact = { name: 'exact.jpg', type: 'image/jpeg', size: 200 * 1024 };
  assert.equal(validatePhotoFile(photoExact), null);
});

test('Frontend Validation: A photo above 200 KB (204,801 bytes) is rejected with clear error', () => {
  const photoOverOneByte = { name: 'over.jpg', type: 'image/jpeg', size: 200 * 1024 + 1 };
  assert.equal(
    validatePhotoFile(photoOverOneByte),
    'Photo file size exceeds 200KB limit.'
  );
});

test('Frontend Validation: A photo well above 200 KB (e.g. 1 MB, 3 MB) is rejected', () => {
  const photo1mb = { name: 'large.jpg', type: 'image/jpeg', size: 1024 * 1024 };
  const photo3mb = { name: 'huge.png', type: 'image/png', size: 3 * 1024 * 1024 };

  assert.equal(
    validatePhotoFile(photo1mb),
    'Photo file size exceeds 200KB limit.'
  );
  assert.equal(
    validatePhotoFile(photo3mb),
    'Photo file size exceeds 200KB limit.'
  );
});

test('Frontend Validation: Invalid MIME types are rejected with format error message', () => {
  const pdfFile = { name: 'doc.pdf', type: 'application/pdf', size: 100000 };
  const textFile = { name: 'photo.txt', type: 'text/plain', size: 50000 };

  assert.equal(
    validatePhotoFile(pdfFile),
    'Please upload a valid image file (JPG, PNG, or WebP).'
  );
  assert.equal(
    validatePhotoFile(textFile),
    'Please upload a valid image file (JPG, PNG, or WebP).'
  );
});
