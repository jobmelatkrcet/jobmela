import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Inspect StudentWhatsAppModal.jsx
const modalPath = path.join(__dirname, 'src', 'components', 'StudentWhatsAppModal.jsx');
const modalSource = fs.readFileSync(modalPath, 'utf8');

test('WhatsApp Popup Modal: Component exists and has required channel notice messaging', () => {
  assert.ok(fs.existsSync(modalPath), 'StudentWhatsAppModal.jsx must exist');
  assert.match(
    modalSource,
    /WhatsApp Channel/i,
    'Modal must explicitly instruct students to follow WhatsApp Channel'
  );
  assert.match(
    modalSource,
    /Everyone Join/i,
    'Modal must highlight Everyone Join for the channel'
  );
  assert.ok(
    !modalSource.includes('chat.whatsapp.com'),
    'Modal must NOT have WhatsApp group link (chat.whatsapp.com)'
  );
});

test('WhatsApp Popup Modal: Action buttons provide Follow Channel and Dismiss option', () => {
  assert.match(
    modalSource,
    /id=["']follow-whatsapp-channel-btn["']/,
    'Modal must have Follow WhatsApp Channel button'
  );
  assert.match(
    modalSource,
    /id=["']already-joined-whatsapp-btn["']/,
    'Modal must have Already Following / Close button'
  );
  assert.match(
    modalSource,
    /localStorage\.setItem\(storageKey,\s*['"]true['"]\)/,
    'Modal must save followed status to localStorage when student follows channel'
  );
  assert.match(
    modalSource,
    /window\.open\(/,
    'Modal must open WhatsApp channel link in new window upon clicking follow'
  );
});

// 2. Inspect StudentLayout.jsx
const layoutPath = path.join(__dirname, 'src', 'layouts', 'StudentLayout.jsx');
const layoutSource = fs.readFileSync(layoutPath, 'utf8');

test('StudentLayout: Mounts StudentWhatsAppModal and triggers quick popup when students log in/open', () => {
  assert.match(
    layoutSource,
    /import\s+StudentWhatsAppModal\s+from\s+['"]\.\.\/components\/StudentWhatsAppModal['"]/,
    'StudentLayout must import StudentWhatsAppModal'
  );
  assert.match(
    layoutSource,
    /<StudentWhatsAppModal[\s\S]*?isOpen=\{isWhatsAppModalOpen\}/,
    'StudentLayout must render StudentWhatsAppModal'
  );
  assert.match(
    layoutSource,
    /setTimeout\(\(\)\s*=>\s*\{[\s\S]*?setIsWhatsAppModalOpen\(true\);[\s\S]*?\},\s*\d+\)/,
    'StudentLayout must quickly pop up the modal on open/login'
  );
  assert.match(
    layoutSource,
    /id=["']student-banner-channel-btn["']/,
    'StudentLayout must offer a banner trigger button for WhatsApp Channel'
  );
});

// 3. Inspect StudentLoginPage.jsx
const loginPath = path.join(__dirname, 'src', 'pages', 'student', 'StudentLoginPage.jsx');
const loginSource = fs.readFileSync(loginPath, 'utf8');

test('StudentLoginPage: Sets login flag so modal pops up quickly upon student login', () => {
  assert.match(
    loginSource,
    /sessionStorage\.setItem\(['"]jobmela_just_logged_in['"],\s*['"]true['"]\)/,
    'StudentLoginPage must record justLoggedIn in sessionStorage'
  );
  assert.match(
    loginSource,
    /navigate\(['"]\/dashboard['"],\s*\{\s*state:\s*\{\s*justLoggedIn:\s*true\s*\}\s*\}\)/,
    'StudentLoginPage must pass justLoggedIn navigation state to dashboard'
  );
});

// 4. Inspect constants.js
const constantsPath = path.join(__dirname, 'src', 'utils', 'constants.js');
const constantsSource = fs.readFileSync(constantsPath, 'utf8');

test('Constants: WHATSAPP_CHANNEL_URL is configured and WHATSAPP_GROUP_URL is removed', () => {
  assert.match(
    constantsSource,
    /export\s+const\s+WHATSAPP_CHANNEL_URL\s*=\s*['"]https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9_-]+['"]/,
    'WHATSAPP_CHANNEL_URL must be an exportable valid channel URL'
  );
  assert.ok(
    !constantsSource.includes('WHATSAPP_GROUP_URL'),
    'WHATSAPP_GROUP_URL must be removed from constants'
  );
  assert.ok(
    !constantsSource.includes('chat.whatsapp.com'),
    'chat.whatsapp.com must be removed from constants'
  );
});
