import log from 'electron-log/main';

log.initialize();

log.transports.console.useStyles = true;
log.transports.console.format =
  '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] %c[{level}]%c{text}';

export const logger = log;
