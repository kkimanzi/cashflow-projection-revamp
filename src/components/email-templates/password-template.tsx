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

interface PasswordEmailProps {
  userName: string;
  userEmail: string;
  generatedPassword: string;
  loginLink: string;
}

export const PasswordEmail = ({
  userName,
  userEmail,
  generatedPassword,
  loginLink,
}: PasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Your new account details for {userEmail}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Welcome to our platform!</Text>
        <Text style={paragraph}>Hello {userName},</Text>
        <Text style={paragraph}>
          Your account has been created. Here are your login details:
        </Text>
        <Text style={paragraph}>
          <strong>Email:</strong> {userEmail}
        </Text>
        <Text style={paragraph}>
          <strong>Temporary Password:</strong>{" "}
          <span style={passwordStyle}>{generatedPassword}</span>
        </Text>
        <Text style={paragraph}>
          Please log in using these credentials and change your password
          immediately for security reasons.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={loginLink}>
            Go to Login
          </Button>
        </Section>
        <Text style={paragraph}>
          If the button above doesn't work, you can copy and paste this link
          into your browser:
          <br />
          <Link href={loginLink} style={link}>
            {loginLink}
          </Link>
        </Text>
        <Text style={footer}>
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

// Default props for preview
PasswordEmail.PreviewProps = {
  userName: "John Doe",
  userEmail: "john.doe@example.com",
  generatedPassword: "SecurePassword123!",
  loginLink: "https://example.com/login",
} as PasswordEmailProps;

export default PasswordEmail;

// Styles (reusing from your InvitationEmail example for consistency)
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

const passwordStyle = {
  fontWeight: "bold",
  color: "#ef4444", // A distinct color for the password
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
