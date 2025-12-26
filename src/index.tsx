import { render } from "ink";
import Page from "./app/page";

function main() {
  const { stdin } = process;

  render(<Page />, {
    stdin,
    // Allow running in non-TTY environments
    patchConsole: false,
  });
}

/* RUN ! */
main();
