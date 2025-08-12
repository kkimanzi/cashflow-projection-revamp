import Footer from "@/components/footer";
import PublicTopBar from "@/components/public-topbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CustomTopbar from "./custom-topbar";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-background">
      {!session ? <PublicTopBar /> : <CustomTopbar />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
