import express, { Request, Response } from "express";
import { Worker } from "worker_threads";

function runThread(req: Request) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./src/intense-work.js", { workerData: req.params.n });

    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

function start(): void {
  const app = express();
  const port: number = 3002;
  const baseAPI: string = "/api/v1";

  app.get("/", (_, res: Response) => {
    res.send("Hello World!");
  });

  app.get(`${baseAPI}/intense/:n`, async (req: Request, res: Response) => {
    console.time("intense");
    const count = await runThread(req);
    console.timeEnd("intense");
    res.send(`Final count is ${count}`);
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port} with worker ${process.pid}`);
  });
};

start();
