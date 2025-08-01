import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import BreadcrumbNav from "../../components/BreadcrumbNav/BreadcrumbNav";
import baseUrl from "../../services/base-url";
import { Spin } from "antd";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const username = payload.sub;
  const userId = payload.user_id;
  const role = payload.role;

  useEffect(() => {
    const url =
      role === "user"
        ? `${baseUrl}/transactions?user_id=${encodeURIComponent(
            userId
          )}&size=100`
        : `${baseUrl}/transactions?size=100`;
    axios
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setTxns(res.data.transactions || []))
      .catch((err) => {
        console.error("Failed to load transactions:", err);
        setTxns([]);
      })
      .finally(() => setLoading(false));
  }, [role, userId, token]);

  const fmtMoney = (n) => {
    if (typeof n !== "number" || isNaN(n)) return "0";
    try {
      return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
    } catch {
      return n.toLocaleString();
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
      >
        {" "}
        <Spin size="large" />{" "}
      </div>
    );
  }

  // — USER view —
  if (role === "user") {
    const accepted = txns.filter((t) => t.status === "accepted").length;
    const rejected = txns.filter((t) => t.status === "rejected").length;
    const commented = txns.filter((t) => t.status === "commented").length;
    const totalSavings = txns
      .filter((t) => t.status === "accepted")
      .reduce((sum, t) => sum + (t.price_difference || 0), 0);

    return (
      <>
        <div style={{ marginTop: "10px" }}>
          <BreadcrumbNav />
        </div>
        <div className="profile-container">
          <h1 className="profile-title">MY PROFILE</h1>
          <div className="profile-stats">
            <div>
              <strong>Username:</strong> {username}
            </div>
            <div>
              <strong>Accepted:</strong> {accepted}
            </div>
            <div>
              <strong>Rejected:</strong> {rejected}
            </div>
            <div>
              <strong>Comments:</strong> {commented}
            </div>
            <div>
              <strong>Total Savings:</strong> ${fmtMoney(totalSavings)}
            </div>
          </div>
          <h2 className="section-title">History</h2>
          <div className="txn-table-container">
            <table className="txn-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Original → Replacement</th>
                  <th>Status</th>
                  <th>Savings</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((d, i) => (
                  <tr key={i}>
                    <td>{new Date(d.updated_at).toLocaleString()}</td>
                    <td>
                      {d.original_part_name} → {d.replacement_part_name}
                    </td>
                    <td
                      className={
                        d.status === "accepted"
                          ? "accepted-cell"
                          : d.status === "rejected"
                          ? "rejected-cell"
                          : ""
                      }
                    >
                      {d.status}
                    </td>
                    <td>
                      {d.status === "accepted"
                        ? `$${fmtMoney(d.price_difference)}`
                        : "-"}
                    </td>
                    <td className="comment-cell">{d.comment || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // — MANAGER view —
  if (role === "manager") {
    const recent = txns.slice(0, 10);
    const byUser = txns.reduce((acc, t) => {
      const u = t.user_id || "unknown";
      if (!acc[u]) {
        acc[u] = {
          user: u,
          accepted: 0,
          rejected: 0,
          commented: 0,
          savings: 0,
        };
      }
      if (t.status === "accepted") {
        acc[u].accepted++;
        acc[u].savings += t.price_difference || 0;
      } else if (t.status === "rejected") {
        acc[u].rejected++;
        acc[u].savings -= t.price_difference || 0;
      } else {
        acc[u].commented++;
      }
      return acc;
    }, {});
    const users = Object.values(byUser);

    return (
      <div className="profile-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="profile-title">Manager Dashboard</h1>

        <h2 className="section-title">Recent Transactions</h2>
        <div className="txn-table-container">
          <table className="txn-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Original → Replacement</th>
                <th>Status</th>
                <th>Savings</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((d, i) => (
                <tr key={i}>
                  <td>{new Date(d.updated_at).toLocaleString()}</td>
                  <td>{d.user_id}</td>
                  <td>
                    {d.original_part_name} → {d.replacement_part_name}
                  </td>
                  <td
                    className={
                      d.status === "accepted"
                        ? "accepted-cell"
                        : d.status === "rejected"
                        ? "rejected-cell"
                        : ""
                    }
                  >
                    {d.status}
                  </td>
                  <td>
                    {d.status === "accepted"
                      ? `$${fmtMoney(d.price_difference)}`
                      : "-"}
                  </td>
                  <td className="comment-cell">{d.comment || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="section-title">User Summary</h2>
        <div className="manager-table-container">
          <table className="manager-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Accepted</th>
                <th>Rejected</th>
                <th>Comments</th>
                <th>Savings</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>{u.user}</td>
                  <td className="accepted-cell">{u.accepted}</td>
                  <td className="rejected-cell">{u.rejected}</td>
                  <td>{u.commented}</td>
                  <td className="accepted-cell">${fmtMoney(u.savings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1 className="profile-title">Admin Panel</h1>
      <button className="profile-button" onClick={() => navigate("/users")}>
        Manage Users
      </button>
    </div>
  );
}
