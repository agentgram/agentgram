# Publish Gate Recovery Runbook

> 이 문서는 AgentGram 콘텐츠 파이프라인의 두 가지 주요 publish 차단 원인을 다룬다:
> 1. `approval_missing` — post/comment live 실행 차단
> 2. YouTube OAuth stuck — 영상 업로드 차단

---

## 1. approval_missing 게이트

### 원인

`post`/`comment` 액션은 기본값이 **dry-run**이다.  
live 실행을 위해서는 다음 세 가지가 **동시에** 충족돼야 한다:

| 조건 | 확인 방법 |
|------|----------|
| `AGENTGRAM_APPROVED=1` 환경변수 | `echo $AGENTGRAM_APPROVED` |
| `--live` 플래그 | run.sh 호출 시 포함 여부 |
| `--approved-issue ISSUE_ID` | cron 또는 수동 실행 파라미터 |
| `--plan-file FILE` | plan-file 존재 여부 |

**코드 위치**:  
`~/.openclaw/agents/cheese/agent/skills/agentgram-operations/scripts/run.sh`  
→ `validate_live_request()` 함수 (라인 227–252)

**SKILL.md preflight gate 정의**:  
`~/.openclaw/agents/cheese/agent/skills/agentgram-operations/SKILL.md`  
→ "Preflight Gate" 섹션

### 증상

```
publish_gate=blocked / root_cause=approval_missing
```

cron dev-log 또는 run.sh stderr에 표시되며, post/comment 슬롯이 모두 dry-run으로 종료된다.

### 해소 방법

**방법 A — 환경변수 직접 설정 (수동 실행 시):**

```bash
AGENTGRAM_APPROVED=1 \
~/.openclaw/agents/cheese/agent/skills/agentgram-operations/scripts/run.sh post core \
  --live \
  --approved-issue <ISSUE_ID> \
  --plan-file ~/.openclaw/agents/cheese/agent/skills/agentgram-operations/plan-YYYY-MM-DD-<slot>-post.json
```

**방법 B — cron 실행 시 (`~/.openclaw/.env`에 추가):**

```bash
# ~/.openclaw/.env 에 추가
AGENTGRAM_APPROVED=1
```

> ⚠️ cron이 이미 `AGENTGRAM_APPROVED=1`을 설정하고 있다면 plan-file과 approved-issue가 빠진 것이 원인.  
> cron job 설정을 `openclaw cron list` → `openclaw cron edit <jobId>`로 확인.

**방법 C — like 대체 실행 (즉각 KPI 회복):**

approval 없이도 `like`는 live 실행 가능:

```bash
~/.openclaw/agents/cheese/agent/skills/agentgram-operations/scripts/run.sh like
```

### preflight 3단계 체크리스트

```
blocked_retry:
  slot: <다음 슬롯 시각>
  checklist:
    - approval: AGENTGRAM_APPROVED=1 또는 --approved-issue ID 확인
    - plan_file: plan-YYYY-MM-DD-<slot>.json 존재 확인
    - env: AGENTGRAM_TOKEN, AGENTGRAM_USER_ID 설정 확인
  status: pending | cleared
```

---

## 2. post_id_discovery_failed (comment 404)

### 원인

comment plan에 포함된 `post_id`가 AgentGram 피드에서 삭제되거나 만료되어 404 NOT_FOUND 반환.

### 증상

```
news-bot | error | HTTP 404: {"success":false,"error":{"code":"NOT_FOUND","message":"Post not found"}}
```

### 해소 방법

1. AgentGram 피드에서 현재 유효한 post_id 새로 수집:

   ```bash
   curl -s "https://www.agentgram.co/api/v1/posts?sort=hot&limit=30" | python3 -c \
     "import json,sys; posts=json.load(sys.stdin).get('data',[]); [print(p['id'], p.get('title','')[:40]) for p in posts]"
   ```

2. comment plan 파일의 `post_id` 값을 유효한 ID로 교체.

3. `validate_comment_plan.py`로 충돌 확인 후 live 실행:

   ```bash
   python3 ~/.openclaw/agents/cheese/agent/skills/agentgram-operations/scripts/validate_comment_plan.py \
     --plan-file <updated-plan.json>
   ```

---

## 3. YouTube OAuth stuck (invalid_grant)

### 원인

YouTube API OAuth2 토큰 만료. 토큰 파일:  
`~/.openclaw/credentials/youtube-token.json`

### 증상

```
YouTube upload failed: invalid_grant
```

또는 업로드 스크립트 실행 시 인증 오류.

### 해소 방법

**Step 1 — 재인증 실행 (덕환 직접 실행 필요):**

```bash
cd ~/.openclaw/projects/youtube-pipeline
python3 scripts/upload-youtube.py --auth
```

브라우저가 열리면 Google 계정으로 로그인 → 권한 허용.  
완료 시 `~/.openclaw/credentials/youtube-token.json` 갱신됨.

**Step 2 — 토큰 유효성 확인:**

```bash
python3 scripts/upload-youtube.py --from-script scripts/test.json --dry-run 2>&1 | head -5
# "token OK" 또는 업로드 준비 완료 메시지 확인
```

**Step 3 — 업로드 재시도:**

```bash
cd ~/.openclaw/projects/youtube-pipeline
python3 scripts/upload-youtube.py output/<name>.mp4 --from-script scripts/<name>.json
```

> ⚠️ OAuth 재인증은 브라우저 인터랙션이 필요하므로 **자동화 불가**. 덕환이 직접 실행해야 한다.

**인증 미완료 시 임시 대안 — 수동 업로드:**

YouTube 스튜디오에서 `output/<name>.mp4`를 수동 업로드한 뒤  
`output/upload_log.json`에 아래 형식으로 수동 기록:

```json
{
  "video_id": "<youtube-video-id>",
  "title": "<영상 제목>",
  "upload_mode": "manual",
  "uploaded_at": "2026-06-25T00:00:00+09:00",
  "script": "scripts/<name>.json"
}
```

---

## 운영 필요 액션 요약

| 액션 | 담당 | 자동화 가능 |
|------|------|-----------|
| `AGENTGRAM_APPROVED=1` 설정 또는 --approved-issue 발급 | 덕환 | ❌ (정책상 수동 승인) |
| comment plan post_id 갱신 | 치즈 (자동) 또는 덕환 | ✅ (피드 API) |
| YouTube OAuth 재인증 (`--auth`) | 덕환 | ❌ (브라우저 필요) |
| like 슬롯 유지 (KPI 방어) | 치즈 자동 | ✅ |

---

## 참고 파일

| 파일 | 역할 |
|------|------|
| `~/.openclaw/agents/cheese/agent/skills/agentgram-operations/SKILL.md` | preflight gate 정책 |
| `~/.openclaw/agents/cheese/agent/skills/agentgram-operations/scripts/run.sh` | canonical runner |
| `~/.openclaw/agents/kkami/agent/skills/video-pipeline/SKILL.md` | YouTube 업로드 파이프라인 |
| `~/.openclaw/credentials/youtube-token.json` | YouTube OAuth 토큰 |
| `~/.openclaw/agents/cheese/agent/docs/agentgram-live-approval-flow.md` | 승인 플로우 SoT |
