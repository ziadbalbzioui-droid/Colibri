import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Upload, FileImage, CheckCircle2, Loader2, X, CreditCard } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/auth";

export function CarteIdentite() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(!!profile?.carte_identite_url);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      setError("Formats acceptés : JPG, PNG, PDF.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Fichier trop lourd (max 5 Mo).");
      return;
    }
    setError(null);
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const fakeEvent = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(fakeEvent);
  }

  async function handleUpload() {
    if (!file || !user) return;
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `identites/${user.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      const { error: profileError } = await updateProfile({
        carte_identite_url: urlData.publicUrl,
      });
      if (profileError) throw new Error(profileError);

      setUploaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'envoi.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => navigate("/app/profil")}
        className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Retour au profil
      </button>

      <div className="bg-white rounded-xl border border-border p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">Pièce d'identité</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Déposez le recto de votre carte nationale d'identité ou de votre passeport.
            Ce document est requis pour valider votre identité et recevoir vos paiements.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-1">
          <p className="font-semibold">Documents acceptés</p>
          <p>· Carte nationale d'identité (recto)</p>
          <p>· Passeport (page photo)</p>
          <p>· Formats : JPG, PNG, PDF — max 5 Mo</p>
        </div>

        {uploaded ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-green-700">Document déposé avec succès</p>
            <p className="text-sm text-muted-foreground">Votre pièce d'identité est en cours de vérification par notre équipe.</p>
            <button
              onClick={() => { setUploaded(false); setFile(null); setPreview(null); }}
              className="text-sm text-primary hover:underline mt-1"
            >
              Déposer un nouveau document
            </button>
          </div>
        ) : (
          <>
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              {preview ? (
                <div className="relative w-full">
                  <img src={preview} alt="Aperçu" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="absolute top-1 right-1 bg-white border border-border rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : file ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileImage className="w-5 h-5 text-primary" />
                  <span className="font-medium">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Cliquez ou glissez votre fichier ici</p>
                    <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG ou PDF · max 5 Mo</p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Envoi en cours..." : "Envoyer le document"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
