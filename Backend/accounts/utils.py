def get_short_name(full_name):

    if not full_name:
        return ""

    parts = full_name.strip().split()

    return " ".join(parts[:2])

def get_display_name(user):

    if user is None:
        return None

    short_name = get_short_name(user.first_name)

    if short_name:
        return short_name

    if user.email:
        return user.email.split("@")[0]

    return user.username