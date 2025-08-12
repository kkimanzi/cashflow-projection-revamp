// components/invalid-invitation.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Lock, Mail } from "lucide-react";
import Link from "next/link";

type InvalidReason = "required" | "not-found" | "already-accepted" | "expired";

export default function InvalidInvitation({
  reason,
}: { reason: InvalidReason }) {
  const messages = {
    required: {
      title: "Invitation Required",
      description: "You need a valid invitation to create an account.",
      icon: <Lock className="h-12 w-12 text-amber-500" />,
    },
    "not-found": {
      title: "Invitation Not Found",
      description: "This invitation link is invalid or may have been deleted.",
      icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
    },
    "already-accepted": {
      title: "Invitation Already Used",
      description: "This invitation has already been accepted.",
      icon: <CheckCircle2 className="h-12 w-12 text-green-500" />,
    },
    expired: {
      title: "Invitation Expired",
      description: "This invitation link has expired.",
      icon: <Mail className="h-12 w-12 text-yellow-500" />,
    },
  };

  const { title, description, icon } = messages[reason];

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto">{icon}</div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>{description}</p>
          <Button asChild className="mt-4">
            <Link href="/">Return to Homepage</Link>
          </Button>
          {reason === "required" && (
            <p className="text-sm text-muted-foreground">
              Please contact your organization administrator for an invitation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
