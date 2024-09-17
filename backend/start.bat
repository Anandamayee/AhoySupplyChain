
start "" /B nginx -c C:\Users\anandamayee.nanda\Hackathon\\backend\nginx-1.26.2\nginx-1.26.2\conf\nginx.conf
start "" /B cmd /c "npm run build"
start "" /B cmd /c "npm run build:tea-process"
start "" /B cmd /c "cd user-auth/ && npm run start:produser""
start "" /B cmd /c "cd tea-process/ && npm run start:prod"
