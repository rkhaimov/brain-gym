# Sales Tracking — Phase Two: Form value drafts

Status: needs-triage

## Deferred scope

Phase two protects unfinished browser form values from accidental navigation, refresh, server failure, and application restart. Draft recovery applies consistently to create and edit forms without making browser storage authoritative for confirmed application data.

## User stories

1. As the creator, unfinished form values are restored after navigation, refresh, or application restart so that I do not have to re-enter them.
2. As the creator, I can explicitly clear a restored form draft, and a draft is cleared automatically only after its save is confirmed.
3. As the creator, imported editable values can be restored as a draft, while the original Excel binary is never retained in browser storage.

## Implementation decisions

- One shared Form facility owns browser-local draft parsing, persistence, restoration, stale-write protection, and clearing.
- Each form supplies only a stable draft key and structural schema.
- Draft values are structurally validated when read from untyped synchronous browser storage; malformed data is ignored and cannot prevent a later valid write.
- Changed values are persisted approximately every five seconds and synchronously during page close.
- Every stored draft carries a request timestamp, and an older write cannot replace a newer structurally valid draft.
- Ordinary navigation and cancellation do not clear a draft. Confirmed save and an explicit Clear action do.
