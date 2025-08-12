"use client";

import { Button } from "@/components/ui/button";
import type { TransactionCategoryDto } from "@/db/dto/transaction-category";
import { useScopeCheck } from "@/hooks/use-scope-check";
import { ChevronLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CategoryFormDialog } from "./category-form-dialog";
import { CategoryTable } from "./category-table";

export default function CategoriesPageDetails() {
  const pathname = usePathname();
  const ledgerPath = pathname.replace("/transaction-categories", "");
  const { checkScope } = useScopeCheck();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<TransactionCategoryDto | null>(null);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" className="gap-2">
          <Link href={ledgerPath}>
            <ChevronLeft className="h-4 w-4" />
            Back to Ledger
          </Link>
        </Button>
        {checkScope("transaction_category:create") && (
          <Button
            onClick={() => {
              setCurrentCategory(null);
              setIsFormDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Category
          </Button>
        )}
      </div>

      <CategoryTable />
      <CategoryFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        category={currentCategory}
      />
    </div>
  );
}
