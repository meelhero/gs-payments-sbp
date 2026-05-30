export default async function handler(req, res) {

  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://grange-see.com'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    const {
      product,
      amount,
      email,
      phone
    } = req.body;

    const customer = {};

    if (email && email.trim()) {
      customer.email = email.trim();
    }

    if (phone && phone.trim()) {
      customer.phone = phone.trim();
    }

    if (
      !customer.email &&
      !customer.phone
    ) {
      return res.status(400).json({
        error:
          'Укажите email или телефон для чека'
      });
    }

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

            customer,

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

    const data =
      await response.json();

    if (!response.ok) {

      return res
        .status(response.status)
        .json(data);

    }

    return res.status(200).json({

      paymentId: data.id,

      status: data.status,

      url:
        data.confirmation
          ?.confirmation_url

    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}
