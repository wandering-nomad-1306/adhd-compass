# ADHD Compass - Cloudflare Terraform Infrastructure

This directory contains production Terraform configurations for managing Cloudflare edge rules and security settings for `adhdcompass.in`.

## Resources Managed

1. **Custom WAF Ruleset** (`cloudflare_ruleset.custom_waf_rules`):
   - **Rule 1: Drop Secret & Vulnerability Scanners**: Blocks requests matching `.env`, `.tfstate`, `wp-config`, `.git`, `.bak`, `.swp`, `phpinfo`, `/terraform`.
   - **Rule 2: Block Hostile Scanning Subnet**: Blocks incoming traffic from CIDR block `185.177.72.0/24`.
   - **Rule 3: Challenge Unmasked Bot User-Agents**: Applies Managed Challenge to `TLM-Audit-Scanner`, `curl/`, and `python-requests` (exempting webhook path `/api/webhooks`).

2. **Cache Ruleset** (`cloudflare_ruleset.cache_rules`):
   - **Rule 1: Edge Cache All Static Assets 1 Year TTL**: Caches static assets (`js`, `css`, `png`, `jpg`, `jpeg`, `webp`, `avif`, `svg`, `woff2`, `woff`, `glb`, `gltf`, `ico`) at edge and browser for 1 year (`31536000s`), with stale-while-revalidate enabled.
   - **Rule 2: Edge Cache 404 Status Responses**: Caches HTTP 404 responses at Cloudflare edge for 2 hours (`7200s`) to mitigate scanning DDoS and reduce origin overhead.

3. **Zone Settings** (`cloudflare_zone_settings_override.zone_settings`):
   - **SSL/TLS**: `Always Use HTTPS` (`on`), `Automatic HTTPS Rewrites` (`on`), `SSL Mode` (`strict`), `Minimum TLS Version` (`1.2`).
   - **Protocol Optimization**: `HTTP/3 (QUIC)` (`on`), `0-RTT Connection Resumption` (`on`), `Brotli Compression` (`on`), `Early Hints` (`on`).

## Deployment Instructions

### Prerequisites
- [Terraform](https://www.terraform.io/) >= 1.5.0 installed
- Cloudflare API token with `Zone.WAF (Edit)`, `Zone.Cache Rules (Edit)`, and `Zone.Settings (Edit)` permissions.

### Quick Start
```bash
cd terraform

# 1. Initialize working directory
terraform init

# 2. Configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your cloudflare_api_token and cloudflare_zone_id

# 3. Preview planned changes
terraform plan

# 4. Apply configurations to Cloudflare
terraform apply
```
