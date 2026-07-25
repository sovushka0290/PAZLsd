@echo off
echo Starting PAZL Dev Server...
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
pause
