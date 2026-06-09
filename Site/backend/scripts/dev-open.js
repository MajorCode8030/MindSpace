const { spawn } = require("child_process");

const child =
  process.platform === "win32"
    ? spawn("npm run dev", {
        shell: true,
        stdio: "inherit",
        env: {
          ...process.env,
          OPEN_BROWSER: "true",
        },
      })
    : spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  env: {
    ...process.env,
    OPEN_BROWSER: "true",
  },
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
