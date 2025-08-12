import { AuthorizedServer } from "@/components/authorized-server";
import CategoriesPageDetails from "./categories-handler";

export default function CategoriesPage() {
  return (
    <AuthorizedServer scopes="transaction_category:read">
      <CategoriesPageDetails />
    </AuthorizedServer>
  );
}
