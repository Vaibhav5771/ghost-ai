"use client";
import { PanelLeftClose, PanelLeftOpen, Share2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  // New props for AI and Share
  isAIEnabled?: boolean;
  onToggleAI?: () => void;
  onShare?: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  isAIEnabled = false,
  onToggleAI,
  onShare,
}: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center bg-card border-b border-border px-3">
      {/* Sidebar Toggle */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2 pr-2">
        {/* AI Toggle Button */}
        {onToggleAI && (
          <Button
            variant={isAIEnabled ? "default" : "outline"}
            onClick={onToggleAI}
            className="flex items-center gap-2 font-medium"
          >
            ✨ AI
          </Button>
        )}

        {/* Share Button */}
        {onShare && (
          <Button
            variant="outline"
            onClick={onShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}

        {/* User Button */}
        <UserButton />
      </div>
    </header>
  );
}