import { useState } from "react";
import { FolderOpen, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import type { InspectionDraft } from "@/lib/inspection-drafts";

export default function SavedInspectionDrafts({ open, onOpenChange, drafts, onLoad, onDelete }: { open: boolean; onOpenChange: (open: boolean) => void; drafts: InspectionDraft[]; onLoad: (draft: InspectionDraft) => void; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState<InspectionDraft | null>(null);
  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85dvh] flex flex-col rounded-lg">
        <DialogHeader><DialogTitle>Saved Inspection Drafts</DialogTitle><DialogDescription>{drafts.length} saved on this device</DialogDescription></DialogHeader>
        <div className="overflow-y-auto min-h-0 space-y-3 pr-1">
          {drafts.length === 0 && <div className="py-10 text-center text-muted-foreground"><FolderOpen className="mx-auto mb-3 h-8 w-8" /><p>No saved drafts yet.</p></div>}
          {drafts.map((draft) => <article key={draft.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="space-y-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground break-words">{draft.snapshot.projectName || "Untitled project"}</h3>
              <p className="text-sm text-muted-foreground break-words">Assessor: {draft.snapshot.assessorName || "Not specified"}</p>
              <p className="text-xs text-muted-foreground">{new Date(draft.savedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</p>
              <p className="text-sm font-medium text-safe">{draft.verified}/{draft.total} items verified</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onLoad(draft)}><Play />Resume / Load</Button>
              <Button size="sm" variant="outline" className="text-unsafe border-unsafe/30" onClick={() => setDeleting(draft)}><Trash2 />Delete</Button>
            </div>
          </article>)}
        </div>
      </DialogContent>
    </Dialog>
    <AlertDialog open={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
      <AlertDialogContent className="max-w-sm rounded-lg"><AlertDialogHeader><AlertDialogTitle>Delete Draft?</AlertDialogTitle><AlertDialogDescription>Delete the saved draft for {deleting?.snapshot.projectName || "this project"}? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (deleting) onDelete(deleting.id); setDeleting(null); }}>Delete Draft</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}