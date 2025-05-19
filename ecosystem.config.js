module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "run build-and-start",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
