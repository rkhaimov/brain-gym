# Report Import Review and Reconciliation — Backlog

Status: needs-triage

## Deferred scope

Extend automatic Yandex Mail import with a manual recovery path for local files, interactive correction, and content-aware reconciliation. This is separate from ticket 09's cursor-based automatic import.

## User stories

1. As the creator, I can select a local Report file when mail import is unavailable or inappropriate.
2. As the creator, I can review grouped parsed values, correct validation problems, and deliberately confirm the complete batch.
3. As the creator, I am warned when attachment content duplicates or revises an earlier import.
4. As the creator, I can reconcile a resent workbook and recover safely after an INBOX UIDVALIDITY reset without duplicating history.

## Open decisions

- Define persisted source identity, revision lineage, and retention policy without storing unnecessary private attachment content.
- Decide how corrections relate to the immutable source workbook and later resends.
- Design explicit recovery for mailbox-account and UIDVALIDITY changes.
