import { AuthorizedServer } from "@/components/authorized-server";
import { ActionsMenu } from "./actions-menu";
import TransactionLedger from "./components/transactions/transactions-ledger";

export default async function DashboardPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <ActionsMenu />
        <AuthorizedServer scopes={["transaction:read", "transaction:read:own"]}>
          <TransactionLedger orgSlug={params.slug} />
        </AuthorizedServer>
      </div>
    </div>
  );
}
