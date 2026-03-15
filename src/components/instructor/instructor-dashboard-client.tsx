"use client"

import { User, GraduationCap } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProfilTab } from "./tabs/profil-tab"
import { MineKursTab } from "./tabs/mine-kurs-tab"
import type { CourseWithFullRelations } from "@/lib/queries/courses"
import type { getInstructorByUserId } from "@/lib/queries/instructors"
import type { getSpots } from "@/lib/queries/spots"

type InstructorProfile = NonNullable<Awaited<ReturnType<typeof getInstructorByUserId>>>
type Spots = Awaited<ReturnType<typeof getSpots>>

type Props = {
  instructor: InstructorProfile
  courses: CourseWithFullRelations[]
  spots: Spots
}

export function InstructorDashboardClient({
  instructor,
  courses,
  spots,
}: Props) {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-0 overflow-hidden px-6 py-6 md:px-8 md:py-8">
      <header className="shrink-0 pb-4">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Instruktørpanel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administrer profil og kurs
        </p>
      </header>

      <Tabs
        defaultValue="profil"
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        <div className="overflow-x-auto overflow-y-hidden -mx-1 px-1 shrink-0">
          <TabsList>
            <TabsTrigger value="profil">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="courses">
              <GraduationCap className="h-4 w-4" />
              Mine Kurs
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
          <TabsContent value="profil" className="mt-0 outline-none">
            <ProfilTab instructor={instructor} />
          </TabsContent>

          <TabsContent value="courses" className="mt-0 outline-none">
            <MineKursTab courses={courses} spots={spots} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
