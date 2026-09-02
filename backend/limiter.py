from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared limiter instance. Keyed by client IP; swap get_remote_address for a
# per-user key function if you need per-account limits instead.
limiter = Limiter(key_func=get_remote_address)
