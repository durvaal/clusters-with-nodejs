import express, { Request, Response } from 'express';
import cluster, { Worker } from 'cluster';
import os from 'os';

/**
 * Mimics some intense server-side work
 */
function intenseWork(req: Request): number {
  let n: number = parseInt(req.params.n);
  let count: number = 0;

  if (n > 5000000000) n = 5000000000;

  for (let i = 0; i <= n; i++) {
    count += i;
  }

  return count;
}

function createClusters(): void {
  const cores: number = os.cpus().length;

  console.log(`Total cores: ${cores}`);
  console.log(`Primary process ${process.pid} is running`);

  for (let i = 0; i < cores; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker: Worker, code) => {
    console.log(`Worker ${worker.process.pid} exited with code ${code}`);
    console.log('Fork new worker!');
    cluster.fork();
  });
}

function start(): void {
  if (cluster.isPrimary) {
    createClusters();
  } else {
    const app = express();
    const port: number = 3002;
    const baseAPI: string = '/api/v1';

    app.get("/", (_, res: Response) => {
      res.send("Hello World!");
    });
  
    app.get(`${baseAPI}/intense/:n`, (req: Request, res: Response) => {
      console.time('intense');
      const count: number = intenseWork(req);
      console.timeEnd('intense');
      res.send(`Final count is ${count}`);
    });
  
    app.listen(port, () => {
      console.log(`App listening on port ${port} with worker ${process.pid}`);
    });
  }
};

start();
