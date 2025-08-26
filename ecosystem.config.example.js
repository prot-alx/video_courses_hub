module.exports = {
  apps: [
    {
      name: "video-courses",
      script: "server.mjs", // Используем наш HTTPS сервер
      cwd: "/var/www/video-courses-mvp", // Путь к проекту на сервере
      instances: 2,
      exec_mode: "cluster",
      node_args: "--max-old-space-size=2048",
      env: {
        NODE_ENV: "production"
        // Остальные переменные будут загружены из .env файла автоматически
      },
      log_file: "/var/log/pm2/video-courses.log",
      out_file: "/var/log/pm2/video-courses-out.log", 
      error_file: "/var/log/pm2/video-courses-error.log",
      time: true,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: "10s",
      watch: false,
      ignore_watch: ["node_modules", "uploads", ".git", "*.pem"]
    }
  ]
};