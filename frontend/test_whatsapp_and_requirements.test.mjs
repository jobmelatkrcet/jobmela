import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const waModalFile = path.join(__dirname, 'src', 'components', 'StudentWhatsAppModal.jsx');
const guideModalFile = path.join(__dirname, 'src', 'components', 'CompanyApplicationGuideModal.jsx');
const dashboardFile = path.join(__dirname, 'src', 'pages', 'student', 'StudentDashboardPage.jsx');
const layoutFile = path.join(__dirname, 'src', 'layouts', 'StudentLayout.jsx');
const floatingBtnFile = path.join(__dirname, 'src', 'components', 'WhatsAppFloatingButton.jsx');

const waModalSrc = fs.readFileSync(waModalFile, 'utf8');
const guideModalSrc = fs.readFileSync(guideModalFile, 'utf8');
const dashboardSrc = fs.readFileSync(dashboardFile, 'utf8');
const layoutSrc = fs.readFileSync(layoutFile, 'utf8');
const floatingBtnSrc = fs.readFileSync(floatingBtnFile, 'utf8');

test('StudentWhatsAppModal: Has WhatsApp Channel with "Everyone Join" badge', () => {
  assert.ok(waModalSrc.includes('follow-whatsapp-channel-btn'), 'Should have channel button id');
  assert.ok(waModalSrc.includes('Everyone Join'), 'Should highlight Everyone Join');
  assert.ok(waModalSrc.includes('WHATSAPP_CHANNEL_URL'), 'Should reference WHATSAPP_CHANNEL_URL');
});

test('StudentWhatsAppModal: Has WhatsApp Group with "If Not Joined" badge', () => {
  assert.ok(waModalSrc.includes('join-whatsapp-group-btn'), 'Should have group button id');
  assert.ok(waModalSrc.includes('If Not Joined'), 'Should highlight If Not Joined');
  assert.ok(waModalSrc.includes('WHATSAPP_GROUP_URL'), 'Should reference WHATSAPP_GROUP_URL');
});

test('StudentWhatsAppModal: Has Candidate Requirements option', () => {
  assert.ok(waModalSrc.includes('wa-modal-candidate-requirements-btn'), 'Should have candidate requirements button id');
  assert.ok(waModalSrc.includes('Candidate Requirements'), 'Should mention Candidate Requirements');
  assert.ok(waModalSrc.includes('onOpenRequirements'), 'Should call onOpenRequirements');
});

test('CompanyApplicationGuideModal: Has WhatsApp Channel and Group quick options', () => {
  assert.ok(guideModalSrc.includes('guide-follow-channel-btn'), 'Should have follow channel button');
  assert.ok(guideModalSrc.includes('guide-join-group-btn'), 'Should have join group button');
  assert.ok(guideModalSrc.includes('Everyone Should Join'), 'Should state Everyone Should Join');
  assert.ok(guideModalSrc.includes('If Not Joined'), 'Should state If Not Joined');
});

test('CompanyApplicationGuideModal: Has Candidate Requirements option', () => {
  assert.ok(guideModalSrc.includes('guide-view-requirements-btn'), 'Should have view requirements button');
  assert.ok(guideModalSrc.includes('Candidate Requirements for Job Mela'), 'Should mention Candidate Requirements');
  assert.ok(guideModalSrc.includes('onOpenRequirements'), 'Should accept onOpenRequirements prop');
});

test('StudentDashboardPage: Has highlighted hub with WhatsApp Channel, WhatsApp Group, and Requirements', () => {
  assert.ok(dashboardSrc.includes('dashboard-join-channel-btn'), 'Dashboard must have channel button');
  assert.ok(dashboardSrc.includes('dashboard-join-group-btn'), 'Dashboard must have group button');
  assert.ok(dashboardSrc.includes('dashboard-open-requirements-btn'), 'Dashboard must have requirements button');
  assert.ok(dashboardSrc.includes('student-dashboard-top-requirements-btn'), 'Admit card must have requirements button');
  assert.ok(dashboardSrc.includes('EVERYONE SHOULD JOIN'), 'Dashboard must clearly say EVERYONE SHOULD JOIN');
  assert.ok(dashboardSrc.includes('IF NOT JOINED'), 'Dashboard must clearly say IF NOT JOINED');
  assert.ok(dashboardSrc.includes('MANDATORY CHECKLIST'), 'Dashboard must highlight MANDATORY CHECKLIST');
  assert.ok(dashboardSrc.includes('RequirementsModal'), 'Dashboard must render RequirementsModal');
});

test('StudentLayout: Passes onOpenRequirements and renders Channel button in banner', () => {
  assert.ok(layoutSrc.includes('onOpenRequirements={() => setIsRequirementsModalOpen(true)}'), 'Layout must pass onOpenRequirements');
  assert.ok(layoutSrc.includes('student-banner-channel-btn'), 'Layout must render WhatsApp Channel in banner');
  assert.ok(layoutSrc.includes('Everyone Join'), 'Banner must indicate Everyone Join');
});

test('WhatsAppFloatingButton: Provides both WhatsApp Channel and WhatsApp Group options', () => {
  assert.ok(floatingBtnSrc.includes('WHATSAPP_CHANNEL_URL'), 'Floating button must import WHATSAPP_CHANNEL_URL');
  assert.ok(floatingBtnSrc.includes('WHATSAPP_GROUP_URL'), 'Floating button must import WHATSAPP_GROUP_URL');
  assert.ok(floatingBtnSrc.includes('floating-menu-channel-btn'), 'Floating button menu must have channel button');
  assert.ok(floatingBtnSrc.includes('floating-menu-group-btn'), 'Floating button menu must have group button');
});
