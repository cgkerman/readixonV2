Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\dev\readixondev\apps\web\src\app\icon.png"
$resBase = "C:\dev\readixondev\apps\web\android\app\src\main\res"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source icon not found at $sourcePath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-Image($source, $targetWidth, $targetHeight, $outPath, [bool]$isRound=$false) {
    $bmp = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    if ($isRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $targetWidth, $targetHeight)
        $graphics.SetClip($path)
    }

    $graphics.DrawImage($source, 0, 0, $targetWidth, $targetHeight)
    $graphics.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

function Create-Foreground($source, $fgSize, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap $fgSize, $fgSize
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)

    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    # Safe zone for adaptive icons is center 66-72%
    $iconSize = [int]($fgSize * 0.70)
    $offset = [int](($fgSize - $iconSize) / 2)

    $graphics.DrawImage($source, $offset, $offset, $iconSize, $iconSize)
    $graphics.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$densities = @(
    @{ Name="mipmap-mdpi"; Size=48; Fg=108 },
    @{ Name="mipmap-hdpi"; Size=72; Fg=162 },
    @{ Name="mipmap-xhdpi"; Size=96; Fg=216 },
    @{ Name="mipmap-xxhdpi"; Size=144; Fg=324 },
    @{ Name="mipmap-xxxhdpi"; Size=192; Fg=432 }
)

foreach ($d in $densities) {
    $dirPath = Join-Path $resBase $d.Name
    if (-not (Test-Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
    }

    # ic_launcher.png
    $launcherPath = Join-Path $dirPath "ic_launcher.png"
    Resize-Image $srcImage $d.Size $d.Size $launcherPath $false
    Write-Host "Created: $($d.Name)/ic_launcher.png ($($d.Size)x$($d.Size))"

    # ic_launcher_round.png
    $roundPath = Join-Path $dirPath "ic_launcher_round.png"
    Resize-Image $srcImage $d.Size $d.Size $roundPath $true
    Write-Host "Created: $($d.Name)/ic_launcher_round.png ($($d.Size)x$($d.Size))"

    # ic_launcher_foreground.png
    $fgPath = Join-Path $dirPath "ic_launcher_foreground.png"
    Create-Foreground $srcImage $d.Fg $fgPath
    Write-Host "Created: $($d.Name)/ic_launcher_foreground.png ($($d.Fg)x$($d.Fg))"
}

$srcImage.Dispose()
Write-Host "SUCCESS: All Android launcher and adaptive icons generated successfully with Readixon logo!"
