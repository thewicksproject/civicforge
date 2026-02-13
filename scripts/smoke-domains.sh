#!/usr/bin/env bash
set -euo pipefail

PROD_DOMAIN="${1:-civicforge.org}"
DEV_DOMAIN="${2:-dev.civicforge.org}"

check_dns() {
  local domain="$1"
  if ! dig +short "$domain" A | grep -E "." >/dev/null; then
    echo "[smoke-domains] DNS lookup failed for $domain"
    return 1
  fi
  echo "[smoke-domains] DNS OK for $domain"
}

check_http() {
  local domain="$1"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" "https://${domain}")"
  if [[ ! "$code" =~ ^(200|301|302|307|308)$ ]]; then
    echo "[smoke-domains] Unexpected HTTP status for ${domain}: ${code}"
    return 1
  fi
  echo "[smoke-domains] HTTP OK for ${domain}: ${code}"
}

echo "[smoke-domains] Running domain smoke checks"

check_dns "$PROD_DOMAIN"
check_dns "$DEV_DOMAIN"

check_http "$PROD_DOMAIN"
check_http "$DEV_DOMAIN"

echo "[smoke-domains] All checks passed"
