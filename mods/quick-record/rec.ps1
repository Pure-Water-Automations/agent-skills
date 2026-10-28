# Windows version of rec. Toggle screen+mic recording. Run once: starts. Run again: stops,
# transcribes, grabs frames, copies the README path to the clipboard. Last line printed = README path.
$ErrorActionPreference = 'Stop'
$Root      = if ($env:REC_DIR) { $env:REC_DIR } else { Join-Path $env:USERPROFILE 'Recordings' }
$Model     = if ($env:REC_MODEL) { $env:REC_MODEL } else { Join-Path $env:USERPROFILE '.cache\whisper\ggml-small.en.bin' }
$Every     = if ($env:REC_FRAME_EVERY) { [int]$env:REC_FRAME_EVERY } else { 5 }  # seconds between frames
$MaxMin    = if ($env:REC_MAX_MIN) { [int]$env:REC_MAX_MIN } else { 30 }         # ffmpeg stops itself after this
$State     = Join-Path $Root '.recording'                                         # holds "<pid>|<dir>" while recording
$Whisper   = @($env:REC_WHISPER, (Join-Path $PSScriptRoot 'bin\whisper-cli.exe'), 'whisper-cli') | Where-Object { $_ } |
             Where-Object { (Test-Path $_) -or (Get-Command $_ -ErrorAction SilentlyContinue) } | Select-Object -First 1
New-Item -ItemType Directory -Force -Path $Root | Out-Null

if (-not (Test-Path $State)) {
  $dir = Join-Path $Root (Get-Date -Format 'yyyy-MM-dd_HHmmss')
  New-Item -ItemType Directory -Force -Path (Join-Path $dir 'frames') | Out-Null
  # Mic: REC_MIC, else the first DirectShow audio device ffmpeg lists.
  $mic = $env:REC_MIC
  if (-not $mic) {
    $list = & ffmpeg -hide_banner -list_devices true -f dshow -i dummy 2>&1 | Out-String
    $mic = ([regex]'"([^"]+)" \(audio\)').Match($list).Groups[1].Value
  }
  $audio = if ($mic) { @('-f', 'dshow', '-i', "audio=$mic") } else { @() }
  # Matroska survives being stopped with a kill (Windows has no Ctrl+C for a background process); remuxed to mp4 on stop.
  $ffArgs = @('-hide_banner', '-loglevel', 'error', '-f', 'gdigrab', '-framerate', '15', '-draw_mouse', '1', '-i', 'desktop') + $audio +
          @('-vf', 'scale=1920:-2', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-c:a', 'aac',
            '-t', "$($MaxMin * 60)", '-f', 'matroska', (Join-Path $dir 'video.mkv'))
  # Windows PowerShell 5.1 does not quote -ArgumentList items, so quote the ones with spaces (paths, mic names) here.
  $line = ($ffArgs | ForEach-Object { if ($_ -match '\s') { '"' + $_ + '"' } else { $_ } }) -join ' '
  $p = Start-Process ffmpeg -ArgumentList $line -NoNewWindow -PassThru -RedirectStandardError (Join-Path $dir 'ffmpeg.log')
  "$($p.Id)|$dir" | Set-Content -NoNewline $State
  [System.Media.SystemSounds]::Asterisk.Play()
  'Recording... run rec again to stop'
  exit 0
}

$procId, $dir = (Get-Content $State -Raw).Split('|', 2)
Remove-Item $State
Stop-Process -Id ([int]$procId) -ErrorAction SilentlyContinue
Wait-Process -Id ([int]$procId) -ErrorAction SilentlyContinue
[System.Media.SystemSounds]::Exclamation.Play()

$mkv = Join-Path $dir 'video.mkv'; $mp4 = Join-Path $dir 'video.mp4'
if (-not ((Test-Path $mkv) -and (Get-Item $mkv).Length -gt 0)) { "Recording failed - see $dir\ffmpeg.log"; exit 1 }
& ffmpeg -hide_banner -loglevel error -y -i $mkv -c copy $mp4
if ((Test-Path $mp4) -and (Get-Item $mp4).Length -gt 0) { Remove-Item $mkv } else { $mp4 = $mkv }

$wav = Join-Path $dir 'audio.wav'
& ffmpeg -hide_banner -loglevel error -y -i $mp4 -ar 16000 -ac 1 $wav
if ($Whisper -and (Test-Path $wav)) { & $Whisper -m $Model -f $wav -osrt -of (Join-Path $dir 'transcript') -np *> $null }
& ffmpeg -hide_banner -loglevel error -i $mp4 -vf "fps=1/$Every,scale=1280:-2" -q:v 4 (Join-Path $dir 'frames\f_%03d.jpg')
Remove-Item $wav -ErrorAction SilentlyContinue

# One file Claude can read: transcript + which frame covers which second.
$srt = Join-Path $dir 'transcript.srt'
$readme = Join-Path $dir 'README.md'
@(
  "# Screen recording $(Split-Path $dir -Leaf)", '',
  "Video: $mp4",
  "Frames: $dir\frames\f_NNN.jpg - frame N is at $Every*(N-1) seconds", '',
  '## Transcript (SRT timestamps)', '',
  $(if (Test-Path $srt) { Get-Content $srt -Raw } elseif (-not $Whisper) { '(whisper-cli not found - see the README install steps)' } else { '(no speech detected)' })
) | Set-Content -Encoding UTF8 $readme

Set-Clipboard "Screen recording with my feedback: $readme (read it, then look at the frames it points to)"
[System.Media.SystemSounds]::Asterisk.Play()
$readme
