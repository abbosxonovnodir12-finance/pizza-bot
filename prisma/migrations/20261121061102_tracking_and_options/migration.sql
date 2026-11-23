-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PREPARING';
ALTER TYPE "OrderStatus" ADD VALUE 'ON_THE_WAY';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "courierName" TEXT,
ADD COLUMN     "courierPhone" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "onTheWayAt" TIMESTAMP(3),
ADD COLUMN     "preparingAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
