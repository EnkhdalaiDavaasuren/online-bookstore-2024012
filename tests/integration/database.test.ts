import { beforeEach, describe, expect, it } from "vitest";
import { addBook, addCategory, addCustomer, addOrder, addOrderEvent, addOrderItem, clearDatabase } from "../helpers/database";

const expectConstraintFailure = async (operation: Promise<unknown>): Promise<void> => {
  await expect(operation).rejects.toThrow();
};

describe("initial D1 schema constraints", () => {
  beforeEach(clearDatabase);

  it("enforces primary keys on all six tables", async () => {
    await addCategory(1, "Databases");
    await expectConstraintFailure(addCategory(1, "Fiction"));
    await addBook(1, 1, "Database Basics", "A. Writer", "9780000000001", 1250, 2);
    await expectConstraintFailure(addBook(1, 1, "Another Title", "B. Writer", "9780000000002", 1500, 3));
    await addCustomer(1);
    await expectConstraintFailure(addCustomer(1, "different@example.test"));
    await addOrder(1, 1, "request-1");
    await expectConstraintFailure(addOrder(1, 1, "request-2"));
    await addOrderItem(1, 1);
    await expectConstraintFailure(addOrderItem(1, 1, 2, 1300));
    await addOrderEvent(1, 1);
    await expectConstraintFailure(addOrderEvent(1, 1, "confirmed"));
  });

  it("enforces unique category names, non-null ISBNs, customer emails, and request keys", async () => {
    await addCategory(1, "Databases");
    await expectConstraintFailure(addCategory(2, "Databases"));
    await addCategory(2, "Fiction");
    await addBook(1, 1, "Book One", "A. Writer", "9780000000001", 1000, 1);
    await expectConstraintFailure(addBook(2, 2, "Book Two", "B. Writer", "9780000000001", 1000, 1));
    await addBook(3, 2, "Book Without ISBN A", "C. Writer", null, 1000, 1);
    await addBook(4, 2, "Book Without ISBN B", "D. Writer", null, 1000, 1);
    await addCustomer(1, "same@example.test");
    await expectConstraintFailure(addCustomer(2, "same@example.test"));
    await addCustomer(2);
    await addOrder(1, 1, "shared-request-key");
    await expectConstraintFailure(addOrder(2, 2, "shared-request-key"));
  });

  it("enforces category name and book monetary/stock checks", async () => {
    await expectConstraintFailure(addCategory(1, ""));
    await addCategory(1, "Databases");
    await expectConstraintFailure(addBook(1, 1, "Negative Price", "Writer", null, -1, 0));
    await expectConstraintFailure(addBook(1, 1, "Fractional Price", "Writer", null, 12.5, 0));
    await expectConstraintFailure(addBook(1, 1, "Negative Stock", "Writer", null, 100, -1));
    await expectConstraintFailure(addBook(1, 1, "Fractional Stock", "Writer", null, 100, 1.5));
  });

  it("enforces order status, order item quantity/price, and event type checks", async () => {
    await addCategory(1, "Databases");
    await addBook(1, 1, "Database Basics", "Writer", null, 1000, 1);
    await addCustomer(1);
    await addOrder(1, 1, "request-1");
    await expectConstraintFailure(addOrder(2, 1, "request-2", "shipped"));
    await expectConstraintFailure(addOrderItem(1, 1, 0));
    await expectConstraintFailure(addOrderItem(1, 1, -1));
    await expectConstraintFailure(addOrderItem(1, 1, 1.5));
    await expectConstraintFailure(addOrderItem(1, 1, 1, -1));
    await expectConstraintFailure(addOrderItem(1, 1, 1, 10.5));
    await expectConstraintFailure(addOrderEvent(1, 1, "refunded"));
  });

  it("enforces foreign keys for books, orders, line items, and order events", async () => {
    await expectConstraintFailure(addBook(1, 999, "Orphan Book", "Writer", null, 100, 1));
    await addCategory(1, "Databases");
    await addBook(1, 1, "Database Basics", "Writer", null, 100, 1);
    await expectConstraintFailure(addOrder(1, 999, "orphan-order"));
    await expectConstraintFailure(addOrderItem(999, 1));
    await expectConstraintFailure(addOrderItem(1, 999));
    await expectConstraintFailure(addOrderEvent(1, 999));
  });
});
