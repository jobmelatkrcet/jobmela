import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modalFile = path.join(__dirname, 'src', 'components', 'AdminBroadcastEmailModal.jsx');
const modalSource = fs.readFileSync(modalFile, 'utf8');

test('AdminBroadcastEmailModal: Has scope selection (All vs Specific/Custom Count)', () => {
  assert.ok(
    modalSource.includes('broadcast-scope-all-btn'),
    'Modal must have broadcast-scope-all-btn'
  );
  assert.ok(
    modalSource.includes('broadcast-scope-custom-btn'),
    'Modal must have broadcast-scope-custom-btn'
  );
  assert.ok(
    modalSource.includes('How many students do you want to send to?'),
    'Modal must have clear heading asking how many students to send to'
  );
});

test('AdminBroadcastEmailModal: Has input fields for recipient limit and starting candidate number', () => {
  assert.ok(
    modalSource.includes('broadcast-limit-input'),
    'Modal must have broadcast-limit-input for entering custom student count'
  );
  assert.ok(
    modalSource.includes('broadcast-start-from-input'),
    'Modal must have broadcast-start-from-input for entering starting candidate index'
  );
  assert.ok(
    modalSource.includes('Number of students to send:'),
    'Modal must label the student count input'
  );
  assert.ok(
    modalSource.includes('Start from candidate #:'),
    'Modal must label the start offset input'
  );
});

test('AdminBroadcastEmailModal: Includes quick select chips for instant counts', () => {
  assert.ok(
    modalSource.includes('First {num}'),
    'Modal should render quick chip with First {num}'
  );
  assert.match(
    modalSource,
    /\[25,\s*50,\s*100/,
    'Modal should provide chip values for 25, 50, 100'
  );
});

test('AdminBroadcastEmailModal: Forwards limit and start_from in API payload', () => {
  assert.ok(
    modalSource.includes('payload.limit = parseInt(recipientLimit, 10)'),
    'Modal must parse and forward recipientLimit as limit integer'
  );
  assert.ok(
    modalSource.includes('payload.start_from = Math.max(1, parseInt(startFrom, 10) || 1)'),
    'Modal must forward start_from in payload'
  );
});

test('AdminBroadcastEmailModal: Dynamic feedback badge and send button reflect selected count', () => {
  assert.ok(
    modalSource.includes('Send to Selected ${getRecipientCount()} Participants'),
    'Button must reflect selected recipient count'
  );
  assert.ok(
    modalSource.includes('broadcast-send-btn'),
    'Modal must have broadcast-send-btn'
  );
});

test('AdminBroadcastEmailModal: Supports vinaybyagari07@gmail.com default testing email and input', () => {
  assert.ok(
    modalSource.includes('broadcast-test-email-input'),
    'Modal must have broadcast-test-email-input for configuring test email'
  );
  assert.ok(
    modalSource.includes('vinaybyagari07@gmail.com'),
    'Modal must default to vinaybyagari07@gmail.com'
  );
  assert.ok(
    modalSource.includes('test_email: destEmail'),
    'Modal must forward test_email parameter in test dispatch payload'
  );
});

test('AdminBroadcastEmailModal: Has independent checkboxes for WhatsApp Group and WhatsApp Channel', () => {
  assert.ok(
    modalSource.includes('include-whatsapp-group-checkbox'),
    'Modal must have include-whatsapp-group-checkbox'
  );
  assert.ok(
    modalSource.includes('include-whatsapp-channel-checkbox'),
    'Modal must have include-whatsapp-channel-checkbox'
  );
  assert.ok(
    modalSource.includes('include_whatsapp_group: includeWhatsappGroup'),
    'Modal must forward include_whatsapp_group in payload'
  );
  assert.ok(
    modalSource.includes('include_whatsapp_channel: includeWhatsappChannel'),
    'Modal must forward include_whatsapp_channel in payload'
  );
  assert.ok(
    modalSource.includes('Check Both') && modalSource.includes('Uncheck Both'),
    'Modal should provide quick helper buttons for checking/unchecking both'
  );
});

test('AdminBroadcastEmailModal: Defines both subject and message states', () => {
  assert.ok(
    modalSource.includes('const [message, setMessage] = useState('),
    'Modal must have message state defined'
  );
  assert.ok(
    modalSource.includes('const [subject, setSubject] = useState('),
    'Modal must have subject state defined'
  );
});


