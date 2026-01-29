# Macrofolio Monitoring & Incident Response Playbook

**Version:** 1.0  
**Last Updated:** January 29, 2026  
**Applicable to:** Production deployment (Polygon Mainnet)

---

## 1. Monitoring Setup

### 1.1 Error Tracking (Sentry)

**Purpose:** Capture and alert on production errors in real-time.

#### Installation

```bash
npm install @sentry/react @sentry/tracing
```

#### Configuration (main.tsx)

```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true, // Mask PII
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // Capture all error sessions
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send ResizeObserver errors
        if (error.message.includes('ResizeObserver')) {
          return null;
        }
        // Don't send user-dismissable errors
        if (error.message.includes('User rejected')) {
          return null;
        }
      }
    }
    return event;
  },
});
```

#### Key Metrics to Monitor

```typescript
// Transaction monitoring
const transaction = Sentry.startTransaction({
  name: "Portfolio Anchoring",
  op: "transaction",
});

try {
  // Anchor operation
  const result = await contract.anchor(...);
  Sentry.captureMessage("Portfolio anchored successfully", "info");
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: "portfolio_anchor",
      severity: "critical",
    },
  });
} finally {
  transaction.finish();
}
```

#### Alert Rules (in Sentry UI)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Error rate exceeds | 10% | Slack notification |
| New issue created | Any | Email team |
| Critical error occurs | Any | PagerDuty escalation |
| Wallet connection fails | >50 in 1 hour | Alert team |

---

### 1.2 Performance Monitoring (Web Vitals)

**Purpose:** Track user experience metrics (LCP, FID, CLS).

#### Implementation

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(metric => {
  Sentry.captureMessage(`CLS: ${metric.value}`, "info");
});

getFID(metric => {
  Sentry.captureMessage(`FID: ${metric.value}`, "info");
});

getLCP(metric => {
  Sentry.captureMessage(`LCP: ${metric.value}`, "info");
});
```

#### Thresholds

| Metric | Good | Needs Work | Poor |
|--------|------|-----------|------|
| LCP | <2.5s | 2.5-4s | >4s |
| FID | <100ms | 100-300ms | >300ms |
| CLS | <0.1 | 0.1-0.25 | >0.25 |

---

### 1.3 Smart Contract Monitoring

**Purpose:** Track contract state, transactions, and anomalies.

#### Setup with Alchemy Webhooks

```typescript
// Webhook endpoint
app.post('/webhooks/contract', (req, res) => {
  const { event } = req.body;

  if (event.type === 'PortfolioAnchored') {
    // Log anchor event
    console.log(`Anchor: user=${event.from}, hash=${event.dataHash}`);
    
    // Check for anomalies
    const anchorsPerHour = await countAnchorsInWindow(event.from, 3600);
    if (anchorsPerHour > 15) {
      // Possible attack
      Sentry.captureMessage(`Unusual anchor activity: ${event.from}`, "warning");
    }
  }

  res.json({ received: true });
});
```

#### Key Events to Monitor

```javascript
// PortfolioAnchored events
{
  "event": "PortfolioAnchored",
  "from": "0x...",
  "actionType": 0,
  "dataHash": "0x...",
  "timestamp": 1234567890
}

// Monitor for:
// - Spike in anchor events (possible attack)
// - Rapid sequences from same user (rate limit test)
// - Invalid action types
// - Repeated same dataHash (replay attempt)
```

---

### 1.4 Database Monitoring (Supabase)

**Purpose:** Track database health, query performance, security.

#### Supabase Monitoring Dashboard

```sql
-- Monitor query performance
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor slow queries
SELECT
  query,
  total_time,
  calls,
  mean_time
FROM pg_stat_statements
WHERE mean_time > 100 -- ms
ORDER BY total_time DESC;

-- Monitor RLS policy enforcement
SELECT
  * 
FROM postgres_logs
WHERE message LIKE '%RLS%'
  AND timestamp > NOW() - INTERVAL '1 hour';
```

#### Alerts to Configure

- Query execution time > 1 second
- RLS policy failures
- Unusual INSERT/UPDATE/DELETE volume
- Authentication failures > 10/hour

---

### 1.5 Infrastructure Monitoring (Netlify)

**Purpose:** Track deployment health, CDN performance, errors.

#### Netlify Integrations

```yaml
# netlify.toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[context.production]
  environment = { SENTRY_AUTH_TOKEN = "token" }

[functions."error-handler"]
  # Custom error handler function
  handler = "error-handler/index.js"
```

#### Key Metrics

- Deployment success rate (target: 100%)
- Page load time (target: <2s)
- CDN cache hit rate (target: >90%)
- Error rate (target: <0.1%)

---

## 2. Incident Response Procedures

### 2.1 Incident Classification

| Level | Examples | Response Time | Actions |
|-------|----------|----------------|---------|
| **P1 (Critical)** | Smart contract exploit, data breach | Immediate | Page all engineers, pause deploys |
| **P2 (High)** | Signature verification failure, rate limit bypass | 15 min | Alert team, begin investigation |
| **P3 (Medium)** | High error rate, slow performance | 1 hour | Log issue, schedule review |
| **P4 (Low)** | Minor UI bug, cosmetic issue | 1 day | Backlog item |

---

### 2.2 P1: Critical Incident Playbook

#### Scenario 1: Smart Contract Exploit Detected

**Symptoms:**
- Unauthorized anchors appearing
- Rate limit being bypassed
- Nonce incrementing unexpectedly
- Signature verification failures

**Response:**

```
T+0min:  Detect anomaly in monitoring
         ├─ Sentry alert: "Unusual anchor activity"
         └─ Team notified via PagerDuty

T+1min:  Incident commander assigned
         ├─ Create incident channel in Slack (#incident-xxxx)
         ├─ Page on-call engineer (contract specialist)
         └─ Prepare communication

T+2min:  Investigation begins
         ├─ Review contract state on Polygonscan
         ├─ Check RPC logs for transaction details
         ├─ Analyze Sentry error patterns
         └─ Verify no sensitive data leaked

T+5min:  Decision: Pause or Monitor?
         ├─ If contained: Monitor closely
         ├─ If escalating: Pause contract via Owner pause()
         └─ If data breach: Notify users immediately

T+10min: Mitigation
         ├─ If paused: Prepare patch
         ├─ Code review new implementation
         ├─ Test thoroughly on testnet
         └─ Deploy new version (transparent proxy if available)

T+30min: Communication
         ├─ Post incident summary
         ├─ Explain impact & mitigation
         ├─ Provide user action items if needed
         └─ Schedule post-mortem

T+24hr:  Post-mortem meeting
         ├─ Timeline of events
         ├─ Root cause analysis
         ├─ Preventive measures
         └─ Process improvements
```

**Checklist:**

```
[ ] Confirm incident is real (not false alarm)
[ ] Page incident commander
[ ] Create incident channel in communication platform
[ ] Pause contract if necessary (Owner.pause())
[ ] Preserve evidence (logs, traces, transactions)
[ ] Notify security team
[ ] Prepare user communication
[ ] Review contract code for vulnerabilities
[ ] Prepare patched version
[ ] Deploy to testnet for testing
[ ] Execute upgrade (if applicable)
[ ] Monitor for further incidents
[ ] Document timeline
[ ] Schedule post-mortem
[ ] Update security procedures
```

---

#### Scenario 2: Data Breach (User Data Exposed)

**Symptoms:**
- RLS policy bypass detected
- Unauthorized data access
- User reports seeing other user's data
- Database logs show policy violations

**Response:**

```
T+0min:  Alert received from monitoring
         ├─ Sentry: "RLS policy violation"
         └─ User report: "Seeing other user's portfolio"

T+1min:  Incident commander takes over
         ├─ Notify legal/compliance
         ├─ Preserve all logs (do not delete)
         ├─ Prepare incident communication
         └─ Page security engineer

T+5min:  Investigation
         ├─ Identify affected users
         ├─ Determine scope of exposure
         ├─ Review database logs (who accessed what)
         ├─ Check Supabase audit logs
         └─ Determine root cause

T+10min: Containment
         ├─ If RLS bypass: Review and fix policies
         ├─ If auth token compromise: Invalidate tokens
         ├─ If query injection: Review input validation
         └─ Deploy fix immediately

T+30min: Notification to users
         ├─ Determine which users were affected
         ├─ Prepare communication explaining:
         │   - What data was exposed
         │   - Who had access
         │   - Timeline
         │   - What we're doing
         │   - User action items
         └─ Send notification (email, in-app)

T+1hr:   Monitor for exploits
         ├─ Watch for new unauthorized access
         ├─ Review failed login attempts
         ├─ Check if leaked data appears elsewhere
         └─ Consider password reset requirement

T+24hr:  Post-mortem
         ├─ Detailed timeline of breach
         ├─ How it was exploited
         ├─ Impact assessment
         ├─ Fix validation
         ├─ Process improvements
         └─ Regulatory notification (if required)
```

**Checklist:**

```
[ ] Confirm data breach occurred
[ ] Notify incident commander immediately
[ ] Page security/compliance team
[ ] Identify all affected users
[ ] Determine exposure scope and duration
[ ] Preserve all forensic evidence
[ ] Review database/app logs
[ ] Identify root cause
[ ] Patch vulnerability
[ ] Deploy fix and test
[ ] Invalidate compromised sessions (if needed)
[ ] Prepare user notification
[ ] Send notifications to affected users
[ ] Monitor for further exploitation
[ ] Update RLS policies/auth logic
[ ] Regulatory notification (GDPR/CCPA if applicable)
[ ] Schedule post-mortem
[ ] Document lessons learned
```

---

### 2.3 P2: High Severity Playbook

#### Scenario: Rate Limit Bypass Detected

**Response (30-minute resolution target):**

```
1. Detect & Alert (1 min)
   └─ Sentry shows >20 anchors from single user in 10 min

2. Investigate (5 min)
   └─ Review contract rate limiting logic
   └─ Check if user is exploiting or testing

3. Determine Action (5 min)
   ├─ If test: Contact user, ask to stop
   ├─ If exploit: Pause contract, patch, redeploy
   └─ If bug: Fix and deploy

4. Patch & Test (15 min)
   └─ Deploy fix to testnet
   └─ Verify rate limiting works
   └─ Deploy to mainnet

5. Monitor (ongoing)
   └─ Watch for recurrence
```

**Severity: HIGH** because:
- Could lead to DoS
- Could inflate gas costs
- Could indicate broader vulnerability

---

### 2.4 P3: Medium Severity Playbook

**High Error Rate Detected (>5% for >5 min)**

```
1. Identify pattern
   ├─ Which errors are most common?
   ├─ Are they user-caused or system-caused?
   └─ Are they increasing?

2. Assess impact
   ├─ How many users affected?
   ├─ Are wallets unable to connect?
   ├─ Are anchors failing?

3. Triage
   ├─ If user-caused (bad input): Update error message
   ├─ If system (contract/DB issue): Investigate
   └─ If transient: Monitor and wait

4. Communicate
   ├─ If widespread: Post status update
   ├─ If isolated: Log issue, plan fix
   └─ Monitor until error rate normalizes

5. Follow-up
   ├─ Schedule review meeting
   ├─ Implement monitoring improvements
   └─ Add tests to catch this earlier next time
```

---

## 3. Monitoring Dashboard Template

### 3.1 Sentry Dashboard

**Key Metrics:**

```
┌─────────────────────────────────────────────┐
│ Macrofolio Production Monitoring            │
├─────────────────────────────────────────────┤
│                                             │
│ Error Rate:           0.2%  [HEALTHY]     │
│ Avg Response Time:    245ms [HEALTHY]     │
│ Failed Transactions:  3     [ALERT]       │
│                                             │
│ Last Hour Errors:                          │
│ ├─ MetaMask Connection: 2                  │
│ ├─ Signature Failure: 1                    │
│ └─ Database Timeout: 0                     │
│                                             │
│ Users Affected: 3                          │
│ Incidents This Week: 2 (both resolved)     │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 3.2 Smart Contract Monitoring

**Key Metrics:**

```
┌─────────────────────────────────────────────┐
│ PortfolioAnchor Contract Status             │
├─────────────────────────────────────────────┤
│ Contract Address: 0x...                    │
│ Status: ACTIVE [NOT PAUSED]                │
│                                             │
│ Today's Anchors: 143                       │
│ Today's Errors: 0                          │
│ Avg Gas Used: 78,000 gas                   │
│                                             │
│ Rate Limit Hits: 0 (today)                 │
│ Signature Failures: 0 (today)              │
│                                             │
│ Top Issues:                                 │
│ └─ None detected                           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. Escalation Path

### On-Call Schedule

```
Primary (Security): 
  - Rotation: 1 week
  - Alert via: PagerDuty
  - Escalate after: 15 minutes no response

Secondary (Backend):
  - Rotation: 1 week
  - Alert via: PagerDuty
  - Escalate after: 30 minutes no response

Tertiary (DevOps):
  - Rotation: 1 week
  - Alert via: PagerDuty
  - Escalate after: 1 hour no response

Management Escalation:
  - CTO/CEO if P1 incident
  - Triggered immediately for data breaches
  - Triggered after 2 hours for any P2 incident
```

### Communication Chain

```
1. Monitoring System (Sentry/Alchemy) detects issue
                            ↓
2. PagerDuty sends alert to on-call engineer
                            ↓
3. Engineer creates incident channel in Slack
                            ↓
4. Team members join incident channel
                            ↓
5. If not resolved in 15 min (P1) or 1 hour (P2):
   - Escalate to management
   - Notify affected users (if necessary)
   - Prepare external communication
```

---

## 5. Post-Incident Review

### Incident Report Template

```markdown
# Incident Report: [Title]

**Date:** [Date]  
**Duration:** [Start] - [End] (X hours)  
**Severity:** P[1-4]  

## Timeline

| Time | Action | Owner |
|------|--------|-------|
| T+0 | Issue detected | Monitoring system |
| T+5 | Investigation started | Security engineer |
| ... | ... | ... |

## Root Cause

[Detailed explanation of what went wrong]

## Impact

- Users affected: X
- Data compromised: [Yes/No] [Details]
- Financial loss: $X
- Duration: X minutes

## Mitigation

[What we did to stop it]

## Prevention

[How we'll prevent this in the future]

## Action Items

- [ ] Deploy code fix
- [ ] Add monitoring alert
- [ ] Update documentation
- [ ] Schedule follow-up training

## Lessons Learned

[What we learned from this incident]
```

---

## 6. Security Monitoring Checklist

### Daily Checks

```
[ ] Review Sentry error dashboard
[ ] Check smart contract event logs
[ ] Verify no unusual transaction patterns
[ ] Monitor database query performance
[ ] Review failed login attempts
[ ] Check uptime/availability metrics
```

### Weekly Review

```
[ ] Analyze error trends
[ ] Review new security vulnerabilities (CVEs)
[ ] Audit RLS policy enforcement
[ ] Check backup integrity
[ ] Review access logs
[ ] Update on-call schedule
```

### Monthly Review

```
[ ] Full incident retrospective
[ ] Security practices review
[ ] Dependency updates assessment
[ ] Infrastructure cost analysis
[ ] Incident response drill (simulation)
[ ] Update threat model if necessary
```

---

## 7. Communication Templates

### User-Facing Incident Notification

```
Subject: [ACTION REQUIRED] Macrofolio Security Issue - Brief Outage

Dear Macrofolio User,

We're writing to inform you of a [brief outage | security incident | service 
degradation] that affected our platform.

**What Happened:**
[Clear explanation of what occurred]

**When:**
[Date/time range]

**Impact:**
[Who was affected and what they experienced]

**What We're Doing:**
[Remediation steps]

**Your Next Steps:**
[If any action is required]

**Questions?**
Contact us at security@macrofolio.app

We apologize for any inconvenience.

- The Macrofolio Team
```

### Internal Incident Notification

```
INCIDENT ALERT - [SEVERITY LEVEL]

Affected Service: [Service name]
Detected: [Date/time]
Status: [Investigating | Mitigating | Resolved]

Description:
[What's happening]

Immediate Actions:
[What we're doing now]

Updates:
[Real-time updates in thread]

Join: [incident-slack-channel]
```

---

## Conclusion

This monitoring and incident response playbook ensures:

1. **Rapid Detection** - Monitoring catches issues within minutes
2. **Quick Response** - Clear procedures enable fast mitigation
3. **Minimal Impact** - Escalation paths prevent cascading failures
4. **Learning** - Post-mortems improve future incident handling
5. **User Trust** - Transparent communication during incidents

**Next Steps:**
- [ ] Set up Sentry with DSN key
- [ ] Configure PagerDuty on-call schedule
- [ ] Train team on escalation procedures
- [ ] Run incident response drill
- [ ] Document team contact information