# Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate existing ones:

```
// Pseudocode
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns new copy with change
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large modules
- Organize by feature/domain, not by type

## Error Handling

ALWAYS handle errors comprehensively:
- Handle errors explicitly at every level
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

## Input Validation

ALWAYS validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

## エレガントさの追求

重要な変更においては、コード品質を意識する：
- ハック的・場当たり的に感じるコードは**再実装を検討**する
- 「今知っていることをすべて踏まえて、エレガントな解決策を実装する」という視点を持つ
- ただし**過剰設計は避ける** - シンプルで明白な修正にはそのまま適用しない
- 一時的な修正（temporary fix）は禁止。シニアエンジニア水準を維持する

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation (immutable patterns used)
