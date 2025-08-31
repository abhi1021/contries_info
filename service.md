
To run a Gunicorn/Uvicorn Flask application as a Linux service, create a Markdown document containing step-by-step instructions and a sample systemd unit file. The application path and command are based on the details provided.

## Quick Setup Instructions

Below is a sample `systemd` unit file for running the application as a service. This configuration assumes the runtime command is:

```
uv run gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

and the app is located at `/home/ec2-user/countries_info/app.py`.[^1][^2][^3]

## Command to install Gunicorm

```aiignore
pip install gunicorn
```

***

## `countries_info.service` Systemd Unit File

```markdown
# File: /etc/systemd/system/countries_info.service

[Unit]
Description=Gunicorn/Uvicorn Flask application: countries_info
After=network.target

[Service]
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/countries_info
Environment="PATH=/home/ec2-user/.local/bin:/usr/local/bin:/usr/bin"
ExecStart=/usr/local/bin/uv run gunicorn -w 4 -b 0.0.0.0:5000 app:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```


***

## Steps to Enable and Start the Service

1. **Copy the unit file above to `/etc/systemd/system/countries_info.service`**.[^2][^1]
2. **Reload systemd and start the service:**

```sh
sudo systemctl daemon-reload
sudo systemctl start countries_info
sudo systemctl enable countries_info
```

3. **Check the service status:**

```sh
sudo systemctl status countries_info
```
