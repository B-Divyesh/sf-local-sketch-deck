$ErrorActionPreference = 'Stop'
$repo = 'B-Divyesh/sf-local-sketch-deck'
$release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"
$asset = $release.assets | Where-Object { $_.name -match '\.(msi|exe)$' } | Select-Object -First 1
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
if (!$asset -or !$sums) { throw 'No Windows installer or checksum found.' }
$dir = Join-Path $env:TEMP 'local-sketch-deck'; New-Item -Force -ItemType Directory $dir | Out-Null
$path = Join-Path $dir $asset.name; Invoke-WebRequest $asset.browser_download_url -OutFile $path
$list = (Invoke-WebRequest $sums.browser_download_url).Content
$expected = (($list -split "`n" | Where-Object { $_ -match [regex]::Escape($asset.name) }) -split '\s+')[0]
$actual = (Get-FileHash $path -Algorithm SHA256).Hash.ToLower()
if ($actual -ne $expected.ToLower()) { throw 'Checksum verification failed.' }
Write-Host "Verified $($asset.name). Starting unsigned installer..."; Start-Process $path
