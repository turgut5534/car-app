-- CreateTable
CREATE TABLE "ExpenseAttachment" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "url" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExpenseAttachment" ADD CONSTRAINT "ExpenseAttachment_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
