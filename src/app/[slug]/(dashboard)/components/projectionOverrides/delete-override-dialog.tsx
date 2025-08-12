"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  overrideId: string;
  onSuccess?: () => void;
}

export function DeleteOverrideDialog({
  open,
  onOpenChange,
  overrideId,
  onSuccess,
}: DeleteOverrideDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/projected-overrides/${overrideId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete override");
      }

      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Error deleting override:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Projection Override</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this override? The original
            projection values will be restored.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Override"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
