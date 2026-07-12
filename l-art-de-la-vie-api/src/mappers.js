export const productFromDb = (row) => ({
  id: row.id, code: row.code, name: row.name, category: row.category,
  price: Number(row.price), stock: row.stock, minStock: row.min_stock,
  ...(row.image_url ? { image: row.image_url } : {})
});

const itemFromDb = (row) => ({
  productId: row.product_id, productName: row.product_name, quantity: row.quantity,
  unitPrice: Number(row.unit_price), subtotal: Number(row.subtotal)
});

export const saleFromDb = (row) => ({
  id: `S${String(row.folio).padStart(3, "0")}`, date: row.created_at,
  items: (row.sale_items ?? []).map(itemFromDb), subtotal: Number(row.subtotal),
  discount: Number(row.discount), total: Number(row.total), paymentMethod: row.payment_method,
  ...(row.cash_received !== null ? { cashReceived: Number(row.cash_received), change: Number(row.change_amount) } : {})
});

export const movementFromDb = (row) => ({
  id: row.id, productId: row.product_id, productName: row.product_name,
  type: row.type, quantity: row.quantity, date: row.created_at,
  ...(row.note ? { note: row.note } : {})
});

export const expenseFromDb = (row) => ({
  id: row.id, description: row.description, amount: Number(row.amount), date: row.created_at
});

export const closeFromDb = (row) => ({
  id: row.id, date: row.business_date, totalSales: Number(row.total_sales),
  salesByMethod: { efectivo: Number(row.cash_sales), tarjeta: Number(row.card_sales), transferencia: Number(row.transfer_sales) },
  expectedCash: Number(row.expected_cash), actualCash: Number(row.actual_cash), difference: Number(row.difference),
  expenses: (row.cash_close_expenses ?? []).map((link) => expenseFromDb(link.expenses)),
  totalExpenses: Number(row.total_expenses)
});
