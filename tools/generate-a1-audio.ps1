$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$audioRoot = Join-Path $projectRoot "public\audio"
$items = node --experimental-strip-types (Join-Path $PSScriptRoot "a1-audio-manifest.mjs") | ConvertFrom-Json
$voice = New-Object -ComObject SAPI.SpVoice
$englishVoice = @($voice.GetVoices()) | Where-Object { $_.GetDescription() -match "Zira|English.*United (States|Kingdom)" } | Select-Object -First 1
if (-not $englishVoice) { throw "Nessuna voce inglese madrelingua disponibile." }
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
  } finally { $stream.Close() }
  $created++
}
Write-Output "Voce: $($englishVoice.GetDescription())"
Write-Output "Audio A1 generati: $created"