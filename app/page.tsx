import { ProjectSelection } from "@/components/project-selection"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Volunteer Roster</h1>
      <ProjectSelection />
    </main>
  )
}

