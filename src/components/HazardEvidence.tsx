import { useRef, useState } from "react";
import { Camera, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { preparePhoto } from "@/lib/camera-photo";
import { toast } from "sonner";

export default function HazardEvidence({ photo, onChange }: { photo?: string; onChange: (photo?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const attach = async (file?: File) => {
    if (!file) return;
    setProcessing(true);
    try {
      const prepared = await preparePhoto(file);
      onChange(`data:${prepared.mimeType};base64,${prepared.image}`);
      setOpen(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not attach photo."); }
    finally { setProcessing(false); }
  };
  return (
    <div className="space-y-2">
      <input ref={camera} aria-label="Take hazard photo" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { void attach(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={gallery} aria-label="Upload hazard photo" type="file" accept="image/*" className="hidden" onChange={(e) => { void attach(e.target.files?.[0]); e.target.value = ""; }} />
      <Button type="button" variant="outline" disabled={processing} onClick={() => setOpen(true)} className="w-full min-h-12 border-primary/30 bg-primary/15 text-primary hover:bg-primary/25"><Camera />{processing ? "Preparing photo..." : "Attach Hazard Photo"}</Button>
      {photo && <>
        <img src={photo} alt="Attached hazard evidence" className="w-full h-40 object-contain rounded-md bg-muted border border-unsafe/30" />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-unsafe bg-unsafe/10 border border-unsafe/30 rounded px-2 py-1">Hazard Evidence Attached</span>
          <div className="flex shrink-0">
            <Button variant="ghost" size="icon" aria-label="Replace hazard photo" title="Replace hazard photo" disabled={processing} onClick={() => setOpen(true)}><RefreshCw /></Button>
            <Button variant="ghost" size="icon" aria-label="Remove hazard photo" title="Remove hazard photo" disabled={processing} onClick={() => onChange(undefined)} className="text-unsafe"><Trash2 /></Button>
          </div>
        </div>
      </>}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md p-4 pb-8 space-y-3">
            <DrawerHeader><DrawerTitle>Hazard Evidence</DrawerTitle><DrawerDescription>Attach a photo to this checklist item.</DrawerDescription></DrawerHeader>
            <Button variant="outline" disabled={processing} className="w-full min-h-12" onClick={() => camera.current?.click()}><Camera />Take Photo</Button>
            <Button variant="outline" disabled={processing} className="w-full min-h-12" onClick={() => gallery.current?.click()}><ImagePlus />Upload from Gallery/Files</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}