"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import { Plus, Trash2, Edit, Users, Camera, Loader2 } from "lucide-react"

// Mock instructor data
const instructorProfile = {
  name: "Erik Hansen",
  email: "erik@example.com",
  avatar: null,
  bio: "Erfaren kiter og instruktør med over 10 års erfaring fra Sunnmøre. Spesialiserer meg på sikkerhet og teknikk for nybegynnere.",
  certifications: "IKO Level 3, Rescue",
  yearsExperience: 10,
  phone: "+47 912 34 567",
}

const myCourses = [
  { id: "1", title: "Nybegynnerkurs Giske", date: "2026-03-12", spot: "Giske Nordvest", participants: 3 },
  { id: "2", title: "Teknikk for viderekomne", date: "2026-03-25", spot: "Alnes", participants: 2 },
  { id: "3", title: "Sikkerhetskurs", date: "2026-04-05", spot: "Mauseidvåg", participants: 4 },
]

const spots = [
  { id: "giske-nordvest", name: "Giske Nordvest" },
  { id: "alnes", name: "Alnes" },
  { id: "mauseidvag", name: "Mauseidvåg" },
  { id: "vigra-nord", name: "Vigra Nord" },
  { id: "hareid-strand", name: "Hareid Strand" },
]

export default function InstructorPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Instruktør</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="courses">Mine Kurs</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="courses">
          <CoursesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileTab() {
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState(instructorProfile)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-foreground mb-6">Rediger profil</h2>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback className="bg-sky-100 text-sky-800 text-2xl">
                {profile.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <Button variant="outline">
            <Camera className="h-4 w-4 mr-2" />
            Bytt bilde
          </Button>
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="mt-2"
            rows={4}
            placeholder="Fortell litt om deg selv..."
          />
        </div>

        {/* Certifications */}
        <div>
          <Label htmlFor="certifications">Sertifiseringer</Label>
          <Input
            id="certifications"
            value={profile.certifications}
            onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
            className="mt-2"
            placeholder="f.eks. IKO Level 2, Førstehjelp"
          />
        </div>

        {/* Years Experience */}
        <div>
          <Label htmlFor="experience">Års erfaring</Label>
          <Input
            id="experience"
            type="number"
            value={profile.yearsExperience}
            onChange={(e) => setProfile({ ...profile, yearsExperience: parseInt(e.target.value) || 0 })}
            className="mt-2 w-32"
            min={0}
          />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="mt-2"
            placeholder="+47 123 45 678"
          />
        </div>

        <Button className="bg-sky-600 hover:bg-sky-700" onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lagre
        </Button>
      </div>
    </div>
  )
}

function CoursesTab() {
  const [showNewCourseDialog, setShowNewCourseDialog] = useState(false)
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateCourse = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setShowNewCourseDialog(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Mine kurs</h2>
        <Dialog open={showNewCourseDialog} onOpenChange={setShowNewCourseDialog}>
          <DialogTrigger asChild>
            <Button className="bg-sky-600 hover:bg-sky-700">
              <Plus className="h-4 w-4 mr-2" />
              Nytt kurs
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nytt kurs</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="course-title">Tittel</Label>
                <Input id="course-title" placeholder="f.eks. Nybegynnerkurs Giske" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="course-description">Beskrivelse</Label>
                <Textarea id="course-description" placeholder="Beskriv kurset..." className="mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course-price">Pris</Label>
                  <div className="relative mt-1">
                    <Input id="course-price" type="number" placeholder="1500" className="pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kr</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="course-max">Maks deltakere</Label>
                  <Input id="course-max" type="number" placeholder="6" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="course-date">Dato</Label>
                <Input id="course-date" type="date" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course-start">Starttid</Label>
                  <Input id="course-start" type="time" placeholder="10:00" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="course-end">Sluttid</Label>
                  <Input id="course-end" type="time" placeholder="14:00" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="course-spot">Spot</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Velg spot" />
                  </SelectTrigger>
                  <SelectContent>
                    {spots.map((spot) => (
                      <SelectItem key={spot.id} value={spot.id}>
                        {spot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewCourseDialog(false)}>Avbryt</Button>
              <Button className="bg-sky-600 hover:bg-sky-700" onClick={handleCreateCourse} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Opprett kurs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tittel</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead>Spot</TableHead>
              <TableHead>Deltakere</TableHead>
              <TableHead className="w-[150px]">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.date}</TableCell>
                <TableCell>{course.spot}</TableCell>
                <TableCell>{course.participants}</TableCell>
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
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">KS</AvatarFallback>
                              </Avatar>
                              <span>Kari Svendsen</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive">Fjern</Button>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">PH</AvatarFallback>
                              </Avatar>
                              <span>Per Hansen</span>
                            </div>
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
