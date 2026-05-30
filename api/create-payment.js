export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const { product, amount, email } = req.body;

  const auth = Buffer
    .from(
      process.env.YOOKASSA_SHOP_ID +
      ':' +
      process.env.YOOKASSA_SECRET_KEY
    )
    .toString('base64');

  const response = await fetch(
    'https://api.yookassa.ru/v3/payments',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': crypto.randomUUID()
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency: 'RUB'
        },

        capture: true,
        description: product,

        confirmation: {
          type: 'redirect',
          return_url: 'https://grange-see.com'
        },

        payment_method_data: {
          type: 'sbp'
        },

        receipt: {
          customer: {
            email: email
          },

          items: [
            {
              description: product,
              quantity: '1.00',

              amount: {
                value: amount,
                currency: 'RUB'
              },

              vat_code: 1
            }
          ]
        }
      })
    }
  );

  const data = await response.json();

  if (!data.confirmation) {
    return res.status(400).json(data);
  }

  return res.status(200).json({
    url: data.confirmation.confirmation_url
  });
}
