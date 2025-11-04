Reminder that
**User is already defined by the auth session so it does not need to be passed to apis**

## Habit Entries

**Base route:** `/api/habits/[habitId]/entries`

This nested structure makes semantic sense since entries belong to habits.

```
POST   /api/habits/[habitId]/entries
GET    /api/habits/[habitId]/entries
GET    /api/habits/[habitId]/entries/[entryId]
PUT    /api/habits/[habitId]/entries/[entryId]
PATCH  /api/habits/[habitId]/entries/[entryId]
DELETE /api/habits/[habitId]/entries/[entryId]
```

## User-Centric Queries

**Base route:** `/api/entries`

Queries that span multiple habits (like "all entries on a day"):

```
GET /api/entries?date=2025-11-03
GET /api/entries?startDate=2025-11-01&endDate=2025-11-30
```

## Habits Management

**Base route:** `/api/habits`

```
POST   /api/habits
GET    /api/habits
GET    /api/habits/[habitId]
PUT    /api/habits/[habitId]
DELETE /api/habits/[habitId]
```