"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrganization } from "@/hooks/use-organization";
import { type Member, authClient } from "@/lib/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, User, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import ScopeManager from "./scope-manager";

export default function MembersPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const { data: organization, isLoading } = useOrganization();

  // Send invitation mutation
  const { mutate: sendInvitation, isPending: isSending } = useMutation({
    mutationFn: async (email: string) => {
      if (!organization?.id) throw new Error("Organization id is required");
      const { error } = await authClient.organization.inviteMember({
        email,
        role: "member",
        organizationId: organization?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  // Remove member mutation
  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: async (memberId: string) => {
      if (!organization) {
        throw new Error("Organization missing");
      }
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: organization.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove member");
    },
  });

  // Cancel invitation mutation
  const { mutate: cancelInvitation, isPending: isCanceling } = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel invitation");
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    sendInvitation(email);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 md:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organization Members</h1>
      </div>

      {/* Invite New Member Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invite New Member</CardTitle>
          <CardDescription>
            Send an invitation to join your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
            />
            <Button type="submit" disabled={isSending || !email.trim()}>
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Members Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Members</CardTitle>
          <CardDescription>
            People who have accepted invitations to your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organization?.members.map((member) => {
                // Type cast member to include scopes
                const typedMember = member as Member;

                return (
                  <TableRow key={member.id}>
                    <TableCell className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {member.user.name || "No name"}
                    </TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell className="capitalize">{member.role}</TableCell>
                    <TableCell>
                      {typedMember.role !== "owner" ? (
                        <div className="flex gap-1">
                          <ScopeManager member={typedMember} />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            disabled={isRemoving}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Invitations that have been sent but not yet accepted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Invited By</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organization?.invitations
                .filter((invitation) => invitation.status === "pending")
                .map((invitation) => {
                  const inviter = organization.members.find(
                    (m) => m.userId === invitation.inviterId,
                  );
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        {inviter?.user.name || "Unknown"} (
                        {inviter?.user.email || "unknown"})
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.expiresAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitation(invitation.id)}
                          disabled={isCanceling}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
