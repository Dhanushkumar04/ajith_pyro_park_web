const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create a Razorpay order
app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, receipt } = req.body;
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 Paise)
            currency: currency || "INR",
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Failed to create order", error });
    }
});

// Route to verify payment signature
app.post('/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        res.status(200).json({ status: "success", message: "Payment verified successfully" });
    } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
});

// Route to handle order confirmation email (Placeholder logic)
app.post('/send-order-email', (req, res) => {
    const { clientName, clientEmail, orderId, totalAmount, customerInfo, cartItems } = req.body;
    
    console.log(`--- New Order Confirmed ---`);
    console.log(`Customer: ${clientName} (${clientEmail})`);
    console.log(`Order ID: ${orderId}`);
    console.log(`Amount: ₹${totalAmount}`);
    console.log(`Items:`, cartItems.map(i => `${i.name} x${i.quantity}`).join(', '));
    
    // In a real app, you'd use nodemailer to send an actual email here.
    res.status(200).json({ message: "Order details received and email sent to owner!" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
