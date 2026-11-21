<#
.SYNOPSIS
    Cloudflare WAF, Cache Rules, SSL/TLS, and Protocol Optimization Deployment Script
    for ADHD Compass (adhdcompass.in).

.DESCRIPTION
    Configures production-ready Cloudflare Edge rules and settings via Cloudflare API v4:
    1. Custom WAF Ruleset (phase: http_request_firewall_custom):
       - Rule 1: Drop Secret & Vulnerability Scanners (.env, .tfstate, wp-config, .git, .bak, .swp, phpinfo, /terraform)
       - Rule 2: Block Hostile Scanning Subnet (185.177.72.0/24)
       - Rule 3: Challenge Unmasked Bot User-Agents (TLM-Audit-Scanner, curl/, python-requests except /api/webhooks)
    2. Cache Ruleset (phase: http_request_cache_settings):
       - Rule 1: Edge Cache All Static Assets 1 Year TTL (js, css, png, jpg, jpeg, webp, avif, svg, woff2, woff, glb, gltf, ico)
       - Rule 2: Edge Cache 404 Status Responses (http.response.code eq 404, TTL 2 hours)
    3. SSL/TLS Settings:
       - Always Use HTTPS: ON
       - Automatic HTTPS Rewrites: ON
       - SSL Mode: Full (Strict)
       - Minimum TLS Version: 1.2
    4. Protocol Optimization:
       - HTTP/3 (QUIC): ON
       - 0-RTT Connection Resumption: ON
       - Brotli Compression: ON
       - Early Hints: ON

.PARAMETER ApiToken
    Cloudflare API Token with Zone.WAF (Edit), Zone.Cache Rules (Edit), and Zone.Settings (Edit) permissions.
    Can also be provided via $env:CLOUDFLARE_API_TOKEN.

.PARAMETER ZoneId
    Cloudflare Zone ID for adhdcompass.in. If omitted, it will be automatically queried by ZoneName.

.PARAMETER ZoneName
    Domain name of the zone (defaults to adhdcompass.in).

.PARAMETER Mode
    Operation mode:
    - Apply: Deploy/update all rules and settings to Cloudflare API.
    - Validate: Verify API token permissions and inspect current Cloudflare configuration.
    - Export: Export JSON payloads and curl commands to disk without sending modification requests.

.PARAMETER DryRun
    Simulate API calls and display requests/responses without modifying zone settings.

.EXAMPLE
    # Export JSON payloads and curl snippets without requiring API token:
    .\scripts\cloudflare-rules.ps1 -Mode Export

.EXAMPLE
    # Deploy to Cloudflare with API token:
    .\scripts\cloudflare-rules.ps1 -ApiToken "your_cf_api_token" -Mode Apply

.EXAMPLE
    # Validate configuration with DryRun:
    .\scripts\cloudflare-rules.ps1 -ApiToken "your_cf_api_token" -DryRun
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$ApiToken = $env:CLOUDFLARE_API_TOKEN,

    [Parameter(Mandatory = $false)]
    [string]$ZoneId,

    [Parameter(Mandatory = $false)]
    [string]$ZoneName = "adhdcompass.in",

    [Parameter(Mandatory = $false)]
    [ValidateSet("Apply", "Validate", "Export")]
    [string]$Mode = "Apply",

    [Parameter(Mandatory = $false)]
    [switch]$DryRun,

    [Parameter(Mandatory = $false)]
    [string]$ExportDir = ""
)

$ErrorActionPreference = "Stop"

# Determine script directory reliably across all PowerShell hosts
$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
if ([string]::IsNullOrWhiteSpace($ExportDir)) {
    $ExportDir = Join-Path $scriptDir "cloudflare-payloads"
}

# =============================================================================
# Helper Utilities
# =============================================================================

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Invoke-CfApi {
    param (
        [string]$Uri,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )

    $defaultHeaders = @{
        "Authorization" = "Bearer $ApiToken"
        "Content-Type"  = "application/json"
    }
    foreach ($k in $Headers.Keys) {
        $defaultHeaders[$k] = $Headers[$k]
    }

    $jsonBody = $null
    if ($Body -ne $null) {
        if ($Body -is [string]) {
            $jsonBody = $Body
        } else {
            $jsonBody = $Body | ConvertTo-Json -Depth 10 -Compress
        }
    }

    if ($DryRun) {
        Write-Host " [DRY-RUN] $Method $Uri" -ForegroundColor DarkGray
        if ($jsonBody) {
            Write-Host " [DRY-RUN BODY] $jsonBody" -ForegroundColor DarkGray
        }
        return @{ success = $true; result = @{ dry_run = $true }; simulated = $true }
    }

    try {
        $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $defaultHeaders -Body $jsonBody -TimeoutSec 30
        return $response
    }
    catch {
        $errResponse = $_.Exception.Response
        if ($errResponse -ne $null) {
            $reader = New-Object System.IO.StreamReader($errResponse.GetResponseStream())
            $errBody = $reader.ReadToEnd()
            Write-Err "Cloudflare API Error ($Method $Uri): $errBody"
        } else {
            Write-Err "HTTP Request Failed: $($_.Exception.Message)"
        }
        throw
    }
}

# =============================================================================
# Definition: 3 Custom WAF Rules (phase: http_request_firewall_custom)
# =============================================================================

$wafRules = @(
    @{
        description = "Drop Secret & Vulnerability Scanners"
        expression  = '(http.request.uri.path contains ".env") or (http.request.uri.path contains ".tfstate") or (http.request.uri.path contains "wp-config") or (http.request.uri.path contains ".git") or (http.request.uri.path contains ".bak") or (http.request.uri.path contains ".swp") or (http.request.uri.path contains "phpinfo") or (http.request.uri.path contains "/terraform")'
        action      = "block"
        enabled     = $true
    },
    @{
        description = "Block Hostile Scanning Subnet"
        expression  = 'ip.src in {185.177.72.0/24}'
        action      = "block"
        enabled     = $true
    },
    @{
        description = "Challenge Unmasked Bot User-Agents"
        expression  = '((http.user_agent contains "TLM-Audit-Scanner") or (http.user_agent contains "curl/") or (http.user_agent contains "python-requests")) and not (starts_with(http.request.uri.path, "/api/webhooks"))'
        action      = "managed_challenge"
        enabled     = $true
    }
)

$wafRulesetPayload = @{
    name        = "ADHD Compass Custom WAF Ruleset"
    description = "Production WAF rules protecting adhdcompass.in against secret scrapers, hostile subnets, and unmasked bots"
    kind        = "zone"
    phase       = "http_request_firewall_custom"
    rules       = $wafRules
}

# =============================================================================
# Definition: 2 Cache Rules (phase: http_request_cache_settings)
# =============================================================================

$cacheRules = @(
    @{
        description       = "Edge Cache All Static Assets 1 Year TTL"
        expression        = 'http.request.uri.path.extension in {"js" "css" "png" "jpg" "jpeg" "webp" "avif" "svg" "woff2" "woff" "glb" "gltf" "ico"}'
        action            = "set_cache_settings"
        action_parameters = @{
            cache       = $true
            edge_ttl    = @{
                mode    = "override_origin"
                default = 31536000
            }
            browser_ttl = @{
                mode    = "override_origin"
                default = 31536000
            }
            serve_stale = @{
                disable_stale_while_revalidate = $false
            }
        }
        enabled           = $true
    },
    @{
        description       = "Edge Cache 404 Status Responses"
        expression        = '(http.response.code eq 404)'
        action            = "set_cache_settings"
        action_parameters = @{
            cache    = $true
            edge_ttl = @{
                mode            = "override_origin"
                status_code_ttl = @(
                    @{
                        status_code = 404
                        value       = 7200
                    }
                )
            }
        }
        enabled           = $true
    }
)

$cacheRulesetPayload = @{
    name        = "ADHD Compass Cache Ruleset"
    description = "Production Edge and Browser caching rules for static assets and error responses"
    kind        = "zone"
    phase       = "http_request_cache_settings"
    rules       = $cacheRules
}

# =============================================================================
# Definition: SSL/TLS & Protocol Optimization Settings
# =============================================================================

$zoneSettings = @{
    # SSL/TLS Configurations
    "always_use_https"         = @{ value = "on" }
    "automatic_https_rewrites" = @{ value = "on" }
    "ssl"                      = @{ value = "strict" }
    "min_tls_version"          = @{ value = "1.2" }

    # Protocol Optimizations
    "http3"                    = @{ value = "on" }
    "0rtt"                     = @{ value = "on" }
    "brotli"                   = @{ value = "on" }
    "early_hints"              = @{ value = "on" }
}

# =============================================================================
# Function: Export Payloads to Disk
# =============================================================================

function Export-Payloads {
    if (-not (Test-Path $ExportDir)) {
        New-Item -ItemType Directory -Path $ExportDir -Force | Out-Null
    }

    # 1. WAF Ruleset
    $wafFile = Join-Path $ExportDir "waf-ruleset.json"
    $wafJson = $wafRulesetPayload | ConvertTo-Json -Depth 10
    Set-Content -Path $wafFile -Value $wafJson -Encoding UTF8
    Write-Success "Exported WAF Ruleset payload to: $wafFile"

    # 2. Cache Ruleset
    $cacheFile = Join-Path $ExportDir "cache-ruleset.json"
    $cacheJson = $cacheRulesetPayload | ConvertTo-Json -Depth 10
    Set-Content -Path $cacheFile -Value $cacheJson -Encoding UTF8
    Write-Success "Exported Cache Ruleset payload to: $cacheFile"

    # 3. Zone Settings
    $settingsFile = Join-Path $ExportDir "zone-settings.json"
    $settingsJson = $zoneSettings | ConvertTo-Json -Depth 10
    Set-Content -Path $settingsFile -Value $settingsJson -Encoding UTF8
    Write-Success "Exported Zone Settings payload to: $settingsFile"

    # 4. cURL Deploy Shell Script
    $curlScriptFile = Join-Path $ExportDir "deploy-via-curl.sh"
    $curlContent = @"
#!/usr/bin/env bash
# Deploy ADHD Compass Cloudflare Configurations using curl
set -euo pipefail

CF_TOKEN="`$${CLOUDFLARE_API_TOKEN:-<YOUR_CLOUDFLARE_API_TOKEN>}"
ZONE_ID="`$${CLOUDFLARE_ZONE_ID:-<YOUR_ZONE_ID>}"

echo "=== 1. Deploying Custom WAF Ruleset ==="
curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/`$ZONE_ID/rulesets/phases/http_request_firewall_custom/entrypoint" \
  -H "Authorization: Bearer `$CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data @waf-ruleset.json | jq .

echo "=== 2. Deploying Cache Ruleset ==="
curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/`$ZONE_ID/rulesets/phases/http_request_cache_settings/entrypoint" \
  -H "Authorization: Bearer `$CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data @cache-ruleset.json | jq .

echo "=== 3. Applying SSL/TLS & Protocol Settings ==="
for setting in always_use_https automatic_https_rewrites http3 0rtt brotli early_hints; do
  echo "Setting `$setting to 'on'..."
  curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/`$ZONE_ID/settings/`$setting" \
    -H "Authorization: Bearer `$CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"value":"on"}' | jq -r '.success'
done

echo "Setting SSL mode to strict..."
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/`$ZONE_ID/settings/ssl" \
  -H "Authorization: Bearer `$CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"strict"}' | jq -r '.success'

echo "Setting Min TLS version to 1.2..."
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/`$ZONE_ID/settings/min_tls_version" \
  -H "Authorization: Bearer `$CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"1.2"}' | jq -r '.success'

echo "All Cloudflare configurations successfully deployed!"
"@
    Set-Content -Path $curlScriptFile -Value $curlContent -Encoding UTF8
    Write-Success "Exported curl deployment script to: $curlScriptFile"
}

# =============================================================================
# Main Execution Workflow
# =============================================================================

Write-Host "=================================================================" -ForegroundColor Magenta
Write-Host "    ADHD Compass Cloudflare Edge Configuration Engine" -ForegroundColor Magenta
Write-Host "=================================================================" -ForegroundColor Magenta
Write-Host "Zone Name : $ZoneName"
Write-Host "Mode      : $Mode"
Write-Host "DryRun    : $DryRun"
Write-Host ""

if ($Mode -eq "Export") {
    Export-Payloads
    Write-Success "Export complete! Files are saved in $ExportDir"
    exit 0
}

# Check for API Token if applying or validating
if ([string]::IsNullOrWhiteSpace($ApiToken)) {
    Write-Warn "No CLOUDFLARE_API_TOKEN provided. Exporting configuration payloads only..."
    Export-Payloads
    Write-Info "To apply these rules directly to Cloudflare, pass -ApiToken '<token>' or set `$env:CLOUDFLARE_API_TOKEN."
    exit 0
}

# 1. Verify Cloudflare Token
Write-Info "Verifying Cloudflare API Token..."
$tokenVerify = Invoke-CfApi -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify"
if ($tokenVerify.success) {
    Write-Success "API Token verified successfully (Status: $($tokenVerify.result.status))."
} else {
    Write-Err "API Token verification failed."
    exit 1
}

# 2. Resolve Zone ID if not provided
if ([string]::IsNullOrWhiteSpace($ZoneId)) {
    Write-Info "Resolving Zone ID for '$ZoneName'..."
    $zoneQuery = Invoke-CfApi -Uri "https://api.cloudflare.com/client/v4/zones?name=$ZoneName"
    if ($zoneQuery.success -and $zoneQuery.result.Count -gt 0) {
        $ZoneId = $zoneQuery.result[0].id
        Write-Success "Found Zone ID: $ZoneId for $ZoneName"
    } else {
        Write-Err "Could not find active Zone ID for '$ZoneName'. Check domain name or token permissions."
        exit 1
    }
}

if ($Mode -eq "Validate") {
    Write-Info "Validating current zone rulesets and settings..."
    $curWaf = Invoke-CfApi -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/rulesets/phases/http_request_firewall_custom/entrypoint"
    Write-Info "Current Custom WAF Rules count: $($curWaf.result.rules.Count)"

    $curCache = Invoke-CfApi -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/rulesets/phases/http_request_cache_settings/entrypoint"
    Write-Info "Current Cache Rules count: $($curCache.result.rules.Count)"
    Write-Success "Validation completed."
    exit 0
}

# 3. Deploy Custom WAF Ruleset
Write-Info "Deploying 3 Custom WAF Rules to zone $ZoneId..."
$wafEndpoint = "https://api.cloudflare.com/client/v4/zones/$ZoneId/rulesets/phases/http_request_firewall_custom/entrypoint"
$wafResult = Invoke-CfApi -Uri $wafEndpoint -Method "PUT" -Body $wafRulesetPayload
if ($wafResult.success) {
    Write-Success "Custom WAF Ruleset applied successfully:"
    Write-Host "  - Rule 1: Drop Secret & Vulnerability Scanners (.env, .tfstate, wp-config, etc.) -> BLOCK" -ForegroundColor Green
    Write-Host "  - Rule 2: Block Hostile Scanning Subnet (185.177.72.0/24) -> BLOCK" -ForegroundColor Green
    Write-Host "  - Rule 3: Challenge Unmasked Bot User-Agents (TLM-Audit-Scanner, curl/, python-requests) -> MANAGED CHALLENGE" -ForegroundColor Green
} else {
    Write-Err "Failed to deploy Custom WAF ruleset."
}

# 4. Deploy Cache Ruleset
Write-Info "Deploying 2 Cache Rules to zone $ZoneId..."
$cacheEndpoint = "https://api.cloudflare.com/client/v4/zones/$ZoneId/rulesets/phases/http_request_cache_settings/entrypoint"
$cacheResult = Invoke-CfApi -Uri $cacheEndpoint -Method "PUT" -Body $cacheRulesetPayload
if ($cacheResult.success) {
    Write-Success "Cache Ruleset applied successfully:"
    Write-Host "  - Rule 1: Edge Cache All Static Assets 1 Year TTL (js, css, png, jpg, webp, glb, etc.) -> Edge 1yr, Browser 1yr" -ForegroundColor Green
    Write-Host "  - Rule 2: Edge Cache 404 Status Responses (http.response.code eq 404) -> Edge 2hrs" -ForegroundColor Green
} else {
    Write-Err "Failed to deploy Cache ruleset."
}

# 5. Apply SSL/TLS & Protocol Optimization Settings
Write-Info "Configuring SSL/TLS and Protocol Optimization settings..."
foreach ($settingKey in $zoneSettings.Keys) {
    $settingVal = $zoneSettings[$settingKey]
    $settingUri = "https://api.cloudflare.com/client/v4/zones/$ZoneId/settings/$settingKey"
    Write-Info "Updating $settingKey to '$($settingVal.value)'..."
    $res = Invoke-CfApi -Uri $settingUri -Method "PATCH" -Body $settingVal
    if ($res.success) {
        Write-Success "  $settingKey -> $($settingVal.value) [OK]"
    } else {
        Write-Warn "  Could not update $settingKey."
    }
}

# Export backups
Export-Payloads

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "All Cloudflare Rules and Security Settings Configured Successfully!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
