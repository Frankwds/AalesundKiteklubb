"use client"

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
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Instruktørpanel</h1>

      <Tabs defaultValue="profil">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList>
            <TabsTrigger value="profil">Profil</TabsTrigger>
            <TabsTrigger value="courses">Mine Kurs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profil">
          <ProfilTab instructor={instructor} />
        </TabsContent>

        <TabsContent value="courses">
          <MineKursTab courses={courses} spots={spots} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
