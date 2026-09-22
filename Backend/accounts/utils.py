def get_short_name(full_name):
    
    if not full_name:
        return ""

    parts = full_name.strip().split()

    if len(parts) <= 1:
        return full_name.strip()

    return " ".join(parts[:-1])