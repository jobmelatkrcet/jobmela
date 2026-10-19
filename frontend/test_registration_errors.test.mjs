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

const {
  SUPPORT_PHONE,
  sanitizeErrorMessage,
  parseRegistrationError,
} = mod.exports;

test('Error Handling: SUPPORT_PHONE constant is 8019792661', () => {
  assert.equal(SUPPORT_PHONE, '8019792661');
});

test('Error Handling: Field validation errors returned by Django are mapped to fieldErrors with guidance banner', () => {
  const err = {
    response: {
      status: 400,
      data: {
        full_name: ['Full name is required.'],
        password: ['Password must be at least 6 characters.'],
      },
    },
  };

  const result = parseRegistrationError(err);
  assert.equal(result.fieldErrors.full_name, 'Full name is required.');
  assert.equal(result.fieldErrors.password, 'Password must be at least 6 characters.');
  assert.equal(result.generalError, 'Please correct the errors highlighted below and try again.');
});

test('Error Handling: Duplicate email returned by backend sets field error and login guidance banner', () => {
  const err = {
    response: {
      status: 400,
      data: {
        email: ['An account with this email already exists.'],
      },
    },
  };

  const result = parseRegistrationError(err);
  assert.equal(result.fieldErrors.email, 'An account with this email already exists.');
  assert.equal(
    result.generalError,
    'An account with this email address already exists. Please log in to your account.'
  );
});

test('Error Handling: Duplicate mobile returned by backend sets field error and mobile guidance banner', () => {
  const err = {
    response: {
      status: 400,
      data: {
        mobile: ['This mobile number is already registered.'],
      },
    },
  };

  const result = parseRegistrationError(err);
  assert.equal(result.fieldErrors.mobile, 'This mobile number is already registered.');
  assert.equal(
    result.generalError,
    'This mobile number is already registered. Please check your number or log in.'
  );
});

test('Error Handling: Network failure (no HTTP response received) returns concise message without support number', () => {
  const errNoResponse = {
    request: {},
    message: 'Network Error',
  };

  const result = parseRegistrationError(errNoResponse);
  assert.equal(
    result.generalError,
    'Unable to connect to the server. Please check your internet connection and try again.'
  );
  // Verify it does NOT tell students to contact support for a normal connection drop
  assert.equal(result.generalError.includes(SUPPORT_PHONE), false);
  assert.deepEqual(result.fieldErrors, {});
});

test('Error Handling: Request timeout returns concise message without support number', () => {
  const errTimeout = {
    code: 'ECONNABORTED',
    message: 'timeout of 15000ms exceeded',
  };

  const result = parseRegistrationError(errTimeout);
  assert.equal(
    result.generalError,
    'Registration request timed out. Please check your internet connection and try again.'
  );
  // Verify it does NOT tell students to contact support for a timeout
  assert.equal(result.generalError.includes(SUPPORT_PHONE), false);
  assert.deepEqual(result.fieldErrors, {});
});

test('Error Handling: HTTP 413 Payload Too Large returns clear file size limits', () => {
  const err413 = {
    response: {
      status: 413,
      data: 'Request Entity Too Large',
    },
  };

  const result = parseRegistrationError(err413);
  assert.equal(
    result.generalError,
    'Uploaded files are too large. Please ensure photo is under 3 MB, resume is under 3.5 MB, and combined attachments do not exceed 4 MB.'
  );
});

test('Error Handling: HTTP 429 Too Many Requests returns rate-limiting guidance', () => {
  const err429 = {
    response: {
      status: 429,
      data: { detail: 'Request was throttled.' },
    },
  };

  const result = parseRegistrationError(err429);
  assert.equal(
    result.generalError,
    'Too many registration attempts. Please wait a moment and try again.'
  );
  assert.deepEqual(result.fieldErrors, {});
});

test('Error Handling: HTTP 500 Internal Server Error provides student-friendly message and support fallback', () => {
  const err500 = {
    response: {
      status: 500,
      data: 'Internal Server Error',
    },
  };

  const result = parseRegistrationError(err500);
  assert.equal(
    result.generalError,
    `Our registration server encountered an unexpected error. Please try again shortly. If the issue persists, contact support at ${SUPPORT_PHONE}.`
  );
});

test('Error Handling: HTTP 502/503/504 Server / Gateway Unavailable provides student-friendly message and support fallback', () => {
  const err503 = {
    response: {
      status: 503,
      data: 'Service Unavailable',
    },
  };

  const result503 = parseRegistrationError(err503);
  assert.equal(
    result503.generalError,
    `The registration server is temporarily unavailable. Please try again in a few moments. If the issue persists, contact support at ${SUPPORT_PHONE}.`
  );

  const err504 = {
    response: {
      status: 504,
      data: 'Gateway Timeout',
    },
  };

  const result504 = parseRegistrationError(err504);
  assert.equal(
    result504.generalError,
    `The registration server is temporarily unavailable. Please try again in a few moments. If the issue persists, contact support at ${SUPPORT_PHONE}.`
  );
});

test('Error Handling: Sensitive technical details, SQL errors, and stack traces are sanitized and never exposed', () => {
  const rawLeak = 'Traceback (most recent call last):\nFile "views.py", line 42, in post\ndjango.db.utils.OperationalError: connection to server at "postgres.pooler.supabase.com" failed';
  const sanitized = sanitizeErrorMessage(rawLeak);

  assert.equal(sanitized.includes('Traceback'), false);
  assert.equal(sanitized.includes('OperationalError'), false);
  assert.equal(sanitized.includes('postgres'), false);
  assert.equal(sanitized.includes('supabase'), false);
  assert.equal(
    sanitized,
    `A server error occurred. Please try again shortly or contact support at ${SUPPORT_PHONE}.`
  );

  const errWithLeak = {
    response: {
      status: 400,
      data: {
        detail: 'psycopg2.errors.UniqueViolation: duplicate key value violates unique constraint "accounts_user_email_key"',
      },
    },
  };

  const parsed = parseRegistrationError(errWithLeak);
  assert.equal(parsed.generalError.includes('psycopg2'), false);
  assert.equal(parsed.generalError.includes('accounts_user_email_key'), false);
  assert.equal(
    parsed.generalError,
    `A server error occurred. Please try again shortly or contact support at ${SUPPORT_PHONE}.`
  );
});

test('Error Handling: Standard safe validation errors pass through sanitizeErrorMessage cleanly', () => {
  assert.equal(sanitizeErrorMessage('Full name is required.'), 'Full name is required.');
  assert.equal(sanitizeErrorMessage('Password must be at least 6 characters.'), 'Password must be at least 6 characters.');
  assert.equal(sanitizeErrorMessage('Photo must be 250 KB or smaller. Please choose a smaller image.'), 'Photo must be 250 KB or smaller. Please choose a smaller image.');
  assert.equal(sanitizeErrorMessage('Resume file size exceeds 5MB limit.'), 'Resume file size exceeds 5MB limit.');
});
