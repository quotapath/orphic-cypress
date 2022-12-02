import sys
import json

thresholds = [90, 80]


def get_coverage_url():
    """Get line coverage from json-summary nyc report, passed from stdin"""
    coverage_data = json.load(sys.stdin)
    pct = round(coverage_data["total"]["lines"]["pct"])
    color = (
        "success"
        if pct > thresholds[0]
        else "yellow"
        if pct > thresholds[1]
        else "critical"
    )
    print(f"https://img.shields.io/badge/test%20coverage-{pct}-{color}")


get_coverage_url()
