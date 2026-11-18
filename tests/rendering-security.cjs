const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = vm.createContext({
  localStorage: { getItem() { return null; } },
  currentUser: null,
  imgMap: {},
  console: { warn() {} }
});
const config = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
const helpers = config.slice(config.indexOf('function escapeHtml('), config.indexOf('\nvar parishes ='));
vm.runInContext(helpers, context, { timeout: 1000 });
for (const file of ['home.js', 'circles.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), context, { timeout: 1000 });
}

for (const color of ['#1B3A5C', '#fff', '#abcd', '#1B3A5C80', 'var(--primary-blue)', 'var(--color-primary, #1B3A5C)']) {
  assert.equal(context.safeAvatarColor(color), color);
}
for (const color of ['red;position:fixed', '#fff\"><img src=x onerror=alert(1)>', 'url(https://example.test)', 'expression(alert(1))', null, {}, 7]) {
  assert.equal(context.safeAvatarColor(color), '#1B3A5C');
}
for (const count of [0, 7, '8', ' 9 ']) {
  assert.equal(context.safePrayerCount(count), Number(count));
}
for (const count of [-1, 2.5, Infinity, NaN, 'Infinity', '<img src=x>', [], {}, Number.MAX_SAFE_INTEGER + 1]) {
  assert.equal(context.safePrayerCount(count), 0);
}

const attack = '\"><img src=x onerror=alert(1)>';
const id = "user');globalThis.injected=true;//\"&";
const html = context.renderPWHCard({ id, data: {
  authorName: 'Friend', text: 'Prayer', authorInitials: attack,
  authorColor: attack, prayerCount: attack
}}, 0);
assert(!html.includes('<img'));
assert(html.includes('background:#1B3A5C'));
assert(html.includes('class="pw-h-count">0</span>'));
assert(html.includes('prayAndCycle(0,this.dataset.intentionId,this)'));
assert(!/onclick="[^\"]*user/.test(html));
assert(!html.includes('globalThis.injected=true;//"&'));
const decode = value => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const dataId = decode(html.match(/data-intention-id="([^\"]*)"/)[1]);
assert.equal(dataId, id);
let prayed;
context.event = { stopPropagation() {} };
context.prayAndCycle = (index, intentionId) => { prayed = { index, intentionId }; };
context.button = { dataset: { intentionId: dataId } };
vm.runInContext('(function(){event.stopPropagation();prayAndCycle(0,this.dataset.intentionId,this)}).call(button)', context, { timeout: 1000 });
assert.deepEqual(prayed, { index: 0, intentionId: id });
assert.equal(context.injected, undefined);

const message = { text: attack, name: attack, initials: attack, color: attack, time: 'Now' };
let chat = context.renderChatMsg(message);
assert(!chat.includes('<img'));
assert(chat.includes('background:var(--primary-blue)'));
context.currentUser = { uid: 'self' };
chat = context.renderChatMsg({ ...message, uid: 'self' }, id, id);
assert(!chat.includes('<img'));
assert(chat.includes('deleteMessage(this.dataset.channelKey,this.dataset.messageId,this)'));
assert.equal(decode(chat.match(/data-message-id="([^\"]*)"/)[1]), id);
assert.equal(decode(chat.match(/data-channel-key="([^\"]*)"/)[1]), id);
let deleted;
context.deleteMessage = (channelKey, messageId) => { deleted = { channelKey, messageId }; };
context.button = { dataset: { channelKey: id, messageId: id } };
vm.runInContext('(function(){deleteMessage(this.dataset.channelKey,this.dataset.messageId,this)}).call(button)', context, { timeout: 1000 });
assert.deepEqual(deleted, { channelKey: id, messageId: id });
assert.equal(context.injected, undefined);
const circlesSource = fs.readFileSync(path.join(root, 'js/circles.js'), 'utf8');
const localFeed = circlesSource.slice(circlesSource.indexOf('    localPosts.forEach('), circlesSource.indexOf('    // Feed (default/seed posts)'));
context.h = '';
context.localPosts = [{ color: attack, count: attack, initials: attack, name: attack, text: attack, time: attack }];
context.isUserBlocked = () => false;
context.svgIcons = { heart: '', bell: '' };
vm.runInContext(localFeed, context, { timeout: 1000 });
assert(!context.h.includes('<img'));
assert(context.h.includes('0 praying'));
context.h = '';
context.localPosts[0].count = 0;
vm.runInContext(localFeed, context, { timeout: 1000 });
assert(context.h.includes('0 praying'));
context.t = () => 'Translation';
const profileHeader = context.renderHomeHeader({ greeting: 'Hello', firstName: attack, initials: attack });
assert(!profileHeader.includes('><img src=x'));
console.log('Rendering regressions passed for colors, counts, local posts, profile/prayer initials and inert intention/chat identifiers.');
