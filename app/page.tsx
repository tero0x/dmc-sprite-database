import { DigimonDataTable } from "@/components/digimon-data-table"
import { DigimonProvider } from "@/components/digimon-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold"></h1>
        <div className="flex items-center gap-3">
          <a href="https://forms.gle/tfGKFRBq8noMGeh38" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback & Requests</span>
              <span className="sm:hidden">Feedback</span>
            </Button>
          </a>
          <ThemeToggle />
        </div>
      </div>
      <DigimonProvider>
        <DigimonDataTable />
      </DigimonProvider>
    </main>
  )
}
