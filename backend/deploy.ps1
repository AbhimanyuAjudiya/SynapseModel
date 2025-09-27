# PowerShell script to copy project files to a remote server

# === CONFIGURATION ===
$remoteUser = "ubuntu"                # Change this to your remote username
$remoteHost = "your.server.ip"        # Change this to your server's IP or domain
$remotePath = "/home/ubuntu/app"      # Change this to the target directory on server
$sshKeyPath = "C:\Users\Jin\Desktop\gg\mykey"  # Path to your private key

# === PROJECT DIRECTORY ===
$localPath = "C:\Users\Jin\Desktop\gg"

# === FILES TO COPY ===
$files = @(".env", "main.py", "mykey", "mykey.pub", "requirements.txt")

# === EXECUTION ===
foreach ($file in $files) {
    $fullPath = Join-Path $localPath $file
    Write-Host "Uploading $file ..."
    scp -i $sshKeyPath $fullPath "$remoteUser@$remoteHost:$remotePath/"
}

Write-Host "✅ All files uploaded successfully."
