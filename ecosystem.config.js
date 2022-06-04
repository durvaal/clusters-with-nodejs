module.exports = {
  apps: [
    {
      name: "single-process",
      script: "src/single-process.ts",
      instances: 0,
      exec_mode: "cluster",
    },
    {
      name: "multi-process",
      script: "src/multi-process.ts",
      instances: 0,
      exec_mode: "cluster",
    }
  ],
};
