-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "pets" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "hasQuote" BOOLEAN NOT NULL DEFAULT false,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'DIRECT',
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "stage" TEXT NOT NULL DEFAULT 'BOOKED',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("adults", "channel", "checkIn", "checkOut", "children", "createdAt", "currency", "guestCount", "guestId", "hasQuote", "id", "infants", "notes", "paidAmount", "pets", "propertyId", "source", "status", "totalAmount", "updatedAt") SELECT "adults", "channel", "checkIn", "checkOut", "children", "createdAt", "currency", "guestCount", "guestId", "hasQuote", "id", "infants", "notes", "paidAmount", "pets", "propertyId", "source", "status", "totalAmount", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
