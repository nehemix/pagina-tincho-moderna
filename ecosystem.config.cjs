module.exports = {
  apps: [
    {
      name: "pagina-tincho-moderna",
      script: "bun",
      args: "build/index.js",
      env: {
        PORT: 9090
      }
    }
  ]
};