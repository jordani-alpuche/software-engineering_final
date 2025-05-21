module.exports = {
  apps: [
    {
      name: "GateApp",
      script: "npm",
      args: "run build-and-start",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
