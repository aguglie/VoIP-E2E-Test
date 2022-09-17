const AmiClient = require('asterisk-ami-client');
const logger = require('pino')();
const hyperid = require('hyperid');

class CallService {
  constructor({
    asteriskHost,
    asteriskPort,
    amiUser,
    amiPassword,
  }) {
    this.asteriskHost = asteriskHost;
    this.asteriskPort = asteriskPort;
    this.amiUser = amiUser;
    this.amiPassword = amiPassword;

    this.hyperidInstance = hyperid();
  }

  async dial(number, maxDuration = 30) {
    const client = new AmiClient({
      reconnect: false,
      maxAttemptsCount: 2,
      attemptsDelay: 1000,
    });

    await client.connect(this.amiUser, this.amiPassword, {
      host: this.asteriskHost,
      port: this.asteriskPort,
    });

    const callPromise = new Promise((resolve) => {
      const actionId = this.hyperidInstance();
      let asteriskUniqueId = '-1';
      let rtpQosStats = null;
      let callStartedAt = null;

      client.action({
        Action: 'Originate',
        Channel: `SIP/${number}@pstn`,
        Context: 'call-test',
        Exten: 'start',
        Priority: 1,
        Timeout: 30000,
        ActionID: actionId,
        Async: 'true',
        Variable: `TIMEOUT(absolute)=${maxDuration}`,
      });

      client.on('event', (event) => {
        if (event.ActionID === actionId && event.Event === 'OriginateResponse') {
          if (event.Response === 'Success') {
            asteriskUniqueId = event.Uniqueid;
            callStartedAt = Date.now();
            logger.info({
              message: 'Call started',
              asteriskUniqueId,
              event,
            });
          } else {
            logger.info({
              message: 'Call failed',
              asteriskUniqueId,
              event,
            });
            resolve({ isSuccess: false });
          }
        }

        if (event.Event === 'VarSet' && event.Variable === 'RTPAUDIOQOS' && event.Uniqueid === asteriskUniqueId) {
          rtpQosStats = event.Value
            .split(';')
            .reduce((acc, item) => {
              const [key, value] = item.split('=');
              return {
                ...acc,
                [key]: parseFloat(value),
              };
            }, {});
        }

        if (event.Event === 'Hangup' && event.Uniqueid === asteriskUniqueId) {
          const duration = (Date.now() - callStartedAt) / 1000;
          logger.info({
            message: 'Call ended',
            asteriskUniqueId,
            rtpQosStats,
            duration,
          });
          resolve({
            isSuccess: true,
            rtpQosStats,
            duration,
          });
        }
      });
    });

    return callPromise.finally(() => client.disconnect());
  }
}

module.exports = CallService;
