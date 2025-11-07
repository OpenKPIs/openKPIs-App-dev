# PowerShell script to completely clean environment cache
# This fixes the OpenAI API key caching issue

Write-Host "=== Complete Environment Cache Cleanup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Node.js processes
Write-Host "Step 1: Killing all Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   Killed $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "   No Node.js processes running" -ForegroundColor Green
}

# Step 2: Delete .next cache
Write-Host ""
Write-Host "Step 2: Deleting .next cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Write-Host "   Deleted .next directory" -ForegroundColor Green
} else {
    Write-Host "   No .next directory found" -ForegroundColor Green
}

# Step 3: Delete .turbo cache
Write-Host ""
Write-Host "Step 3: Deleting .turbo cache..." -ForegroundColor Yellow
if (Test-Path ".turbo") {
    Remove-Item -Recurse -Force ".turbo" -ErrorAction SilentlyContinue
    Write-Host "   Deleted .turbo directory" -ForegroundColor Green
} else {
    Write-Host "   No .turbo directory found" -ForegroundColor Green
}

# Step 4: Delete node_modules/.cache
Write-Host ""
Write-Host "Step 4: Deleting node_modules/.cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
    Write-Host "   Deleted node_modules/.cache" -ForegroundColor Green
} else {
    Write-Host "   No node_modules/.cache found" -ForegroundColor Green
}

# Step 5: Delete all .env files except .Credentials.txt
Write-Host ""
Write-Host "Step 5: Cleaning up .env files..." -ForegroundColor Yellow
$envFiles = @(".env.local", ".env.development.local", ".env.development", ".env.production.local", ".env.production", ".env")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Remove-Item -Force $file -ErrorAction SilentlyContinue
        Write-Host "   Deleted $file" -ForegroundColor Green
    }
}
Write-Host "   Keeping .Credentials.txt as source of truth" -ForegroundColor Cyan

# Step 6: Verify .Credentials.txt exists
Write-Host ""
Write-Host "Step 6: Verifying .Credentials.txt..." -ForegroundColor Yellow
$credentialsPath = "..\credentials\.Credentials.txt"
if (Test-Path $credentialsPath) {
    $content = Get-Content $credentialsPath -Raw
    if ($content -match "OPENAI_API_KEY\s*=\s*(sk-proj-[^\r\n]+)") {
        $key = $matches[1].Trim()
        if ($key -like "*spXzv*") {
            Write-Host "   .Credentials.txt has correct OpenAI key" -ForegroundColor Green
            Write-Host "      Key: $($key.Substring(0, 20))...$($key.Substring($key.Length - 10))" -ForegroundColor Gray
        } else {
            Write-Host "   .Credentials.txt may have wrong key" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   OPENAI_API_KEY not found in .Credentials.txt" -ForegroundColor Yellow
    }
} else {
    Write-Host "   .Credentials.txt not found at: $credentialsPath" -ForegroundColor Red
}

# Step 7: Verify next.config.js
Write-Host ""
Write-Host "Step 7: Verifying next.config.js..." -ForegroundColor Yellow
if (Test-Path "next.config.js") {
    $configContent = Get-Content "next.config.js" -Raw
    if ($configContent -match "loadCredentials|Credentials\.txt") {
        Write-Host "   next.config.js loads from .Credentials.txt" -ForegroundColor Green
    } else {
        Write-Host "   next.config.js may not be configured to load credentials" -ForegroundColor Yellow
    }
} else {
    Write-Host "   next.config.js not found" -ForegroundColor Red
}

# Step 8: Check system environment variables (should be empty)
Write-Host ""
Write-Host "Step 8: Checking system environment variables..." -ForegroundColor Yellow
$sysEnvKey = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "User")
if ($sysEnvKey) {
    Write-Host "   Found OPENAI_API_KEY in User environment: $($sysEnvKey.Substring(0, 20))..." -ForegroundColor Yellow
    Write-Host "      This may override Next.js env vars. Consider removing it." -ForegroundColor Yellow
} else {
    Write-Host "   No OPENAI_API_KEY in User environment" -ForegroundColor Green
}

$sysEnvKeyMachine = [Environment]::GetEnvironmentVariable("OPENAI_API_KEY", "Machine")
if ($sysEnvKeyMachine) {
    Write-Host "   Found OPENAI_API_KEY in Machine environment: $($sysEnvKeyMachine.Substring(0, 20))..." -ForegroundColor Yellow
    Write-Host "      This may override Next.js env vars. Consider removing it." -ForegroundColor Yellow
} else {
    Write-Host "   No OPENAI_API_KEY in Machine environment" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "=== Cleanup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Close ALL terminal windows" -ForegroundColor White
Write-Host "  2. Open a NEW terminal" -ForegroundColor White
Write-Host "  3. Navigate to project: cd openkpis-next\openkpis-next" -ForegroundColor White
Write-Host "  4. Run: npm run dev" -ForegroundColor White
Write-Host "  5. Test the API endpoint" -ForegroundColor White
Write-Host ""
Write-Host "The key should now load from next.config.js via .Credentials.txt" -ForegroundColor Green
