const axios = require('axios');
const logger = require('pino')();

const axiosInstance = axios.create({
  timeout: 10000,
});

async function httpPing(url, method = 'GET') {
  try {
    await axiosInstance({
      method,
      url,
    });
    logger.info({
      message: 'HTTP ping sent',
      url,
      method,
    });
  } catch (error) {
    logger.error({
      message: 'HTTP ping failed',
      errorMessage: error.message,
      url,
      method,
    });
  }
}

module.exports = httpPing;
