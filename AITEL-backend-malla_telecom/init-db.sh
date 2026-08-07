#!/bin/bash
# Se ejecuta una sola vez, la primera vez que arranca el volumen de MySQL
# (docker-entrypoint-initdb.d). Crea las 4 bases y un usuario de aplicacion
# dedicado (no root) con permisos solo sobre esas 4 bases.
set -e

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
    CREATE DATABASE IF NOT EXISTS usuarios_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE IF NOT EXISTS cursos_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE IF NOT EXISTS semestres_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE IF NOT EXISTS comentarios_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

    CREATE USER IF NOT EXISTS '${MYSQL_APP_USER}'@'%' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';
    GRANT ALL PRIVILEGES ON usuarios_service_db.* TO '${MYSQL_APP_USER}'@'%';
    GRANT ALL PRIVILEGES ON cursos_service_db.* TO '${MYSQL_APP_USER}'@'%';
    GRANT ALL PRIVILEGES ON semestres_service_db.* TO '${MYSQL_APP_USER}'@'%';
    GRANT ALL PRIVILEGES ON comentarios_service_db.* TO '${MYSQL_APP_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL
