export default async function handler(req, res) {

  const response = await fetch(
    'https://grange-see.com/tstore/yml/19bc76915fadb8f217eaeda56f6f0ff5.yml'
  );

  const xml = await response.text();

  const offers =
    xml.match(/<offer[\s\S]*?<\/offer>/g) || [];

  const products = [];

  offers.forEach(offer => {

    const nameMatch =
      offer.match(/<name>(.*?)<\/name>/s);

    const priceMatch =
      offer.match(/<price>(.*?)<\/price>/s);

    const colorMatch =
      offer.match(
        /<param name="Цвет">(.*?)<\/param>/s
      );

    const accessoryMatch =
      offer.match(
        /<param name="Обвес">(.*?)<\/param>/s
      );

    const urlMatch =
      offer.match(/<url>(.*?)<\/url>/s);

    if (!nameMatch || !priceMatch) {
      return;
    }

    const name =
      nameMatch[1].trim();

    // Исключаем сертификаты
    if (
      name.includes(
        'Подарочный электронный сертификат'
      )
    ) {
      return;
    }

    const price =
      priceMatch[1].trim();

    const color =
      colorMatch
        ? colorMatch[1].trim()
        : '';

    const accessory =
      accessoryMatch
        ? accessoryMatch[1].trim()
        : '';

    const parts = [];

    if (color) {
      parts.push(color);
    }

    if (accessory) {
      parts.push(accessory);
    }

    const fullName =
      parts.length
        ? `${name} — ${parts.join(' / ')}`
        : name;

    products.push({
      name,
      fullName,
      price,
      color,
      accessory,
      url: urlMatch
        ? urlMatch[1].trim()
        : ''
    });

  });

  // Сортировка по названию
  products.sort((a, b) =>
    a.fullName.localeCompare(
      b.fullName,
      'ru'
    )
  );

  res.status(200).json(products);

}
