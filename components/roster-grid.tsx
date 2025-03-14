"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import type { Project } from "@/components/project-dialog"
import { useFirebase } from "@/lib/firebase"

// Generate time slots for a specific range
const generateTimeSlots = (startHour: number, endHour: number) => {
  const slots = []
  for (let i = startHour; i < endHour; i++) {
    const hour = i.toString().padStart(2, "0")
    slots.push(`${hour}:00`)
  }
  return slots
}

// Type for volunteer data
type VolunteerData = {
  [timeSlot: string]: {
    [role: string]: string | false
  }
}

type RosterGridProps = {
  project: Project
  onUpdateRoles: (roles: string[]) => void
}

export function RosterGrid({ project, onUpdateRoles }: RosterGridProps) {
  const [roles, setRoles] = useState<string[]>(project.roles)
  const [newRole, setNewRole] = useState("")
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [volunteerData, setVolunteerData] = useState<VolunteerData>({})
  const [volunteerName, setVolunteerName] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { services } = useFirebase()

  // Initialize time slots and volunteer data when project changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setSaveError(null)
        const slots = generateTimeSlots(project.startTime, project.endTime)
        setTimeSlots(slots)
        setRoles(project.roles || [])

        // Try to get existing volunteer data from Firebase
        if (project.volunteerData) {
          setVolunteerData(project.volunteerData as VolunteerData)
        } else {
          // Initialize volunteer data with all slots set to false
          const initialData: VolunteerData = {}
          slots.forEach((timeSlot) => {
            initialData[timeSlot] = {}
            project.roles.forEach((role) => {
              initialData[timeSlot][role] = false
            })
          })
          setVolunteerData(initialData)
          
          // Save the initialized volunteer data to Firebase
          try {
            await services.updateVolunteerData(project.id, initialData)
          } catch (error) {
            console.error("Error initializing volunteer data:", error)
            // Don't show an error toast here as it's just initialization
          }
        }
      } catch (error) {
        console.error("Error fetching volunteer data:", error)
        toast({
          title: "Error",
          description: "Failed to load volunteer data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [project, services])

  // Add a new role
  const handleAddRole = async () => {
    if (!newRole.trim()) {
      toast({
        title: "Error",
        description: "Role name cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (roles.includes(newRole)) {
      toast({
        title: "Error",
        description: "Role already exists",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedRoles = [...roles, newRole]
      setRoles(updatedRoles)
      
      // Update roles in Firebase
      await onUpdateRoles(updatedRoles)

      // Update volunteer data to include the new role
      const updatedData = { ...volunteerData }
      timeSlots.forEach((timeSlot) => {
        updatedData[timeSlot] = updatedData[timeSlot] || {}
        updatedData[timeSlot][newRole] = false
      })
      setVolunteerData(updatedData)
      
      // Save updated volunteer data to Firebase
      await services.updateVolunteerData(project.id, updatedData)
      
      setNewRole("")
      
      toast({
        title: "Success",
        description: `Role "${newRole}" added successfully`,
      })
    } catch (error) {
      console.error("Error adding role:", error)
      toast({
        title: "Error",
        description: "Failed to add role",
        variant: "destructive",
      })
    }
  }

  // Remove a role
  const handleRemoveRole = async (roleToRemove: string) => {
    try {
      const updatedRoles = roles.filter((role) => role !== roleToRemove)
      setRoles(updatedRoles)
      
      // Update roles in Firebase
      await onUpdateRoles(updatedRoles)

      // Update volunteer data to remove the role
      const updatedData = { ...volunteerData }
      timeSlots.forEach((timeSlot) => {
        if (updatedData[timeSlot]) {
          delete updatedData[timeSlot][roleToRemove]
        }
      })
      setVolunteerData(updatedData)
      
      // Save updated volunteer data to Firebase
      await services.updateVolunteerData(project.id, updatedData)
      
      toast({
        title: "Success",
        description: `Role "${roleToRemove}" removed successfully`,
      })
    } catch (error) {
      console.error("Error removing role:", error)
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      })
    }
  }

  // Open dialog to sign up for a slot
  const handleCellClick = (timeSlot: string, role: string) => {
    setSelectedTimeSlot(timeSlot)
    setSelectedRole(role)
    
    // Pre-fill with existing volunteer name if any
    const existingVolunteer = volunteerData[timeSlot]?.[role]
    setVolunteerName(existingVolunteer && typeof existingVolunteer === 'string' ? existingVolunteer : "")
    
    setIsDialogOpen(true)
  }

  // Sign up a volunteer for a slot
  const handleSignUp = async () => {
    if (!selectedTimeSlot || !selectedRole) return

    if (!volunteerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedData = { ...volunteerData }
      updatedData[selectedTimeSlot] = updatedData[selectedTimeSlot] || {}
      updatedData[selectedTimeSlot][selectedRole] = volunteerName
      setVolunteerData(updatedData)
      
      // Save updated volunteer data to Firebase
      await services.updateVolunteerData(project.id, updatedData)
      
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: `${volunteerName} signed up for ${selectedRole} at ${selectedTimeSlot}`,
      })
    } catch (error) {
      console.error("Error signing up volunteer:", error)
      toast({
        title: "Error",
        description: "Failed to sign up volunteer",
        variant: "destructive",
      })
    }
  }

  // Clear a volunteer from a slot
  const handleClearSlot = async (timeSlot: string, role: string) => {
    try {
      const updatedData = { ...volunteerData }
      updatedData[timeSlot][role] = false
      setVolunteerData(updatedData)
      
      // Save updated volunteer data to Firebase
      await services.updateVolunteerData(project.id, updatedData)
      
      toast({
        title: "Success",
        description: "Volunteer removed successfully",
      })
    } catch (error) {
      console.error("Error clearing slot:", error)
      toast({
        title: "Error",
        description: "Failed to remove volunteer",
        variant: "destructive",
      })
    }
  }

  // Save roster data to Firebase
  const handleSaveRoster = async () => {
    try {
      setSaving(true)
      setSaveError(null)
      await services.updateVolunteerData(project.id, volunteerData)
      
      toast({
        title: "Roster Saved",
        description: `Roster for project "${project.name}" has been saved successfully`,
      })
    } catch (error) {
      console.error("Error saving roster:", error)
      setSaveError("Failed to save roster. Please try again.")
      toast({
        title: "Error",
        description: "Failed to save roster",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>Loading roster data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Roles for {project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="new-role">Add New Role</Label>
              <div className="flex gap-2">
                <Input
                  id="new-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Enter role name"
                  className="w-full sm:w-auto"
                />
                <Button onClick={handleAddRole} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {roles.map((role) => (
                <div key={role} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-md">
                  <span>{role}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveRole(role)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          {roles.length === 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-center">
              <p>Please add at least one role to create your roster</p>
            </div>
          )}
        </CardContent>
      </Card>

      {roles.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Volunteer Roster ({project.startTime}:00 - {project.endTime}:00)
            </CardTitle>
            <Button onClick={handleSaveRoster} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Roster"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted">Time</th>
                    {roles.map((role) => (
                      <th key={role} className="border p-2 bg-muted text-center">
                        {role}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td className="border p-2 font-medium">{timeSlot}</td>
                      {roles.map((role) => {
                        const volunteer = volunteerData[timeSlot]?.[role]
                        return (
                          <td key={`${timeSlot}-${role}`} className="border p-2 text-center">
                            {volunteer ? (
                              <div className="flex flex-col items-center">
                                <span className="text-sm">{volunteer}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs text-destructive"
                                  onClick={() => handleClearSlot(timeSlot, role)}
                                >
                                  Clear
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6"
                                onClick={() => handleCellClick(timeSlot, role)}
                              >
                                +
                              </Button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRole && selectedTimeSlot
                ? `Sign up for ${selectedRole} at ${selectedTimeSlot}`
                : "Sign Up"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="volunteer-name">Your Name</Label>
              <Input
                id="volunteer-name"
                value={volunteerName}
                onChange={(e) => setVolunteerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSignUp}>Sign Up</Button>
          </div>
        </DialogContent>
      </Dialog>

      {saveError && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <p>{saveError}</p>
        </div>
      )}
    </div>
  )
}

