import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Inspect CompanyApplicationGuideModal.jsx
const guideModalPath = path.join(__dirname, 'src', 'components', 'CompanyApplicationGuideModal.jsx');
const guideModalSource = fs.readFileSync(guideModalPath, 'utf8');

test('Guide Modal: Component exists and includes all required 6 walkthrough steps', () => {
  assert.ok(fs.existsSync(guideModalPath), 'CompanyApplicationGuideModal.jsx must exist');

  // Step 1: Visit portal
  assert.match(
    guideModalSource,
    /https:\/\/jobmela\.vercel\.app\/?/i,
    'Step 1 must include visit to https://jobmela.vercel.app/'
  );

  // Step 2: Register details
  assert.match(
    guideModalSource,
    /register with accurate personal,\s*educational,\s*and contact details/i,
    'Step 2 must instruct registering with personal, educational, and contact details'
  );

  // Step 3: Create password
  assert.match(
    guideModalSource,
    /create a password during registration/i,
    'Step 3 must instruct creating a password during registration'
  );

  // Step 4: Log in
  assert.match(
    guideModalSource,
    /log in using the registered email address and password whenever needed/i,
    'Step 4 must instruct logging in using registered email and password'
  );

  // Step 5: Open companies
  assert.match(
    guideModalSource,
    /open the companies section/i,
    'Step 5 must instruct opening the Companies section'
  );

  // Step 6: Apply individually
  assert.match(
    guideModalSource,
    /apply to preferred companies individually and verify successful submission/i,
    'Step 6 must instruct applying to preferred companies individually and verifying submission'
  );
});

test('Guide Modal: Contains required prominent important warning and Go to Companies button', () => {
  assert.match(
    guideModalSource,
    /registration alone does not mean you have applied to companies/i,
    'Must include warning that registration alone does not mean applied'
  );

  assert.match(
    guideModalSource,
    /complete your company applications as soon as possible/i,
    'Must instruct completing company applications as soon as possible'
  );

  assert.match(
    guideModalSource,
    /id=["']guide-go-to-companies-btn["']/,
    'Must include prominent Go to Companies button'
  );
});

// 2. Inspect HomePage.jsx
const homePath = path.join(__dirname, 'src', 'pages', 'public', 'HomePage.jsx');
const homeSource = fs.readFileSync(homePath, 'utf8');

test('HomePage: Contains highlighted How to Apply for Companies button immediately above Companies section', () => {
  assert.match(
    homeSource,
    /id=["']homepage-how-to-apply-btn["']/,
    'HomePage must contain highlighted How to Apply for Companies button'
  );
  assert.match(
    homeSource,
    /<CompanyApplicationGuideModal[\s\S]*?isOpen=\{isGuideModalOpen\}/,
    'HomePage must mount CompanyApplicationGuideModal'
  );
});

// 3. Inspect StudentDashboardPage.jsx
const dashboardPath = path.join(__dirname, 'src', 'pages', 'student', 'StudentDashboardPage.jsx');
const dashboardSource = fs.readFileSync(dashboardPath, 'utf8');

test('StudentDashboardPage: Contains guide button near top and near company application section', () => {
  assert.match(
    dashboardSource,
    /id=["']student-dashboard-top-guide-btn["']/,
    'StudentDashboardPage must have guide button near the top'
  );

  assert.match(
    dashboardSource,
    /id=["']dashboard-companies-guide-btn["']/,
    'StudentDashboardPage must have guide button near featured companies section'
  );

  assert.match(
    dashboardSource,
    /<CompanyApplicationGuideModal[\s\S]*?isOpen=\{isGuideModalOpen\}/,
    'StudentDashboardPage must mount CompanyApplicationGuideModal'
  );
});

test('StudentDashboardPage: Contains Complete Your Profile card with photo & resume upload controls', () => {
  assert.match(
    dashboardSource,
    /Complete Your Profile/i,
    'Must render Complete Your Profile card'
  );

  assert.match(
    dashboardSource,
    /id=["']student-dashboard-photo-upload-btn["']/,
    'Must provide button to upload/update photograph'
  );

  assert.match(
    dashboardSource,
    /id=["']student-dashboard-resume-upload-btn["']/,
    'Must provide button to upload/update resume'
  );

  assert.match(
    dashboardSource,
    /photoPreviewUrl/,
    'Must support image preview for photograph'
  );

  assert.match(
    dashboardSource,
    /uploadingPhoto/i,
    'Must handle loading state for photo upload'
  );

  assert.match(
    dashboardSource,
    /uploadingResume/i,
    'Must handle loading state for resume upload'
  );
});

// 4. Inspect StudentWhatsAppModal.jsx
const waModalPath = path.join(__dirname, 'src', 'components', 'StudentWhatsAppModal.jsx');
const waModalSource = fs.readFileSync(waModalPath, 'utf8');

test('StudentWhatsAppModal: Includes How to Apply for Companies button and compact styling', () => {
  assert.match(
    waModalSource,
    /id=["']wa-modal-how-to-apply-btn["']/,
    'WhatsApp modal must have How to Apply for Companies button'
  );

  assert.match(
    waModalSource,
    /compact-wa-modal/,
    'WhatsApp modal must have compact styling class'
  );
});

// 5. Inspect StudentCompaniesPage.jsx and PublicCompaniesPage.jsx
const studentCompaniesPath = path.join(__dirname, 'src', 'pages', 'student', 'StudentCompaniesPage.jsx');
const studentCompaniesSource = fs.readFileSync(studentCompaniesPath, 'utf8');
const publicCompaniesPath = path.join(__dirname, 'src', 'pages', 'public', 'PublicCompaniesPage.jsx');
const publicCompaniesSource = fs.readFileSync(publicCompaniesPath, 'utf8');

test('Companies pages: Include How to Apply Guide buttons', () => {
  assert.match(
    studentCompaniesSource,
    /id=["']student-companies-guide-btn["']/,
    'StudentCompaniesPage must have guide button'
  );

  assert.match(
    publicCompaniesSource,
    /id=["']public-companies-guide-btn["']/,
    'PublicCompaniesPage must have guide button'
  );
});
