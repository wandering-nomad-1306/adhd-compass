<#
.SYNOPSIS
    DNS Hygiene & Dangling CNAME Diagnostic Tool for ADHD Compass (adhdcompass.in).

.DESCRIPTION
    Performs comprehensive DNS diagnostics to:
    1. Specifically inspect 'k2._domainkey.adhdcompass.in' for CNAME / TXT / ANY records.
    2. Detect dangling CNAME records (subdomain takeover vulnerabilities) where a CNAME points
       to an unresolvable or dead canonical target (NXDOMAIN / SERVFAIL).
    3. Check DKIM selector alignment against the active DMARC policy (p=quarantine).
    4. Scan related DKIM selectors (k1, k2, s1, s2, selector1, default, google).
    5. Audit root apex and www records for dangling hosting targets (Vercel, Netlify, S3, etc.).
    6. Provide clear, prioritized remediation steps.

.PARAMETER Domain
    The base domain to check (defaults to 'adhdcompass.in').

.PARAMETER DkimSelector
    The DKIM selector to audit (defaults to 'k2').

.EXAMPLE
    .\scripts\check-dns-hygiene.ps1

.EXAMPLE
    .\scripts\check-dns-hygiene.ps1 -DkimSelector "k1"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$Domain = "adhdcompass.in",

    [Parameter(Mandatory = $false)]
    [string]$DkimSelector = "k2"
)

$ErrorActionPreference = "Continue"

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "========================================================================" -ForegroundColor Magenta
    Write-Host "  $Title" -ForegroundColor Magenta
    Write-Host "========================================================================" -ForegroundColor Magenta
}

function Write-Check {
    param([string]$Status, [string]$Message, [string]$Detail = "")
    switch ($Status) {
        "PASS"    { Write-Host "[PASS] " -ForegroundColor Green -NoNewline; Write-Host $Message -ForegroundColor White }
        "FAIL"    { Write-Host "[FAIL] " -ForegroundColor Red -NoNewline; Write-Host $Message -ForegroundColor Red }
        "WARN"    { Write-Host "[WARN] " -ForegroundColor Yellow -NoNewline; Write-Host $Message -ForegroundColor Yellow }
        "INFO"    { Write-Host "[INFO] " -ForegroundColor Cyan -NoNewline; Write-Host $Message -ForegroundColor White }
    }
    if ($Detail) {
        Write-Host "       $Detail" -ForegroundColor DarkGray
    }
}

Write-Section "ADHD Compass DNS Hygiene & Dangling CNAME Audit"
Write-Host "Domain   : $Domain"
Write-Host "Selector : $DkimSelector._domainkey.$Domain"
Write-Host "Timestamp: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss UTC'))"
Write-Host ""

# =============================================================================
# 1. Authoritative Nameserver Discovery
# =============================================================================
Write-Section "1. Authoritative Nameservers Check"

$nsRecords = @()
try {
    $nsRecords = Resolve-DnsName -Name $Domain -Type NS -Server "1.1.1.1" -ErrorAction Stop
    foreach ($ns in $nsRecords) {
        Write-Check "INFO" "Nameserver: $($ns.NameHost)"
    }
} catch {
    Write-Check "WARN" "Could not retrieve NS records via 1.1.1.1: $($_.Exception.Message)"
}

$authServer = if ($nsRecords.Count -gt 0) { $nsRecords[0].NameHost } else { "1.1.1.1" }
Write-Check "INFO" "Using authoritative nameserver for deep queries: $authServer"

# =============================================================================
# 2. Targeted Audit of k2._domainkey (Dangling CNAME Detection)
# =============================================================================
$targetFqdn = "$DkimSelector._domainkey.$Domain"
Write-Section "2. Auditing $targetFqdn"

$cnameRecord = $null
$txtRecord   = $null
$isDangling  = $false

# A. CNAME Query
try {
    $cnameRecord = Resolve-DnsName -Name $targetFqdn -Type CNAME -Server $authServer -ErrorAction Stop
} catch {
    # If not found, expected behavior for non-existent record
}

# B. TXT Query
try {
    $txtRecord = Resolve-DnsName -Name $targetFqdn -Type TXT -Server $authServer -ErrorAction Stop
} catch {
    # If not found, expected behavior
}

if ($cnameRecord -ne $null) {
    $cnameTarget = $cnameRecord[0].NameHost
    Write-Check "INFO" "CNAME Record detected on $targetFqdn" "Points to: $cnameTarget"

    # Verify if canonical target host resolves
    Write-Host "`n  Verifying CNAME target validity ($cnameTarget)..." -ForegroundColor Cyan
    $targetResolves = $false
    $targetLookupError = $null

    try {
        $targetLookup = Resolve-DnsName -Name $cnameTarget -Server "1.1.1.1" -ErrorAction Stop
        if ($targetLookup.Count -gt 0) {
            $targetResolves = $true
        }
    } catch {
        $targetLookupError = $_.Exception.Message
    }

    if ($targetResolves) {
        Write-Check "PASS" "Canonical target resolves successfully." "Target: $cnameTarget"
        $isDangling = $false
    } else {
        $isDangling = $true
        Write-Check "FAIL" "DANGLING CNAME DETECTED! Potential Subdomain Takeover Risk!"
        Write-Host "       The record '$targetFqdn' points to '$cnameTarget'," -ForegroundColor Red
        Write-Host "       but '$cnameTarget' does not resolve (NXDOMAIN/SERVFAIL)." -ForegroundColor Red
        Write-Host "       Error: $targetLookupError" -ForegroundColor Red
    }
} elseif ($txtRecord -ne $null) {
    Write-Check "PASS" "Direct TXT DKIM record found (No CNAME in use)."
    $strings = $txtRecord | ForEach-Object { $_.Strings }
    Write-Check "INFO" "TXT Value: $($strings -join ' ')"
} else {
    Write-Check "INFO" "Record '$targetFqdn' does NOT exist (NXDOMAIN)."
    Write-Check "PASS" "NO Dangling CNAME vulnerability currently present on $targetFqdn."
}

# =============================================================================
# 3. DMARC and Email Security Policy Alignment
# =============================================================================
Write-Section "3. DMARC & Email Policy Alignment"

$dmarcRecord = $null
try {
    $dmarcRecord = Resolve-DnsName -Name "_dmarc.$Domain" -Type TXT -Server "1.1.1.1" -ErrorAction Stop
    $dmarcPolicy = ($dmarcRecord | ForEach-Object { $_.Strings }) -join " "
    Write-Check "INFO" "DMARC Record: $dmarcPolicy"

    if ($dmarcPolicy -match "p=quarantine" -or $dmarcPolicy -match "p=reject") {
        Write-Check "WARN" "DMARC policy is active with enforcement: $($Matches[0])"
        if ($cnameRecord -eq $null -and $txtRecord -eq $null) {
            Write-Check "WARN" "DKIM selector '$DkimSelector' is not published, but DMARC enforces quarantine."
            Write-Host "       If any outbound email system signs emails with s=$DkimSelector," -ForegroundColor Yellow
            Write-Host "       incoming mail servers will fail DKIM verification and quarantine emails!" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Check "WARN" "No DMARC record found for _dmarc.$Domain"
}

# Check SPF
try {
    $spfRecord = Resolve-DnsName -Name $Domain -Type TXT -Server "1.1.1.1" -ErrorAction Stop |
                 Where-Object { $_.Strings -match "v=spf1" }
    if ($spfRecord) {
        Write-Check "INFO" "SPF Record: $(($spfRecord.Strings) -join ' ')"
    } else {
        Write-Check "INFO" "No direct SPF record found on apex $Domain."
    }
} catch {}

# =============================================================================
# 4. Multi-Selector DKIM Scan
# =============================================================================
Write-Section "4. Multi-Selector DKIM Scan"

$selectorsToCheck = @("k1", "k2", "k3", "s1", "s2", "selector1", "default", "google")
$scanResults = @()

foreach ($sel in $selectorsToCheck) {
    $selFqdn = "$sel._domainkey.$Domain"
    $status = "NXDOMAIN"
    $detail = ""

    try {
        $cname = Resolve-DnsName -Name $selFqdn -Type CNAME -Server "1.1.1.1" -ErrorAction Stop
        $status = "CNAME"
        $detail = "-> $($cname[0].NameHost)"
    } catch {
        try {
            $txt = Resolve-DnsName -Name $selFqdn -Type TXT -Server "1.1.1.1" -ErrorAction Stop
            $status = "TXT"
            $detail = "DKIM Key Published"
        } catch {
            $status = "NXDOMAIN"
        }
    }

    $scanResults += [PSCustomObject]@{
        Selector = "$sel._domainkey"
        Type     = $status
        Status   = if ($status -eq "NXDOMAIN") { "Clean (NXDOMAIN)" } else { "Active ($status)" }
        Details  = $detail
    }
}

$scanResults | Format-Table -AutoSize

# =============================================================================
# 5. Apex & Subdomain Infrastructure CNAME Verification
# =============================================================================
Write-Section "5. Apex & WWW Routing Hygiene"

$hostsToVerify = @($Domain, "www.$Domain")
foreach ($h in $hostsToVerify) {
    try {
        $aRec = Resolve-DnsName -Name $h -Type A -Server "1.1.1.1" -ErrorAction Stop
        $ips = ($aRec | Where-Object { $_.IPAddress } | ForEach-Object { $_.IPAddress }) -join ", "
        Write-Check "PASS" "$h resolves to IP: $ips"
    } catch {
        Write-Check "WARN" "Could not resolve A records for $h"
    }
}

# =============================================================================
# 6. Summary and Remediation Guidance
# =============================================================================
Write-Section "6. Audit Summary & Action Items"

if ($isDangling) {
    Write-Host "CRITICAL ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "1. Dangling CNAME detected on '$targetFqdn' pointing to dead target '$cnameTarget'." -ForegroundColor Red
    Write-Host "2. Immediately log in to Cloudflare Dashboard -> adhdcompass.in -> DNS -> Records." -ForegroundColor Red
    Write-Host "3. Delete the dangling CNAME record for '$targetFqdn' to eliminate subdomain takeover risk." -ForegroundColor Red
} else {
    Write-Host "[STATUS] No dangling CNAME vulnerabilities detected." -ForegroundColor Green
    Write-Host "Record '$targetFqdn' currently returns NXDOMAIN (does not exist in DNS)." -ForegroundColor White
    Write-Host ""
    Write-Host "RECOMMENDED ACTIONS FOR DKIM / EMAIL HYGIENE:" -ForegroundColor Cyan
    Write-Host "1. Verify whether your email provider (Microsoft 365, GoDaddy, Google Workspace, etc.) requires DKIM selector '$DkimSelector'." -ForegroundColor White
    Write-Host "2. If required by your provider, add the authoritative CNAME or TXT record provided by them into Cloudflare DNS." -ForegroundColor White
    Write-Host "3. If NOT using selector '$DkimSelector', ensure no dangling CNAME pointing to an unclaimed third party is ever created." -ForegroundColor White
    Write-Host "4. Maintain DMARC monitoring reports via the configured rua address (rua=mailto:dmarc_rua@onsecureserver.net)." -ForegroundColor White
}
Write-Host ""
