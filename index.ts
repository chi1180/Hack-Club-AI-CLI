import { render } from "ink";
import App from "./src/app/app";
import { init } from "./src/lib/init";

function main() {
  const dirPath = process.cwd();
  if (dirPath) {
    init(dirPath);
  } else {
    console.error("Please provide a directory path as an argument.");
    process.exit(1);
  }
  render(App());
}

// RUN !!!
main();
