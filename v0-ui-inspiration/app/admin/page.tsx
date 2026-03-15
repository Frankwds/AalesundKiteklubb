"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit, Users, Loader2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Mock data
const instructors = [
  { id: "1", name: "Erik Hansen", email: "erik@example.com", certifications: "IKO Level 3, Rescue", createdAt: "2024-01-15" },
  { id: "2", name: "Mari Olsen", email: "mari@example.com", certifications: "IKO Level 2", createdAt: "2024-03-20" },
  { id: "3", name: "Jonas Berg", email: "jonas@example.com", certifications: "IKO Level 2, Førstehjelpskurs", createdAt: "2024-06-10" },
]

const courses = [
  { id: "1", title: "Nybegynnerkurs Giske", date: "2026-03-12", spot: "Giske Nordvest", instructor: "Erik Hansen", participants: 3, status: "upcoming" },
  { id: "2", title: "Videregående kurs", date: "2026-03-15", spot: "Alnes", instructor: "Mari Olsen", participants: 4, status: "upcoming" },
  { id: "3", title: "Teknikk og triks", date: "2026-03-20", spot: "Mauseidvåg", instructor: "Jonas Berg", participants: 1, status: "upcoming" },
  { id: "4", title: "Nybegynnerkurs Vigra", date: "2025-12-01", spot: "Vigra Nord", instructor: "Erik Hansen", participants: 6, status: "past" },
]

const spots = [
  { id: "1", name: "Giske Nordvest", season: "Sommer", area: "Giske", level: "Nybegynner", waterType: "Flatt vann, Chop" },
  { id: "2", name: "Alnes", season: "Sommer", area: "Giske", level: "Erfaren", waterType: "Bølger, Chop" },
  { id: "3", name: "Mauseidvåg", season: "Vinter", area: "Ålesund", level: "Nybegynner", waterType: "Flatt vann" },
]

const subscribers = [
  { id: "1", email: "anna@example.com", name: "Anna Larsen", subscribedAt: "2025-01-10" },
  { id: "2", email: "bjorn@example.com", name: "Bjørn Eriksen", subscribedAt: "2025-02-15" },
  { id: "3", email: "cecilie@example.com", name: "Cecilie Dahl", subscribedAt: "2025-03-01" },
  { id: "4", email: "daniel@example.com", name: "Daniel Moe", subscribedAt: "2025-03-05" },
  { id: "5", email: "eva@example.com", name: "Eva Strand", subscribedAt: "2025-03-08" },
]

const users = [
  { id: "1", name: "Ola Nordmann", email: "ola@example.com", role: "admin", createdAt: "2024-01-01", isCurrentUser: true },
  { id: "2", name: "Kari Svendsen", email: "kari@example.com", role: "instructor", createdAt: "2024-02-10", isCurrentUser: false },
  { id: "3", name: "Per Hansen", email: "per@example.com", role: "user", createdAt: "2024-05-20", isCurrentUser: false },
  { id: "4", name: "Lisa Berg", email: "lisa@example.com", role: "user", createdAt: "2024-08-15", isCurrentUser: false },
  { id: "5", name: "Tom Nilsen", email: "tom@example.com", role: "instructor", createdAt: "2024-10-01", isCurrentUser: false },
]

export default function AdminPage() {
  return (
    <TooltipProvider>
      <div className="p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Admin</h1>

        <Tabs defaultValue="instructors" className="w-full">
          <TabsList className="mb-6 w-full flex flex-wrap h-auto gap-1 bg-muted p-1">
            <TabsTrigger value="instructors" className="flex-1 min-w-[100px]">Instruktører</TabsTrigger>
            <TabsTrigger value="courses" className="flex-1 min-w-[100px]">Kurs</TabsTrigger>
            <TabsTrigger value="spots" className="flex-1 min-w-[100px]">Spot guide</TabsTrigger>
            <TabsTrigger value="subscribers" className="flex-1 min-w-[100px]">Abonnenter</TabsTrigger>
            <TabsTrigger value="users" className="flex-1 min-w-[100px]">Brukere</TabsTrigger>
          </TabsList>

          <TabsContent value="instructors">
            <InstructorsTab />
          </TabsContent>

          <TabsContent value="courses">
            <CoursesTab />
          </TabsContent>

          <TabsContent value="spots">
            <SpotsTab />
          </TabsContent>

          <TabsContent value="subscribers">
            <SubscribersTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

function InstructorsTab() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Instruktører</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-sky-600 hover:bg-sky-700">
              <Plus className="h-4 w-4 mr-2" />
              Legg til instruktør
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Legg til instruktør</DialogTitle>
              <DialogDescription>Søk etter en bruker for å gjøre dem til instruktør.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="user-search">Søk etter bruker</Label>
              <Input id="user-search" placeholder="Søk på navn eller e-post..." className="mt-2" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Avbryt</Button>
              <Button className="bg-sky-600 hover:bg-sky-700">Legg til</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Sertifiseringer</TableHead>
              <TableHead>Opprettet</TableHead>
              <TableHead className="w-[100px]">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell className="font-medium">{instructor.name}</TableCell>
                <TableCell>{instructor.email}</TableCell>
                <TableCell>{instructor.certifications}</TableCell>
                <TableCell>{instructor.createdAt}</TableCell>
                <TableCell>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Fjern instruktør</DialogTitle>
                        <DialogDescription>
                          Er du sikker på at du vil fjerne {instructor.name} som instruktør?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Avbryt</Button>
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>Fjern</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function CoursesTab() {
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false)

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Kurs</h2>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tittel</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead>Spot</TableHead>
              <TableHead>Instruktør</TableHead>
              <TableHead>Deltakere</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.date}</TableCell>
                <TableCell>{course.spot}</TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell>{course.participants}</TableCell>
                <TableCell>
                  <Badge className={course.status === "upcoming" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-muted text-muted-foreground hover:bg-muted"}>
                    {course.status === "upcoming" ? "Kommende" : "Tidligere"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Dialog open={showParticipantsDialog} onOpenChange={setShowParticipantsDialog}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Users className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Deltakere - {course.title}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span>Kari Svendsen</span>
                            <Button variant="ghost" size="sm" className="text-destructive">Fjern</Button>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span>Per Hansen</span>
                            <Button variant="ghost" size="sm" className="text-destructive">Fjern</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function SpotsTab() {
  const [showNewSpotDialog, setShowNewSpotDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setShowNewSpotDialog(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Spot guide</h2>
        <Dialog open={showNewSpotDialog} onOpenChange={setShowNewSpotDialog}>
          <DialogTrigger asChild>
            <Button className="bg-sky-600 hover:bg-sky-700">
              <Plus className="h-4 w-4 mr-2" />
              Ny spot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ny spot</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spot-name">Navn</Label>
                  <Input id="spot-name" placeholder="f.eks. Giske Nordvest" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="spot-area">Område</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Velg område" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="giske">Giske</SelectItem>
                      <SelectItem value="alesund">Ålesund</SelectItem>
                      <SelectItem value="vigra">Vigra</SelectItem>
                      <SelectItem value="hareid">Hareid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="spot-description">Beskrivelse</Label>
                <Textarea id="spot-description" placeholder="Beskriv spotten..." className="mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spot-season">Sesong</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Velg sesong" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sommer">Sommer</SelectItem>
                      <SelectItem value="vinter">Vinter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="spot-level">Nivå</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Velg nivå" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nybegynner">Nybegynner</SelectItem>
                      <SelectItem value="erfaren">Erfaren</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Vindretninger</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"].map((dir) => (
                    <Button key={dir} variant="outline" size="sm" className="min-w-[40px]">
                      {dir}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Kartbilde</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">Dra og slipp eller klikk for å laste opp</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spot-lat">Breddegrad</Label>
                  <Input id="spot-lat" placeholder="62.4721" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="spot-lng">Lengdegrad</Label>
                  <Input id="spot-lng" placeholder="6.1549" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="spot-skill-note">Ferdighetsnotat</Label>
                <Textarea id="spot-skill-note" placeholder="f.eks. Krever erfaring med bølger..." className="mt-1" rows={2} />
              </div>
              <div>
                <Label>Vanntype</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Flatt vann", "Chop", "Bølger"].map((type) => (
                    <Button key={type} variant="outline" size="sm">
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSpotDialog(false)}>Avbryt</Button>
              <Button className="bg-sky-600 hover:bg-sky-700" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Opprett spot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-4">
        <Select>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sesong" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="sommer">Sommer</SelectItem>
            <SelectItem value="vinter">Vinter</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Område" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="giske">Giske</SelectItem>
            <SelectItem value="alesund">Ålesund</SelectItem>
            <SelectItem value="vigra">Vigra</SelectItem>
            <SelectItem value="hareid">Hareid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>Sesong</TableHead>
              <TableHead>Område</TableHead>
              <TableHead>Nivå</TableHead>
              <TableHead>Vanntype</TableHead>
              <TableHead className="w-[100px]">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spots.map((spot) => (
              <TableRow key={spot.id}>
                <TableCell className="font-medium">{spot.name}</TableCell>
                <TableCell>
                  <Badge className={spot.season === "Sommer" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-sky-100 text-sky-800 hover:bg-sky-100"}>
                    {spot.season}
                  </Badge>
                </TableCell>
                <TableCell>{spot.area}</TableCell>
                <TableCell>
                  <Badge className={spot.level === "Nybegynner" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-orange-100 text-orange-800 hover:bg-orange-100"}>
                    {spot.level}
                  </Badge>
                </TableCell>
                <TableCell>{spot.waterType}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function SubscribersTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Abonnenter</h2>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-post</TableHead>
              <TableHead>Navn</TableHead>
              <TableHead>Abonnert siden</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>{subscriber.email}</TableCell>
                <TableCell>{subscriber.name}</TableCell>
                <TableCell>{subscriber.subscribedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function UsersTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Brukere</h2>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Opprettet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.isCurrentUser ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Select disabled defaultValue={user.role}>
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Bruker</SelectItem>
                              <SelectItem value="instructor">Instruktør</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Du kan ikke endre din egen rolle</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Select defaultValue={user.role}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Bruker</SelectItem>
                        <SelectItem value="instructor">Instruktør</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
