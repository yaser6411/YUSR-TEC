
# YUSR-TEC Setup Guide for Kali Linux

## 📋 System Requirements

### Hardware Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 10GB free space
- **CPU**: Multi-core processor recommended for parallel scanning
- **Network**: Internet connection for AI features and updates

### Software Requirements
- **OS**: Kali Linux 2023.1 or newer
- **Node.js**: Version 16.0 or higher
- **NPM**: Latest version
- **SQLite3**: For database operations
- **Git**: For version control and updates

## 🚀 Installation Steps

### Step 1: Update Kali Linux
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js and NPM
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install Required System Packages
```bash
sudo apt install -y \
    sqlite3 \
    libsqlite3-dev \
    git \
    curl \
    wget \
    build-essential \
    python3-pip \
    nmap \
    masscan \
    nikto \
    dirb \
    gobuster \
    sqlmap \
    metasploit-framework
```

### Step 4: Clone YUSR-TEC Repository
```bash
# Clone from your repository or download the files
git clone https://github.com/your-username/yusr-tec.git
cd yusr-tec

# Or if downloading manually:
mkdir yusr-tec && cd yusr-tec
# Copy all project files here
```

### Step 5: Install Project Dependencies
```bash
# Install Node.js dependencies
npm install

# Make install script executable
chmod +x install.sh

# Run the installation script
./install.sh
```

### Step 6: Configure Database
```bash
# Initialize SQLite database
node database.js
```

### Step 7: Configure Firewall (Optional)
```bash
# Allow port 3001 for the application
sudo ufw allow 3001/tcp
sudo ufw enable
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:
```bash
# .env file
PORT=3001
NODE_ENV=development
DB_PATH=./yusrtec.db
AI_API_KEY=your_ai_api_key_here
```

### Security Tools Configuration

#### Nmap Configuration
```bash
# Ensure Nmap scripts are updated
sudo nmap --script-updatedb
```

#### Metasploit Setup
```bash
# Initialize Metasploit database
sudo systemctl start postgresql
sudo msfdb init
```

#### Masscan Configuration
```bash
# Install Masscan if not available
sudo apt install masscan

# Configure for high-speed scanning
echo 'net.core.rmem_default = 262144' | sudo tee -a /etc/sysctl.conf
echo 'net.core.rmem_max = 262144' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 🏃‍♂️ Running YUSR-TEC

### Start the Application
```bash
# Start the server
npm start

# Or run directly
node server.js
```

### Access the Web Interface
Open your browser and navigate to:
```
http://localhost:3001
```

### Command Line Usage
```bash
# Run AI-powered scan
curl -X POST http://localhost:3001/api/ai-scan \
  -H "Content-Type: application/json" \
  -d '{"target":"example.com","scanType":"find-bugs"}'

# Execute manual command
curl -X POST http://localhost:3001/api/run-command \
  -H "Content-Type: application/json" \
  -d '{"tool":"nmap","command":"nmap -sV example.com"}'
```

## 🛠️ Additional Tools Installation

### Advanced Security Tools
```bash
# Install additional penetration testing tools
sudo apt install -y \
    amass \
    subfinder \
    nuclei \
    httpx \
    waybackurls \
    gau \
    ffuf \
    wfuzz \
    burpsuite \
    zaproxy

# Install Python tools
pip3 install \
    requests \
    beautifulsoup4 \
    dnspython \
    python-nmap
```

### Docker Support (Optional)
```bash
# Install Docker for containerized scanning
sudo apt install docker.io
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

## 🔍 Verification

### Test Installation
```bash
# Test Node.js server
node -e "console.log('Node.js is working')"

# Test SQLite
sqlite3 yusrtec.db "SELECT 'Database is working';"

# Test Nmap
nmap --version

# Test network connectivity
curl -I https://google.com
```

### Performance Optimization
```bash
# Increase file descriptor limits
echo 'fs.file-max = 65536' | sudo tee -a /etc/sysctl.conf
echo '* soft nofile 65536' | sudo tee -a /etc/security/limits.conf
echo '* hard nofile 65536' | sudo tee -a /etc/security/limits.conf

# Optimize network settings for scanning
echo 'net.core.somaxconn = 65536' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 🚨 Security Considerations

### Network Isolation
```bash
# Create isolated network for testing
sudo docker network create --driver bridge pentest-net
```

### Logging Configuration
```bash
# Enable detailed logging
mkdir logs
chmod 755 logs

# Configure log rotation
sudo logrotate -d /etc/logrotate.conf
```

### Backup Database
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
cp yusrtec.db "yusrtec_backup_$(date +%Y%m%d_%H%M%S).db"
EOF
chmod +x backup.sh
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3001
sudo netstat -tulpn | grep 3001
sudo kill -9 <process_id>
```

#### Permission Denied
```bash
# Fix file permissions
chmod +x install.sh
chmod +x *.js
sudo chown -R $USER:$USER .
```

#### Database Locked
```bash
# Kill database connections
sudo pkill -f sqlite3
rm -f yusrtec.db-wal yusrtec.db-shm
```

### Debug Mode
```bash
# Run with debugging enabled
DEBUG=* node server.js

# Check logs
tail -f logs/app.log
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs in the `logs/` directory
3. Verify all dependencies are properly installed
4. Ensure proper network connectivity

## ⚠️ Legal Notice

This tool is for authorized testing only. Ensure you have proper permission before scanning any target systems. Use responsibly and in compliance with all applicable laws and regulations.
