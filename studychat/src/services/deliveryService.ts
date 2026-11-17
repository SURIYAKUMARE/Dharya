/** Confirm one successful network delivery; never wait forever on a stalled transport. */
export function confirmDelivery(attempts: Promise<boolean>[], timeoutMs = 12000): Promise<boolean> {
  if (!attempts.length) return Promise.resolve(false);
  return new Promise(resolve => {
    let finished = false;
    let remaining = attempts.length;
    const finish = (success: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(success);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    attempts.forEach(attempt => {
      Promise.resolve(attempt).then(success => {
        if (success) finish(true);
      }, () => {}).finally(() => {
        remaining -= 1;
        if (!remaining) finish(false);
      });
    });
  });
}
