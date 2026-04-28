import type { ChangeEvent, FocusEvent } from "react";
import { getInitials } from "@//utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";

interface ProfilePictureUpdateProps {
  previewUrl?: string;
  profilePictureUrl?: string;
  name?: string;
  handleRemoveImage: () => void;
  fileInputRef: React.Ref<HTMLInputElement>;
  fileInputName: string;
  onFileInputBlur: (e: FocusEvent<HTMLInputElement>) => void;
  onPickImageFile: (file: File) => void;
}

const ProfilePictureUpdate = ({
  previewUrl,
  profilePictureUrl,
  name,
  handleRemoveImage,
  fileInputRef,
  fileInputName,
  onFileInputBlur,
  onPickImageFile,
}: ProfilePictureUpdateProps) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      onPickImageFile(file);
    }
  };

  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle className="text-2xl">Foto de Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="justify-items-center">
          <Avatar className="mb-4 size-30 md:size-40 lg:size-50">
            <AvatarImage
              src={previewUrl || profilePictureUrl || undefined}
              alt="Foto de perfil"
            />
            <AvatarFallback className="text-4xl text-primary" delayMs={600}>
              {getInitials(name || "")}
            </AvatarFallback>
          </Avatar>
        </div>

        <label
          htmlFor="avatarInput"
          className="mt-4 inline-flex items-center justify-center w-full rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-primary hover:text-background h-10 px-4 py-2 cursor-pointer"
        >
          Atualizar imagem
        </label>

        <input
          ref={fileInputRef}
          name={fileInputName}
          onBlur={onFileInputBlur}
          type="file"
          id="avatarInput"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          hidden={true}
        />
        <button
          type="button"
          onClick={handleRemoveImage}
          className="mt-4 inline-flex items-center justify-center w-full text-sm text-primary hover:underline cursor-pointer"
        >
          Remover foto
        </button>
      </CardContent>
    </Card>
  );
};

export default ProfilePictureUpdate;
