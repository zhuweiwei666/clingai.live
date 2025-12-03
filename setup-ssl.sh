#!/bin/bash

###############################################################################
# 配置 SSL 证书（HTTPS）
###############################################################################

set -e

SERVER="root@173.255.193.131"
PASSWORD="Zww199976.@1"
SERVER_PROJECT_DIR="/root/honeyai"
SERVER_DEPLOY_DIR="/var/www/honeyai"
DOMAIN="clingai.live"

# SSL证书内容
CERTIFICATE="-----BEGIN CERTIFICATE-----

MIIEFTCCAv2gAwIBAgIUeArX1rClDJqzLv89ON4IuTH+0i4wDQYJKoZIhvcNAQEL
BQAwgagxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQH
Ew1TYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBDbG91ZGZsYXJlLCBJbmMuMRswGQYD
VQQLExJ3d3cuY2xvdWRmbGFyZS5jb20xNDAyBgNVBAMTK01hbmFnZWQgQ0EgMThm
MjkyY2E0YTg4NjA0NmI2YThhZDBiM2ZhMzE2YTAwHhcNMjUxMjAzMTExMTAwWhcN
MzUxMjAxMTExMTAwWjAiMQswCQYDVQQGEwJVUzETMBEGA1UEAxMKQ2xvdWRmbGFy
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMc+/1ctX9u9NjmWgBWW
MHKNI0oJIXbIV3PsPOrLW1OnQ8vtCX4GK4TA/Y/IUiy9dlzF1ZNavitEAEs+PKvz
KdkNzdklds2SVxorW5uYHOgbpAu1k/NUcfyS9lPOyKZLZIv+9JAN90NWEOY34tKq
ig5qxNNLL5JQ+uGJTEExFoeduCiHPTa1uqXhsrVkBV6kTAKYcJYdRdx5Y5Jlc8jt
lsdYSlc6O7dBfu9aH9u42LdyQO1wQc/qcuPp1n0s6r4REq77NWSG0i/H/zeQh7yk
Xlk+Jfw1bKAOhl25XTkdhohI2HWfOpWnZ+5meUgTy3oGkaKpiWe/uBVSKzpnw/8+
gqsCAwEAAaOBuzCBuDATBgNVHSUEDDAKBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAA
MB0GA1UdDgQWBBTUYIoK/LyeEUQisTrI/yzq3+UACTAfBgNVHSMEGDAWgBQNYYh+
r01e8kVCxl+h5WGcTOSGhjBTBgNVHR8ETDBKMEigRqBEhkJodHRwOi8vY3JsLmNs
b3VkZmxhcmUuY29tL2ViMmI0MWIzLWVhMGYtNGU5ZS05Nzc4LWVhZTJjMDYzMTY1
My5jcmwwDQYJKoZIhvcNAQELBQADggEBAE/RUHgoPybRqAphdKzCAE3KCNlKQOYS
7/JJilVm4qTMmIlgMK3YAugYmtNf/yxLnqzb+k/x3GR3a3N2xZLVXWwlkreaoxMU
cqsQ+f/O3agE9OotXUY1u/FaqVYm3gJ1BWiFKzTpCVKsLxVPkBYb9WMPl4tXbtK7
hm9piWNxjQIThBmT3Fn8owsvYf26Rq5KpVrcAB7sQHZ/Efqo8vealpmDc43i2DWL
GdMNHbctJtKVTOXRUgbd0NMDhbE+5SteDJIXVq/tM8QPzET/nVsm1sknVKemecab
zJmsh/5JRmOQmAUZVlQHKENs67JCWuOKjvaDtyoM3wZJ20WsrDCw6UY=
-----END CERTIFICATE-----"

PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHPv9XLV/bvTY5
loAVljByjSNKCSF2yFdz7Dzqy1tTp0PL7Ql+BiuEwP2PyFIsvXZcxdWTWr4rRABL
Pjyr8ynZDc3ZJXbNklcaK1ubmBzoG6QLtZPzVHH8kvZTzsimS2SL/vSQDfdDVhDm
N+LSqooOasTTSy+SUPrhiUxBMRaHnbgohz02tbql4bK1ZAVepEwCmHCWHUXceWOS
ZXPI7ZbHWEpXOju3QX7vWh/buNi3ckDtcEHP6nLj6dZ9LOq+ERKu+zVkhtIvx/83
kIe8pF5ZPiX8NWygDoZduV05HYaISNh1nzqVp2fuZnlIE8t6BpGiqYlnv7gVUis6
Z8P/PoKrAgMBAAECggEAN6cLiEymvUhk+IHmpeDtCFoO1NOnErgT4U/HlieWC1Ap
mjDL2XUcu7hyOrKP7WpAQNqLdNzASHJ2iI3KQZcqhbOa3z/dJr9s7+TTcirzTAvI
bvLZb/qS2iMsha05E2X0oDvnEMOt4JOOJdfPVduHs040SvZxw7M12EBS2dS9v8QZ
hUPS2dclwhlG5hypmnyzWnPfOA/WHyJXk6DLVk6EMiwzuz2xE9+s3IKvDlbQ2C/L
cy8o/KfgmR+WPdMImazpe4JMwaVtYoorSlPMF0YxqygbEjlB2O6lvsWzZf+ZtXY+
aiKczAHfuKD1DD4txt0OP8Ja9fMuejji2Ldv5hudgQKBgQD+kc8waprZTYJh4jPA
4A7/PBxjy+epjGJetVfPwqaFFVaDFluETrLcFS0demfmPaOVxTMQYIt0kRedBgkV
RnL/oQO9PKC8Pi6pubBfjG+I1jc09CyLv1vkko1REeP2jqqM4jXq/K9WNqE1lU2t
/R8cFN3Jn05D9slkMx7T6g3CgQKBgQDIXZtfVWwlGv4EGwOTbhHfUhQQJa06Q+46
q7IMHMuYwGYX140Ps3MYvfmF6FInf9jI46mmfa+9ECjj/bn7wwtw3bxkwKq5/Jjo
5/+hjhNpNxCBBZ/rxrpbLZy/x3FIPu2R9p6hElrz+NUpq3FRUn2JRm/IFfIA5jgZ
CMb+7VVXKwKBgQDyiSqzvy1u0TjiVyfln9LJ+5Q0xGUflR93iiByUcpiyvSUie2B
PZWMtyQ3jJKGur0rCSlgdgsHcODleoWW3nrb76TnW2bsUfYVQFO4hM0Surz4V5ZF
Qnijabj3vyrIkh4NgcvK6RmH8x5eNbQ/iwRjtcGkwYFIoUw4ibfaQIkBgQKBgARy
x5NLQzZjrgYLT34DcJQjr1xYacskXPKigzZvoTmH8/xNhc02b7S56wNFECXeWcLE
Ay02FyO8axv8sxda0jM0SQ13lZLBf+eT1wIQNHAej9g9drp2VAbYMWW0mNhAxWd7
MTRkQu6ttJXTP5XNngnhLXQkwJWyhsZPgpOAU2e3AoGAYzrlg7cIaU9LiGhh0SU4
WmmPtAkVB6zb1zcqUK1J+hdUDCAG0do9o13vXIZtKBvpFs3rQcLJGkY6CLefFsCp
hUgu4leKnx8qWMt0jku4v+BxhB4TrZJcRR2pyNN3LKph7JU0N4PAQnv0pagtiZ82
b4yhRkfFuOCZbWfZ3xrsQDs=
-----END PRIVATE KEY-----"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo -e "${BLUE}🔒 配置 SSL 证书（HTTPS）${NC}"
echo "=========================================="
echo "服务器: $SERVER"
echo "域名: $DOMAIN"
echo "=========================================="
echo ""

# 检查expect
if ! command -v expect &> /dev/null; then
    echo -e "${RED}❌ 需要安装 expect${NC}"
    exit 1
fi

# 创建服务器端SSL配置脚本
cat > /tmp/setup-ssl-server.sh << 'SSL_SCRIPT'
#!/bin/bash
set -e

DOMAIN="$1"
DEPLOY_DIR="$2"
CERT_PATH="/etc/ssl/certs"
KEY_PATH="/etc/ssl/private"

echo "=== 创建SSL证书目录 ==="
mkdir -p "$CERT_PATH"
mkdir -p "$KEY_PATH"

echo "=== 保存证书文件 ==="
cat > "$CERT_PATH/${DOMAIN}.crt" << 'CERT_EOF'
-----BEGIN CERTIFICATE-----
MIIEFTCCAv2gAwIBAgIUeArX1rClDJqzLv89ON4IuTH+0i4wDQYJKoZIhvcNAQEL
BQAwgagxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQH
Ew1TYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBDbG91ZGZsYXJlLCBJbmMuMRswGQYD
VQQLExJ3d3cuY2xvdWRmbGFyZS5jb20xNDAyBgNVBAMTK01hbmFnZWQgQ0EgMThm
MjkyY2E0YTg4NjA0NmI2YThhZDBiM2ZhMzE2YTAwHhcNMjUxMjAzMTExMTAwWhcN
MzUxMjAxMTExMTAwWjAiMQswCQYDVQQGEwJVUzETMBEGA1UEAxMKQ2xvdWRmbGFy
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMc+/1ctX9u9NjmWgBWW
MHKNI0oJIXbIV3PsPOrLW1OnQ8vtCX4GK4TA/Y/IUiy9dlzF1ZNavitEAEs+PKvz
KdkNzdklds2SVxorW5uYHOgbpAu1k/NUcfyS9lPOyKZLZIv+9JAN90NWEOY34tKq
ig5qxNNLL5JQ+uGJTEExFoeduCiHPTa1uqXhsrVkBV6kTAKYcJYdRdx5Y5Jlc8jt
lsdYSlc6O7dBfu9aH9u42LdyQO1wQc/qcuPp1n0s6r4REq77NWSG0i/H/zeQh7yk
Xlk+Jfw1bKAOhl25XTkdhohI2HWfOpWnZ+5meUgTy3oGkaKpiWe/uBVSKzpnw/8+
gqsCAwEAAaOBuzCBuDATBgNVHSUEDDAKBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAA
MB0GA1UdDgQWBBTUYIoK/LyeEUQisTrI/yzq3+UACTAfBgNVHSMEGDAWgBQNYYh+
r01e8kVCxl+h5WGcTOSGhjBTBgNVHR8ETDBKMEigRqBEhkJodHRwOi8vY3JsLmNs
b3VkZmxhcmUuY29tL2ViMmI0MWIzLWVhMGYtNGU5ZS05Nzc4LWVhZTJjMDYzMTY1
My5jcmwwDQYJKoZIhvcNAQELBQADggEBAE/RUHgoPybRqAphdKzCAE3KCNlKQOYS
7/JJilVm4qTMmIlgMK3YAugYmtNf/yxLnqzb+k/x3GR3a3N2xZLVXWwlkreaoxMU
cqsQ+f/O3agE9OotXUY1u/FaqVYm3gJ1BWiFKzTpCVKsLxVPkBYb9WMPl4tXbtK7
hm9piWNxjQIThBmT3Fn8owsvYf26Rq5KpVrcAB7sQHZ/Efqo8vealpmDc43i2DWL
GdMNHbctJtKVTOXRUgbd0NMDhbE+5SteDJIXVq/tM8QPzET/nVsm1sknVKemecab
zJmsh/5JRmOQmAUZVlQHKENs67JCWuOKjvaDtyoM3wZJ20WsrDCw6UY=
-----END CERTIFICATE-----
CERT_EOF

cat > "$KEY_PATH/${DOMAIN}.key" << 'KEY_EOF'
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHPv9XLV/bvTY5
loAVljByjSNKCSF2yFdz7Dzqy1tTp0PL7Ql+BiuEwP2PyFIsvXZcxdWTWr4rRABL
Pjyr8ynZDc3ZJXbNklcaK1ubmBzoG6QLtZPzVHH8kvZTzsimS2SL/vSQDfdDVhDm
N+LSqooOasTTSy+SUPrhiUxBMRaHnbgohz02tbql4bK1ZAVepEwCmHCWHUXceWOS
ZXPI7ZbHWEpXOju3QX7vWh/buNi3ckDtcEHP6nLj6dZ9LOq+ERKu+zVkhtIvx/83
kIe8pF5ZPiX8NWygDoZduV05HYaISNh1nzqVp2fuZnlIE8t6BpGiqYlnv7gVUis6
Z8P/PoKrAgMBAAECggEAN6cLiEymvUhk+IHmpeDtCFoO1NOnErgT4U/HlieWC1Ap
mjDL2XUcu7hyOrKP7WpAQNqLdNzASHJ2iI3KQZcqhbOa3z/dJr9s7+TTcirzTAvI
bvLZb/qS2iMsha05E2X0oDvnEMOt4JOOJdfPVduHs040SvZxw7M12EBS2dS9v8QZ
hUPS2dclwhlG5hypmnyzWnPfOA/WHyJXk6DLVk6EMiwzuz2xE9+s3IKvDlbQ2C/L
cy8o/KfgmR+WPdMImazpe4JMwaVtYoorSlPMF0YxqygbEjlB2O6lvsWzZf+ZtXY+
aiKczAHfuKD1DD4txt0OP8Ja9fMuejji2Ldv5hudgQKBgQD+kc8waprZTYJh4jPA
4A7/PBxjy+epjGJetVfPwqaFFVaDFluETrLcFS0demfmPaOVxTMQYIt0kRedBgkV
RnL/oQO9PKC8Pi6pubBfjG+I1jc09CyLv1vkko1REeP2jqqM4jXq/K9WNqE1lU2t
/R8cFN3Jn05D9slkMx7T6g3CgQKBgQDIXZtfVWwlGv4EGwOTbhHfUhQQJa06Q+46
q7IMHMuYwGYX140Ps3MYvfmF6FInf9jI46mmfa+9ECjj/bn7wwtw3bxkwKq5/Jjo
5/+hjhNpNxCBBZ/rxrpbLZy/x3FIPu2R9p6hElrz+NUpq3FRUn2JRm/IFfIA5jgZ
CMb+7VVXKwKBgQDyiSqzvy1u0TjiVyfln9LJ+5Q0xGUflR93iiByUcpiyvSUie2B
PZWMtyQ3jJKGur0rCSlgdgsHcODleoWW3nrb76TnW2bsUfYVQFO4hM0Surz4V5ZF
Qnijabj3vyrIkh4NgcvK6RmH8x5eNbQ/iwRjtcGkwYFIoUw4ibfaQIkBgQKBgARy
x5NLQzZjrgYLT34DcJQjr1xYacskXPKigzZvoTmH8/xNhc02b7S56wNFECXeWcLE
Ay02FyO8axv8sxda0jM0SQ13lZLBf+eT1wIQNHAej9g9drp2VAbYMWW0mNhAxWd7
MTRkQu6ttJXTP5XNngnhLXQkwJWyhsZPgpOAU2e3AoGAYzrlg7cIaU9LiGhh0SU4
WmmPtAkVB6zb1zcqUK1J+hdUDCAG0do9o13vXIZtKBvpFs3rQcLJGkY6CLefFsCp
hUgu4leKnx8qWMt0jku4v+BxhB4TrZJcRR2pyNN3LKph7JU0N4PAQnv0pagtiZ82
b4yhRkfFuOCZbWfZ3xrsQDs=
-----END PRIVATE KEY-----
KEY_EOF

# 设置证书文件权限
chmod 644 "$CERT_PATH/${DOMAIN}.crt"
chmod 600 "$KEY_PATH/${DOMAIN}.key"

echo "✅ 证书文件已保存"
echo ""

echo "=== 配置 Nginx HTTPS ==="
cat > /etc/nginx/sites-available/honeyai << NGINX_EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN} _;
    
    # 重定向所有 HTTP 请求到 HTTPS
    return 301 https://\$host\$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN} _;
    
    # SSL 证书配置
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
echo "✅ SSL 配置完成！"
SSL_SCRIPT

echo -e "${GREEN}[1/3]${NC} 上传SSL配置脚本..."
expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no /tmp/setup-ssl-server.sh $SERVER:/tmp/setup-ssl-server.sh
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

echo -e "${GREEN}[2/3]${NC} 在服务器上执行SSL配置..."
expect << EOF
set timeout 120
spawn ssh -o StrictHostKeyChecking=no $SERVER "chmod +x /tmp/setup-ssl-server.sh && bash /tmp/setup-ssl-server.sh '$DOMAIN' '$SERVER_DEPLOY_DIR'"
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
spawn ssh -o StrictHostKeyChecking=no $SERVER "rm -f /tmp/setup-ssl-server.sh"
expect {
    "password:" {
        send "$PASSWORD\r"
        exp_continue
    }
    eof
}
EOF

rm -f /tmp/setup-ssl-server.sh

echo ""
echo "=========================================="
echo -e "${GREEN}✅ SSL 证书配置完成！${NC}"
echo "=========================================="
echo "🌐 HTTPS 地址: https://$DOMAIN"
echo "🌐 HTTPS 地址: https://www.$DOMAIN"
echo ""
echo "⚠️  注意事项："
echo "1. 确保域名 DNS 已正确解析到服务器 IP"
echo "2. 确保防火墙已开放 443 端口"
echo "3. HTTP 请求会自动重定向到 HTTPS"
echo "=========================================="

