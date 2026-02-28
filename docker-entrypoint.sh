#!/usr/bin/env bash
set -euo pipefail

: "${POSTGRES_DB:=omniquiz}"
: "${POSTGRES_USER:=omniquiz}"
: "${POSTGRES_PASSWORD:=omniquiz}"
: "${JWT_SECRET_KEY:=change-me-in-production}"
: "${SPRING_PROFILES_ACTIVE:=prod}"

PG_MAJOR="$(ls /etc/postgresql | sort -V | tail -n 1)"
PG_CLUSTER="main"

mkdir -p /var/run/postgresql
chown -R postgres:postgres /var/run/postgresql

pg_ctlcluster --skip-systemctl-redirect "${PG_MAJOR}" "${PG_CLUSTER}" start

ROLE_EXISTS="$(su - postgres -c "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='${POSTGRES_USER}'\"")"
if [[ "${ROLE_EXISTS}" != "1" ]]; then
  su - postgres -c "psql -v ON_ERROR_STOP=1 -c \"CREATE ROLE \\\"${POSTGRES_USER}\\\" LOGIN PASSWORD '${POSTGRES_PASSWORD}';\""
else
  su - postgres -c "psql -v ON_ERROR_STOP=1 -c \"ALTER ROLE \\\"${POSTGRES_USER}\\\" WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';\""
fi

DB_EXISTS="$(su - postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'\"")"
if [[ "${DB_EXISTS}" != "1" ]]; then
  su - postgres -c "createdb -O \"${POSTGRES_USER}\" \"${POSTGRES_DB}\""
fi

cleanup() {
  pg_ctlcluster --skip-systemctl-redirect "${PG_MAJOR}" "${PG_CLUSTER}" stop || true
}
trap cleanup EXIT

exec java ${JAVA_OPTS:-} -jar /opt/app/app.jar \
  --server.port=8080 \
  --spring.profiles.active="${SPRING_PROFILES_ACTIVE}" \
  --spring.datasource.url="jdbc:postgresql://127.0.0.1:5432/${POSTGRES_DB}" \
  --spring.datasource.username="${POSTGRES_USER}" \
  --spring.datasource.password="${POSTGRES_PASSWORD}" \
  --security.jwt.secret-key="${JWT_SECRET_KEY}" \
  --code.execution.enabled=true \
  --code.execution.prefer-local=true \
  --code.execution.local-fallback-enabled=true
