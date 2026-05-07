"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { EditorProject } from "@/lib/project-types"

interface ProjectDialogsProps {
  activeProject: EditorProject | null
  dialog: "create" | "rename" | "delete" | null
  isLoading: boolean
  onClose: () => void
  onCreate: () => void
  onDelete: () => void
  onNameChange: (value: string) => void
  onRename: () => void
  projectName: string
  slugPreview: string
}

export function ProjectDialogs({
  activeProject,
  dialog,
  isLoading,
  onClose,
  onCreate,
  onDelete,
  onNameChange,
  onRename,
  projectName,
  slugPreview,
}: ProjectDialogsProps) {
  return (
    <>
      <Dialog open={dialog === "create"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              onCreate()
            }}
          >
            <DialogHeader>
              <DialogTitle>Create project</DialogTitle>
              <DialogDescription>
                Name the new architecture workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="create-project-name">
                Project name
              </label>
              <Input
                id="create-project-name"
                value={projectName}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Architecture workspace"
              />
              <p className="text-sm text-muted-foreground">
                Room ID preview: <span className="text-foreground">{slugPreview}</span>
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!projectName.trim() || isLoading}>
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "rename"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              onRename()
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename project</DialogTitle>
              <DialogDescription>
                Current project name: {activeProject?.name ?? "Untitled project"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="rename-project-name">
                Project name
              </label>
              <Input
                id="rename-project-name"
                autoFocus
                value={projectName}
                onChange={(event) => onNameChange(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!projectName.trim() || isLoading}>
                Rename project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "delete"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Delete {activeProject?.name ?? "this project"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={onDelete} disabled={isLoading}>
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
