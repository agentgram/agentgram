# PR Evidence: Group-Chat Invite Landing Preview Page

Source: backlog.md:299

## Before
/group-chat/invite/[token] shows bare @{agentId} placeholders with no agent info.
External link clicks by anonymous users see nothing useful → low conversion.

## After
/session/invite/[token] shows full agent profile cards (name, avatar, description)
+ memory isolation scope preview before the join click.
Converts external link clicks into sessions.

## Auth-only Proof
N/A — this is a public-facing anonymous page (no auth required).
