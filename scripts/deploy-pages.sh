#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
if [ -n "$(git status --porcelain -- public)" ]; then
  echo '먼저 public/ 변경 사항을 커밋해 주세요.' >&2
  exit 1
fi
# 서버 코드나 비밀 파일 없이 public/의 트리만 브랜치 루트로 게시한다.
pages_tree=$(git rev-parse HEAD:public)
remote_branch=$(git ls-remote --heads origin refs/heads/gh-pages)
parent_args=()
if [ -n "$remote_branch" ]; then
  git fetch origin refs/heads/gh-pages
  previous_commit=$(git rev-parse FETCH_HEAD)
  if [ "$(git rev-parse "${previous_commit}^{tree}")" = "$pages_tree" ]; then
    echo 'gh-pages에 동일한 사이트 파일이 이미 있습니다.'
    exit 0
  fi
  parent_args=(-p "$previous_commit")
fi
pages_commit=$(git commit-tree "$pages_tree" "${parent_args[@]}" -m "Publish Maple Weekly from $(git rev-parse --short HEAD)")
git push origin "${pages_commit}:refs/heads/gh-pages"
echo 'gh-pages 브랜치에 정적 파일을 올렸습니다. GitHub Settings → Pages에서 배포 상태를 확인하세요.'
