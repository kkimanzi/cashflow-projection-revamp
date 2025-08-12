import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface InvitationEmailProps {
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  inviteLink: string;
}

export const InvitationEmail = ({
  inviterName,
  inviterEmail,
  organizationName,
  inviteLink,
}: InvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Join {organizationName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>You've been invited!</Text>

        <Text style={paragraph}>Hello there,</Text>

        <Text style={paragraph}>
          You've been invited to join <strong>{organizationName}</strong> by{" "}
          <strong>{inviterName}</strong> ({inviterEmail}). This invitation gives
          you access to the organization's features and resources.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={inviteLink}>
            Accept Invitation
          </Button>
        </Section>

        <Text style={paragraph}>
          The invitation link will expire in a few days for security reasons.
        </Text>

        <Text style={paragraph}>
          If the button above doesn't work, you can copy and paste this link
          into your browser:
          <br />
          <Link href={inviteLink} style={link}>
            {inviteLink}
          </Link>
        </Text>

        <Text style={paragraph}>
          Best regards,
          <br />
          The {organizationName} Team
        </Text>

        <Text style={footer}>
          © {new Date().getFullYear()} {organizationName}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

// Default props for preview
InvitationEmail.PreviewProps = {
  inviterName: "Jane Doe",
  inviterEmail: "jane.doe@example.com",
  organizationName: "Acme Corporation",
  inviteLink: "https://example.com/invitation/12345",
} as InvitationEmailProps;

export default InvitationEmail;

// Styles
const main = {
  backgroundColor: "#f9f9f9",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px",
  borderRadius: "5px",
  border: "1px solid #ddd",
  maxWidth: "600px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1f2937",
  textAlign: "center" as const,
  marginBottom: "20px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const button = {
  backgroundColor: "#0066cc",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "16px",
  padding: "12px 24px",
  borderRadius: "9999px",
  textDecoration: "none",
};

const link = {
  color: "#0066cc",
  wordBreak: "break-all" as const,
  marginLeft: "4px",
};

const footer = {
  marginTop: "30px",
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center" as const,
};
