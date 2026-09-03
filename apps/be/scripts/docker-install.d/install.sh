#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for script in $(ls "$SCRIPT_DIR" | grep -E '^[0-9]+_' | sort -n); do
  echo "> $script"
  bash "$SCRIPT_DIR/$script"
done
