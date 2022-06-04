import express, { Request, Response } from 'express';

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

function start(): void {
  const app = express();
  const port = 3001;
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
};

start();
