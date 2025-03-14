"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export type Project = {
  id: string
  name: string
  startTime: number
  endTime: number
  roles: string[]
  volunteerData?: Record<string, Record<string, string | false>>
  createdAt?: any
  updatedAt?: any
}

type ProjectDialogProps = {
  onProjectCreate: (project: Omit<Project, "id">) => void
}

export function ProjectDialog({ onProjectCreate }: ProjectDialogProps) {
  const [projectName, setProjectName] = useState("")
  const [startTime, setStartTime] = useState("9")
  const [endTime, setEndTime] = useState("17")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate hours for select options
  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString(),
    label: `${i.toString().padStart(2, "0")}:00`,
  }))

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Project name cannot be empty",
        variant: "destructive",
      })
      return
    }

    const start = Number.parseInt(startTime)
    const end = Number.parseInt(endTime)

    if (start >= end) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const newProject: Omit<Project, "id"> = {
        name: projectName,
        startTime: start,
        endTime: end,
        roles: [], // Start with no roles
        volunteerData: {} // Initialize empty volunteer data
      }
  
      await onProjectCreate(newProject)
      
      // Reset form
      setProjectName("")
      setStartTime("9")
      setEndTime("17")
      setIsOpen(false)
    } catch (error) {
      console.error("Error in handleCreateProject:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button className="w-full">Create New Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime} disabled={isSubmitting}>
                <SelectTrigger id="start-time">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={`start-${hour.value}`} value={hour.value}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime} disabled={isSubmitting}>
                <SelectTrigger id="end-time">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={`end-${hour.value}`} value={hour.value}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateProject} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

