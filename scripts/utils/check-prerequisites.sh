#!/bin/bash

check_prerequisites() {
    local required_dirs=(
        "/opt/backups/telegram-bot/pre-deploy"
        "/opt/telegram-bot/data"
        "/scripts"
    )

    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            echo "❌ Required directory not found: $dir"
            echo "Please run /scripts/init-server.sh first"
            exit 1
        fi
        if [ ! -w "$dir" ]; then
            echo "❌ Cannot write to directory: $dir"
            echo "Please check permissions or run /scripts/init-server.sh"
            exit 1
        fi
    done

    if ! docker ps >/dev/null 2>&1; then
        echo "❌ Cannot access Docker. Please check permissions"
        exit 1
    fi
}
