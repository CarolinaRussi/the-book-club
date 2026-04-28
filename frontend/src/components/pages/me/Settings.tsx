import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { cn } from "../../../lib/utils";
import {
  type ClubThemeId,
  getStoredClubTheme,
  persistClubTheme,
} from "../../../utils/clubTheme";

const THEMES: {
  id: ClubThemeId;
  title: string;
  description: string;
  swatches: string[];
}[] = [
  {
    id: "classic",
    title: "Clássico",
    description: "Vinho, terracota e tons quentes do clube.",
    swatches: ["#be2c3f", "#d16a47"],
  },
  {
    id: "oceanic",
    title: "Oceânico",
    description: "Azuis profundos e contraste frio.",
    swatches: ["#28278b", "#4777d1"],
  },
  {
    id: "greenery",
    title: "Natureza",
    description: "Verdes e palette fresca.",
    swatches: ["#198a42", "#47d165"],
  },
];

export default function Settings() {
  const [selected, setSelected] = useState<ClubThemeId>(() =>
    getStoredClubTheme(),
  );

  const handleSelect = (id: ClubThemeId) => {
    setSelected(id);
    persistClubTheme(id);
  };

  return (
    <div className="flex flex-col w-full mt-6">
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Tema do clube</CardTitle>
          <CardDescription>
            Escolha a paleta de cores da interface. A preferência é salva neste
            navegador e aplicada sempre que você acessar o app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            role="radiogroup"
            aria-label="Tema do clube"
          >
            {THEMES.map((t) => {
              const isActive = selected === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => handleSelect(t.id)}
                  className={cn(
                    "text-left rounded-xl border p-4 transition-colors",
                    "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "border-primary ring-2 ring-primary/30 bg-card"
                      : "border-border bg-card/50",
                  )}
                >
                  <div className="flex gap-1.5 mb-3">
                    {t.swatches.map((color) => (
                      <span
                        key={color}
                        className="h-8 flex-1 rounded-md shadow-inner border border-black/5"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <p className="font-semibold text-foreground">{t.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
