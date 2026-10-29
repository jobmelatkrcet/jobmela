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
const reqModalFile = path.join(__dirname, 'src', 'components', 'RequirementsModal.jsx');

const waModalSrc = fs.readFileSync(waModalFile, 'utf8');
const guideModalSrc = fs.readFileSync(guideModalFile, 'utf8');
const dashboardSrc = fs.readFileSync(dashboardFile, 'utf8');
const layoutSrc = fs.readFileSync(layoutFile, 'utf8');
const floatingBtnSrc = fs.readFileSync(floatingBtnFile, 'utf8');
const reqModalSrc = fs.readFileSync(reqModalFile, 'utf8');

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

test('StudentWhatsAppModal: Dedicated popup (not crowded with embedded requirements)', () => {
  assert.ok(waModalSrc.includes('wa-modal-continue-btn'), 'Should have continue button id');
  assert.ok(waModalSrc.includes('Next: How to Apply Guide'), 'Should prompt advance to next popup');
});

test('CompanyApplicationGuideModal: Has Next Candidate Requirements action button in footer', () => {
  assert.ok(guideModalSrc.includes('guide-next-requirements-btn'), 'Should have next requirements button in footer');
  assert.ok(guideModalSrc.includes('Next: Candidate Requirements'), 'Should state Next: Candidate Requirements');
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

test('StudentLayout: Handles sequential flow: WhatsApp cancel/close -> Apply Guide -> Candidate Requirements', () => {
  assert.ok(layoutSrc.includes('handleWhatsAppClose'), 'Layout must define handleWhatsAppClose');
  assert.ok(layoutSrc.includes('handleGuideClose'), 'Layout must define handleGuideClose');
  assert.ok(layoutSrc.includes('setIsGuideModalOpen(true)'), 'Closing WhatsApp must open Guide modal');
  assert.ok(layoutSrc.includes('setIsRequirementsModalOpen(true)'), 'Closing Guide must open Requirements modal');
  assert.ok(layoutSrc.includes('student-banner-channel-btn'), 'Layout must render WhatsApp Channel in banner');
  assert.ok(layoutSrc.includes('Everyone Join'), 'Banner must indicate Everyone Join');
});

test('RequirementsModal: Supports step indicator badge', () => {
  assert.ok(reqModalSrc.includes('stepIndicator'), 'RequirementsModal should support stepIndicator');
});

test('WhatsAppFloatingButton: Provides both WhatsApp Channel and WhatsApp Group options', () => {
  assert.ok(floatingBtnSrc.includes('WHATSAPP_CHANNEL_URL'), 'Floating button must import WHATSAPP_CHANNEL_URL');
  assert.ok(floatingBtnSrc.includes('WHATSAPP_GROUP_URL'), 'Floating button must import WHATSAPP_GROUP_URL');
  assert.ok(floatingBtnSrc.includes('floating-menu-channel-btn'), 'Floating button menu must have channel button');
  assert.ok(floatingBtnSrc.includes('floating-menu-group-btn'), 'Floating button menu must have group button');
});
