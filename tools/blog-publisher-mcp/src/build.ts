import { spawnSync } from 'node:child_process';

export type BuildResult =
  | { ok: true }
  | { ok: false; code: 'E-BUILD-FAILED'; message: string };

/**
 * 本機 hugo build 驗證關卡（PUB-R-04/R-10）。
 * --renderToMemory 不落地 public/；失敗時回傳完整錯誤輸出，檔案處置交由呼叫端。
 */
export function runHugoBuild(opts: { siteDir: string; hugoBin?: string }): BuildResult {
  const bin = opts.hugoBin ?? 'hugo';
  // 不加 --quiet：它連 ERROR 行也吞掉，失敗時會拿不到原因（成功時本就不回傳輸出）
  const proc = spawnSync(bin, ['--renderToMemory'], {
    cwd: opts.siteDir,
    encoding: 'utf8',
    timeout: 120_000,
  });

  if (proc.error) {
    return {
      ok: false,
      code: 'E-BUILD-FAILED',
      message: `無法執行 hugo（${bin}）：${proc.error.message}`,
    };
  }
  if (proc.status !== 0) {
    return {
      ok: false,
      code: 'E-BUILD-FAILED',
      message: `hugo build 失敗（exit ${proc.status}）：\n${proc.stderr}${proc.stdout}`.trim(),
    };
  }
  return { ok: true };
}
