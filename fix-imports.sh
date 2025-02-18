#!/bin/bash

# Find all TypeScript and TypeScript/React files
find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | while IFS= read -r -d '' file; do
  # Replace the import statement
  sed -i '' "s|from '@/app/api/auth/\[\.\.\.nextauth\]/route'|from '@/lib/auth-options'|g" "$file"
done