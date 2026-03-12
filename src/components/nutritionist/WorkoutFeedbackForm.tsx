"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function WorkoutFeedbackForm({
  workoutId,
  hasFeedback,
}: {
  workoutId: string;
  hasFeedback: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit() {
    if (!content.trim()) return;
    setLoading(true);
    await fetch("/api/nutritionist/workout-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutId, feedback: content }),
    });
    setLoading(false);
    setContent("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
      >
        <MessageSquare className="w-4 h-4" />
        {hasFeedback ? "Atualizar feedback" : "Enviar feedback"}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Escreva um feedback sobre o treino do paciente..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={loading || !content.trim()}>
          {loading ? "Enviando..." : "Salvar feedback"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
