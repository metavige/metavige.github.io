import { spawnSync } from 'node:child_process';

export type GitResult =
  | { ok: true }
  | { ok: false; code: 'E-PUSH-REJECTED'; message: string };

function git(repoDir: string, ...args: string[]) {
  const proc = spawnSync('git', args, { cwd: repoDir, encoding: 'utf8', timeout: 120_000 });
  return { status: proc.status, stderr: proc.stderr ?? '', stdout: proc.stdout ?? '', error: proc.error };
}

/**
 * 以 repo 慣例的英文 commit message commit 該 bundle 並 push（PUB-R-05/R-11）。
 * 只 commit bundle 路徑，不掃入其他變更；push 被拒回 E-PUSH-REJECTED、本地 commit 保留，絕不 force。
 */
export function commitAndPush(opts: {
  repoDir: string;
  bundleDir: string;
  title: string;
}): GitResult {
  const add = git(opts.repoDir, 'add', '--', opts.bundleDir);
  if (add.status !== 0) {
    throw new Error(`git add 失敗：${add.stderr}${add.error?.message ?? ''}`);
  }

  const message = `doc: add new article "${opts.title}"`;
  const commit = git(opts.repoDir, 'commit', '-m', message, '--', opts.bundleDir);
  if (commit.status !== 0) {
    throw new Error(`git commit 失敗：${commit.stderr}${commit.stdout}`);
  }

  const push = git(opts.repoDir, 'push', 'origin', 'master');
  if (push.status !== 0) {
    return {
      ok: false,
      code: 'E-PUSH-REJECTED',
      message: `push 被拒（本地 commit 已保留，不會 force push）：\n${push.stderr}${push.error?.message ?? ''}`.trim(),
    };
  }
  return { ok: true };
}
