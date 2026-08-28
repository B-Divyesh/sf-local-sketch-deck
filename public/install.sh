#!/usr/bin/env sh
set -eu
repo="B-Divyesh/sf-local-sketch-deck"
api="https://api.github.com/repos/$repo/releases/latest"
os="$(uname -s)"; arch="$(uname -m)"
case "$os:$arch" in
  Darwin:arm64|Darwin:aarch64) pattern='(aarch64|arm64).*\.dmg$';;
  Darwin:x86_64|Darwin:amd64) pattern='(x64|x86_64).*\.dmg$';;
  Linux:x86_64|Linux:amd64) pattern='(amd64|x86_64).*\.AppImage$';;
  *) echo "No installer is published for $os $arch. Use https://github.com/$repo/releases/latest"; exit 1;;
esac
json="$(curl -fsSL "$api")"
url="$(printf '%s' "$json" | grep -o 'https:[^"]*' | grep -E "$pattern" | head -1)"
[ -n "$url" ] || { echo "No matching installer found"; exit 1; }
sumurl="$(printf '%s' "$json" | grep -o 'https:[^"]*' | grep 'SHA256SUMS' | head -1)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
file="$tmp/$(basename "$url")"; curl -fL "$url" -o "$file"; curl -fsSL "$sumurl" -o "$tmp/SHA256SUMS"
(cd "$tmp" && if command -v sha256sum >/dev/null 2>&1; then
  grep " $(basename "$file")$" SHA256SUMS | sha256sum -c -
else
  grep " $(basename "$file")$" SHA256SUMS | shasum -a 256 -c -
fi)
echo "Verified $(basename "$file"). Open it to install Local Sketch Deck (unsigned build)."
case "$os" in Linux) chmod +x "$file"; "$file";; Darwin) open "$file";; esac
