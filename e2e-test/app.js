const logger = require('pino')();
const cron = require('node-cron');
const envSchema = require('env-schema');
const CallService = require('./lib/CallService');
const e2eCallTest = require('./lib/e2eCallTest');
const httpPing = require('./lib/httpPing');

const env = envSchema({
  schema: {
    type: 'object',
    properties: {
      ASTERISK_HOST: {
        type: 'string',
        description: 'The host of the Asterisk server',
      },
      ASTERISK_PORT: {
        type: 'number',
        description: 'The AMI port of the Asterisk server',
      },
      AMI_USER: {
        type: 'string',
        description: 'The AMI user of the Asterisk server',
      },
      AMI_PASSWORD: {
        type: 'string',
        description: 'The AMI password of the Asterisk server',
      },

      CRON_EXPRESSION: {
        type: 'string',
        pattern: '(((\\d+,)+\\d+|(\\d+(\\/|-)\\d+)|\\d+|\\*) ?){5,7}',
        description: 'The cron expression to run the test',
      },
      NUMBER_TO_CALL: {
        type: 'string',
        description: 'The number to call during the test',
      },
      MAX_CALL_DURATION: {
        type: 'number',
        minimum: 0,
        description: 'The maximum duration of the call in seconds after which it will be automatically hung up',
      },
      ASSERT_MIN_CALL_DURATION: {
        type: 'number',
        minimum: 0,
        description: 'The minimum duration of the call in seconds to pass the test',
      },
      ASSERT_MIN_RTP_PACKETS_RECEIVED: {
        type: 'number',
        minimum: 0,
        description: 'The minimum number of RTP packets to receive to pass the test',
      },

      SUCCESS_WEBHOOK_URL: {
        type: 'string',
        description: 'Optional URL to to ping on a successful test',
      },
      SUCCESS_WEBHOOK_URL_METHOD: {
        type: 'string',
        enum: ['GET', 'POST'],
      },

      FAILURE_WEBHOOK_URL: {
        type: 'string',
        description: 'Optional URL to to ping on a failed test',
      },
      FAILURE_WEBHOOK_URL_METHOD: {
        type: 'string',
        enum: ['GET', 'POST'],
      },
    },
    required: [
      'ASTERISK_HOST',
      'ASTERISK_PORT',
      'AMI_USER',
      'AMI_PASSWORD',
      'CRON_EXPRESSION',
      'NUMBER_TO_CALL',
      'MAX_CALL_DURATION',
      'ASSERT_MIN_CALL_DURATION',
      'ASSERT_MIN_RTP_PACKETS_RECEIVED',
    ],
  },
});

const callService = new CallService({
  asteriskHost: env.ASTERISK_HOST,
  asteriskPort: env.ASTERISK_PORT,
  amiUser: env.AMI_USER,
  amiPassword: env.AMI_PASSWORD,
});

const cronExpression = env.CRON_EXPRESSION;
const numberToCall = env.NUMBER_TO_CALL;
const maxCallDuration = env.MAX_CALL_DURATION;
const assertMinCallDuration = env.ASSERT_MIN_CALL_DURATION;
const assertMinRtpPacketsReceived = env.ASSERT_MIN_RTP_PACKETS_RECEIVED;

logger.info({
  message: 'Cron will run according to expression',
  cronExpression,
});

cron.schedule(cronExpression, async () => {
  logger.info({ message: 'Performing e2e call test' });

  const isSuccessful = await e2eCallTest(
    callService,
    numberToCall,
    maxCallDuration,
    assertMinCallDuration,
    assertMinRtpPacketsReceived,
  );

  if (isSuccessful) {
    logger.info({ message: 'e2e call test was successful' });

    if (env.SUCCESS_WEBHOOK_URL && env.SUCCESS_WEBHOOK_URL_METHOD) {
      await httpPing(env.SUCCESS_WEBHOOK_URL, env.SUCCESS_WEBHOOK_URL_METHOD);
    }
  } else {
    logger.error({ message: 'e2e call test failed' });

    if (env.FAILURE_WEBHOOK_URL && env.FAILURE_WEBHOOK_URL_METHOD) {
      await httpPing(env.FAILURE_WEBHOOK_URL, env.FAILURE_WEBHOOK_URL_METHOD);
    }
  }
});
