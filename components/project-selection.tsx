"use client"

import { useState, useEffect } from "react"
import { ProjectDialog, type Project } from "@/components/project-dialog"
import { RosterGrid } from "@/components/roster-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useFirebase } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function ProjectSelection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { services } = useFirebase()

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchedProjects = await services.getProjects()
        
        // Sort projects by creation date (newest first)
        const sortedProjects = fetchedProjects.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        setProjects(sortedProjects)
        
        // Select the first project if there is one and none is selected
        if (sortedProjects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(sortedProjects[0].id)
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching projects:", error)
        setError("Failed to load projects. Please try refreshing the page.")
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchProjects()
  }, [services, selectedProjectId])

  const handleProjectCreate = async (project: Omit<Project, "id">) => {
    try {
      const newProject = await services.createProject(project)
      
      // Add the new project to the list and sort
      const updatedProjects = [...projects, newProject as Project].sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setProjects(updatedProjects)
      setSelectedProjectId(newProject.id as string)
      
      toast({
        title: "Success",
        description: `Project "${project.name}" created successfully`,
      })
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await services.deleteProject(projectId)
      setProjects(projects.filter(p => p.id !== projectId))
      
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null)
      }
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const handleUpdateRoles = async (projectId: string, roles: string[]) => {
    try {
      await services.updateProject(projectId, { roles })
      setProjects(projects.map(p => p.id === projectId ? { ...p, roles } : p))
      
      toast({
        title: "Success",
        description: "Roles updated successfully",
      })
    } catch (error) {
      console.error("Error updating roles:", error)
      toast({
        title: "Error",
        description: "Failed to update roles",
        variant: "destructive",
      })
    }
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading projects...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProjectDialog onProjectCreate={handleProjectCreate} />

          {projects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="project-select">Select Project</Label>
              <div className="flex gap-2">
                <Select 
                  value={selectedProjectId || ""} 
                  onValueChange={setSelectedProjectId}
                  className="flex-1"
                >
                  <SelectTrigger id="project-select">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedProjectId && (
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => handleDeleteProject(selectedProjectId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProject && (
        <RosterGrid
          project={selectedProject}
          onUpdateRoles={(roles) => handleUpdateRoles(selectedProject.id, roles)}
        />
      )}

      {!selectedProject && projects.length > 0 && (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p>Please select a project to view its roster</p>
        </div>
      )}

      {projects.length === 0 && (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p>Create a project to get started</p>
        </div>
      )}
    </div>
  )
}

