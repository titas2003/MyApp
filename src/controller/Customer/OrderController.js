const Order = require("../../models/Customer/OrderSchema");
const jwt = require('jsonwebtoken');
const CUSTOMER_SECRET_KEY = "MyApp";

// Utility function to extract customer ID from the token
const getCustomerIdFromToken = (token) => {
    try {
        const decode = jwt.verify(token, process.env.CUSTOMER_SECRET_KEY);
        return decode.id; // Assuming the customer ID is stored as 'id' in the JWT payload
    } catch (error) {
        return null;
    }
};

// Create an order for the logged-in user
const createOrder = async (req, res) => {
    const { productId } = req.body;
    const token = req.header('Authorization')?.replace('Bearer',''); // Bearer TOKEN format
    const customerId = getCustomerIdFromToken(token);

    if (!customerId) {
        return res.status(401).json({ message: 'You must be logged in to place an order.' });
    }

    try {
        // Capture the current date and time for the order
        const orderTime = new Date();

        // Create a new order
        const newOrder = new Order({
            customerId: customerId,
            productId: productId,
            orderStatus: "not delivered",
            paymentStatus: "pending",
            orderTime: orderTime,
        });

        await newOrder.save();

        res.status(201).json({ message: 'Order placed successfully', newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
};

// Get all orders for the logged-in user
const getCustomerOrders = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer','');
    const customerId = getCustomerIdFromToken(token);

    if (!customerId) {
        return res.status(401).json({ message: 'You must be logged in to view your orders.' });
    }

    try {
        const orders = await Order.find({ customerId: customerId });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
    }
};

module.exports = { createOrder, getCustomerOrders };
