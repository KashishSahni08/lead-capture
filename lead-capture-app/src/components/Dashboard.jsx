import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Dashboard.css";

// ---- CONFIG: replace these two values ----
const SHEET_ID = "1GI9_bvN8d1h-_RYslddfyggtO3B5wGFSV3Sapfd3TQ4";
const API_KEY = "AIzaSyBLNmuTBOWWdmMvitOadnoFD8Stx2Nmw7I";
const RANGE = "Sheet1!A2:D1000"; // skips header row
// -------------------------------------------

const SOURCE_COLORS = {
  Instagram: "#E8A33D",
  Google: "#1F4E3D",
  Referral: "#7C9885",
};

function parseSheetRows(rows) {
  // Each row: [timestamp, name, email, source]
  return rows
    .filter((row) => row.length >= 4)
    .map((row) => ({
      timestamp: row[0],
      name: row[1],
      email: row[2],
      source: row[3],
    }));
}

function buildSignupsByDay(leads) {
  const counts = {};
  leads.forEach((lead) => {
    // Extract just the date portion, works whether timestamp is
    // ISO ("2026-07-17T21:07:21.945Z") or formatted ("18 Jul 2026, 2:41 AM")
    const dateKey = lead.timestamp.slice(0, 10);
    counts[dateKey] = (counts[dateKey] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([date, count]) => ({ date, signups: count }));
}

function buildSignupsBySource(leads) {
  const counts = {};
  leads.forEach((lead) => {
    counts[lead.source] = (counts[lead.source] || 0) + 1;
  });
  return Object.entries(counts).map(([source, count]) => ({
    source,
    count,
  }));
}

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    async function loadData() {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Sheets API request failed");

        const data = await res.json();
        const parsed = parseSheetRows(data.values || []);
        setLeads(parsed);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    loadData();
  }, []);

  if (status === "loading") {
    return <div className="dash-state">Loading dashboard…</div>;
  }

  if (status === "error") {
    return (
      <div className="dash-state dash-state--error">
        Couldn't load lead data. Check your Sheet ID, API key, and sharing
        settings.
      </div>
    );
  }

  const byDay = buildSignupsByDay(leads);
  const bySource = buildSignupsBySource(leads);
  const totalLeads = leads.length;

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>Lead Capture Dashboard</h1>
        <p className="dash-sub">{totalLeads} total signups logged</p>
      </header>

      <div className="dash-grid">
        <section className="dash-card">
          <h2>Signups over time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e6e2" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="signups"
                stroke="#1F4E3D"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="dash-card">
          <h2>Signups by source</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bySource}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e6e2" />
              <XAxis dataKey="source" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {bySource.map((entry) => (
                  <Cell
                    key={entry.source}
                    fill={SOURCE_COLORS[entry.source] || "#1F4E3D"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="dash-card dash-card--wide">
          <h2>Source breakdown</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={bySource}
                dataKey="count"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => `${entry.source}: ${entry.count}`}
              >
                {bySource.map((entry) => (
                  <Cell
                    key={entry.source}
                    fill={SOURCE_COLORS[entry.source] || "#1F4E3D"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}