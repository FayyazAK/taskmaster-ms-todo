const redis = require('redis');

async function clearCache() {
  const client = redis.createClient({ 
    url: process.env.REDIS_URL || 'redis://localhost:6379' 
  });
  
  try {
    await client.connect();
    await client.flushAll();
    console.log('Redis cache cleared successfully');
    await client.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache(); 