import logging

RESET = "\033[0m"
BLUE = "\033[94m"
YELLOW = "\033[93m"
RED = "\033[91m"

class ColorFormatter(logging.Formatter):
    def format(self, record):
        try:
            status = record.status
        except AttributeError:
            status = 0

        if status == 304:
            color = BLUE
        elif status == 404:
            color = YELLOW
        elif 500 <= status < 600:
            color = RED
        else:
            color = RESET

        ip_formatted = f"{record.ip:<15}"
        method_formatted = f"{record.method:<6}"
        path_formatted = f"{color}{record.path:<50}"
        status_formatted = f"{color}{record.status:<3}{RESET}"

        record.ip = ip_formatted
        record.method = method_formatted
        record.path = path_formatted
        record.status = status_formatted

        return super().format(record)

class SensitiveInfoFilter(logging.Filter):
    def filter(self, record):
        message = record.getMessage()
        if 'GET' in message or 'POST' in message:
            parts = message.split(' ')
            for i, part in enumerate(parts):
                if part.startswith('/'):
                    url = part.split('?')[0]
                    parts[i] = url
            record.msg = ' '.join(parts)
            record.args = ()
        return True

def setup_logging():
    # Access Logger
    access_logger = logging.getLogger('access')
    access_logger.setLevel(logging.INFO)
    access_handler = logging.StreamHandler()
    access_formatter = ColorFormatter('[%(asctime)s] from %(ip)s %(method)s %(path)s %(status)s',
                                      '%Y-%m-%d %H:%M:%S')
    access_handler.setFormatter(access_formatter)
    access_logger.addHandler(access_handler)
    access_logger.addFilter(SensitiveInfoFilter())

    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.disabled = True

    return access_logger