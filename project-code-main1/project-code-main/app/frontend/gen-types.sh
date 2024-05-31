#!/bin/bash

# Step 1: Download the openapi.json file
curl -o "generated/openapi.json" "http://127.0.0.1:5000/openapi/openapi.json" &>/dev/null

# Step 2: Generate types, or print error
npx openapi-typescript generated/openapi.json -o generated/schema.d.ts &>/dev/null
if [ $? -eq 0 ]; then
    echo "Type generation complete"
else
    echo "Error: Failed to generate types"
fi
