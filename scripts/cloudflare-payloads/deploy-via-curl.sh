#!/usr/bin/env bash
# Deploy ADHD Compass Cloudflare Configurations using curl
set -euo pipefail

CF_TOKEN="$"
ZONE_ID="$"

echo "=== 1. Deploying Custom WAF Ruleset ==="
curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/phases/http_request_firewall_custom/entrypoint" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data @waf-ruleset.json | jq .

echo "=== 2. Deploying Cache Ruleset ==="
curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/phases/http_request_cache_settings/entrypoint" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data @cache-ruleset.json | jq .

echo "=== 3. Applying SSL/TLS & Protocol Settings ==="
for setting in always_use_https automatic_https_rewrites http3 0rtt brotli early_hints; do
  echo "Setting $setting to 'on'..."
  curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/$setting" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"value":"on"}' | jq -r '.success'
done

echo "Setting SSL mode to strict..."
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"strict"}' | jq -r '.success'

echo "Setting Min TLS version to 1.2..."
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/min_tls_version" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"1.2"}' | jq -r '.success'

echo "All Cloudflare configurations successfully deployed!"
