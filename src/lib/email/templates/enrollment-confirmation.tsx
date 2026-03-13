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

interface EnrollmentConfirmationEmailProps {
  courseTitle: string
  courseDate: string
  instructorName: string
  price?: number | null
  spotName?: string | null
  spotUrl?: string | null
  chatUrl: string
  coursesPageUrl: string
}

export function EnrollmentConfirmationEmail({
  courseTitle,
  courseDate,
  instructorName,
  price,
  spotName,
  spotUrl,
  chatUrl,
  coursesPageUrl,
}: EnrollmentConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Påmelding bekreftet: {courseTitle}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Du er påmeldt!</Heading>

          <Text style={text}>
            Du er nå påmeldt følgende kurs hos Ålesund Kiteklubb:
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
            {price != null && (
              <Text style={detailRow}>
                <strong>Pris:</strong> {price} kr
              </Text>
            )}
            {spotName && (
              <Text style={detailRow}>
                <strong>Sted:</strong>{" "}
                {spotUrl ? (
                  <Link href={spotUrl} style={link}>
                    {spotName}
                  </Link>
                ) : (
                  spotName
                )}
              </Text>
            )}
          </Section>

          <Section style={buttonSection}>
            <Link href={chatUrl} style={button}>
              Åpne kurschat
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Vil du melde deg av? Gå til{" "}
            <Link href={coursesPageUrl} style={footerLink}>
              kurssiden
            </Link>{" "}
            for å administrere dine påmeldinger.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default EnrollmentConfirmationEmail

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
  color: "#0284c7",
  marginBottom: "24px",
}

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#374151",
}

const details = {
  backgroundColor: "#f9fafb",
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

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
}

const button = {
  backgroundColor: "#0284c7",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600" as const,
  textDecoration: "none",
  padding: "12px 32px",
  borderRadius: "6px",
  display: "inline-block",
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

const footerLink = {
  color: "#0284c7",
  textDecoration: "underline",
}
