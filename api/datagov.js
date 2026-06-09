export const config = {
  api: {
    bodyParser: false, // Disable automatic body parsing to forward raw bodies correctly
  },
};

export default async function handler(req, res) {
  // Handle CORS preflight requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse target path and query parameters
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathParam = url.searchParams.get('path') || '';
  url.searchParams.delete('path');
  const searchString = url.search;
  
  // Reconstruct the upstream target URL
  const targetUrl = `https://api.data.gov.in/${pathParam}${searchString}`;

  // Read the raw request body if present
  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    if (chunks.length > 0) {
      body = Buffer.concat(chunks);
    }
  }

  // Copy and adjust headers
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
      headers[key] = value;
    }
  }
  headers['host'] = 'api.data.gov.in';

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      redirect: 'follow',
    });

    // Copy response headers back (excluding Access-Control and body-related encoding headers)
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        !lowerKey.startsWith('access-control-') &&
        lowerKey !== 'content-encoding' &&
        lowerKey !== 'content-length' &&
        lowerKey !== 'transfer-encoding'
      ) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status);

    // Read the response as an ArrayBuffer and send it
    const responseBuffer = await response.arrayBuffer();
    res.send(Buffer.from(responseBuffer));
  } catch (error) {
    console.error('DataGov Proxy Error:', error);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
