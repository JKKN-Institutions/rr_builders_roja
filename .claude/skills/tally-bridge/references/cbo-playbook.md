# Tally Bridge — CBO Playbook

## Client Onboarding Checklist

Print this. Follow it step by step. Tick each box.

---

### BEFORE YOU LEAVE FOR THE CLIENT SITE

- [ ] **1. Open Claude Code on YOUR laptop**
- [ ] **2. Type:** `/tally-bridge new-client`
- [ ] **3. When asked, type the client's company name** (exactly as it appears in TallyPrime — spelling, spacing, and capitalisation must match)
- [ ] **4. Wait** — Claude creates the cloud account and dashboard (1-2 minutes)
- [ ] **5. You'll see 3 values on screen. Write them down or screenshot:**

```
  API Key:    bw_live_xxxxxxxxxxxxxxxxxxxxxxxx
  Cloud URL:  https://....vercel.app/api/tally
  Client ID:  company-name
```

- [ ] **6. Save these 3 values** — you'll need them on the client's machine

---

### FIRST TIME ON A NEW CLIENT MACHINE (only once per machine)

Connect to the client's machine via AnyDesk/TeamViewer.

- [ ] **7. Open Command Prompt** on the client's machine (Start > type `cmd` > Enter)
- [ ] **8. Type:** `node --version` and press Enter
  - If you see a version number (e.g., `v20.11.1`) → skip to step 10
  - If you see an error → do step 9

- [ ] **9. Install Node.js** (only if step 8 failed)
  - Open a browser on the client's machine
  - Go to **nodejs.org**
  - Click the big green **"LTS"** download button
  - Run the installer, click Next through everything
  - Close and reopen Command Prompt
  - Type `node --version` again — should show a version now

- [ ] **10. Install Claude Code** (only first time)
  - In Command Prompt, type: `npm install -g @anthropic-ai/claude-code`
  - Wait for it to finish
  - Type: `claude` and press Enter
  - Follow the login steps (use your Claude Max account)

- [ ] **11. Set up the bridge folder**
  - Copy the bridge code to `C:\tally-bridge` (from USB or network share)
  - In Command Prompt, type: `cd C:\tally-bridge && npm install`
  - Wait for it to finish (may take 2-3 minutes)

---

### CONNECT THE CLIENT (every new client)

Make sure TallyPrime is open on the client's machine with their company loaded.

- [ ] **12. Open Claude Code on the client's machine**
  - In Command Prompt, type: `cd C:\tally-bridge && claude`

- [ ] **13. Type:** `/tally-bridge setup`

- [ ] **14. When Claude asks, paste the 3 values** from step 5:
  - API Key
  - Cloud URL
  - Client ID

- [ ] **15. Claude will find the company in TallyPrime automatically**
  - If it shows the right company name → confirm
  - If it shows multiple companies → pick the right one
  - If it says "no company found" → make sure TallyPrime is open with a company loaded

- [ ] **16. Wait for data sync** (Claude shows progress)
  - Small company (< 500 vouchers): 1-2 minutes
  - Medium company (500-5000 vouchers): 5-10 minutes
  - Large company (5000+ vouchers): 15-30 minutes

- [ ] **17. Claude sets up auto-start** — bridge runs when computer turns on

- [ ] **18. Claude shows the delivery report** — check that:
  - [ ] Tally connection says CONNECTED
  - [ ] Voucher count matches what's in TallyPrime
  - [ ] Cloud connection says CONNECTED
  - [ ] Dashboard URL is shown

---

### VERIFY (don't skip this!)

- [ ] **19. Open the Dashboard URL** in a browser on the client's machine
  - [ ] Can you see voucher data?
  - [ ] Does the total count match TallyPrime?
  - [ ] Are the dates correct?

- [ ] **20. Quick Tally test** — create a test voucher in TallyPrime
  - Create a simple Payment voucher (you can delete it after)
  - Wait 2 minutes
  - Refresh the dashboard
  - [ ] Does the new voucher appear?

- [ ] **21. If the test voucher appeared** → DELETE it from TallyPrime
  - The test voucher will disappear from the dashboard after the nightly reconciliation (11 PM). This is normal — deletion detection is not instant.

---

### HANDOVER TO CLIENT

- [ ] **22. Show the client their dashboard URL** — they can bookmark it
- [ ] **23. Tell the client these 3 things:**
  - "Your financial data syncs automatically every minute during business hours"
  - "TallyPrime needs to be running for sync to work"
  - "If the computer restarts, the sync starts automatically"

- [ ] **24. Save a record** of this setup:

```
  Client:        ___________________________
  Date:          ___________________________
  Company Name:  ___________________________
  Client ID:     ___________________________
  API Key:       bw_live_....________________ (last 4 chars only)
  Dashboard URL: ___________________________
  Machine Name:  ___________________________
  Tally Port:    9000 (default)
  Contact Person:___________________________
  Phone:         ___________________________
```

---

## TROUBLESHOOTING — WHEN THINGS GO WRONG

### "Tally is not responding"

1. Is TallyPrime open on this computer? Open it.
2. Is a company loaded? Open one.
3. Check API: In TallyPrime, press F1 > Settings > Connectivity > API Server should be ON, port 9000.
4. Still not working? Restart TallyPrime.

### "Cloud connection failed"

1. Is the internet working? Open a browser, try google.com.
2. Check the API key — is it exactly right? (starts with `bw_live_`)
3. Check the Cloud URL — does it end with `/api/tally`?
4. Still failing? Run `/tally-bridge debug` in Claude Code.
5. Still failing? Call the tech team.

### "Vouchers not appearing on dashboard"

1. Is the bridge running? Open Command Prompt, type: `schtasks /query /tn "TallyBridge"`
2. Is TallyPrime open? It must be running for sync to work.
3. Run `/tally-bridge status` in Claude Code to see what's stuck.
4. Try: `/tally-bridge resync` to sync everything fresh.

### "Dashboard shows wrong data"

1. Check if the right company is open in TallyPrime.
2. Run `/tally-bridge status` — does the company name match?
3. If wrong company: close TallyPrime, open the right company, run `/tally-bridge resync`.

### "Computer restarted and sync stopped"

1. Open Command Prompt
2. Type: `schtasks /query /tn "TallyBridge"`
3. If it says "not found": open Claude Code, run `/tally-bridge setup` (it will re-enable auto-start)
4. If it exists but not running: type `schtasks /run /tn "TallyBridge"`

### "I need to re-sync everything from scratch"

1. Open Claude Code on the client's machine
2. Type: `/tally-bridge resync`
3. Wait for it to finish

### Nothing above works?

Call the tech team. Tell them:
- Client name and ID
- What you see on screen
- What step you were on in this checklist

---

## QUICK COMMANDS REFERENCE

| What you want to do | What to type |
|---------------------|-------------|
| Set up a new client (on YOUR laptop) | `/tally-bridge new-client` |
| Prepare a client machine (first time) | `/tally-bridge prep-machine` |
| Connect bridge to Tally (on client machine) | `/tally-bridge setup` |
| Check if everything is working | `/tally-bridge status` |
| Fix problems | `/tally-bridge debug` |
| Re-sync all data from scratch | `/tally-bridge resync` |
| Check data flows end-to-end | `/tally-bridge verify` |

---

## TIMINGS TO KNOW

| What | How long |
|------|----------|
| Cloud account creation (your laptop) | 1-2 minutes |
| First-time machine setup (Node.js + bridge) | 10-15 minutes |
| Connecting bridge to Tally | 2-3 minutes |
| Initial sync (small company, < 500 vouchers) | 1-2 minutes |
| Initial sync (medium, 500-5000 vouchers) | 5-10 minutes |
| Initial sync (large, 5000+ vouchers) | 15-30 minutes |
| Ongoing sync (per voucher change) | ~1 minute |
| Dashboard refresh | Instant (just reload the page) |

---

## WHAT RUNS WHERE

| Your laptop | Client's machine |
|-------------|-----------------|
| Create cloud account | Install bridge |
| Deploy dashboard | Connect to Tally |
| — | Sync vouchers |
| — | Auto-start on boot |
| — | Debug problems |

**Your laptop** needs: Claude Code + internet
**Client's machine** needs: Claude Code + Node.js + bridge code + TallyPrime + internet
