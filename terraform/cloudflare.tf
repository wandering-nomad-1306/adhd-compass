# =============================================================================
# ADHD Compass - Cloudflare Infrastructure as Code (Terraform)
# =============================================================================
# Implements:
#   1. Custom WAF Ruleset (Secret Scanners, Subnet Blacklist, Bot Challenge)
#   2. Cache Ruleset (Static Assets 1yr TTL, 404 Status Responses 2hrs TTL)
#   3. Zone Settings (SSL/TLS Strict, Always HTTPS, HTTP/3 QUIC, 0-RTT, Brotli)
# =============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.30"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# -----------------------------------------------------------------------------
# 1. Custom WAF Ruleset (phase: http_request_firewall_custom)
# -----------------------------------------------------------------------------
resource "cloudflare_ruleset" "custom_waf_rules" {
  zone_id     = var.cloudflare_zone_id
  name        = "ADHD Compass Custom WAF Ruleset"
  description = "Custom WAF security rules protecting adhdcompass.in"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  # Rule 1: Drop Secret & Vulnerability Scanners
  rules {
    action      = "block"
    expression  = "(http.request.uri.path contains \".env\") or (http.request.uri.path contains \".tfstate\") or (http.request.uri.path contains \"wp-config\") or (http.request.uri.path contains \".git\") or (http.request.uri.path contains \".bak\") or (http.request.uri.path contains \".swp\") or (http.request.uri.path contains \"phpinfo\") or (http.request.uri.path contains \"/terraform\")"
    description = "Drop Secret & Vulnerability Scanners"
    enabled     = true
  }

  # Rule 2: Block Hostile Scanning Subnet
  rules {
    action      = "block"
    expression  = "ip.src in {185.177.72.0/24}"
    description = "Block Hostile Scanning Subnet"
    enabled     = true
  }

  # Rule 3: Challenge Unmasked Bot User-Agents
  rules {
    action      = "managed_challenge"
    expression  = "((http.user_agent contains \"TLM-Audit-Scanner\") or (http.user_agent contains \"curl/\") or (http.user_agent contains \"python-requests\")) and not (starts_with(http.request.uri.path, \"/api/webhooks\"))"
    description = "Challenge Unmasked Bot User-Agents"
    enabled     = true
  }
}

# -----------------------------------------------------------------------------
# 2. Cache Ruleset (phase: http_request_cache_settings)
# -----------------------------------------------------------------------------
resource "cloudflare_ruleset" "cache_rules" {
  zone_id     = var.cloudflare_zone_id
  name        = "ADHD Compass Cache Ruleset"
  description = "Edge and Browser Cache settings for adhdcompass.in"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  # Rule 1: Edge Cache All Static Assets 1 Year TTL
  rules {
    action      = "set_cache_settings"
    expression  = "http.request.uri.path.extension in {\"js\" \"css\" \"png\" \"jpg\" \"jpeg\" \"webp\" \"avif\" \"svg\" \"woff2\" \"woff\" \"glb\" \"gltf\" \"ico\"}"
    description = "Edge Cache All Static Assets 1 Year TTL"
    enabled     = true

    action_parameters {
      cache = true

      edge_ttl {
        mode    = "override_origin"
        default = 31536000 # 1 Year (365 days)
      }

      browser_ttl {
        mode    = "override_origin"
        default = 31536000 # 1 Year
      }

      serve_stale {
        disable_stale_while_revalidate = false
      }
    }
  }

  # Rule 2: Edge Cache 404 Status Responses
  rules {
    action      = "set_cache_settings"
    expression  = "(http.response.code eq 404)"
    description = "Edge Cache 404 Status Responses"
    enabled     = true

    action_parameters {
      cache = true

      edge_ttl {
        mode = "override_origin"
        status_code_ttl {
          status_code = 404
          value       = 7200 # 2 Hours
        }
      }
    }
  }
}

# -----------------------------------------------------------------------------
# 3. Zone Settings: SSL/TLS & Protocol Optimization
# -----------------------------------------------------------------------------
resource "cloudflare_zone_settings_override" "zone_settings" {
  zone_id = var.cloudflare_zone_id

  settings {
    # SSL/TLS Configurations
    always_use_https         = "on"
    automatic_https_rewrites = "on"
    ssl                      = "strict"
    min_tls_version          = "1.2"

    # Protocol Optimizations
    http3       = "on"
    zero_rtt    = "on"
    brotli      = "on"
    early_hints = "on"
  }
}
