export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { eventName, eventType, date, location, guestCount, budgetRange } = req.body;

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DB_ID = process.env.NOTION_DB_ID;

  if (!NOTION_TOKEN || !NOTION_DB_ID) {
    return res.status(500).json({ error: 'Notion credentials not configured' });
  }

  // Map budget range from form values to Notion select options
  const budgetMap = {
    'under-50k':   'Under 50000',
    '50k-1l':      '50000 to 100000',
    '1l-2l':       '100000 to 200000',
    '2l-5l':       '200000 to 500000',
    'above-5l':    'Above 500000',
  };

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DB_ID },
        properties: {
          'Event Name': {
            title: [{ text: { content: eventName || 'Untitled Event' } }],
          },
          'Event Type': {
            select: { name: eventType || 'Other' },
          },
          'Date': date ? {
            date: { start: date },
          } : undefined,
          'Location': {
            rich_text: [{ text: { content: location || '' } }],
          },
          'Guest Count': {
            number: parseInt(guestCount) || 0,
          },
          'Budget Range': {
            select: { name: budgetMap[budgetRange] || 'Under 50000' },
          },
          'Status': {
            select: { name: 'Planning' },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Notion error:', data);
      return res.status(500).json({ error: data.message || 'Notion API error' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
