#!/usr/bin/env bash
# install-live.sh — upgrade a DSH plugin in the live web profile and auto-restart the GUI.
#
# The GUI service (dsh web) runs the plugin host, so host-side changes only take
# effect after a service restart. This session usually lives inside the service
# cgroup, so `systemctl restart` would kill the caller mid-command. The restart
# is therefore scheduled as an independent systemd transient unit via
# systemd-run: systemd (PID 1) executes it after this script has finished
# printing, even if this session dies with the service.
#
# usage: ./scripts/install-live.sh [plugin] [profile]
#   plugin  npm package name to upgrade (default: dsh-mnemon)
#   profile DSH profile name          (default: web)
#
# env:
#   DSH_HOME       DSH root (default: /root/Documents/Codex/2026-08-13/npx-deepseek-ai-dsh-web-deepseek/.dsh)
#   SERVICE        systemd unit to restart (default: dsh-rsi)
#   RESTART_DELAY  seconds before restart fires (default: 5)
#   NO_RESTART=1   upgrade only, never schedule a restart
#   FORCE=1        schedule restart even when the version did not change
set -euo pipefail

PLUGIN="${1:-dsh-mnemon}"
PROFILE="${2:-web}"
DSH_HOME="${DSH_HOME:-/root/Documents/Codex/2026-08-13/npx-deepseek-ai-dsh-web-deepseek/.dsh}"
SERVICE="${SERVICE:-dsh-rsi}"
RESTART_DELAY="${RESTART_DELAY:-5}"

PROFILE_DIR="$DSH_HOME/profiles/$PROFILE"
WS_YAML="$PROFILE_DIR/pnpm-workspace.yaml"
LOCK_YAML="$PROFILE_DIR/pnpm-lock.yaml"
NPM_CACHE="${NPM_CACHE:-/tmp/.npm-cache}"

log() { printf '[install-live] %s\n' "$*"; }

[[ -d "$PROFILE_DIR" ]] || { echo "error: profile dir not found: $PROFILE_DIR" >&2; exit 1; }
[[ -f "$WS_YAML" ]]    || { echo "error: pnpm-workspace.yaml not found: $WS_YAML" >&2; exit 1; }

# 1. Query the latest published version.
log "querying npm for $PLUGIN ..."
LATEST="$(npm view "$PLUGIN" version 2>/dev/null)"
log "npm latest: $LATEST"
BEFORE="$(node -p "require('$PROFILE_DIR/node_modules/$PLUGIN/package.json').version" 2>/dev/null || echo none)"
log "installed before: $BEFORE"

# 2. Keep the supply-chain policy happy: pnpm 11's minimumReleaseAge rejects
#    recently published packages (and stale lockfile entries) unless they are
#    listed in minimumReleaseAgeExclude. Rebuild that block to hold every
#    version of $PLUGIN present in the lockfile plus the npm latest.
python3 - "$WS_YAML" "$LOCK_YAML" "$PLUGIN" "$LATEST" <<'PY'
import re, sys
ws_path, lock_path, plugin, latest = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
with open(lock_path) as f:
    lock_text = f.read()
versions = set(re.findall(re.escape(plugin) + r'@(\d+\.\d+\.\d+)', lock_text))
versions.add(latest)
with open(ws_path) as f:
    text = f.read()
m = re.search(r'(minimumReleaseAgeExclude:\n)((?:  - .*\n)*)', text)
if not m:
    print('warning: minimumReleaseAgeExclude block not found in workspace yaml', file=sys.stderr)
    sys.exit(0)
header, body = m.groups()
keep = [ln for ln in body.splitlines() if ln and not ln.startswith('  - ' + plugin + '@')]
entries = keep + ['  - %s@%s' % (plugin, v) for v in sorted(versions)]
new_block = header + ''.join(e + '\n' for e in entries)
open(ws_path, 'w').write(text[:m.start()] + new_block + text[m.end():])
print('exclude entries: %s' % ', '.join('%s@%s' % (plugin, v) for v in sorted(versions)))
PY

# 3. Upgrade the package inside the profile.
log "upgrading in $PROFILE_DIR ..."
cd "$PROFILE_DIR"
PATH="/root/.local/bin:/root/.bun/bin:$PATH" npm_config_cache="$NPM_CACHE" pnpm update "$PLUGIN"

# 4. Verify the installed version.
AFTER="$(node -p "require('$PROFILE_DIR/node_modules/$PLUGIN/package.json').version")"
log "installed after: $AFTER"

# 5. Schedule the restart as an independent systemd unit.
if [[ "${NO_RESTART:-}" == "1" ]]; then
    log "NO_RESTART=1: skipping restart (run 'systemctl restart $SERVICE' manually)"
elif [[ "$AFTER" == "$BEFORE" && "${FORCE:-}" != "1" ]]; then
    log "version unchanged; no restart scheduled (set FORCE=1 to restart anyway)"
else
    log "scheduling '$SERVICE' restart in ${RESTART_DELAY}s as an independent unit ..."
    systemd-run --collect --unit="$SERVICE-restart-$$" --on-active="${RESTART_DELAY}s" \
        /usr/bin/systemctl restart "$SERVICE"
    log "done. The GUI will come back on its own; the service cgroup (including this session) is about to be recycled."
fi
