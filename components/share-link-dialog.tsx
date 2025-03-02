"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ShareLinkDialogProps {
  proposalId: number;
}

export function ShareLinkDialog({ proposalId }: ShareLinkDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const shareableLink = `${window.location.origin}/proposal/${proposalId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "The shareable link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Error",
        description: "Failed to copy the link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-black dark:text-black"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Proposal</DialogTitle>
          <DialogDescription>
            Anyone with this link will be able to view this proposal.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input value={shareableLink} readOnly className="flex-1" />
          <Button onClick={copyToClipboard} type="submit">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
