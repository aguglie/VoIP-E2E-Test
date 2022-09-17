# VoIP E2E Test

Designed to automate VoIP end-to-end test calls.

The script automatically calls a phone number based on a cron schedule.
The test is considered as passed if a minimum duration is reached and a threshold of RTP packets is received.

## Quickstart

* Copy the `example` folder.
* Fill [sip.conf](example/sip.conf) with valid SIP credentials. This account is used to place the test calls.
* Edit [docker-compose.yml](example/docker-compose.yaml) to set the cron schedule, the phone number to call, thresholds
  and webhook URLs.
* Run `docker-compose up -d` to start the test.
* The test will be executed according to the cron schedule.

## Parameters

| Environment variable              | Description                                                                    |
|-----------------------------------|--------------------------------------------------------------------------------|
| `CRON_EXPRESSION`                 | Cron schedule for the tests.                                                   |
| `NUMBER_TO_CALL`                  | Phone number to call.                                                          |
| `MAX_CALL_DURATION`               | Maximum duration of the call in seconds after which it's automatically closed. |
| `ASSERT_MIN_CALL_DURATION`        | Minimum duration of the call in seconds to consider the test as passed.        |
| `ASSERT_MIN_RTP_PACKETS_RECEIVED` | Minimum number of RTP packets to receive to pass the test.                     |
| `SUCCESS_WEBHOOK_URL`             | _Optional_ URL to call when the test is successful.                            |
| `SUCCESS_WEBHOOK_URL_METHOD`      | _Optional_ HTTP method to use when calling the success webhook.                |
| `FAILURE_WEBHOOK_URL`             | _Optional_ URL to call when the test fails.                                    |
| `FAILURE_WEBHOOK_URL_METHOD`      | _Optional_ HTTP method to use when calling the failure webhook.                |
| `ASTERISK_HOST`                   | Hostname of the Asterisk server.                                               |
| `ASTERISK_PORT`                   | Port of the Asterisk AMI interface.                                            |
| `AMI_USER`                        | Username of the AMI user.                                                      |
| `AMI_PASSWORD`                    | Password of the AMI user.                                                      |
