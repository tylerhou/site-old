#!/bin/bash

set -x
set -e

: ${NETLIFY_BUILD_BASE="/opt/buildhome"}
NETLIFY_CACHE_DIR="$NETLIFY_BUILD_BASE/cache"

echo "Installing Hugo..."
hugoOut=$(binrc install -c $NETLIFY_CACHE_DIR/.binrc-$(binrc version) tylerhou/hugo 0.80.0-mathjax)
export PATH=$(dirname $hugoOut):$PATH

hugo version

# Build
hugo --minify
