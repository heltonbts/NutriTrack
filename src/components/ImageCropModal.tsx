"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Check, X, ZoomIn, ZoomOut } from "lucide-react";

async function getCroppedBlob(imageSrc: string, cropArea: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height,
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas vazio"))),
      "image/jpeg",
      0.92,
    ),
  );
}

interface ImageCropModalProps {
  imageSrc: string;
  onConfirm: (croppedFile: File, previewUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  imageSrc,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], "workout.jpg", { type: "image/jpeg" });
      const preview = URL.createObjectURL(blob);
      onConfirm(file, preview);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={false}
          style={{
            containerStyle: { background: "#000" },
            cropAreaStyle: { borderColor: "#fff", borderWidth: 2 },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="bg-black px-6 pt-4 pb-2 flex items-center gap-3">
        <ZoomOut className="w-4 h-4 text-white/60 shrink-0" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-white"
        />
        <ZoomIn className="w-4 h-4 text-white/60 shrink-0" />
      </div>

      {/* Actions */}
      <div className="bg-black px-6 pb-8 pt-2 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10"
          onClick={onCancel}
          disabled={processing}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          className="flex-1 bg-white text-black hover:bg-white/90 font-semibold"
          onClick={handleConfirm}
          disabled={processing}
        >
          <Check className="w-4 h-4 mr-2" />
          {processing ? "Processando..." : "Usar foto"}
        </Button>
      </div>
    </div>
  );
}
