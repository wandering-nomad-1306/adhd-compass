# =============================================================================
# ADHD Compass - Cloudflare Terraform Variables
# =============================================================================

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API Token with Zone.WAF (Edit), Zone.Cache Rules (Edit), and Zone.Settings (Edit) permissions"
  sensitive   = true
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare Zone ID for adhdcompass.in"
}

variable "zone_name" {
  type        = string
  description = "Apex domain name for the zone"
  default     = "adhdcompass.in"
}
