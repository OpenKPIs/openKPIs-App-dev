# GitHub Sync Configuration

## Enterprise-Grade Configuration Options

All retry and delay settings are configurable via environment variables with sensible defaults.

---

## Environment Variables

### Fork Polling Configuration

```bash
# Number of attempts to poll for fork readiness
GITHUB_FORK_POLL_ATTEMPTS=20          # Default: 20

# Initial delay between fork poll attempts (ms)
GITHUB_FORK_POLL_DELAY=500            # Default: 500ms

# Maximum delay between fork poll attempts (ms)
GITHUB_FORK_POLL_MAX_DELAY=4000       # Default: 4000ms (4s)
```

**Behavior**: Exponential backoff from 500ms → 1s → 2s → 4s (capped)

---

### Branch Verification Configuration

```bash
# Number of attempts to verify branch exists in fork
GITHUB_BRANCH_VERIFY_REF_ATTEMPTS=5   # Default: 5

# Initial delay between branch verification attempts (ms)
GITHUB_BRANCH_VERIFY_REF_DELAY=1000   # Default: 1000ms (1s)

# Maximum delay between branch verification attempts (ms)
GITHUB_BRANCH_VERIFY_REF_MAX_DELAY=4000  # Default: 4000ms (4s)
```

**Behavior**: Exponential backoff from 1s → 2s → 4s (capped)

---

### Branch Accessibility Configuration

```bash
# Number of attempts to verify branch is accessible for PR creation
GITHUB_BRANCH_VERIFY_ATTEMPTS=8       # Default: 8

# Initial delay between branch accessibility checks (ms)
GITHUB_BRANCH_VERIFY_DELAY=1000       # Default: 1000ms (1s)

# Maximum delay between branch accessibility checks (ms)
GITHUB_BRANCH_VERIFY_MAX_DELAY=8000   # Default: 8000ms (8s)
```

**Behavior**: Exponential backoff from 1s → 2s → 4s → 8s (capped)

---

### PR Creation Configuration

```bash
# Number of attempts to create PR
GITHUB_PR_RETRY_ATTEMPTS=5             # Default: 5

# Initial delay between PR creation attempts (ms)
GITHUB_PR_RETRY_DELAY=2000             # Default: 2000ms (2s)

# Maximum delay between PR creation attempts (ms)
GITHUB_PR_RETRY_MAX_DELAY=16000        # Default: 16000ms (16s)
```

**Behavior**: Exponential backoff from 2s → 4s → 8s → 16s (capped)

---

## Rate Limiting

All operations automatically handle GitHub rate limiting (429 errors):

- **Default retry delay**: 60 seconds
- **Uses `Retry-After` header**: If provided by GitHub
- **Automatic retry**: Continues after rate limit expires

No configuration needed - handled automatically.

---

## Exponential Backoff

All retry operations use exponential backoff:

1. **Initial delay**: First retry uses initial delay
2. **Double each time**: Delay doubles on each retry
3. **Capped at max**: Never exceeds maximum delay

**Example (PR Creation)**:
- Attempt 1: 2s delay
- Attempt 2: 4s delay
- Attempt 3: 8s delay
- Attempt 4: 16s delay (capped)
- Attempt 5: 16s delay (capped)

---

## Default Values Summary

| Operation | Attempts | Initial Delay | Max Delay |
|-----------|----------|---------------|-----------|
| Fork Polling | 20 | 500ms | 4s |
| Branch Verify (Ref) | 5 | 1s | 4s |
| Branch Verify (Access) | 8 | 1s | 8s |
| PR Creation | 5 | 2s | 16s |

---

## When to Adjust

### Increase Delays If:
- GitHub API is slow
- Frequent rate limiting
- Network latency is high

### Decrease Delays If:
- Fast GitHub API response
- Low network latency
- Need faster user experience

### Increase Attempts If:
- GitHub sync is unreliable
- Frequent transient failures
- Need higher success rate

### Decrease Attempts If:
- Want faster failure detection
- GitHub is consistently fast
- Lower timeout requirements

---

## Production Recommendations

### Conservative (High Reliability)
```bash
GITHUB_FORK_POLL_ATTEMPTS=30
GITHUB_BRANCH_VERIFY_ATTEMPTS=10
GITHUB_PR_RETRY_ATTEMPTS=7
GITHUB_PR_RETRY_MAX_DELAY=30000  # 30s max
```

### Balanced (Default)
```bash
# Use defaults - no configuration needed
```

### Aggressive (Fast Failures)
```bash
GITHUB_FORK_POLL_ATTEMPTS=10
GITHUB_BRANCH_VERIFY_ATTEMPTS=3
GITHUB_PR_RETRY_ATTEMPTS=3
GITHUB_PR_RETRY_MAX_DELAY=8000  # 8s max
```

---

## Testing Configuration

To test different configurations:

1. Set environment variables in Vercel
2. Deploy to staging
3. Monitor logs for retry behavior
4. Adjust based on success rates

---

## Monitoring

Watch for these log messages to understand retry behavior:

- `[GitHub Fork PR] Rate limited, waiting Xs...`
- `[GitHub Fork PR] Branch not accessible yet, waiting Xms...`
- `[GitHub Fork PR] PR creation failed (head field invalid), retrying in Xms...`

These indicate the retry logic is working and can help tune delays.

