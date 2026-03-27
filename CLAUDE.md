# Hjelm Send – projektinstruktioner

## Deploy

1. Pusha ändringar till `hjelmua/File-Transfer` på GitHub
2. SSH till servern: `ssh jonas@transfer.hjelms.com`
3. Hämta senaste koden: `cd /opt/file-transfer/app && git pull`
4. Bygg om Docker-imagen: `cd /opt/file-transfer && docker build -t hjelm-share app/`
5. Starta om tjänsten: `docker compose up -d`

## Serverstruktur

| Plats | Innehåll |
|-------|----------|
| `/opt/file-transfer/app/` | Git-repo (`hjelmua/File-Transfer`) |
| `/opt/file-transfer/docker-compose.yml` | Aktiv compose-fil (utanför git) |
| `/opt/file-transfer/data/` | Appdata (persistent, ej i git) |
| `/etc/caddy/Caddyfile` | Reverse proxy + HTTPS |

Docker-imagen heter `hjelm-share` och byggs lokalt från repot – ingen extern registry.
