import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import { HERO_TEXT } from "../config";

export default function Hero() {
  return (
    <Gradient name="rainbow">
      <BigText text={HERO_TEXT} />
    </Gradient>
  );
}
