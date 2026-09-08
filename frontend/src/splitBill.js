// Calculates how much each person owes.
//
// bill: the extracted Bill object (items, subtotal, tax, service_charge, discount, total)
// assignments: { [itemIndex]: [personName, personName, ...] }
//   e.g. { 0: ["Alice", "Bob"], 1: ["Alice"] }  → item 0 is shared by Alice & Bob, item 1 is Alice's alone
//
// Returns: { [personName]: { itemsTotal, taxShare, serviceShare, discountShare, total } }

export function splitBill(bill, assignments) {
  const people = new Set();
  Object.values(assignments).forEach((names) => names.forEach((n) => people.add(n)));

  const result = {};
  people.forEach((name) => {
    result[name] = { itemsTotal: 0, taxShare: 0, serviceShare: 0, discountShare: 0, total: 0 };
  });

  // 1. Split each item's cost evenly among its assignees
  bill.items.forEach((item, idx) => {
    const assignedTo = assignments[idx] || [];
    if (assignedTo.length === 0) return; // unassigned items are ignored for now

    const itemCost = item.price * item.quantity;
    const perPersonShare = itemCost / assignedTo.length;

    assignedTo.forEach((name) => {
      result[name].itemsTotal += perPersonShare;
    });
  });

  // 2. Distribute tax, service charge, and discount proportionally
  //    based on each person's share of the subtotal
  const subtotal = bill.subtotal || 1; // guard against divide-by-zero

  people.forEach((name) => {
    const share = result[name].itemsTotal / subtotal;
    result[name].taxShare = bill.tax * share;
    result[name].serviceShare = bill.service_charge * share;
    result[name].discountShare = bill.discount * share;

    result[name].total =
      result[name].itemsTotal +
      result[name].taxShare +
      result[name].serviceShare -
      result[name].discountShare;
  });

  return result;
}