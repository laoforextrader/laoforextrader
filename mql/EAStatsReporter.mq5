//+------------------------------------------------------------------+
//|                                          EAStatsReporter.mq5     |
//|                  POST account stats to LaoForexTrader webhook    |
//+------------------------------------------------------------------+
//
//  Setup:
//   1. MetaEditor → File → New → Expert Advisor → name "EAStatsReporter"
//   2. Replace generated code with this file's contents → F7 to compile
//   3. Tools → Options → Expert Advisors → tick "Allow WebRequest"
//        Add URL: https://laoforextrader.com   (or your Vercel URL)
//   4. Drag the EA onto any chart, set inputs, click OK
//   5. Make sure "AutoTrading" is ON (the Algo Trading button)
//
//  Memory model (designed for high-volume accounts):
//
//  Bootstrap touches every historical deal so MT5 loads them all into
//  its in-process deal cache and never frees them — that's the 1+ GB
//  spike on heavy accounts. There is no MQL API to release that cache.
//
//  So we run bootstrap exactly ONCE per fresh install: walk history
//  backwards in chunks (BootstrapChunkDays) and bucket each deal into
//  a sparse day/month map plus running cash-flow counters. Then we
//  persist that state to a file in MQL5/Files. Restart MT5 → load the
//  file → skip bootstrap entirely → incremental scans only touch deals
//  newer than g_maxDealTimeSeen (usually ~minutes worth). RAM stays
//  near the empty-terminal baseline forever after.
//
//  Workflow for the user:
//   1. Compile and attach EA → first send triggers bootstrap (1 GB+
//      peak, one-time).
//   2. Bootstrap completes → SaveState() writes the file.
//   3. Restart MT5 → reattach EA → LoadState() restores everything →
//      no bootstrap, no full deal scan, RAM stays low.
//
//  State file: MQL5/Files/EAStatsReporter_<EAID>.dat (CSV). Gets
//  rewritten on every send. Includes EAID + account login as sanity
//  checks; mismatch (e.g. logged into a different account) triggers
//  a fresh bootstrap.
//
#property copyright "LaoForexTrader"
#property version   "1.30"
#property strict

input string  WebhookURL         = "https://laoforextrader.com/api/ea/stats";
input string  Secret             = "changeme";   // must equal EA_WEBHOOK_SECRET on server
input string  EAID               = "sgride";     // matches eaId in Sanity doc
input string  BrokerName         = "Markets4you";
input int     IntervalMin        = 60;           // send every N minutes
input bool    SendOnStart        = true;         // also send once at startup
input int     BootstrapChunkDays = 7;            // history chunk size at first send
input bool    PersistState       = true;         // save/load buckets to file

datetime g_lastSend = 0;

// ── Persistent bucket cache (file-scope; reloaded from disk on init) ──
string   g_dayKeys[];          // "YYYY-MM-DD"
double   g_dayProfit[];        // trading P&L (profit + swap + commission)
string   g_monthKeys[];        // "YYYY-MM"
double   g_monthProfit[];

double   g_cashedDeposits    = 0;
double   g_cashedWithdrawals = 0;
datetime g_maxDealTimeSeen   = 0;
bool     g_bootstrapped      = false;

//+------------------------------------------------------------------+
int OnInit()
{
   if(PersistState && LoadState())
      Print("[EAStatsReporter] State restored from file → skipping bootstrap");
   EventSetTimer(60);
   if(SendOnStart) SendStats();
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
   if(PersistState) SaveState();
}

void OnTimer()
{
   if(TimeCurrent() - g_lastSend >= IntervalMin * 60)
      SendStats();
}

//+------------------------------------------------------------------+
//|  Build & POST the stats payload                                  |
//+------------------------------------------------------------------+
void SendStats()
{
   string payload = BuildPayload();
   string headers = "Content-Type: application/json\r\n";
   char data[]; StringToCharArray(payload, data, 0, StringLen(payload));
   char result[]; string resHeaders;
   ResetLastError();
   int code = WebRequest("POST", WebhookURL, headers, 5000, data, result, resHeaders);
   if(code == -1)
      PrintFormat("[EAStatsReporter] WebRequest failed err=%d (add URL to allowed list)", GetLastError());
   else
      PrintFormat("[EAStatsReporter] POST %d  body=%s", code, CharArrayToString(result));
   if(PersistState) SaveState();
   g_lastSend = TimeCurrent();
}

//+------------------------------------------------------------------+
//|  JSON helpers                                                    |
//+------------------------------------------------------------------+
string Esc(string s)
{
   StringReplace(s, "\\", "\\\\");
   StringReplace(s, "\"", "\\\"");
   StringReplace(s, "\n", "\\n");
   StringReplace(s, "\r", "\\r");
   StringReplace(s, "\t", "\\t");
   return s;
}
string Q(string s) { return "\"" + Esc(s) + "\""; }
string F(double d) { return DoubleToString(d, 2); }

string DateStr(datetime t)
{
   MqlDateTime dt; TimeToStruct(t, dt);
   return StringFormat("%04d-%02d-%02d", dt.year, dt.mon, dt.day);
}
string MonthStr(datetime t)
{
   MqlDateTime dt; TimeToStruct(t, dt);
   return StringFormat("%04d-%02d", dt.year, dt.mon);
}

//+------------------------------------------------------------------+
//|  Bucket helpers — sparse string→double map                       |
//+------------------------------------------------------------------+
int FindKey(const string &keys[], string key)
{
   int n = ArraySize(keys);
   for(int i = 0; i < n; i++) if(keys[i] == key) return i;
   return -1;
}

void BucketAdd(string &keys[], double &vals[], string key, double v)
{
   int idx = FindKey(keys, key);
   if(idx < 0)
   {
      int n = ArraySize(keys);
      ArrayResize(keys, n + 1);
      ArrayResize(vals, n + 1);
      keys[n] = key;
      vals[n] = v;
   }
   else
   {
      vals[idx] += v;
   }
}

double BucketGet(const string &keys[], const double &vals[], string key)
{
   int idx = FindKey(keys, key);
   return idx < 0 ? 0 : vals[idx];
}

//+------------------------------------------------------------------+
//|  Apply one deal to whichever bucket(s) it belongs in             |
//+------------------------------------------------------------------+
void IngestDeal(ulong ticket, datetime dt)
{
   if(dt > g_maxDealTimeSeen) g_maxDealTimeSeen = dt;

   long type = HistoryDealGetInteger(ticket, DEAL_TYPE);

   if(type == DEAL_TYPE_BALANCE ||
      type == DEAL_TYPE_CREDIT  ||
      type == DEAL_TYPE_BONUS)
   {
      double amt = HistoryDealGetDouble(ticket, DEAL_PROFIT);
      if(amt > 0)      g_cashedDeposits    += amt;
      else if(amt < 0) g_cashedWithdrawals += -amt;
      return;
   }

   if(type != DEAL_TYPE_BUY && type != DEAL_TYPE_SELL) return;

   double pnl = HistoryDealGetDouble(ticket, DEAL_PROFIT) +
                HistoryDealGetDouble(ticket, DEAL_SWAP) +
                HistoryDealGetDouble(ticket, DEAL_COMMISSION);

   BucketAdd(g_dayKeys,   g_dayProfit,   DateStr(dt),  pnl);
   BucketAdd(g_monthKeys, g_monthProfit, MonthStr(dt), pnl);
}

//+------------------------------------------------------------------+
//|  State persistence — write/read buckets to MQL5/Files             |
//+------------------------------------------------------------------+
string StateFile() { return "EAStatsReporter_" + EAID + ".dat"; }

void ResetState()
{
   ArrayResize(g_dayKeys,    0);
   ArrayResize(g_dayProfit,  0);
   ArrayResize(g_monthKeys,  0);
   ArrayResize(g_monthProfit,0);
   g_cashedDeposits    = 0;
   g_cashedWithdrawals = 0;
   g_maxDealTimeSeen   = 0;
   g_bootstrapped      = false;
}

void SaveState()
{
   int h = FileOpen(StateFile(), FILE_WRITE | FILE_CSV | FILE_ANSI, ',');
   if(h == INVALID_HANDLE)
   {
      PrintFormat("[EAStatsReporter] SaveState failed err=%d", GetLastError());
      return;
   }
   FileWrite(h, "V", "1");
   FileWrite(h, "ACCT", (string)AccountInfoInteger(ACCOUNT_LOGIN));
   FileWrite(h, "EAID", EAID);
   FileWrite(h, "MAX",  (string)(long)g_maxDealTimeSeen);
   FileWrite(h, "DEP",  DoubleToString(g_cashedDeposits, 2));
   FileWrite(h, "WIT",  DoubleToString(g_cashedWithdrawals, 2));
   int n = ArraySize(g_dayKeys);
   for(int i = 0; i < n; i++)
      FileWrite(h, "D", g_dayKeys[i], DoubleToString(g_dayProfit[i], 2));
   int m = ArraySize(g_monthKeys);
   for(int i = 0; i < m; i++)
      FileWrite(h, "M", g_monthKeys[i], DoubleToString(g_monthProfit[i], 2));
   FileClose(h);
}

bool LoadState()
{
   int h = FileOpen(StateFile(), FILE_READ | FILE_CSV | FILE_ANSI, ',');
   if(h == INVALID_HANDLE) return false;

   string version  = "";
   long   savedAcc = 0;
   string savedEa  = "";
   bool   parsed   = false;

   while(!FileIsEnding(h))
   {
      string tag = FileReadString(h);
      if(tag == "") continue;

      if(tag == "V")
      {
         version = FileReadString(h);
         if(version != "1") { FileClose(h); ResetState(); return false; }
      }
      else if(tag == "ACCT") savedAcc = (long)StringToInteger(FileReadString(h));
      else if(tag == "EAID") savedEa  = FileReadString(h);
      else if(tag == "MAX")  g_maxDealTimeSeen   = (datetime)StringToInteger(FileReadString(h));
      else if(tag == "DEP")  g_cashedDeposits    = StringToDouble(FileReadString(h));
      else if(tag == "WIT")  g_cashedWithdrawals = StringToDouble(FileReadString(h));
      else if(tag == "D")
      {
         string k = FileReadString(h);
         double v = StringToDouble(FileReadString(h));
         BucketAdd(g_dayKeys, g_dayProfit, k, v);
      }
      else if(tag == "M")
      {
         string k = FileReadString(h);
         double v = StringToDouble(FileReadString(h));
         BucketAdd(g_monthKeys, g_monthProfit, k, v);
      }
      parsed = true;
   }
   FileClose(h);

   long currentAcc = (long)AccountInfoInteger(ACCOUNT_LOGIN);
   if(!parsed || version != "1" || savedAcc != currentAcc || savedEa != EAID)
   {
      PrintFormat("[EAStatsReporter] State file mismatch (acct=%I64d/%I64d ea=%s/%s) — bootstrapping fresh",
                  savedAcc, currentAcc, savedEa, EAID);
      ResetState();
      return false;
   }

   g_bootstrapped = true;
   return true;
}

//+------------------------------------------------------------------+
//|  One-time bootstrap: walk history backwards in small chunks.     |
//+------------------------------------------------------------------+
void Bootstrap()
{
   datetime now = TimeCurrent();
   int chunkDays = BootstrapChunkDays < 1 ? 7 : BootstrapChunkDays;
   datetime chunkSec  = (datetime)((long)chunkDays * 86400);
   datetime hardFloor = now > (datetime)(5LL * 365 * 86400)
                          ? (datetime)(now - 5LL * 365 * 86400)
                          : 0;

   datetime chunkEnd  = now + 1;
   int emptyStreak    = 0;

   while(chunkEnd > hardFloor)
   {
      datetime chunkStart = chunkEnd > chunkSec ? chunkEnd - chunkSec : 0;
      bool found = false;

      if(HistorySelect(chunkStart, chunkEnd))
      {
         int total = HistoryDealsTotal();
         for(int i = 0; i < total; i++)
         {
            ulong ticket = HistoryDealGetTicket(i);
            if(ticket == 0) continue;
            datetime dt = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
            if(dt >= chunkEnd) continue;
            IngestDeal(ticket, dt);
            found = true;
         }
      }

      if(found) emptyStreak = 0;
      else      emptyStreak++;

      if(emptyStreak >= 20) break;
      if(chunkStart == 0)   break;
      chunkEnd = chunkStart;
   }

   if(g_maxDealTimeSeen < now) g_maxDealTimeSeen = now;
   g_bootstrapped = true;

   PrintFormat("[EAStatsReporter] Bootstrap done: days=%d months=%d deposits=%.2f withdrawals=%.2f",
               ArraySize(g_dayKeys), ArraySize(g_monthKeys),
               g_cashedDeposits, g_cashedWithdrawals);
}

//+------------------------------------------------------------------+
//|  Incremental: scan only deals strictly newer than last seen       |
//+------------------------------------------------------------------+
void Incremental()
{
   datetime now      = TimeCurrent();
   datetime scanFrom = g_maxDealTimeSeen + 1;
   if(scanFrom > now) return;
   if(!HistorySelect(scanFrom, now + 1)) return;

   int total = HistoryDealsTotal();
   for(int i = 0; i < total; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket == 0) continue;
      datetime dt = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
      if(dt < scanFrom) continue;
      IngestDeal(ticket, dt);
   }
}

//+------------------------------------------------------------------+
//|  Build full JSON payload                                         |
//+------------------------------------------------------------------+
string BuildPayload()
{
   if(!g_bootstrapped) Bootstrap();
   else                Incremental();

   long   acct      = AccountInfoInteger(ACCOUNT_LOGIN);
   string server    = AccountInfoString(ACCOUNT_SERVER);
   string currency  = AccountInfoString(ACCOUNT_CURRENCY);
   double balance   = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity    = AccountInfoDouble(ACCOUNT_EQUITY);

   double totalDeposits    = g_cashedDeposits;
   double totalWithdrawals = g_cashedWithdrawals;
   double startBal  = totalDeposits > 0 ? totalDeposits : balance;
   double profitTot = balance + totalWithdrawals - totalDeposits;
   double profitPct = totalDeposits > 0 ? (profitTot / totalDeposits) * 100.0 : 0;

   datetime now = TimeCurrent();
   MqlDateTime nowDt; TimeToStruct(now, nowDt);
   MqlDateTime todayDt = nowDt; todayDt.hour = 0; todayDt.min = 0; todayDt.sec = 0;
   datetime todayMidnight = StructToTime(todayDt);

   // ── Daily (oldest → newest), last 30 days ──
   string daily = "[";
   for(int i = 29; i >= 0; i--)
   {
      datetime d = todayMidnight - i * 86400;
      string  key = DateStr(d);
      double  p   = BucketGet(g_dayKeys, g_dayProfit, key);
      double  pct = startBal > 0 ? (p / startBal) * 100.0 : 0;
      if(StringLen(daily) > 1) daily += ",";
      daily += "{" + Q("date") + ":" + Q(key) +
               "," + Q("profitPct") + ":" + F(pct) + "}";
   }
   daily += "]";

   // ── Monthly (oldest → newest), last 12 months ──
   string monthly = "[";
   for(int i = 11; i >= 0; i--)
   {
      MqlDateTime mDt = nowDt;
      mDt.mon -= i;
      while(mDt.mon <= 0) { mDt.mon += 12; mDt.year -= 1; }
      mDt.day = 1; mDt.hour = 0; mDt.min = 0; mDt.sec = 0;
      datetime m   = StructToTime(mDt);
      string   key = MonthStr(m);
      double   p   = BucketGet(g_monthKeys, g_monthProfit, key);
      double   pct = startBal > 0 ? (p / startBal) * 100.0 : 0;
      if(StringLen(monthly) > 1) monthly += ",";
      monthly += "{" + Q("month") + ":" + Q(key) +
                 "," + Q("profitPct") + ":" + F(pct) + "}";
   }
   monthly += "]";

   string json = "{"
      + Q("eaId")             + ":" + Q(EAID)                  + ","
      + Q("secret")           + ":" + Q(Secret)                + ","
      + Q("account")          + ":" + Q((string)acct)          + ","
      + Q("server")           + ":" + Q(server)                + ","
      + Q("broker")           + ":" + Q(BrokerName)            + ","
      + Q("currency")         + ":" + Q(currency)              + ","
      + Q("balance")          + ":" + F(balance)               + ","
      + Q("equity")           + ":" + F(equity)                + ","
      + Q("startBalance")     + ":" + F(startBal)              + ","
      + Q("totalDeposits")    + ":" + F(totalDeposits)         + ","
      + Q("totalWithdrawals") + ":" + F(totalWithdrawals)      + ","
      + Q("profitTotal")      + ":" + F(profitTot)             + ","
      + Q("profitTotalPct")   + ":" + F(profitPct)             + ","
      + Q("monthlyReturns")   + ":" + monthly                  + ","
      + Q("dailyReturns")     + ":" + daily
      + "}";
   return json;
}
//+------------------------------------------------------------------+
