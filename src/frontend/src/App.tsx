import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import GamesPage from "./components/GamesPage";
import Header from "./components/Header";
import RosterPage from "./components/RosterPage";
import SchedulePage from "./components/SchedulePage";
import StatsPage from "./components/StatsPage";
import SummaryPage from "./components/SummaryPage";

export default function App() {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto mb-6 bg-muted border border-border p-1 rounded-lg">
              <TabsTrigger
                value="summary"
                data-ocid="nav.summary.tab"
                className="flex items-center gap-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Summary</span>
              </TabsTrigger>
              <TabsTrigger
                value="roster"
                data-ocid="nav.roster.tab"
                className="flex items-center gap-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Roster</span>
              </TabsTrigger>
              <TabsTrigger
                value="games"
                data-ocid="nav.games.tab"
                className="flex items-center gap-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Games</span>
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                data-ocid="nav.schedule.tab"
                className="flex items-center gap-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                data-ocid="nav.stats.tab"
                className="flex items-center gap-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="animate-fade-up">
              <SummaryPage />
            </TabsContent>
            <TabsContent value="roster" className="animate-fade-up">
              <RosterPage />
            </TabsContent>
            <TabsContent value="games" className="animate-fade-up">
              <GamesPage />
            </TabsContent>
            <TabsContent value="schedule" className="animate-fade-up">
              <SchedulePage />
            </TabsContent>
            <TabsContent value="stats" className="animate-fade-up">
              <StatsPage />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t border-border bg-card py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-foreground" />
              <span className="font-display font-semibold text-foreground">
                The Knights
              </span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>

      <Toaster richColors />
    </div>
  );
}
