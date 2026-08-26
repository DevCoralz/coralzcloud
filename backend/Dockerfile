# Coralz Cloud backend — FastAPI
# Built for use as a Pterodactyl egg Docker image (custom egg pointing at this image),
# or standalone `docker build` / `docker run`.

FROM python:3.13-slim

WORKDIR /home/container

# System deps for PyMySQL / mariadb-client (mysqlclient-style builds need
# default-libmysqlclient-dev; PyMySQL itself is pure Python and needs none
# of this, but mariadb-client is kept for manual DB debugging in the shell)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    mariadb-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pterodactyl runs containers as a non-root "container" user (UID 999) by convention
RUN useradd -u 999 -m container && chown -R container:container /home/container
USER container

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

# No ENTRYPOINT shell script: unlike the old start.sh approach, MySQL
# wait + schema init + Cloudflare tunnel all happen in-process inside
# app/main.py's __main__ block (see _wait_for_mysql, _init_database,
# _start_cloudflare_tunnel). Pterodactyl's Startup Command is expected to
# be `python app/main.py`, which runs that block directly.
CMD ["python", "app/main.py"]
