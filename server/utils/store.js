const Product = require('../models/product');
const taxConfig = require('../config/tax');

exports.disableProducts = async function (products) {
  let bulkOptions = products.map(item => ({
    updateOne: {
      filter: { _id: item._id },
      update: { isActive: false }
    }
  }));
  await Product.bulkWrite(bulkOptions);
};

exports.calculateTaxAmount = function (order) {
  try {
    const taxRate = taxConfig.stateTaxRate;

    order.totalTax = 0;
    if (order.products && order.products.length > 0) {
      order.products.forEach(item => {
        const price = item.purchasePrice || (item?.product?.price ?? 0);
        const quantity = item.quantity;
        item.totalPrice = price * quantity;
        item.purchasePrice = price;

        if (item.status !== 'Cancelled') {
          if (item.product?.taxable && item.priceWithTax === 0) {
            const taxAmount = price * taxRate;
            item.totalTax = parseFloat(Number((taxAmount * quantity).toFixed(2)));
            order.totalTax += item.totalTax;
          } else {
            order.totalTax += item.totalTax;
          }
        }

        item.priceWithTax = parseFloat(Number((item.totalPrice + item.totalTax).toFixed(2)));
      });
    }

    const hasCancelledItems = order.products.filter(item => item.status === 'Cancelled');
    if (hasCancelledItems.length > 0) {
      order.total = this.calculateOrderTotal(order);
    }

    const currentTotal = this.calculateOrderTotal(order);
    if (currentTotal !== order.total) {
      order.total = this.calculateOrderTotal(order);
    }

    order.totalWithTax = order.total + order.totalTax;
    order.total = parseFloat(Number(order.total.toFixed(2)));
    order.totalTax = parseFloat(Number((order.totalTax || 0).toFixed(2)));
    order.totalWithTax = parseFloat(Number(order.totalWithTax.toFixed(2)));
    return order;
  } catch (error) {
    return order;
  }
};

exports.calculateOrderTotal = function (order) {
  const total = order.products
    .filter(item => item.status !== 'Cancelled')
    .reduce((sum, current) => sum + current.totalPrice, 0);
  return total;
};

exports.calculateItemsSalesTax = function (items) {
  const taxRate = taxConfig.stateTaxRate;

  return items.map(item => {
    item.priceWithTax = 0;
    item.totalPrice = 0;
    item.totalTax = 0;
    item.purchasePrice = item.price;

    const price = item.purchasePrice;
    const quantity = item.quantity;
    item.totalPrice = parseFloat(Number((price * quantity).toFixed(2)));

    if (item.taxable) {
      const taxAmount = price * taxRate;
      item.totalTax = parseFloat(Number((taxAmount * quantity).toFixed(2)));
      item.priceWithTax = parseFloat(Number((item.totalPrice + item.totalTax).toFixed(2)));
    }

    return item;
  });
};

exports.formatOrders = function (orders) {
  const newOrders = orders.map(order => ({
    _id: order._id,
    total: parseFloat(Number(order.total.toFixed(2))),
    created: order.created,
    status: order.status,
    products: order?.cart?.products
  }));

  return newOrders.map(order =>
    order?.products ? this.calculateTaxAmount(order) : order
  );
};
