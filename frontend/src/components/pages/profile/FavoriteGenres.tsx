import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import type { UseFormSetValue } from "react-hook-form";
import type { IUserUpdateForm } from "@//types/IUser";

interface FavoriteGenresProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  setValue: UseFormSetValue<IUserUpdateForm>;
}
const FavoriteGenres = ({ tags, setTags, setValue }: FavoriteGenresProps) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      setValue("tags", newTags);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle className="text-2xl">Gêneros Favoritos</CardTitle>
        <CardDescription>
          Adicione os gêneros literários que você mais gosta
        </CardDescription>
        <CardContent className="p-0">
          <div className="flex gap-2 w-full">
            <input
              className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
              placeholder="Ex.: Ficção Científica, Romance..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button
              type="button"
              className="bg-primary text-background font-semibold rounded-lg p-2 w-30 cursor-pointer"
              onClick={addTag}
            >
              Adicionar
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="cursor-pointer p-2"
                onClick={() => removeTag(tag)}
              >
                {tag} ✕
              </Badge>
            ))}
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  );
};
export default FavoriteGenres;
