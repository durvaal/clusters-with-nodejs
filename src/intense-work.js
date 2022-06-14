const { parentPort, workerData, threadId } = require("worker_threads");

/**
 * Mimics some intense server-side work
 */

console.log(`Thread (${threadId}) Starting with worker ${process.pid}`);

let n = parseInt(workerData);
let count = 0;

if (n > 5000000000) n = 5000000000;

for (let i = 0; i <= n; i++) {
  count += i;
}

console.log(`Thread (${threadId}) Ending with worker ${process.pid}`);

parentPort?.postMessage(count);