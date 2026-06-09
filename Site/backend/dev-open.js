const { spawn } = require("child_process");

const child = spawn("npm run dev", {
  shell: true,
  stdio: "inherit",
  env: {
    ...process.env,
    OPEN_BROWSER: "true",
  },
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
