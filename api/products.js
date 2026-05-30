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
      offer.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/);

    const priceMatch =
      offer.match(/<price>(.*?)<\/price>/);

    const colorMatch =
      offer.match(/<param name="Цвет">(.*?)<\/param>/);

    const accessoryMatch =
      offer.match(/<param name="Обвес">(.*?)<\/param>/);

    if (!nameMatch || !priceMatch) return;

    const name = nameMatch[1];
    const price = priceMatch[1];

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
      color,
      accessory,
      price
    });

  });

  res.status(200).json(products);
}
