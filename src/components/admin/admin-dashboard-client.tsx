"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { InstructorsTab } from "./tabs/instructors-tab"
import { CoursesTab } from "./tabs/courses-tab"
import { SpotsTab } from "./tabs/spots-tab"
import { SubscribersTab } from "./tabs/subscribers-tab"
import { UsersTab } from "./tabs/users-tab"
import type { CurrentUser } from "@/lib/auth"
import type { CourseWithFullRelations } from "@/lib/queries/courses"

type Props = {
  instructors: Awaited<ReturnType<typeof import("@/lib/queries/instructors").getInstructors>>
  courses: CourseWithFullRelations[]
  spots: Awaited<ReturnType<typeof import("@/lib/queries/spots").getSpots>>
  subscriptions: Awaited<ReturnType<typeof import("@/lib/queries/subscriptions").getAllSubscriptions>>
  users: Awaited<ReturnType<typeof import("@/lib/queries/users").getAllUsers>>
  currentUser: CurrentUser
}

export function AdminDashboardClient({
  instructors,
  courses,
  spots,
  subscriptions,
  users,
  currentUser,
}: Props) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Administrasjon</h1>

      <Tabs defaultValue="instructors">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList>
            <TabsTrigger value="instructors">Instruktører</TabsTrigger>
            <TabsTrigger value="courses">Kurs</TabsTrigger>
            <TabsTrigger value="spots">Spotter</TabsTrigger>
            <TabsTrigger value="subscribers">Abonnenter</TabsTrigger>
            <TabsTrigger value="users">Brukere</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="instructors">
          <InstructorsTab
            instructors={instructors}
            users={users}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="courses">
          <CoursesTab courses={courses} />
        </TabsContent>

        <TabsContent value="spots">
          <SpotsTab spots={spots} />
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscribersTab subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab users={users} currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
