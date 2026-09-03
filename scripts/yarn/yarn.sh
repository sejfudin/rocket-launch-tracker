#!/bin/bash

# load the version of yarn packaged in the repo

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
YARN_SCRIPT="$REPO_ROOT/.yarn/releases/yarn-4.10.3.cjs"

if [ ! -f "$YARN_SCRIPT" ]; then
  echo "Error: Yarn script not found at $YARN_SCRIPT"
  exit 1
fi

node "$YARN_SCRIPT" "$@"
