FROM ghcr.io/aguglie/asterisk-docker:16.27.0

COPY audios /var/lib/asterisk/sounds/en
COPY config/ /etc/asterisk

CMD ["/usr/sbin/asterisk", "-f"]
