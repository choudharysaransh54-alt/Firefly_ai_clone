"""Helpers for converting between "01:02:03" style timecodes and seconds."""


def parse_timestamp(value: str) -> float:
    """'83' -> 83.0, '01:23' -> 83.0, '1:01:23' -> 3683.0, '00:01:23.500' / ',500' -> 83.5"""
    parts = value.strip().replace(",", ".").split(":")
    seconds = 0.0
    for part in parts:
        seconds = seconds * 60 + float(part)
    return seconds


def format_timestamp(seconds: float) -> str:
    """83 -> '01:23', 3683 -> '1:01:23'"""
    total = int(seconds)
    hours, rest = divmod(total, 3600)
    minutes, secs = divmod(rest, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"
