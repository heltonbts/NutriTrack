"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Dumbbell, Loader2, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { workoutFeelings, workoutTypeLabels } from "@/lib/workouts";
import ImageCropModal from "@/components/ImageCropModal";

export default function NewWorkoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [activityType, setActivityType] = useState("GYM");
  const [feeling, setFeeling] = useState("");
  const [notes, setNotes] = useState("");
  const [checkedIn, setCheckedIn] = useState(true);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // abre o modal de crop com a imagem original
    setCropSrc(URL.createObjectURL(file));
    // reset input para permitir reselecionar o mesmo arquivo
    e.target.value = "";
  }

  function handleCropConfirm(croppedFile: File, previewUrl: string) {
    setPhoto(croppedFile);
    setPhotoPreview(previewUrl);
    setCropSrc(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (photo) formData.append("photo", photo);
      formData.append("activityType", activityType);
      formData.append("feeling", feeling);
      formData.append("notes", notes);
      formData.append("checkedIn", String(checkedIn));

      const res = await fetch("/api/workouts", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/dashboard/patient/workouts");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Modal de crop — tela cheia */}
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/patient/workouts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Check-in de Treino</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Foto do treino</CardTitle>
            </CardHeader>
            <CardContent>
              {photoPreview ? (
                <div className="space-y-2">
                  {/* preview 1:1 */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={photoPreview}
                      alt="Preview do treino"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* botão de editar */}
                  <label className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
                    <Pencil className="w-4 h-4" />
                    Trocar foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                      capture="environment"
                    />
                  </label>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    capture="environment"
                  />
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-brand-cyan/50 transition-colors">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">Adicionar foto do treino</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Opcional: academia, corrida, bike, espelho ou ambiente
                    </p>
                  </div>
                </label>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Check-in</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedIn}
                  onChange={(e) => setCheckedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-cyan focus:ring-brand-cyan"
                />
                <div>
                  <p className="font-bold text-gray-900">Treino concluído</p>
                  <p className="text-xs text-gray-500 font-medium">Marque para confirmar sua atividade.</p>
                </div>
              </label>

              <div className="space-y-2">
                <Label>Tipo de atividade fisica</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(workoutTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Como voce se sentiu?</Label>
                <Select value={feeling} onValueChange={setFeeling}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma sensacao" />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutFeelings.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Relato do treino</Label>
                <Textarea
                  placeholder="O que voce treinou, como foi, se teve dificuldade, energia, dor ou algo que queira registrar."
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-brand-magenta hover:bg-brand-magenta-dark text-white h-12 font-bold"
            disabled={loading || !checkedIn}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Salvando check-in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                <span>Finalizar Check-in</span>
              </div>
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
