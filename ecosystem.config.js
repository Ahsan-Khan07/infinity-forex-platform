/**
 * ==========================================================
 * PM2 ECOSYSTEM CONFIG (PRODUCTION - FINTECH GRADE)
 * ==========================================================
 * - Next.js production cluster mode
 * - Safe restart strategy
 * - Memory protection
 * - Proper logging
 * - Graceful shutdown support
 */

module.exports = {
  apps: [
    {
      name: "infinity-forex-platform",

      /**
       * Next.js start command
       */
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",

      /**
       * Cluster Mode (multi-core)
       */
      instances: "max",
      exec_mode: "cluster",

      /**
       * Environment Variables
       */
      env: {
        NODE_ENV: "production",
        PORT: 3000,

        /**
         * Security Hardening
         * Avoid leaking stack traces or sourcemaps
         */
        NEXT_TELEMETRY_DISABLED: "1",
      },

      /**
       * Optional explicit production env section
       */
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: "1",
      },

      // ======================
      // RESTART STRATEGY
      // ======================
      autorestart: true,
      max_restarts: 15,
      restart_delay: 5000,
      min_uptime: "20s",

      /**
       * Exponential backoff to prevent infinite restart loop
       */
      exp_backoff_restart_delay: 200,

      // ======================
      // MEMORY PROTECTION
      // ======================
      max_memory_restart: "1G",

      // ======================
      // GRACEFUL SHUTDOWN
      // ======================
      kill_timeout: 10000,
      listen_timeout: 10000,

      /**
       * Ensures PM2 waits for Next.js to shutdown properly
       */
      wait_ready: false,

      // ======================
      // LOGGING
      // ======================
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // ======================
      // SAFETY
      // ======================
      watch: false,

      /**
       * Node Flags (Production Stability)
       */
      node_args: [
        "--max-old-space-size=2048",
      ],
    },
  ],
};
