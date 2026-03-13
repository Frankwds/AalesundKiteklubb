"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Users, MessageCircle, Bell, BellOff, Loader2 } from "lucide-react"

// Mock data
const instructors = [
  {
    id: "1",
    name: "Erik Hansen",
    bio: "IKO Level 3 instruktør med 10 års erfaring fra Sunnmøre.",
    avatar: null,
    certifications: ["IKO Level 3", "Rescue"],
  },
  {
    id: "2",
    name: "Mari Olsen",
    bio: "Erfaren kiter og instruktør. Spesialiserer seg på nybegynnerkurs.",
    avatar: null,
    certifications: ["IKO Level 2"],
  },
  {
    id: "3",
    name: "Jonas Berg",
    bio: "Friluftsveileder og kiteinstruktør. Elsker å dele kiteglede.",
    avatar: null,
    certifications: ["IKO Level 2", "Førstehjelpskurs"],
  },
]

const courses = [
  {
    id: "1",
    title: "Nybegynnerkurs Giske",
    date: "12. mars 2026",
    startTime: "10:00",
    endTime: "14:00",
    instructor: instructors[0],
    spot: { id: "giske-nordvest", name: "Giske Nordvest" },
    price: 1500,
    capacity: 6,
    enrolled: 3,
    userEnrolled: false,
  },
  {
    id: "2",
    title: "Videregående kurs",
    date: "15. mars 2026",
    startTime: "12:00",
    endTime: "16:00",
    instructor: instructors[1],
    spot: { id: "alnes", name: "Alnes" },
    price: 1800,
    capacity: 4,
    enrolled: 4,
    userEnrolled: true,
  },
  {
    id: "3",
    title: "Teknikk og triks",
    date: "20. mars 2026",
    startTime: "11:00",
    endTime: "15:00",
    instructor: instructors[2],
    spot: { id: "mauseidvag", name: "Mauseidvåg" },
    price: 2000,
    capacity: 4,
    enrolled: 1,
    userEnrolled: false,
  },
]

// Mock user state
const mockUser = {
  isLoggedIn: true,
  email: "ola.nordmann@gmail.com",
  isSubscribed: false,
}

export default function CoursesPage() {
  const [isSubscribed, setIsSubscribed] = useState(mockUser.isSubscribed)
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [enrollingCourse, setEnrollingCourse] = useState<typeof courses[0] | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)

  const handleEnroll = async () => {
    setIsEnrolling(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsEnrolling(false)
    setShowEnrollDialog(false)
  }

  return (
    <div className="p-6 md:p-8">
      {/* Intro */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Kurs</h1>
        <p className="text-foreground/80 leading-relaxed max-w-2xl">
          Vi tilbyr kurs for alle nivåer. Våre instruktører er sertifiserte og erfarne 
          kitere fra Sunnmøre. Kurs legges ut når forholdene ser lovende ut.
        </p>
      </div>

      {/* Instructors */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-foreground mb-6">Våre instruktører</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3">
          {instructors.map((instructor) => (
            <Card key={instructor.id} className="min-w-[260px] md:min-w-0 flex-shrink-0">
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={instructor.avatar || undefined} />
                    <AvatarFallback className="bg-sky-100 text-sky-800 text-xl">
                      {instructor.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-foreground mb-2">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{instructor.bio}</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {instructor.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Upcoming Courses */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-foreground mb-6">Kommende kurs</h2>
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              userLoggedIn={mockUser.isLoggedIn}
              onEnroll={() => {
                setEnrollingCourse(course)
                setShowEnrollDialog(true)
              }}
            />
          ))}
        </div>

        {/* Empty state example */}
        {courses.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-2">
              Kurs legges ut når forholdene ser lovende ut, ikke langt i forkant.
            </p>
            <a href="#subscribe" className="text-sky-600 hover:text-sky-800 text-sm">
              Få varsler om nye kurs
            </a>
          </div>
        )}
      </section>

      {/* Subscribe Section */}
      <section id="subscribe" className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Få varsler om nye kurs</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Meld deg på for å få e-post når nye kurs legges ut.
        </p>
        {isSubscribed ? (
          <Button
            variant="outline"
            onClick={() => setIsSubscribed(false)}
            className="h-11"
          >
            <BellOff className="mr-2 h-4 w-4" />
            Avslutt abonnement
          </Button>
        ) : (
          <Button
            onClick={() => setIsSubscribed(true)}
            className="bg-sky-600 hover:bg-sky-700 h-11"
          >
            <Bell className="mr-2 h-4 w-4" />
            Abonner
          </Button>
        )}
      </section>

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meld på kurs</DialogTitle>
            <DialogDescription>
              Du vil bli meldt på kurset «{enrollingCourse?.title}». En bekreftelse sendes til:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="email"
              value={mockUser.email}
              disabled
              className="w-full px-3 py-2 bg-muted rounded-md text-muted-foreground text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
              Avbryt
            </Button>
            <Button
              className="bg-sky-600 hover:bg-sky-700"
              onClick={handleEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Meld på
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CourseCard({
  course,
  userLoggedIn,
  onEnroll,
}: {
  course: typeof courses[0]
  userLoggedIn: boolean
  onEnroll: () => void
}) {
  const isFull = course.enrolled >= course.capacity

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 space-y-3">
            <h3 className="font-semibold text-lg text-foreground">{course.title}</h3>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {course.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {course.startTime}–{course.endTime}
              </span>
              <Link
                href={`/spots/${course.spot.id}`}
                className="flex items-center gap-1.5 text-sky-600 hover:text-sky-800"
              >
                <MapPin className="h-4 w-4" />
                {course.spot.name}
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-sky-100 text-sky-800 text-xs">
                    {course.instructor.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{course.instructor.name}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <span className="font-medium text-foreground">{course.price} kr</span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                {course.enrolled} / {course.capacity} plasser
              </span>
            </div>
          </div>

          <div className="flex gap-2 md:flex-col md:items-end">
            {!userLoggedIn ? (
              <Button asChild variant="outline" className="flex-1 md:flex-none">
                <Link href="/login">Logg inn for å melde på</Link>
              </Button>
            ) : course.userEnrolled ? (
              <>
                <Button variant="outline" className="flex-1 md:flex-none text-destructive border-destructive hover:bg-destructive/10">
                  Meld av
                </Button>
                <Button asChild variant="secondary" className="flex-1 md:flex-none">
                  <Link href={`/courses/${course.id}/chat`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat
                  </Link>
                </Button>
              </>
            ) : (
              <Button
                onClick={onEnroll}
                disabled={isFull}
                className="flex-1 md:flex-none bg-sky-600 hover:bg-sky-700"
              >
                {isFull ? "Fullt" : "Meld på"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
