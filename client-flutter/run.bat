@echo off
chcp 65001 > NUL
echo =======================================================
echo          TỰ ĐỘNG CẤU HÌNH KẾT NỐI MẠNG FLUTTER
echo =======================================================
echo.
echo [1] Dùng Cáp USB (Tự động chạy ADB Reverse - Không cần IP)
echo [2] Dùng IP trong file lib/api_config.dart
echo [3] Nhập nhanh IP mới
echo.
set /p CHOICE="Nhập lựa chọn (1, 2 hoặc 3) [Mặc định: 1]: "

if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="1" (
    echo.
    echo Dang thiet lap ADB Reverse qua USB...
    if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
        "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
    ) else (
        adb reverse tcp:3000 tcp:3000
    )
    echo Da thiet lap ADB Reverse xong! Bat dau chay app...
    flutter run --dart-define=API_BASE_URL=http://localhost:3000/api
    goto END
)

if "%CHOICE%"=="2" (
    echo.
    echo Dang chay app voi IP trong lib/api_config.dart...
    flutter run
    goto END
)

if "%CHOICE%"=="3" (
    set /p USER_IP="Nhap IP may tinh (VD: 192.168.1.3): "
    echo Chay app voi IP: http://%USER_IP%:3000/api
    flutter run --dart-define=API_BASE_URL=http://%USER_IP%:3000/api
    goto END
)

:END
