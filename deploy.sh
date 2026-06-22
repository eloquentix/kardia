#!/bin/bash
node build.js && \
rsync -avz --delete \
  -e "ssh -i ~/.ssh/id_ed25519_eloquentix -o IdentitiesOnly=yes" \
  --exclude '.git' \
  ./build/ root@104.236.69.158:/var/www/kardia/
echo "Done."
