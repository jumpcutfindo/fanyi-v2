import log from 'electron-log/main';

log.initialize();

log.transports.console.useStyles = true;
log.transports.console.format =
  '{scope} [{y}-{m}-{d} {h}:{i}:{s}.{ms}] %c[{level}]%c{text}';
log.scope.labelPadding = false;
log.scope.defaultLabel = 'app';

export const logger = log;
