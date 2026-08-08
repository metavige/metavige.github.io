import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { commitAndPush } from '../src/git.js';
import { expectedUrl } from '../src/publish.js';

let workDir: string;
let originDir: string;
let repoDir: string;

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function writeBundle(slug: string): string {
  const bundleDir = join(repoDir, 'content', 'posts', slug);
  mkdirSync(bundleDir, { recursive: true });
  writeFileSync(join(bundleDir, 'index.md'), `---\ntitle: "t"\nslug: "${slug}"\n---\n\nbody\n`);
  return bundleDir;
}

beforeEach(() => {
  workDir = mkdtempSync(join(tmpdir(), 'blog-publisher-git-'));
  originDir = join(workDir, 'origin.git');
  repoDir = join(workDir, 'repo');
  mkdirSync(originDir);
  git(workDir, 'init', '--bare', '-b', 'master', 'origin.git');
  git(workDir, 'clone', originDir, 'repo');
  git(repoDir, 'config', 'user.email', 'test@example.com');
  git(repoDir, 'config', 'user.name', 'Test');
  writeFileSync(join(repoDir, 'README.md'), 'seed\n');
  git(repoDir, 'add', 'README.md');
  git(repoDir, 'commit', '-m', 'seed');
  git(repoDir, 'push', 'origin', 'master');
});

afterEach(() => {
  // dangerous-tool-guard：不用遞迴強制刪除，改 mv 到暫存墓地目錄
  renameSync(workDir, `${workDir}.done`);
});

// PUB-R-05：英文 commit（repo 慣例格式）＋ push origin master
test('commit＋push 成功，commit message 沿用 doc: add new article 慣例', () => {
  const bundleDir = writeBundle('test-post');
  const result = commitAndPush({ repoDir, bundleDir, title: '測試文' });
  assert.equal(result.ok, true, !result.ok ? result.message : '');
  const originLog = git(originDir, 'log', '-1', '--format=%s');
  assert.equal(originLog.trim(), 'doc: add new article "測試文"');
  const files = git(originDir, 'ls-tree', '-r', '--name-only', 'master');
  assert.ok(files.includes('content/posts/test-post/index.md'));
});

// commit 只含 bundle，不掃入其他未 commit 變更
test('repo 內其他未 commit 變更不會被掃進發文 commit', () => {
  writeFileSync(join(repoDir, 'unrelated.txt'), 'dirty\n');
  const bundleDir = writeBundle('test-post');
  const result = commitAndPush({ repoDir, bundleDir, title: 't' });
  assert.equal(result.ok, true, !result.ok ? result.message : '');
  const committed = git(repoDir, 'show', '--stat', '--format=', 'HEAD');
  assert.ok(!committed.includes('unrelated.txt'), `發文 commit 不應包含 unrelated.txt：\n${committed}`);
});

// EX-D#2（PUB-R-11）：remote 領先 → E-PUSH-REJECTED、本地 commit 保留、remote 未被覆寫
test('non-fast-forward → E-PUSH-REJECTED，本地 commit 保留、remote 未被 force 覆寫', () => {
  // 造 remote 領先：另一份 clone 先推一個 commit
  const otherDir = join(workDir, 'other');
  git(workDir, 'clone', originDir, 'other');
  git(otherDir, 'config', 'user.email', 'other@example.com');
  git(otherDir, 'config', 'user.name', 'Other');
  writeFileSync(join(otherDir, 'ahead.txt'), 'ahead\n');
  git(otherDir, 'add', 'ahead.txt');
  git(otherDir, 'commit', '-m', 'remote ahead');
  git(otherDir, 'push', 'origin', 'master');
  const remoteHead = git(originDir, 'rev-parse', 'master').trim();

  const bundleDir = writeBundle('test-post');
  const result = commitAndPush({ repoDir, bundleDir, title: 't' });
  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.code, 'E-PUSH-REJECTED');
  // 本地 commit 保留
  const localLog = git(repoDir, 'log', '-1', '--format=%s').trim();
  assert.equal(localLog, 'doc: add new article "t"');
  // remote 未被覆寫（HEAD 仍是領先的那個 commit）
  assert.equal(git(originDir, 'rev-parse', 'master').trim(), remoteHead);
});

// PUB-R-06：預期上線 URL 依 permalink /:year/:month/:day/:slug/
test('expectedUrl 依 permalink 規則組 URL（月日補零）', () => {
  const url = expectedUrl('https://metavige.github.io', 'test-post', new Date(2026, 7, 8, 14, 30, 5));
  assert.equal(url, 'https://metavige.github.io/2026/08/08/test-post/');
});
