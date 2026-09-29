const https = require('https');

function singleRpcCall(method, params = []) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });

    const options = {
      hostname: 'api.devnet.solana.com',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'curl/8.13.0',
        'Accept': '*/*',
        'Connection': 'close',
        'Content-Length': Buffer.byteLength(postData)
      },
      agent: false,
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`RPC error: ${JSON.stringify(parsed.error)}`));
          } else {
            resolve(parsed.result);
          }
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message} - raw: ${data.slice(0, 100)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('RPC request timed out after 30s'));
    });

    req.write(postData);
    req.end();
  });
}

async function rpcCall(method, params = [], maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await singleRpcCall(method, params);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

module.exports = { rpcCall };
