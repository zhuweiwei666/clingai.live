#!/bin/bash
# 配置 gentlemind.net 的 HTTPS

set -e

SERVER="root@173.255.193.131"
SERVER_PASSWORD="Zww199976.@1"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# SSH 执行命令
ssh_exec() {
    expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER "$1"
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    eof
}
EOF
}

# 上传文件
scp_file() {
    expect << EOF
set timeout 60
spawn scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$1" $SERVER:"$2"
expect {
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    eof
}
EOF
}

log_info "开始配置 gentlemind.net 的 HTTPS..."

# 1. 创建 SSL 证书目录
log_info "创建 SSL 证书目录..."
ssh_exec "mkdir -p /etc/nginx/ssl/gentlemind"

# 2. 直接在服务器上创建证书和私钥文件
log_info "创建 SSL 证书文件..."
ssh_exec "cat > /etc/nginx/ssl/gentlemind/cert.pem << 'CERT'
-----BEGIN CERTIFICATE-----
MIIEFTCCAv2gAwIBAgIUElGa+58AT0fX7wjnxKZGAE5YyykwDQYJKoZIhvcNAQEL
BQAwgagxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQH
Ew1TYW4gRnJhbmNpc2NvMRkwFwYDVQQKExBDbG91ZGZsYXJlLCBJbmMuMRswGQYD
VQQLExJ3d3cuY2xvdWRmbGFyZS5jb20xNDAyBgNVBAMTK01hbmFnZWQgQ0EgMThm
MjkyY2E0YTg4NjA0NmI2YThhZDBiM2ZhMzE2YTAwHhcNMjYwMTAxMDYxMjAwWhcN
MzUxMjMwMDYxMjAwWjAiMQswCQYDVQQGEwJVUzETMBEGA1UEAxMKQ2xvdWRmbGFy
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMoNiOmAFcoBoXB7mRUr
WlgGx1ETng7jw3TRUTTU0n81OIPg4RZYRGHzYLUKsvwuCoSWogsicKl79u+3tOjJ
P5jgcqT8Hov/2mQfp89a3YxPkXCotlHMKYmcX8N8idYDwa3R5KJxLmt1jRIgTnI1
8Bxz2QPgkOR48a8fN0jG9gmJmVGdNH3z1ZrkfUTXlK9Q06gNcI5w88kQTjZ16fMN
uJlhkS4s2B2a/RuEGnXP4FVUhT9Ntl76m/XMvgp47qpEgPxD/iIJP862PlNQUh9Z
19JpCwu8JbmYmE/jLO3Zu2S4LpLlQj7NSco1E6zKMd11H+3sBT+JxqxIgsOSHi4J
xfMCAwEAAaOBuzCBuDATBgNVHSUEDDAKBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAA
MB0GA1UdDgQWBBTWWxNbwIBULwDRAgACSN7XLC+22zAfBgNVHSMEGDAWgBQNYYh+
r01e8kVCxl+h5WGcTOSGhjBTBgNVHR8ETDBKMEigRqBEhkJodHRwOi8vY3JsLmNs
b3VkZmxhcmUuY29tL2ViMmI0MWIzLWVhMGYtNGU5ZS05Nzc4LWVhZTJjMDYzMTY1
My5jcmwwDQYJKoZIhvcNAQELBQADggEBAJogjc3Y2zUUgiwQTTbpN1dcln9BK74Q
Im3Q2DxsmAmuMn5bOSDMZlFL2LIYLiM9RCcq5asGfSHKt9aljEoAgIoqNBvZRvqw
f6/aXaZn8qHHnapzfEAFuAbOWTG1SF0v+lWbgiipxQ85PtG7OWXovJ4y6HQm2HMA
lU7rZNnxMoqYSavZeBa8frd35ha4GlpJpmowzsT90ZciLrE36IOemFdoeSPNjAcZ
UrCKiJBTt0CVtFMWnwgdu1hu2+HQrrSE/JvTOIlWG+v4okYaPFxu27k3JVsF0zTS
EKj/Rj5I7oYx/eQGj6eZ/7ooY7gxSTyE9txydlJ7W4b/EcAsUrpqbL8=
-----END CERTIFICATE-----
CERT
"

log_info "创建 SSL 私钥文件..."
ssh_exec "cat > /etc/nginx/ssl/gentlemind/key.pem << 'KEY'
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDKDYjpgBXKAaFw
e5kVK1pYBsdRE54O48N00VE01NJ/NTiD4OEWWERh82C1CrL8LgqElqILInCpe/bv
t7ToyT+Y4HKk/B6L/9pkH6fPWt2MT5FwqLZRzCmJnF/DfInWA8Gt0eSicS5rdY0S
IE5yNfAcc9kD4JDkePGvHzdIxvYJiZlRnTR989Wa5H1E15SvUNOoDXCOcPPJEE42
denzDbiZYZEuLNgdmv0bhBp1z+BVVIU/TbZe+pv1zL4KeO6qRID8Q/4iCT/Otj5T
UFIfWdfSaQsLvCW5mJhP4yzt2btkuC6S5UI+zUnKNROsyjHddR/t7AU/icasSILD
kh4uCcXzAgMBAAECggEAHmNPupJ9dG6vWYv1N4ZYJZILawmwxVuC+3A5ruDtMZ2O
/OKW57XpvvOMEV5lEeFYyp0fDN6mpA7VUjNGXZZa3sKu61pRu8uEjHdoVRq85EvZ
O2DcXsv+WUhv7KYv0sSo3dwJ71ZnXVkGGPpL4ghzrsvLkTY2hG4eJzDiLythOIi5
R/R2Hyu2PqyTzkTRmuZLa0F+2036aoHrQTMHDy5gqgbg7DDbIUCUjU0NPaGuUh7/
79w1YdRCIx7j/yJSWray6O/qb00usA5L3qeV+SogltXkmYmsBTm5qcL7J365e1YK
j8IfbDKgrab6339NP6p7Tw6m2/+sTFQe3+ej7W7E6QKBgQDwF9t+uTjy+/mK34PV
h3iAfIJwhqFcPi6N29Wgg+hMuTA8AFBCBA7Avfo8U2Wf13d9LsVaopKmwg/6kP2n
KPjqq2/snjjWFxTsP7URcCIjsnjjWU0oGMn6hSeO0+Wi+2gbP8Pth9C+XZphfGNQ
IZOl0J22K6ewwLfJBzHTanMjmwKBgQDXcHzksp5N8WYSLWrq6fsKyGhI4Ew3Xa49
ngfsmi9BjkK8Wpr74k+2JDohYtEATiSpqEzmiHulYMyd6tgbJ96uLl38oJAXgetE
T/SH0TNEx914KYmPLo9MPOsLwj8u3PtNoCxnUN+dP0pwkdIrLC5HaixTZfFtg1oZ
gnGReQqoiQKBgDfnljhfsJ8DhQuNGAl0Td69HzJMZu4vnG9zrL5/eGvFAzI1cHqu
rzC6C7ZYROV/Kld/uHxuNm+V6FqTwDxYEf2yhZE3Fkzjev+3pdW1on1lZTiq5ohb
nUw0DQ340ROuLoOJyXlZkoWBDh189TMHXnXRqadtatKBTUoF3tg3hS/ZAoGAUam4
DdCPJShd8oH4xzcOC9ZPgWBUQ6BlDcI7aro/M3BDZ7ZIjTYJ1RcCWellI+J7DzxW
egQ+Kj/5D9sXM6P3SrsUsVADjoWWsnxESr9H2ciQ8J1+ISIa+2EUD47/+DmXoKMY
cck8GhUFmIoNyoOivztFtg8sZsClhInnlqb1HVECgYEAlG6c1KRGbUEOhlAXXZRE
/cqTuLLAkiEu3RsBIc45caCHTg6DwmlBfQ49KgqCxiUPQJOqPomFsM0jCDNcD6kk
aja1u0BEaBwjus41K53NpuHywONwHUGJZeUpHwR1Xts7POVEdK9R8BZHZ/HFdlwp
2GjhBQh1axL7kYiHWqjO/BY=
-----END PRIVATE KEY-----
KEY
"

# 3. 设置证书文件权限
log_info "配置证书文件权限..."
ssh_exec "chmod 600 /etc/nginx/ssl/gentlemind/key.pem && chmod 644 /etc/nginx/ssl/gentlemind/cert.pem && chown root:root /etc/nginx/ssl/gentlemind/*"

# 4. 创建 Nginx 配置文件
log_info "创建 Nginx 配置文件..."
ssh_exec "cat > /etc/nginx/sites-available/gentlemind.net << 'NGINXCONF'
server {
    listen 80;
    listen [::]:80;
    server_name gentlemind.net www.gentlemind.net;
    
    # 重定向 HTTP 到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name gentlemind.net www.gentlemind.net;

    # SSL 配置
    ssl_certificate /etc/nginx/ssl/gentlemind/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/gentlemind/key.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;

    # 根目录（暂时指向一个占位页面，后续可以修改）
    root /var/www/gentlemind;
    index index.html index.htm;

    # 日志
    access_log /var/log/nginx/gentlemind-access.log;
    error_log /var/log/nginx/gentlemind-error.log;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # 禁止访问隐藏文件
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINXCONF
'

# 5. 创建网站根目录
log_info "创建网站根目录..."
ssh_exec "mkdir -p /var/www/gentlemind && chown -R www-data:www-data /var/www/gentlemind"

# 6. 创建临时欢迎页面
log_info "创建临时欢迎页面..."
ssh_exec 'cat > /var/www/gentlemind/index.html << "HTML"
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>GentleMind - Welcome</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .badge {
            display: inline-block;
            margin-top: 2rem;
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class=\"container\">
        <h1>🚀 GentleMind</h1>
        <p>Your website is ready!</p>
        <p>HTTPS is configured successfully.</p>
        <div class=\"badge\">🔒 Secure Connection</div>
    </div>
</body>
</html>
HTML
'

# 7. 启用站点
log_info "启用 Nginx 站点..."
ssh_exec "ln -sf /etc/nginx/sites-available/gentlemind.net /etc/nginx/sites-enabled/gentlemind.net"

# 8. 测试 Nginx 配置
log_info "测试 Nginx 配置..."
ssh_exec "nginx -t"

# 9. 重载 Nginx
log_info "重载 Nginx..."
ssh_exec "systemctl reload nginx"

log_info "✅ HTTPS 配置完成！"
log_info "🌐 网站地址: https://gentlemind.net"
log_info "📝 网站文件目录: /var/www/gentlemind"
log_info "📋 Nginx 配置: /etc/nginx/sites-available/gentlemind.net"
log_info ""
log_warn "⚠️  注意：当前显示的是临时欢迎页面，请将您的网站文件上传到 /var/www/gentlemind 目录"

