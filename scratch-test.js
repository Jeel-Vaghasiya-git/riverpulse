process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function checkLayers() {
  const domain = "rtwqmsdb1.cpcb.gov.in";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  };

  console.log("Checking layer IDs from 1 to 25...");
  for (let id = 1; id <= 25; id++) {
    const url = `https://${domain}/data/internet/layers/${id}/index.json`;
    try {
      const res = await fetch(url, { headers, method: 'HEAD' });
      if (res.ok) {
        // Fetch a small sample to inspect
        const dataRes = await fetch(url, { headers });
        const data = await dataRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const params = Array.from(new Set(data.map(d => d.stationparameter_name)));
          console.log(`Layer ${id} is ACTIVE. Item count: ${data.length}. Parameters:`, params);
        } else {
          console.log(`Layer ${id} is ACTIVE but empty or not an array.`);
        }
      }
    } catch (e) {
      // Ignore failures
    }
  }
}

checkLayers();
