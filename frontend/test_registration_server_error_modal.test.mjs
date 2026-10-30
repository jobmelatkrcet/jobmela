import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Verify RegistrationServerErrorModal component source code and contents
const modalComponentPath = path.join(__dirname, 'src', 'components', 'RegistrationServerErrorModal.jsx');
const modalSourceCode = fs.readFileSync(modalComponentPath, 'utf8');

test('Server Error Modal: File exists and contains required instructions', () => {
  assert.ok(fs.existsSync(modalComponentPath), 'RegistrationServerErrorModal.jsx should exist');

  // Verify Point 1: Do in another mobile or laptop
  assert.match(
    modalSourceCode,
    /Do in another mobile or laptop/i,
    'Modal must contain instruction "Do in another mobile or laptop"'
  );

  // Verify Point 2: Make sure image and resume size should be 100kb
  assert.match(
    modalSourceCode,
    /Make sure image and resume size should be 100kb/i,
    'Modal must contain instruction "Make sure image and resume size should be 100kb"'
  );

  // Verify support helpline number
  assert.match(
    modalSourceCode,
    /8019792661/,
    'Modal must display helpline support phone number 8019792661'
  );
});

test('Server Error Modal: Has accessible role and backdrop dismiss handlers', () => {
  assert.match(modalSourceCode, /role="dialog"/, 'Modal content must have role="dialog"');
  assert.match(modalSourceCode, /aria-modal="true"/, 'Modal content must have aria-modal="true"');
  assert.match(modalSourceCode, /Escape/, 'Modal must handle Escape key');
  assert.match(modalSourceCode, /if\s*\(!isOpen\)\s*return\s*null/, 'Modal must return null when not open');
});

// 2. Test parseRegistrationError isServerError flags in StudentRegisterPage
const registerPagePath = path.join(__dirname, 'src', 'pages', 'student', 'StudentRegisterPage.jsx');
const registerSourceCode = fs.readFileSync(registerPagePath, 'utf8');
const transformed = esbuild.transformSync(registerSourceCode, { loader: 'jsx', format: 'cjs' });

const moduleExports = {};
const mod = { exports: moduleExports };
const fakeRequire = () => ({
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

const { parseRegistrationError } = mod.exports;

test('Server Error Detection: HTTP 500 returns isServerError: true', () => {
  const err500 = {
    response: {
      status: 500,
      data: 'Internal Server Error',
    },
  };
  const result = parseRegistrationError(err500);
  assert.equal(result.isServerError, true);
});

test('Server Error Detection: HTTP 502/503/504 returns isServerError: true', () => {
  const err503 = {
    response: {
      status: 503,
      data: 'Service Unavailable',
    },
  };
  const result = parseRegistrationError(err503);
  assert.equal(result.isServerError, true);
});

test('Server Error Detection: HTTP 413 Payload Too Large returns isServerError: true', () => {
  const err413 = {
    response: {
      status: 413,
      data: 'Payload Too Large',
    },
  };
  const result = parseRegistrationError(err413);
  assert.equal(result.isServerError, true);
});

test('Server Error Detection: Network drop and Timeout return isServerError: true', () => {
  const errNet = {
    request: {},
    message: 'Network Error',
  };
  assert.equal(parseRegistrationError(errNet).isServerError, true);

  const errTimeout = {
    code: 'ECONNABORTED',
    message: 'timeout exceeded',
  };
  assert.equal(parseRegistrationError(errTimeout).isServerError, true);
});

test('Server Error Detection: Duplicate email or mobile validation error returns isServerError: false', () => {
  const errDuplicateEmail = {
    response: {
      status: 400,
      data: {
        email: ['An account with this email already exists.'],
      },
    },
  };
  const resultEmail = parseRegistrationError(errDuplicateEmail);
  assert.equal(resultEmail.isServerError, false);

  const errDuplicateMobile = {
    response: {
      status: 400,
      data: {
        mobile: ['This mobile number is already registered.'],
      },
    },
  };
  const resultMobile = parseRegistrationError(errDuplicateMobile);
  assert.equal(resultMobile.isServerError, false);
});

test('StudentRegisterPage: Imports and mounts RegistrationServerErrorModal and triggers on server error', () => {
  assert.match(
    registerSourceCode,
    /import RegistrationServerErrorModal from/,
    'StudentRegisterPage must import RegistrationServerErrorModal'
  );

  assert.match(
    registerSourceCode,
    /<RegistrationServerErrorModal[\s\S]*?isOpen=\{showServerErrorModal\}/,
    'StudentRegisterPage must mount RegistrationServerErrorModal with showServerErrorModal state'
  );

  assert.match(
    registerSourceCode,
    /setShowServerErrorModal\(true\)/,
    'StudentRegisterPage must trigger setShowServerErrorModal(true) when server error occurs'
  );
});

