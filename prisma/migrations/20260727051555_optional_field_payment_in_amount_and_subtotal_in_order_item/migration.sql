-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "subTotal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" DROP NOT NULL;
