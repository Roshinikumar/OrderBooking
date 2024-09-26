import React, { useEffect, useState } from 'react';

const OrderBook = () => {
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080'); // WebSocket connection to the Node.js backend

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);

      // Check if it's an order book update
      if (Array.isArray(data[1])) {
        const price = data[1][0];
        const count = data[1][1];
        const amount = data[1][2];

        if (count > 0) {
          if (amount > 0) {
            // Buy order (positive amount)
            setBuyOrders((prevOrders) => [
              ...prevOrders.filter(order => order.price !== price),
              { price, count, amount }
            ]);
          } else if (amount < 0) {
            // Sell order (negative amount)
            setSellOrders((prevOrders) => [
              ...prevOrders.filter(order => order.price !== price),
              { price, count, amount: Math.abs(amount) }
            ]);
          }
        } else {
          // Remove order if count is 0
          setBuyOrders((prevOrders) => prevOrders.filter(order => order.price !== price));
          setSellOrders((prevOrders) => prevOrders.filter(order => order.price !== price));
        }
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const renderOrders = (orders) => (
    orders.sort((a, b) => b.price - a.price).map((order, index) => (
      <tr key={index}>
        <td>{order.price.toFixed(2)}</td>
        <td>{order.amount.toFixed(4)}</td>
      </tr>
    ))
  );

  return (
    <div>
      <h2>Order Book</h2>
      <div className="order-book-container">
        <div className="buy-orders">
          <h3>Buy Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {renderOrders(buyOrders)}
            </tbody>
          </table>
        </div>
        <div className="sell-orders">
          <h3>Sell Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {renderOrders(sellOrders)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
