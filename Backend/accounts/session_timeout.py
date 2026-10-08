import math
import time

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

LOGIN_AT_KEY = "auth_login_at"


def get_timeout_seconds():
    return int(getattr(settings, "AUTH_ABSOLUTE_TIMEOUT_SECONDS", 60 * 60 * 24))


@receiver(user_logged_in, dispatch_uid="accounts_stamp_login_time")
def stamp_login_time(sender, request, user, **kwargs):
    """Runs on every login (API login and /admin/ login). Records the one start time."""
    if request is not None and hasattr(request, "session"):
        request.session[LOGIN_AT_KEY] = time.time()  


def _remaining(request):
    """Exact seconds left (float). 0 if the login time is missing or the deadline passed."""
    login_at = request.session.get(LOGIN_AT_KEY)
    if not isinstance(login_at, (int, float)):
        return 0.0
    return max(0.0, login_at + get_timeout_seconds() - time.time())


def seconds_remaining(request):
    """Whole seconds left, rounded UP, for the frontend countdown."""
    return math.ceil(_remaining(request))


class FixedSessionTimeoutMiddleware:
    """Ends the session once the fixed deadline has passed."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and _remaining(request) <= 0:
            request.session.flush()  
            request.user = AnonymousUser()
        return self.get_response(request)