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

interface NewCourseEmailProps {
  courseTitle: string
  courseDate: string
  instructorName: string
  price?: number | null
  spotName?: string | null
  spotUrl?: string | null
  enrollUrl: string
}

export function NewCourseEmail({
  courseTitle,
  courseDate,
  instructorName,
  price,
  spotName,
  spotUrl,
  enrollUrl,
}: NewCourseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nytt kurs: {courseTitle}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Nytt kurs tilgjengelig!</Heading>

          <Text style={text}>
            Ålesund Kiteklubb har publisert et nytt kurs:
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
            <Link href={enrollUrl} style={button}>
              Meld deg på
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Du mottar denne e-posten fordi du abonnerer på kursvarsler fra
            Ålesund Kiteklubb. Du kan avslutte abonnementet på kurssiden.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default NewCourseEmail

const body = {
  backgroundColor: "#f9fafb",
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
  color: "#132a45",
  marginBottom: "24px",
}

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#374151",
}

const details = {
  backgroundColor: "#f3f4f6",
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
  color: "#132a45",
  textDecoration: "underline",
}

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
}

const button = {
  backgroundColor: "#132a45",
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
