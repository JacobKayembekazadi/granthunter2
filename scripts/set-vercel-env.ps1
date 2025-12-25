# PowerShell script to set Vercel environment variables
# Run this after deployment to configure your app

Write-Host "🔧 Setting Vercel Environment Variables..." -ForegroundColor Cyan

# Required variables
$envVars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://xvrqtrkrqrcgypghjlvu.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "sb_publishable_FX14Enlcyz-ZXhEly9Ol9A_Yih-PTeE"
    "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cnF0cmtycXJjZ3lwZ2hqbHZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU5NzgzMCwiZXhwIjoyMDgyMTczODMwfQ.xvjmsSUS_E-9-78akuohWx_Bdj1H8KXRDR81Eh3vp1U"
    "DATABASE_URL" = "postgresql://postgres:Am2j4L%269%23rD%2F4Wi@db.xvrqtrkrqrcgypghjlvu.supabase.co:5432/postgres"
    "GEMINI_API_KEY" = "AIzaSyCSLlthr_RcWJ2LouKz03PCtsX3uDQujO0"
    "SAM_GOV_API_KEY" = "SAM-3b71bf5a-37bd-4082-bbeb-fb3aecab124b"
}

Write-Host "`n⚠️  Note: Vercel CLI requires interactive input for env vars." -ForegroundColor Yellow
Write-Host "Please set these in Vercel Dashboard instead:" -ForegroundColor Yellow
Write-Host "https://vercel.com/jacobkayembekazadi-gmailcoms-projects/granthunter/settings/environment-variables`n" -ForegroundColor Cyan

Write-Host "Required Environment Variables:" -ForegroundColor Green
foreach ($key in $envVars.Keys) {
    Write-Host "  - $key" -ForegroundColor White
}

Write-Host "`nOr use Vercel Dashboard → Settings → Environment Variables" -ForegroundColor Cyan


