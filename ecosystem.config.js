module.exports = {
  apps: [
    {
      name: "infinity-forex-platform",

      script: "node_modules/next/dist/bin/next",
      args: "start",

      instances: "max",
      exec_mode: "cluster",

      env: {
        NODE_ENV: "production",
        PORT: 3000
      },

      // ======================
      // RESTART STRATEGY
      // ======================
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      min_uptime: "10s",

      // ======================
      // MEMORY PROTECTION
      // ======================
      max_memory_restart: "500M",

      // ======================
      // LOGGING
      // ======================
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      time: true,

      // ======================
      // SAFETY
      // ======================
      watch: false,
      kill_timeout: 5000,
      listen_timeout: 8000
    }
  ]
};
