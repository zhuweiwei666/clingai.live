#!/bin/bash

###############################################################################
# 更新为 Cloudflare Origin Certificate（源服务器证书）
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"
DOMAIN="clingai.live"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔒 更新为 Cloudflare Origin Certificate${NC}"
echo "=========================================="
echo "服务器: $SERVER"
echo "域名: $DOMAIN"
echo ""
echo -e "${YELLOW}注意：这是 Cloudflare Origin Certificate${NC}"
echo "用于 Cloudflare 和源服务器之间的加密通信"
echo "=========================================="
echo ""

# 检查expect
if ! command -v expect &> /dev/null; then
    echo -e "${RED}❌ 需要安装 expect${NC}"
    exit 1
fi

# 创建服务器端SSL配置脚本
cat > /tmp/update-ssl-origin-server.sh << 'SSL_SCRIPT'
#!/bin/bash
set -e

DOMAIN="$1"
DEPLOY_DIR="$2"
CERT_PATH="/etc/ssl/certs"
KEY_PATH="/etc/ssl/private"

echo "=== 备份旧证书 ==="
if [ -f "$CERT_PATH/${DOMAIN}.crt" ]; then
    cp "$CERT_PATH/${DOMAIN}.crt" "$CERT_PATH/${DOMAIN}.crt.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ 旧证书已备份"
fi
if [ -f "$KEY_PATH/${DOMAIN}.key" ]; then
    cp "$KEY_PATH/${DOMAIN}.key" "$KEY_PATH/${DOMAIN}.key.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ 旧私钥已备份"
fi

echo ""
echo "=== 保存新的 Origin Certificate ==="
cat > "$CERT_PATH/${DOMAIN}.crt" << 'CERT_EOF'
-----BEGIN CERTIFICATE-----
MIIEpDCCA4ygAwIBAgIUfekTuGu3eC/yU2YG/UOyFyvaCAowDQYJKoZIhvcNAQEL
BQAwgYsxCzAJBgNVBAYTAlVTMRkwFwYDVQQKExBDbG91ZEZsYXJlLCBJbmMuMTQw
MgYDVQQLEytDbG91ZEZsYXJlIE9yaWdpbiBTU0wgQ2VydGlmaWNhdGUgQXV0aG9y
aXR5MRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQIEwpDYWxpZm9ybmlh
MB4XDTI1MTIwMzExMTEwMFoXDTQwMTEyOTExMTEwMFowYjEZMBcGA1UEChMQQ2xv
dWRGbGFyZSwgSW5jLjEdMBsGA1UECxMUQ2xvdWRGbGFyZSBPcmlnaW4gQ0ExJjAk
BgNVBAMTHUNsb3VkRmxhcmUgT3JpZ2luIENlcnRpZmljYXRlMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmYwJLvuBhdoUSMd9hJ9ig2G88X/cpYjs04wx
63WZHhb29cGWV7ejSesXnZKZneCSLIv9gkaUcAz99KQqGIetWSGS6KItUGglCVtx
wtcmEfPuHpDfzr1KoSEyewty1Ed/iC7EPF7QpR1i50C7sfix8ivY9hsfvXtAmKKt
DNd8IHf9eC4qH6U/91cUkRxtepQonD/tCVmsTUmssenwaCjeTGzXxRGjRJ/SIu2h
xOTPS+tFxMiXgHfb7iY3VZ48TdkPNb5GGDdrdp9u0ltQCa8unyvZ28rV3MXZv9YH
qhNgDPUcbjNuyaAPrfRLEMHcS9v1ik282y8yn4L9079O/ktatwIDAQABo4IBJjCC
ASIwDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcD
ATAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBTXndikJdzyyGd+C68qHBYF6Vs18TAf
BgNVHSMEGDAWgBQk6FNXXXw0QIep65TbuuEWePwppDBABggrBgEFBQcBAQQ0MDIw
MAYIKwYBBQUHMAGGJGh0dHA6Ly9vY3NwLmNsb3VkZmxhcmUuY29tL29yaWdpbl9j
YTAnBgNVHREEIDAegg4qLmNsaW5nYWkubGl2ZYIMY2xpbmdhaS5saXZlMDgGA1Ud
HwQxMC8wLaAroCmGJ2h0dHA6Ly9jcmwuY2xvdWRmbGFyZS5jb20vb3JpZ2luX2Nh
LmNybDANBgkqhkiG9w0BAQsFAAOCAQEAf8r6kdXTO6TUT6BQHDYGrLs/l8Gkahld
x77GDbNrHuJnxsBPdHfYyyzMjjtFcFam0qKbDPDWvLEA10HLAoMHBevHZYr+kqUh
FiCca5WhKVYl53uiuCpRDtNpFNq/LDOdpgDSLya7cBbGgXQ/TsZSYoxtFPZs91sL
QyxVUQSMt3rHJVP1pN16aKKLe4ocTGgZvf9a+jwcUNA9FFXu6VQOO+Jas72Ci8GZ
GvkLFhbAoMEyMWSNegPScu/avIvZW8sAowSZePC/kSqBkSARDPqmkYhYSctDTPrx
hMSIfltg5MG58TbzYoa09wlZoE91PpC+pY0q7vtf5zkp8ZM7cJMdQA==
-----END CERTIFICATE-----
CERT_EOF

cat > "$KEY_PATH/${DOMAIN}.key" << 'KEY_EOF'
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZjAku+4GF2hRI
x32En2KDYbzxf9yliOzTjDHrdZkeFvb1wZZXt6NJ6xedkpmd4JIsi/2CRpRwDP30
pCoYh61ZIZLooi1QaCUJW3HC1yYR8+4ekN/OvUqhITJ7C3LUR3+ILsQ8XtClHWLn
QLux+LHyK9j2Gx+9e0CYoq0M13wgd/14LiofpT/3VxSRHG16lCicP+0JWaxNSayx
6fBoKN5MbNfFEaNEn9Ii7aHE5M9L60XEyJeAd9vuJjdVnjxN2Q81vkYYN2t2n27S
W1AJry6fK9nbytXcxdm/1geqE2AM9RxuM27JoA+t9EsQwdxL2/WKTbzbLzKfgv3T
v07+S1q3AgMBAAECggEASPGr0zQMPihyBnku+fg19rBR8HCLw+AekglCFdfSG+dQ
/0MuRxGocw9KMsNYUxZCmwMONfuNvQWPB8+NaAXcpkE652VUHaS8I4vbqXJIVbMK
Zl7w0+g9MfrxXl77+DjXLzz4YK2ydR5WxAGOqWe6MY//DDuqgnuxHlH53+XmxA1A
CmvgDq5xx/OMiKmKQN7GoQJIOv7vRx2JFszHfbpxeUAJBgiUJ6cLweiviSN+Tlto
x+JsjxQmmqTltXahAqrMH0e055ITAMcEn3c1zb8XfGWNdv7WbuVY8PNEiBc4Y/Uy
Ato88mtzF8J8oKVO/+0B+xqStVuZN1pRXu69hGywUQKBgQDTeBHTK16kBLxO+Fym
idklFga61MN4tkGexHsM++FyrNp/yQ9rO/U9EmYJCdsChX+NG52x8tV1+1LwqTWX
jTJ2ngTT+2FNmS6Bi9TOPd8/O5ftJ5fefMAfZD3NKdi7c28FzGDVfE8409CwvNvi
DGJiinSv1hq1RSdViFzaK20yEwKBgQC54X2f5lvzdwaMdwDXtf8uvmAxjbWTkBXA
XrD2UGvvWcQ4ITohZ1BrQN/cmctc1bvENgahuLbsnEd1GEkU5adYloJFZ4375iPv
o7y/r/rYtyjRtoxZjd96ZouaXUTZ9EVcaHXVgH1PiEdzKasCLkX4bngXqQ0RdzTb
ixu0wKDpTQKBgQCM1heQ+v5h4CGFupUB+SacM2ox/cddWoyjb5nAEPSaChLPLhnN
wjXXAazg8iZhLIXBdZX10JNnqwUW8KqXj1r/csgmYfHw20cE0hrdbImFNGw/brIP
ZCgUAA/E1szYMs3LH82SAONGJpODUZRjnPndRPbnsIFDHpZOua2VQ3zK7wKBgElE
+gjSe8JPU5SAwCNHSQw63J4L1twQupI2gRjGgJU7VB4v8sMB/3AXhWZmdQPl9/qS
tTCAKBLCU2RzqzMCh2FjCnyjIhN+FwI6D4ebrYxJPlzT0STnyIRt8W9qfl5PbBvN
zUzYNgzokglyDkdwyAHyQYJKD62nyH0Vq1knaQYtAoGALC3lHcGfRI3yWeH0GEbU
9Io+bFFq+x85bgYvIwmubK0pK+m8h6jTk4q1id9gHncKVsHrz2ZXgH38lcJfjFuD
ADo2Iit5cidCWnQC0rUE2DcxVrgBmEuzPXCQsn2snqF7eyH1XRjnfn5j+AbhYuj2
3l5G/1GxVG+mVUrg10VQPFU=
-----END PRIVATE KEY-----
KEY_EOF

# 设置证书文件权限
chmod 644 "$CERT_PATH/${DOMAIN}.crt"
chmod 600 "$KEY_PATH/${DOMAIN}.key"

echo "✅ Origin Certificate 已保存"
echo ""

echo "=== 验证证书信息 ==="
openssl x509 -in "$CERT_PATH/${DOMAIN}.crt" -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After|DNS:)" | head -10

echo ""
echo "=== 更新 Nginx 配置 ==="
cat > /etc/nginx/sites-available/honeyai << NGINX_EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN} _;
    
    # 重定向所有 HTTP 请求到 HTTPS
    return 301 https://\$host\$request_uri;
}

# HTTPS 配置 - Cloudflare Origin Certificate
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN} _;
    
    # SSL 证书配置（Cloudflare Origin Certificate）
    ssl_certificate ${CERT_PATH}/${DOMAIN}.crt;
    ssl_certificate_key ${KEY_PATH}/${DOMAIN}.key;
    
    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 网站根目录
    root ${DEPLOY_DIR};
    index index.html;

    # 日志
    access_log /var/log/nginx/honeyai-access.log;
    error_log /var/log/nginx/honeyai-error.log;

    # 主路由配置
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Cloudflare 真实 IP（如果使用 Cloudflare 代理）
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;
}
NGINX_EOF

echo "✅ Nginx 配置已更新"
echo ""

echo "=== 启用站点 ==="
ln -sf /etc/nginx/sites-available/honeyai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "=== 测试 Nginx 配置 ==="
nginx -t

echo ""
echo "✅ Origin Certificate 配置完成！"
SSL_SCRIPT

echo -e "${GREEN}[1/3]${NC} 上传SSL更新脚本..."
expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/update-ssl-origin-server.sh $SERVER:/tmp/update-ssl-origin-server.sh
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF

echo -e "${GREEN}[2/3]${NC} 在服务器上执行SSL更新..."
expect << EOF
set timeout 120
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/update-ssl-origin-server.sh && bash /tmp/update-ssl-origin-server.sh '$DOMAIN' '$SERVER_DEPLOY_DIR'"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    timeout {
        puts "配置超时"
        exit 1
    }
    eof
}
EOF

echo -e "${GREEN}[3/3]${NC} 重启 Nginx..."
expect << EOF
set timeout 60
spawn ssh -o StrictHostKeyChecking=no $SERVER "systemctl reload nginx && echo 'Nginx 已重启'"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EOF

# 清理临时文件
expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/update-ssl-origin-server.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/update-ssl-origin-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Cloudflare Origin Certificate 配置完成！${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}证书类型：Cloudflare Origin Certificate${NC}"
echo "有效期：2025-12-03 至 2040-12-29（15年）"
echo "支持域名：*.clingai.live 和 clingai.live"
echo ""
echo "🌐 HTTPS 地址: https://$DOMAIN"
echo "🌐 HTTPS 地址: https://www.$DOMAIN"
echo ""
echo "✅ 已配置 Cloudflare 真实 IP 获取"
echo "✅ 旧证书已自动备份"
echo "=========================================="

