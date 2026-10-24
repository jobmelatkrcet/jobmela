import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modalPath = path.join(__dirname, 'src', 'components', 'AdminBroadcastEmailModal.jsx');
const modalSource = fs.readFileSync(modalPath, 'utf8');

test('Admin Broadcast: Supports resumable batch execution loop and progress tracking', () => {
  assert.match(
    modalSource,
    /batchProgress/i,
    'Modal must maintain batchProgress state for real-time progress tracking'
  );
  assert.match(
    modalSource,
    /action:\s*['"]resume['"]/i,
    'Modal must support auto-resuming remaining batches until completion'
  );
  assert.match(
    modalSource,
    /batch_size:\s*(?:25|50)/i,
    'Modal must dispatch in safe batches of 25-50 to prevent serverless timeouts'
  );
});

test('Admin Broadcast: Renders live progress bar and pause control', () => {
  assert.match(
    modalSource,
    /Sending Broadcast in Batches/i,
    'Modal must indicate batch sending to the administrator'
  );
  assert.match(
    modalSource,
    /Pause After Batch/i,
    'Modal must provide a pause button to safely stop between batches'
  );
  assert.match(
    modalSource,
    /Delivered:[\s\S]*?remaining/i,
    'Modal must display delivered count and remaining count during execution'
  );
});

test('Admin Broadcast: Detects active in-progress campaign and renders resume banner', () => {
  assert.match(
    modalSource,
    /stats\?\.active_campaign/i,
    'Modal must detect active campaign from backend statistics'
  );
  assert.match(
    modalSource,
    /handleResumeCampaign/i,
    'Modal must provide handleResumeCampaign to continue an unfinished campaign'
  );
  assert.match(
    modalSource,
    /handleCancelCampaign/i,
    'Modal must provide handleCancelCampaign to discard an unfinished campaign'
  );
});

const adminServicePath = path.join(__dirname, 'src', 'services', 'adminService.js');
const adminServiceSource = fs.readFileSync(adminServicePath, 'utf8');

test('Admin Service: Exposes broadcast email endpoints', () => {
  assert.match(
    adminServiceSource,
    /getBroadcastEmailStats\(\)/,
    'adminService must have getBroadcastEmailStats'
  );
  assert.match(
    adminServiceSource,
    /sendBroadcastEmail\(payload\)/,
    'adminService must have sendBroadcastEmail'
  );
});
