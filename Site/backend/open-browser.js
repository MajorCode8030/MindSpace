const { spawn } = require("child_process");

const url = process.argv[2] || "http://localhost:4000/";

function openUrl(target) {
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", target], {
      detached: true,
      stdio: "ignore",
    }).unref();
    return;
  }

  const command = process.platform === "darwin" ? "open" : "xdg-open";
  spawn(command, [target], {
    detached: true,
    stdio: "ignore",
  }).unref();
}

openUrl(url);
