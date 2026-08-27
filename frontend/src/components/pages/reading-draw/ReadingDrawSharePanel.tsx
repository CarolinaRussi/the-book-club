import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { buildReadingDrawShareUrl } from "@/utils/readingDrawUrl";

type ReadingDrawSharePanelProps = {
  shareCode: string;
  clubName?: string | null;
};

export default function ReadingDrawSharePanel({
  shareCode,
  clubName,
}: ReadingDrawSharePanelProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = buildReadingDrawShareUrl(shareCode);
  const shareText = clubName
    ? `Sorteio da próxima leitura no ${clubName}: ${shareUrl}`
    : `Sorteio da próxima leitura: ${shareUrl}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copiado!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      await navigator.share({
        title: "Sorteio da próxima leitura",
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // user cancelled
    }
  };

  return (
    <div className="rounded-lg border border-secondary/40 bg-background p-4">
      <p className="mb-3 text-sm font-medium text-primary">Convidar o grupo</p>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <img
          src={qrUrl}
          alt="QR code do sorteio"
          width={180}
          height={180}
          className="rounded-md border border-muted bg-white p-2"
        />
        <div className="flex w-full flex-col gap-2">
          <p className="break-all text-xs text-muted-foreground">{shareUrl}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "Copiado" : "Copiar link"}
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
            <Button type="button" size="sm" onClick={handleNativeShare}>
              Compartilhar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
