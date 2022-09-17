const logger = require('pino')();

async function callTest(callService, number, maxDuration, assertMinDuration, assertMinRxPackets) {
  const testLogger = logger.child({
    number,
    maxDuration,
    assertMinDuration,
    assertMinRxPackets,
  });

  const {
    isSuccess,
    rtpQosStats,
    duration,
  } = await callService.dial(number, maxDuration);

  if (!isSuccess) {
    testLogger.error({
      message: 'Failed to dial',
      duration,
    });
    return false;
  }

  const rxPackets = rtpQosStats.rxcount;

  if (duration < assertMinDuration) {
    testLogger.error({
      message: 'Call duration is less than expected',
      duration,
    });
    return false;
  }

  if (rxPackets < assertMinRxPackets) {
    testLogger.error({
      message: 'Received less packets than expected',
      rxPackets,
    });
    return false;
  }

  testLogger.info({
    message: 'Call succeeded',
    duration,
    rxPackets,
  });
  return true;
}

module.exports = callTest;
