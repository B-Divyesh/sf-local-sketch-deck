#!/usr/bin/env sh
set -eu
repo="B-Divyesh/sf-local-sketch-deck"
api="https://api.github.com/repos/$repo/releases/latest"
os="$(uname -s)"; arch="$(uname -m)"
case "$os" in Darwin) pattern='\.dmg$';; Linux) pattern='\.AppImage$';; *) echo "Use the release page for $os"; exit 1;; esac
json="$(curl -fsSL "$api")"
url="$(printf '%s' "$json" | grep -o 'https:[^"]*' | grep -E "$pattern" | head -1)"
[ -n "$url" ] || { echo "No matching installer found"; exit 1; }
sumurl="$(printf '%s' "$json" | grep -o 'https:[^"]*' | grep 'SHA256SUMS' | head -1)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
file="$tmp/$(basename "$url")"; curl -fL "$url" -o "$file"; curl -fsSL "$sumurl" -o "$tmp/SHA256SUMS"
(cd "$tmp" && grep " $(basename "$file")$" SHA256SUMS | sha256sum -c -)
echo "Verified $(basename "$file"). Open it to install Local Sketch Deck (unsigned build)."
case "$os" in Linux) chmod +x "$file"; "$file";; Darwin) open "$file";; esac
