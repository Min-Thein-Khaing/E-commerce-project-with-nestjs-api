/*
  Warnings:

  - Added the required column `subTotal` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "subTotal" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL;
