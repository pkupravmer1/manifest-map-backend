const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { amount, description } = req.body;
      
      // Ваши ключи из ЮKassa
      const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
      const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
      
      const paymentData = {
        amount: {
          value: amount,
          currency: "RUB"
        },
        capture: true,
        description: description,
        confirmation: {
          type: "redirect",
          return_url: "https://t.me/your_bot"
        }
      };

      const response = await fetch('https://api.yookassa.ru/v3/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(YOOKASSA_SHOP_ID + ':' + YOOKASSA_SECRET_KEY).toString('base64'),
          'Idempotence-Key': Date.now().toString()
        },
        body: JSON.stringify(paymentData)
      });

      const payment = await response.json();
      
      if (payment.status === 'pending') {
        res.json({ 
          success: true, 
          payment_url: payment.confirmation.confirmation_url 
        });
      } else {
        res.json({ success: false, error: payment.description });
      }
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
