import { GameProvider } from "@/contexts/GameContext";

export const metadata = {
  title: "Guess the Year | NTTT",
  description: "Learn to identify tango recordings by their era",
};

export default function YearLearnLayout({ children }) {
  return <GameProvider>{children}</GameProvider>;
}
