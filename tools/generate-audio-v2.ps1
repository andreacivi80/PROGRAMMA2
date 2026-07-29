$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$audioRoot = Join-Path $projectRoot "public\audio"
$manifestScript = Join-Path $PSScriptRoot "audio-manifest.mjs"

Push-Location $projectRoot
try {
  $items = (node --experimental-strip-types $manifestScript) | ConvertFrom-Json
} finally {
  Pop-Location
}

if (-not $items -or $items.Count -lt 1) {
  throw "L’elenco degli audio è vuoto."
}

$voice = New-Object -ComObject SAPI.SpVoice
$englishVoice = @($voice.GetVoices()) |
  Where-Object { $_.GetDescription() -match "Zira|English.*United (States|Kingdom)" } |
  Select-Object -First 1
if (-not $englishVoice) {
  throw "Nessuna voce inglese madrelingua disponibile."
}
$voice.Voice = $englishVoice
$voice.Rate = -1

$created = 0
foreach ($item in $items) {
  $target = Join-Path $audioRoot $item.file
  $stream = New-Object -ComObject SAPI.SpFileStream
  try {
    $stream.Open($target, 3, $false)
    $voice.AudioOutputStream = $stream
    [void]$voice.Speak([string]$item.text)
  } finally {
    $stream.Close()
  }
  $created++
  if ($created % 24 -eq 0) {
    Write-Output "Audio inglesi generati: $created/$($items.Count)"
  }
}

Write-Output "Voce: $($englishVoice.GetDescription())"
Write-Output "Completati: $created file WAV"
