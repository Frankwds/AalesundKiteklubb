import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

interface CourseCancellationEmailProps {
  courseTitle: string
  courseDate: string
  instructorName: string
  coursesPageUrl: string
}

export function CourseCancellationEmail({
  courseTitle,
  courseDate,
  instructorName,
  coursesPageUrl,
}: CourseCancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Kurs avlyst: {courseTitle}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Kurs avlyst</Heading>

          <Text style={text}>
            Vi må dessverre informere om at følgende kurs har blitt avlyst:
          </Text>

          <Section style={details}>
            <Text style={detailRow}>
              <strong>Kurs:</strong> {courseTitle}
            </Text>
            <Text style={detailRow}>
              <strong>Tidspunkt:</strong> {courseDate}
            </Text>
            <Text style={detailRow}>
              <strong>Instruktør:</strong> {instructorName}
            </Text>
          </Section>

          <Text style={text}>
            Vi beklager ulempene dette kan medføre. Se gjerne{" "}
            <Link href={coursesPageUrl} style={link}>
              kurssiden
            </Link>{" "}
            for andre tilgjengelige kurs.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Du mottar denne e-posten fordi du var påmeldt dette kurset hos
            Ålesund Kiteklubb.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default CourseCancellationEmail

const body = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
}

const heading = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: "#dc2626",
  marginBottom: "24px",
}

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#374151",
}

const details = {
  backgroundColor: "#fef2f2",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "16px 0",
}

const detailRow = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#374151",
  margin: "4px 0",
}

const link = {
  color: "#0284c7",
  textDecoration: "underline",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
}

const footer = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#9ca3af",
}
