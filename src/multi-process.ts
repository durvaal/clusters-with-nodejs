import express, { Request, Response } from 'express';
import cluster, { Worker } from 'cluster';
import os from 'os';

/**
 * Mimics some intense server-side work
 */
function intenseWork(req: Request): number {
  let n = parseInt(req.params.n);
  let count = 0;

  if (n > 5000000000) n = 5000000000;

  for (let i = 0; i <= n; i++) {
    count += i;
  }

  return count;
}

function createClusters(): void {
  const cores = os.cpus().length;

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
    const port = 3002;
    const baseAPI = '/api/v1';

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });
  
    app.get(`${baseAPI}/intense/:n`, (req: Request, res: Response) => {
      console.time('intense');
      const count = intenseWork(req);
      console.timeEnd('intense');
      res.send(`Final count is ${count}`);
    });
  
    app.listen(port, () => {
      console.log(`App listening on port ${port} with worker ${process.pid}`);
    });
  }
};

start();
