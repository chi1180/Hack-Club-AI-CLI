import figlet from "figlet";
import { HERO_TEXT } from "../config";

export async function Hero() {
  const text = await figlet.text(HERO_TEXT);
  console.log(text);
}
