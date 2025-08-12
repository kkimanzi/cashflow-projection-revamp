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

interface PasswordResetEmailProps {
  userName: string;
  resetLink: string;
  supportEmail?: string;
}

export const PasswordResetEmail = ({
  userName,
  resetLink,
  supportEmail = "support@yourdomain.com",
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Password reset instructions</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Password Reset Request</Text>
        <Text style={paragraph}>Hello {userName || "there"},</Text>
        <Text style={paragraph}>
          We received a request to reset your password. Click the button below
          to set a new password:
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={resetLink}>
            Reset Password
          </Button>
        </Section>

        <Text style={paragraph}>
          If you didn't request this password reset, you can safely ignore this
          email. Your password won't be changed until you access the link above
          and create a new one.
        </Text>

        <Text style={paragraph}>
          This link will expire in 24 hours for security reasons.
        </Text>

        <Text style={paragraph}>
          If the button doesn't work, copy and paste this link into your
          browser:
          <br />
          <Link href={resetLink} style={link}>
            {resetLink}
          </Link>
        </Text>

        <Text style={paragraph}>
          Need help? Contact our support team at{" "}
          <Link href={`mailto:${supportEmail}`} style={link}>
            {supportEmail}
          </Link>
        </Text>

        <Text style={footer}>
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

// Default props for preview
PasswordResetEmail.PreviewProps = {
  userName: "John Doe",
  resetLink: "https://example.com/reset-password?token=abc123",
} as PasswordResetEmailProps;

export default PasswordResetEmail;

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
  color: "#333",
  marginBottom: "20px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
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
  borderRadius: "5px",
  textDecoration: "none",
};

const link = {
  color: "#0066cc",
  wordBreak: "break-all" as const,
};

const footer = {
  marginTop: "30px",
  fontSize: "12px",
  color: "#777",
  textAlign: "center" as const,
};
