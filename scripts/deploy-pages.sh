#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
if [ -n "$(git status --porcelain -- public)" ]; then
  echo '먼저 public/ 변경 사항을 커밋해 주세요.' >&2
  exit 1
fi
pages_commit=$(git subtree split --prefix=public HEAD)
git push origin "${pages_commit}:refs/heads/gh-pages"
echo 'gh-pages 브랜치에 정적 파일을 올렸습니다. GitHub Settings → Pages에서 배포 상태를 확인하세요.'
