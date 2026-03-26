# Deploy

LXD VM (`file-transfer`) på `fylke`. Docker Compose + Caddy med Cloudflare DNS-challenge.

**Server:** `213.136.49.147` (jonas@file-transfer)
**URL:** https://transfer.hjelms.com

## Filer på servern

| Fil | Syfte |
|-----|-------|
| `/opt/file-transfer/docker-compose.yml` | Pingvin Share |
| `/opt/file-transfer/data/` | Appdata (lägg i backup) |
| `/etc/caddy/Caddyfile` | Reverse proxy + HTTPS |
| `/etc/caddy/cloudflare.env` | Cloudflare API-token (ej i git) |

## Starta om tjänsten

```bash
cd /opt/file-transfer
docker compose restart
```

## Uppdatera till ny version

```bash
cd /opt/file-transfer
docker compose pull && docker compose up -d
```

## Hämta upstream-uppdateringar

```bash
cd /opt/file-transfer/app
git fetch upstream && git merge upstream/main
git push origin main
```
