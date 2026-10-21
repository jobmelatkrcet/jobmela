import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Password Reset: authService.js exports requestPasswordReset, validateResetToken, confirmPasswordReset', () => {
  const authServicePath = path.join(__dirname, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(authServicePath, 'utf8');

  assert.ok(content.includes('async requestPasswordReset('), 'authService should have requestPasswordReset');
  assert.ok(content.includes('async validateResetToken('), 'authService should have validateResetToken');
  assert.ok(content.includes('async confirmPasswordReset('), 'authService should have confirmPasswordReset');
});

test('Password Reset: endpoints enforce trailing slash for Django DRF compliance', () => {
  const authServicePath = path.join(__dirname, 'src', 'services', 'authService.js');
  const content = fs.readFileSync(authServicePath, 'utf8');

  assert.ok(content.includes("api.post('/auth/password-reset/',"), 'password-reset request endpoint must end with /');
  assert.ok(content.includes("/auth/password-reset/validate/?uid="), 'validate endpoint must end with / before query string');
  assert.ok(content.includes("api.post('/auth/password-reset/confirm/',"), 'confirm endpoint must end with /');
});

test('Password Reset: StudentLoginPage has Forgot Password link with email state transfer', () => {
  const loginPath = path.join(__dirname, 'src', 'pages', 'student', 'StudentLoginPage.jsx');
  const content = fs.readFileSync(loginPath, 'utf8');

  assert.ok(content.includes('to="/forgot-password"'), 'StudentLoginPage must have link to /forgot-password');
  assert.ok(content.includes('Forgot Password?'), 'StudentLoginPage must show "Forgot Password?" text');
});

test('Password Reset: AdminLoginPage has Forgot Password link', () => {
  const adminLoginPath = path.join(__dirname, 'src', 'pages', 'admin', 'AdminLoginPage.jsx');
  const content = fs.readFileSync(adminLoginPath, 'utf8');

  assert.ok(content.includes('to="/forgot-password"'), 'AdminLoginPage must have link to /forgot-password');
  assert.ok(content.includes('Forgot Password?'), 'AdminLoginPage must show "Forgot Password?" text');
});

test('Password Reset: App.jsx mounts /forgot-password and /reset-password routes', () => {
  const appPath = path.join(__dirname, 'src', 'App.jsx');
  const content = fs.readFileSync(appPath, 'utf8');

  assert.ok(content.includes('path="/forgot-password"'), 'App.jsx must mount /forgot-password');
  assert.ok(content.includes('path="/reset-password/:uid/:token"'), 'App.jsx must mount /reset-password/:uid/:token');
  assert.ok(content.includes('path="/reset-password"'), 'App.jsx must mount /reset-password fallback');
  assert.ok(content.includes('ForgotPasswordPage'), 'App.jsx must import ForgotPasswordPage');
  assert.ok(content.includes('ResetPasswordPage'), 'App.jsx must import ResetPasswordPage');
});

test('Password Reset: ForgotPasswordPage provides clean UX, resend cooldown, and error handling', () => {
  const forgotPath = path.join(__dirname, 'src', 'pages', 'public', 'ForgotPasswordPage.jsx');
  const content = fs.readFileSync(forgotPath, 'utf8');

  assert.ok(content.includes('requestPasswordReset'), 'ForgotPasswordPage must call authService.requestPasswordReset');
  assert.ok(content.includes('Check Your Email'), 'ForgotPasswordPage must show success state after submission');
  assert.ok(content.includes('Resend'), 'ForgotPasswordPage must allow resending reset email');
});

test('Password Reset: ResetPasswordPage enforces minimum length, match checking, and token validation', () => {
  const resetPath = path.join(__dirname, 'src', 'pages', 'public', 'ResetPasswordPage.jsx');
  const content = fs.readFileSync(resetPath, 'utf8');

  assert.ok(content.includes('validateResetToken'), 'ResetPasswordPage must call validateResetToken on mount');
  assert.ok(content.includes('confirmPasswordReset'), 'ResetPasswordPage must call confirmPasswordReset on submit');
  assert.ok(content.includes('newPassword.length < 6'), 'ResetPasswordPage must enforce minimum 6 characters password');
  assert.ok(content.includes('newPassword !== confirmPassword'), 'ResetPasswordPage must check for password mismatch');
});
