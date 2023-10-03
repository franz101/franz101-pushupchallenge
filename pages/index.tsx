import { Welcome } from "../components/Welcome/Welcome";
import { ColorSchemeToggle } from "../components/ColorSchemeToggle/ColorSchemeToggle";
import { BadgeCard } from "../components/BadgeCard/BadgeCard";

export default function HomePage() {
  return (
    <>
      <BadgeCard />
      <ColorSchemeToggle />
    </>
  );
}
