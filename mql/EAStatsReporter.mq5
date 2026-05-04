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
#property copyright "LaoForexTrader"
#property version   "1.00"
#property strict

input string  WebhookURL    = "https://laoforextrader.com/api/ea/stats";
input string  Secret        = "changeme";   // must equal EA_WEBHOOK_SECRET on server
input string  EAID          = "sgride";     // matches eaId in Sanity doc
input string  BrokerName    = "Markets4you";
input int     IntervalMin   = 60;           // send every N minutes
input bool    SendOnStart   = true;         // also send once at startup

datetime g_lastSend = 0;

//+------------------------------------------------------------------+
int OnInit()
{
   EventSetTimer(60); // tick every 60 sec — we throttle internally
   if(SendOnStart) SendStats();
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason) { EventKillTimer(); }

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
   g_lastSend = TimeCurrent();
}

//+------------------------------------------------------------------+
//|  JSON building helpers (no native lib — escape manually)         |
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

//+------------------------------------------------------------------+
//|  Compute starting balance = first DEAL_TYPE_BALANCE deal         |
//|  (the initial deposit) or fallback to current balance.           |
//+------------------------------------------------------------------+
double GetStartBalance()
{
   if(!HistorySelect(0, TimeCurrent())) return AccountInfoDouble(ACCOUNT_BALANCE);
   int total = HistoryDealsTotal();
   for(int i = 0; i < total; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket == 0) continue;
      long type = HistoryDealGetInteger(ticket, DEAL_TYPE);
      if(type == DEAL_TYPE_BALANCE)
      {
         double amt = HistoryDealGetDouble(ticket, DEAL_PROFIT);
         if(amt > 0) return amt; // first positive balance op = initial deposit
      }
   }
   return AccountInfoDouble(ACCOUNT_BALANCE);
}

//+------------------------------------------------------------------+
//|  Sum profit (incl. swap+commission) over [from, to)              |
//+------------------------------------------------------------------+
double SumProfit(datetime from, datetime to)
{
   if(!HistorySelect(from, to)) return 0;
   double sum = 0;
   int total = HistoryDealsTotal();
   for(int i = 0; i < total; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket == 0) continue;
      long type = HistoryDealGetInteger(ticket, DEAL_TYPE);
      // Only trading deals (not balance/credit ops)
      if(type != DEAL_TYPE_BUY && type != DEAL_TYPE_SELL) continue;
      sum += HistoryDealGetDouble(ticket, DEAL_PROFIT);
      sum += HistoryDealGetDouble(ticket, DEAL_SWAP);
      sum += HistoryDealGetDouble(ticket, DEAL_COMMISSION);
   }
   return sum;
}

//+------------------------------------------------------------------+
//|  Format date as YYYY-MM-DD                                        |
//+------------------------------------------------------------------+
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
//|  Build full JSON payload                                         |
//+------------------------------------------------------------------+
string BuildPayload()
{
   long   acct      = AccountInfoInteger(ACCOUNT_LOGIN);
   string server    = AccountInfoString(ACCOUNT_SERVER);
   string currency  = AccountInfoString(ACCOUNT_CURRENCY);
   double balance   = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity    = AccountInfoDouble(ACCOUNT_EQUITY);
   double startBal  = GetStartBalance();
   double profitTot = balance - startBal;
   double profitPct = startBal > 0 ? (profitTot / startBal) * 100.0 : 0;

   // ── Monthly returns: last 12 months ──
   string monthly = "[";
   datetime now = TimeCurrent();
   MqlDateTime nowDt; TimeToStruct(now, nowDt);
   for(int i = 11; i >= 0; i--)
   {
      MqlDateTime mDt = nowDt;
      mDt.mon -= i;
      while(mDt.mon <= 0) { mDt.mon += 12; mDt.year -= 1; }
      mDt.day = 1; mDt.hour = 0; mDt.min = 0; mDt.sec = 0;
      datetime monthStart = StructToTime(mDt);

      MqlDateTime mEnd = mDt;
      mEnd.mon += 1;
      if(mEnd.mon > 12) { mEnd.mon -= 12; mEnd.year += 1; }
      datetime monthEnd = StructToTime(mEnd);

      double p   = SumProfit(monthStart, monthEnd);
      double pct = startBal > 0 ? (p / startBal) * 100.0 : 0;

      if(StringLen(monthly) > 1) monthly += ",";
      monthly += "{" + Q("month") + ":" + Q(MonthStr(monthStart)) +
                 "," + Q("profitPct") + ":" + F(pct) + "}";
   }
   monthly += "]";

   // ── Daily returns: last 30 days ──
   string daily = "[";
   for(int i = 29; i >= 0; i--)
   {
      datetime dayStart = (now - i * 86400);
      MqlDateTime dDt; TimeToStruct(dayStart, dDt);
      dDt.hour = 0; dDt.min = 0; dDt.sec = 0;
      dayStart = StructToTime(dDt);
      datetime dayEnd = dayStart + 86400;

      double p   = SumProfit(dayStart, dayEnd);
      double pct = startBal > 0 ? (p / startBal) * 100.0 : 0;

      if(StringLen(daily) > 1) daily += ",";
      daily += "{" + Q("date") + ":" + Q(DateStr(dayStart)) +
               "," + Q("profitPct") + ":" + F(pct) + "}";
   }
   daily += "]";

   string json = "{"
      + Q("eaId")           + ":" + Q(EAID)                  + ","
      + Q("secret")         + ":" + Q(Secret)                + ","
      + Q("account")        + ":" + Q((string)acct)          + ","
      + Q("server")         + ":" + Q(server)                + ","
      + Q("broker")         + ":" + Q(BrokerName)            + ","
      + Q("currency")       + ":" + Q(currency)              + ","
      + Q("balance")        + ":" + F(balance)               + ","
      + Q("equity")         + ":" + F(equity)                + ","
      + Q("startBalance")   + ":" + F(startBal)              + ","
      + Q("profitTotal")    + ":" + F(profitTot)             + ","
      + Q("profitTotalPct") + ":" + F(profitPct)             + ","
      + Q("monthlyReturns") + ":" + monthly                  + ","
      + Q("dailyReturns")   + ":" + daily
      + "}";
   return json;
}
//+------------------------------------------------------------------+
