#!/bin/bash
set -e

echo "=== 1. Setting up 1.5GB Swap ==="
if [ ! -f /swapfile ]; then
    sudo fallocate -l 1536M /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "=== 2. Installing Prerequisites ==="
sudo apt-get update -qq
sudo apt-get install -y -qq ca-certificates curl gnupg git ufw

echo "=== 3. Adding Docker Official GPG & Repo ==="
sudo install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
fi

CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME")
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${CODENAME} stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "=== 4. Installing Docker CE & Compose Plugin ==="
sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu

echo "=== 5. Configuring Docker Daemon & Log Rotation ==="
sudo mkdir -p /etc/docker
cat << 'DOCKERCONF' | sudo tee /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
DOCKERCONF
sudo systemctl restart docker

echo "=== 6. Configuring UFW Firewall ==="
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "=== 7. Verification ==="
docker --version
docker compose version
free -m
df -h /
echo "=== SERVER SETUP COMPLETE ==="
