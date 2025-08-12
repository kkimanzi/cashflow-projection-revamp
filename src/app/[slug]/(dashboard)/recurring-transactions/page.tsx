import { AuthorizedServer } from "@/components/authorized-server";
import RecurringTransactionTemplatesPage from "./details";

export default function RecurringTxPage() {
  return (
    <AuthorizedServer scopes="recurring_transaction:read">
      <RecurringTransactionTemplatesPage />
    </AuthorizedServer>
  );
}
