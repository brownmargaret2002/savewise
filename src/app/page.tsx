
"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import {
  Leaf, Wallet, ArrowRight, LayoutDashboard, Target, History,
  Settings, TrendingUp, TrendingDown, Plus, Bell, X, Download,
  UserRound, Mail, ShieldCheck, Pencil, Check, CheckCheck,
  Trash2, Info, CircleDollarSign,
} from "lucide-react";

type Screen = "welcome" | "signup" | "login" | "dashboard";
type TransactionType = "income" | "expense";

type Transaction = {
  id: number;
  title: string;
  type: TransactionType;
  amount: number;
  date: string;
};

type UserSettings = {
  displayName: string;
  email: string;
  notifications: boolean;
};

type AppNotification = {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "income" | "expense" | "savings" | "general";
};

const STORAGE_KEY = "savewise-dashboard-v1";
const SETTINGS_KEY = "savewise-settings-v1";
const NOTIFICATIONS_KEY = "savewise-notifications-v1";

const defaultSettings: UserSettings = {
  displayName: "SaveWise User",
  email: "",
  notifications: true,
};

const defaultNotifications: AppNotification[] = [
  {
    id: 1,
    title: "Welcome to SaveWise!",
    message: "Your demo wallet is ready. Start tracking your money today.",
    date: new Date().toISOString(),
    read: false,
    type: "general",
  },
  {
    id: 2,
    title: "Savings goal reminder",
    message: "Keep building your Emergency Fund one step at a time.",
    date: new Date().toISOString(),
    read: false,
    type: "savings",
  },
];

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateOffset(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getLocalDateString(date);
}

function formatTransactionDate(dateString: string) {
  if (dateString === getLocalDateString()) return "Today";
  if (dateString === getDateOffset(1)) return "Yesterday";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

function formatNotificationDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    title: "Monthly salary",
    type: "income",
    amount: 150000,
    date: getDateOffset(0),
  },
  {
    id: 2,
    title: "Food and groceries",
    type: "expense",
    amount: 25000,
    date: getDateOffset(1),
  },
  {
    id: 3,
    title: "Freelance payment",
    type: "income",
    amount: 50000,
    date: getDateOffset(2),
  },
];

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");

  return (
    <main className="welcome-page">
      {screen !== "dashboard" ? (
        <div className="welcome-container">
          <header className="brand">
            <Image
              src="/images/savewise-logo.png"
              alt="SaveWise - Small steps. Smarter savings."
              width={420}
              height={165}
              priority
              className="brand-logo"
            />
          </header>

          {screen === "welcome" ? (
            <>
              <section className="welcome-content">
                <h1>Make saving feel achievable.</h1>
                <p className="description">
                  Understand what may be left after your expenses, choose an
                  amount to save and track your progress.
                </p>

                <div className="hero-visual">
                  <div className="hero-circle">
                    <div className="wallet-illustration">
                      <Wallet size={75} strokeWidth={1.4} />
                      <Leaf className="hero-leaf" size={35} />
                    </div>
                    <span className="decorative-dot dot-one" />
                    <span className="decorative-dot dot-two" />
                  </div>
                </div>
              </section>

              <section className="welcome-actions">
                <button
                  className="primary-button"
                  onClick={() => setScreen("signup")}
                >
                  Get Started <ArrowRight size={17} />
                </button>

                <button
                  className="secondary-button"
                  onClick={() => setScreen("login")}
                >
                  I already have an account
                </button>

                <p className="demo-note">
                  Demo wallet only. No real money transfers.
                </p>
              </section>
            </>
          ) : (
            <section className="auth-content">
              <h1>
                {screen === "signup"
                  ? "Create your account"
                  : "Welcome back"}
              </h1>

              <p>
                {screen === "signup"
                  ? "Start making smarter savings decisions."
                  : "Log in to continue your savings journey."}
              </p>

              <label htmlFor="email">Email address</label>
              <input id="email" type="email" placeholder="Enter your email" />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
              />

              <button
                className="primary-button"
                onClick={() => setScreen("dashboard")}
              >
                {screen === "signup" ? "Create Account" : "Log In"}
              </button>

              <button
                className="secondary-button"
                onClick={() => setScreen("welcome")}
              >
                Back to welcome screen
              </button>

              <p className="demo-note">
                Demo only. No account is created or authenticated.
              </p>
            </section>
          )}
        </div>
      ) : (
        <Dashboard onLogout={() => setScreen("welcome")} />
      )}
    </main>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [balance, setBalance] = useState(450000);
  const [monthlyIncome, setMonthlyIncome] = useState(650000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(200000);
  const [savings, setSavings] = useState(120000);
  const [savingsGoal] = useState(200000);

  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState("");

  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionFilter, setTransactionFilter] =
    useState<"all" | TransactionType>("all");

  const [dateRange, setDateRange] =
    useState<"all" | "today" | "week" | "month">("all");

  const [modalType, setModalType] =
    useState<TransactionType | null>(null);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const [userSettings, setUserSettings] =
    useState<UserSettings>(defaultSettings);
  const [settingsMessage, setSettingsMessage] = useState("");

  // NOTIFICATIONS
  const [notifications, setNotifications] =
    useState<AppNotification[]>(defaultNotifications);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((item) => !item.read).length;

  function addNotification(
    title: string,
    message: string,
    type: AppNotification["type"]
  ) {
    if (!userSettings.notifications) return;

    const newNotification: AppNotification = {
      id: Date.now() + Math.random(),
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type,
    };

    setNotifications((previous) => [
      newNotification,
      ...previous,
    ]);
  }

  function markNotificationAsRead(id: number) {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  }

  function markAllAsRead() {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true }))
    );
  }

  function clearNotifications() {
    setNotifications([]);
  }

  // LOAD FINANCIAL DATA
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (savedData) {
        const data = JSON.parse(savedData);

        if (typeof data.balance === "number") setBalance(data.balance);
        if (typeof data.monthlyIncome === "number") {
          setMonthlyIncome(data.monthlyIncome);
        }
        if (typeof data.monthlyExpenses === "number") {
          setMonthlyExpenses(data.monthlyExpenses);
        }
        if (typeof data.savings === "number") setSavings(data.savings);

        if (
          Array.isArray(data.transactions) &&
          data.transactions.every(
            (item: Transaction) =>
              typeof item.id === "number" &&
              typeof item.title === "string" &&
              (item.type === "income" || item.type === "expense") &&
              typeof item.amount === "number" &&
              typeof item.date === "string"
          )
        ) {
          setTransactions(data.transactions);
        }
      }
    } catch (error) {
      console.error("Could not load SaveWise data:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // SAVE FINANCIAL DATA
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          balance,
          monthlyIncome,
          monthlyExpenses,
          savings,
          transactions,
        })
      );
    } catch (error) {
      console.error("Could not save SaveWise data:", error);
    }
  }, [
    isLoaded,
    balance,
    monthlyIncome,
    monthlyExpenses,
    savings,
    transactions,
  ]);

  // LOAD SETTINGS
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);

        setUserSettings({
          displayName:
            typeof parsed.displayName === "string"
              ? parsed.displayName
              : defaultSettings.displayName,
          email:
            typeof parsed.email === "string"
              ? parsed.email
              : defaultSettings.email,
          notifications:
            typeof parsed.notifications === "boolean"
              ? parsed.notifications
              : defaultSettings.notifications,
        });
      }
    } catch (error) {
      console.error("Could not load SaveWise settings:", error);
    }
  }, []);

  // LOAD NOTIFICATIONS
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);

      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);

        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch (error) {
      console.error("Could not load notifications:", error);
    } finally {
      setNotificationsLoaded(true);
    }
  }, []);

  // SAVE NOTIFICATIONS
  useEffect(() => {
    if (!notificationsLoaded) return;

    try {
      localStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error("Could not save notifications:", error);
    }
  }, [notifications, notificationsLoaded]);

  // SAVE SETTINGS
  function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userSettings.displayName.trim()) {
      alert("Please enter your display name.");
      return;
    }

    try {
      const updatedSettings = {
        ...userSettings,
        displayName: userSettings.displayName.trim(),
        email: userSettings.email.trim(),
      };

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(updatedSettings)
      );

      setUserSettings(updatedSettings);
      setSettingsMessage("Your settings have been saved successfully.");

      setTimeout(() => setSettingsMessage(""), 3500);
    } catch (error) {
      console.error("Could not save settings:", error);
      alert("Your settings could not be saved. Please try again.");
    }
  }

  const profileInitials = userSettings.displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "S";

  // DOWNLOAD TRANSACTIONS AS CSV
  function handleDownloadCSV() {
    if (transactions.length === 0) {
      alert("There are no transactions to download.");
      return;
    }

    const headers = ["Date", "Description", "Type", "Amount (NGN)"];

    const rows = transactions.map((transaction) => [
      transaction.date,
      `"${transaction.title.replace(/"/g, '""')}"`,
      transaction.type,
      transaction.amount,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "savewise-transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ADD TO SAVINGS
  function handleAddSavings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = Number(savingsAmount);

    if (!Number.isFinite(value) || value <= 0) {
      return alert("Please enter a valid amount.");
    }

    if (value > balance) {
      return alert("You do not have enough available balance.");
    }

    setBalance((previous) => previous - value);
    setSavings((previous) => previous + value);

    addNotification(
      "Savings contribution added",
      `${formatMoney(value)} has been added to your Emergency Fund.`,
      "savings"
    );

    setSavingsAmount("");
    setShowSavingsForm(false);
  }

  const savingsPercentage = Math.min(
    (savings / savingsGoal) * 100,
    100
  );

  // MONTHLY SPENDING CHART
  const monthlySpendingData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();

    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));

    const year = date.getFullYear();
    const month = date.getMonth();

    const total = transactions
      .filter((transaction) => {
        const transactionDate = new Date(
          `${transaction.date}T00:00:00`
        );

        return (
          transaction.type === "expense" &&
          transactionDate.getFullYear() === year &&
          transactionDate.getMonth() === month
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      label: date.toLocaleDateString("en-NG", { month: "short" }),
      total,
    };
  });

  const highestMonthlySpending = Math.max(
    ...monthlySpendingData.map((item) => item.total),
    1
  );

  // FILTER TRANSACTIONS
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.title
      .toLowerCase()
      .includes(transactionSearch.trim().toLowerCase());

    const matchesType =
      transactionFilter === "all" ||
      transaction.type === transactionFilter;

    const transactionDate = new Date(
      `${transaction.date}T00:00:00`
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    const dayOfWeek = (startOfWeek.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    let matchesDate = true;

    if (dateRange === "today") {
      matchesDate = transaction.date === getLocalDateString();
    } else if (dateRange === "week") {
      matchesDate = transactionDate >= startOfWeek;
    } else if (dateRange === "month") {
      matchesDate =
        transactionDate.getFullYear() === today.getFullYear() &&
        transactionDate.getMonth() === today.getMonth();
    }

    return matchesSearch && matchesType && matchesDate;
  });

  // ADD OR EDIT TRANSACTION
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (
      !description.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      alert("Please enter a description and a valid amount.");
      return;
    }

    if (editingTransaction) {
      const difference = numericAmount - editingTransaction.amount;

      if (
        editingTransaction.type === "expense" &&
        difference > balance
      ) {
        alert("You do not have enough balance for this increased expense.");
        return;
      }

      if (
        editingTransaction.type === "income" &&
        difference < 0 &&
        -difference > balance
      ) {
        alert(
          "This income cannot be reduced by that amount because the money has already been spent or moved to savings."
        );
        return;
      }

      if (editingTransaction.type === "income") {
        setBalance((previous) => previous + difference);
        setMonthlyIncome((previous) =>
          Math.max(0, previous + difference)
        );
      } else {
        setBalance((previous) => previous - difference);
        setMonthlyExpenses((previous) =>
          Math.max(0, previous + difference)
        );
      }

      setTransactions((previous) =>
        previous.map((item) =>
          item.id === editingTransaction.id
            ? {
                ...item,
                title: description.trim(),
                amount: numericAmount,
              }
            : item
        )
      );
    } else {
      if (modalType === "expense" && numericAmount > balance) {
        alert("You do not have enough balance for this expense.");
        return;
      }

      if (modalType === "income") {
        setBalance((previous) => previous + numericAmount);
        setMonthlyIncome((previous) => previous + numericAmount);

        addNotification(
          "Income received",
          `${formatMoney(numericAmount)} was added: ${description.trim()}.`,
          "income"
        );
      } else if (modalType === "expense") {
        setBalance((previous) => previous - numericAmount);
        setMonthlyExpenses((previous) => previous + numericAmount);

        addNotification(
          "Expense recorded",
          `${formatMoney(numericAmount)} was recorded for ${description.trim()}.`,
          "expense"
        );
      }

      const newTransaction: Transaction = {
        id: Date.now(),
        title: description.trim(),
        type: modalType as TransactionType,
        amount: numericAmount,
        date: getLocalDateString(),
      };

      setTransactions((previous) => [newTransaction, ...previous]);
    }

    setDescription("");
    setAmount("");
    setEditingTransaction(null);
    setModalType(null);
  }

  function openModal(type: TransactionType) {
    setEditingTransaction(null);
    setDescription("");
    setAmount("");
    setModalType(type);
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction);
    setDescription(transaction.title);
    setAmount(String(transaction.amount));
    setModalType(transaction.type);
  }

  // DELETE TRANSACTION
  function handleDeleteTransaction(transaction: Transaction) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${transaction.title}"?`
    );

    if (!confirmed) return;

    if (
      transaction.type === "income" &&
      balance < transaction.amount
    ) {
      alert(
        "This income cannot be deleted because the money has already been spent or moved to savings. Adjust those amounts first."
      );
      return;
    }

    if (transaction.type === "income") {
      setBalance((previous) => previous - transaction.amount);
      setMonthlyIncome((previous) =>
        Math.max(0, previous - transaction.amount)
      );
    } else {
      setBalance((previous) => previous + transaction.amount);
      setMonthlyExpenses((previous) =>
        Math.max(0, previous - transaction.amount)
      );
    }

    setTransactions((previous) =>
      previous.filter((item) => item.id !== transaction.id)
    );
  }

  function getNotificationIcon(type: AppNotification["type"]) {
    if (type === "income") return <TrendingUp size={19} />;
    if (type === "expense") return <TrendingDown size={19} />;
    if (type === "savings") return <Target size={19} />;
    return <Info size={19} />;
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <Image
          src="/images/savewise-logo.png"
          alt="SaveWise"
          width={420}
          height={165}
          className="sidebar-logo"
        />

        <nav className="side-nav">
          <a className="nav-item active" href="#overview">
            <LayoutDashboard size={19} /> Overview
          </a>

          <a className="nav-item" href="#profile">
            <UserRound size={19} /> My Profile
          </a>

          <a className="nav-item" href="#savings">
            <Target size={19} /> My Savings
          </a>

          <a className="nav-item" href="#transactions">
            <History size={19} /> Transactions
          </a>

          <a className="nav-item" href="#settings">
            <Settings size={19} /> Settings
          </a>
        </nav>

        <button className="logout-button" onClick={onLogout}>
          Log Out
        </button>
      </aside>

      <section className="dashboard-main" id="overview">
        <header
          className="dashboard-header"
          style={{ position: "relative" }}
        >
          <div>
            <p className="welcome-small">YOUR FINANCIAL OVERVIEW</p>

            <h1>Good day, {userSettings.displayName}! 👋</h1>

            <p className="dashboard-subtitle">
              Here's how your money is looking today.
            </p>
          </div>

          {/* INTERACTIVE NOTIFICATION BELL */}
          <button
            className="notification-button"
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={showNotifications}
            title="Open notifications"
            onClick={() => setShowNotifications((previous) => !previous)}
            style={{ position: "relative", flexShrink: 0 }}
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  minWidth: "19px",
                  height: "19px",
                  padding: "0 4px",
                  borderRadius: "20px",
                  background: "#a45d42",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid white",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION PANEL */}
          {showNotifications && (
            <div
              role="dialog"
              aria-label="Notifications panel"
              style={{
                position: "absolute",
                top: "65px",
                right: 0,
                width: "min(370px, calc(100vw - 40px))",
                maxHeight: "min(470px, 70vh)",
                overflowY: "auto",
                background: "white",
                border: "1px solid #e5ece3",
                borderRadius: "16px",
                boxShadow: "0 15px 45px rgba(25, 61, 43, 0.16)",
                zIndex: 100,
                padding: "17px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: "#193d2b",
                      fontSize: "17px",
                    }}
                  >
                    Notifications
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#89958a",
                      fontSize: "12px",
                    }}
                  >
                    {unreadCount === 0
                      ? "You're all caught up"
                      : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setShowNotifications(false)}
                  style={{
                    border: "none",
                    background: "#f3f7f1",
                    color: "#52645a",
                    borderRadius: "8px",
                    padding: "7px",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {notifications.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      border: "none",
                      background: "transparent",
                      color: unreadCount === 0 ? "#aab4aa" : "#315b3d",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: unreadCount === 0 ? "default" : "pointer",
                    }}
                  >
                    <CheckCheck size={14} />
                    Mark all as read
                  </button>

                  <button
                    type="button"
                    onClick={clearNotifications}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      border: "none",
                      background: "transparent",
                      color: "#a45d42",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                    Clear all
                  </button>
                </div>
              )}

              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "30px 12px",
                    textAlign: "center",
                    color: "#89958a",
                  }}
                >
                  <Bell size={30} style={{ margin: "0 auto 10px" }} />
                  <strong
                    style={{
                      display: "block",
                      color: "#34483b",
                      fontSize: "14px",
                    }}
                  >
                    No notifications
                  </strong>
                  <p style={{ fontSize: "12px", margin: "6px 0 0" }}>
                    You're all caught up. New activity will appear here.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "9px",
                  }}
                >
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: "11px",
                        padding: "12px",
                        borderRadius: "11px",
                        background: item.read ? "#ffffff" : "#f1f7ee",
                        border: "1px solid #e8eee5",
                      }}
                    >
                      <div
                        style={{
                          width: "35px",
                          height: "35px",
                          minWidth: "35px",
                          borderRadius: "10px",
                          background:
                            item.type === "expense"
                              ? "#fff0e9"
                              : "#e8f2e4",
                          color:
                            item.type === "expense"
                              ? "#a45d42"
                              : "#315b3d",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getNotificationIcon(item.type)}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <strong
                            style={{
                              color: "#34483b",
                              fontSize: "12px",
                              lineHeight: 1.4,
                            }}
                          >
                            {item.title}
                          </strong>

                          {!item.read && (
                            <span
                              aria-label="Unread"
                              style={{
                                width: "7px",
                                height: "7px",
                                minWidth: "7px",
                                borderRadius: "50%",
                                background: "#6f9b62",
                              }}
                            />
                          )}
                        </div>

                        <p
                          style={{
                            margin: "5px 0",
                            color: "#68796c",
                            fontSize: "11px",
                            lineHeight: 1.5,
                          }}
                        >
                          {item.message}
                        </p>

                        <span
                          style={{
                            color: "#89958a",
                            fontSize: "10px",
                          }}
                        >
                          {formatNotificationDate(item.date)}
                        </span>

                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationAsRead(item.id)}
                            style={{
                              display: "block",
                              marginTop: "7px",
                              border: "none",
                              background: "transparent",
                              padding: 0,
                              color: "#315b3d",
                              fontSize: "10px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Check size={12} style={{ display: "inline" }} />{" "}
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!userSettings.notifications && (
                <p
                  style={{
                    margin: "13px 0 0",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#fff8f1",
                    color: "#95613e",
                    fontSize: "11px",
                    lineHeight: 1.5,
                  }}
                >
                  Notifications are turned off in Settings. New activity
                  alerts are currently paused.
                </p>
              )}
            </div>
          )}
        </header>

        {/* BALANCE */}
        <section className="balance-card">
          <div>
            <p>Total available balance</p>
            <h2>{formatMoney(balance)}</h2>
            <span className="balance-note">
              Your demo wallet balance
            </span>
          </div>

          <div className="balance-icon">
            <Wallet size={30} />
          </div>
        </section>

        {/* ADD INCOME AND EXPENSE */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="save-button"
            style={{ flex: 1, marginTop: 0 }}
            onClick={() => openModal("income")}
          >
            <Plus size={18} /> Add Income
          </button>

          <button
            className="save-button"
            style={{
              flex: 1,
              marginTop: 0,
              background: "#a45d42",
            }}
            onClick={() => openModal("expense")}
          >
            <Plus size={18} /> Add Expense
          </button>
        </div>

        {/* FINANCIAL STATISTICS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-heading">
              <span>Monthly income</span>
              <TrendingUp size={20} />
            </div>
            <h3>{formatMoney(monthlyIncome)}</h3>
            <p>Money coming in</p>
          </div>

          <div className="stat-card">
            <div className="stat-heading">
              <span>Monthly expenses</span>
              <TrendingDown size={20} />
            </div>
            <h3>{formatMoney(monthlyExpenses)}</h3>
            <p>Money going out</p>
          </div>
        </section>

        {/* MONTHLY SPENDING CHART */}
        <section
          className="transactions-card"
          style={{ marginTop: "22px" }}
        >
          <div className="section-heading">
            <div>
              <p className="welcome-small">SPENDING OVER TIME</p>
              <h2>Monthly spending</h2>
            </div>
            <TrendingDown size={24} color="#a45d42" />
          </div>

          <p
            style={{
              color: "#89958a",
              fontSize: "13px",
              margin: "8px 0 22px",
            }}
          >
            Your recorded expenses over the last six months
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
              gap: "12px",
              alignItems: "end",
              minHeight: "190px",
              padding: "10px 4px 0",
            }}
          >
            {monthlySpendingData.map((item, index) => {
              const barHeight =
                item.total === 0
                  ? 5
                  : Math.max(
                      12,
                      (item.total / highestMonthlySpending) * 135
                    );

              return (
                <div
                  key={`${item.label}-${index}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "9px",
                    minWidth: 0,
                    height: "180px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#52645a",
                      textAlign: "center",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.total > 0
                      ? formatMoney(item.total).replace(".00", "")
                      : "₦0"}
                  </span>

                  <div
                    style={{
                      width: "min(100%, 34px)",
                      height: `${barHeight}px`,
                      minHeight: "5px",
                      borderRadius: "7px 7px 2px 2px",
                      background:
                        item.total > 0 ? "#6f9b62" : "#e5ece3",
                      transition: "height 0.25s ease",
                    }}
                  />

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#52645a",
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "14px",
              borderTop: "1px solid #edf1eb",
              paddingTop: "13px",
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#89958a", fontSize: "12px" }}>
              Total shown
            </span>
            <strong style={{ color: "#315b3d", fontSize: "14px" }}>
              {formatMoney(
                monthlySpendingData.reduce(
                  (sum, item) => sum + item.total,
                  0
                )
              )}
            </strong>
          </div>
        </section>

        {/* PROFILE */}
        <section
          className="transactions-card"
          id="profile"
          style={{ marginTop: "22px" }}
        >
          <div className="section-heading">
            <div>
              <p className="welcome-small">YOUR ACCOUNT</p>
              <h2>My Profile</h2>
            </div>
            <UserRound size={25} color="#315b3d" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
              padding: "22px 0",
              borderBottom: "1px solid #edf1eb",
            }}
          >
            <div
              style={{
                width: "76px",
                height: "76px",
                minWidth: "76px",
                borderRadius: "50%",
                background: "#315b3d",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "25px",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              {profileInitials}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  color: "#193d2b",
                  fontSize: "20px",
                  margin: "0 0 7px",
                  overflowWrap: "anywhere",
                }}
              >
                {userSettings.displayName}
              </h3>

              <p
                style={{
                  color: "#89958a",
                  fontSize: "13px",
                  margin: 0,
                  overflowWrap: "anywhere",
                }}
              >
                {userSettings.email || "No email address added"}
              </p>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  background: "#edf6e9",
                  color: "#315b3d",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                DEMO ACCOUNT
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                padding: "16px",
                borderRadius: "11px",
                background: "#f6f9f4",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <Mail size={21} color="#315b3d" />
              <div>
                <p style={{ margin: 0, color: "#89958a", fontSize: "11px" }}>
                  EMAIL ADDRESS
                </p>
                <strong
                  style={{
                    display: "block",
                    color: "#34483b",
                    fontSize: "13px",
                    marginTop: "5px",
                    overflowWrap: "anywhere",
                  }}
                >
                  {userSettings.email || "Not provided"}
                </strong>
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "11px",
                background: "#f6f9f4",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <ShieldCheck size={21} color="#315b3d" />
              <div>
                <p style={{ margin: 0, color: "#89958a", fontSize: "11px" }}>
                  ACCOUNT TYPE
                </p>
                <strong
                  style={{
                    display: "block",
                    color: "#34483b",
                    fontSize: "13px",
                    marginTop: "5px",
                  }}
                >
                  Demo Account
                </strong>
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "11px",
                background: "#f6f9f4",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <Wallet size={21} color="#315b3d" />
              <div>
                <p style={{ margin: 0, color: "#89958a", fontSize: "11px" }}>
                  PREFERRED CURRENCY
                </p>
                <strong
                  style={{
                    display: "block",
                    color: "#34483b",
                    fontSize: "13px",
                    marginTop: "5px",
                  }}
                >
                  Nigerian Naira (₦)
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              document.getElementById("settings")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              marginTop: "22px",
              padding: "12px 18px",
              border: "none",
              borderRadius: "10px",
              background: "#315b3d",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Pencil size={16} />
            Edit Profile
          </button>

          <p
            style={{
              color: "#89958a",
              fontSize: "11px",
              lineHeight: 1.6,
              marginTop: "16px",
            }}
          >
            Your profile information is stored locally in this browser.
            This demo does not use a real account or online authentication.
          </p>
        </section>

        {/* SAVINGS GOAL */}
        <section className="savings-card" id="savings">
          <div className="section-heading">
            <div>
              <p className="welcome-small">YOUR SAVINGS GOAL</p>
              <h2>Emergency Fund</h2>
            </div>
            <Target size={25} />
          </div>

          <div className="savings-amount">
            <strong>{formatMoney(savings)}</strong>
            <span>of {formatMoney(savingsGoal)}</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${savingsPercentage}%` }}
            />
          </div>

          <p className="progress-caption">
            {Math.round(savingsPercentage)}% of your goal completed
          </p>

          <button
            className="save-button"
            onClick={() => {
              setSavingsAmount("");
              setShowSavingsForm(true);
            }}
          >
            <Plus size={18} /> Add to savings
          </button>
        </section>

        {/* TRANSACTIONS */}
        <section className="transactions-card" id="transactions">
          <div
            className="section-heading"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <h2>Recent transactions</h2>

            <button
              type="button"
              onClick={handleDownloadCSV}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 14px",
                border: "1px solid #dce6dc",
                borderRadius: "10px",
                background: "#315b3d",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Download size={16} />
              Download CSV
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              margin: "18px 0",
            }}
          >
            <input
              type="search"
              value={transactionSearch}
              onChange={(event) =>
                setTransactionSearch(event.target.value)
              }
              placeholder="Search by description..."
              aria-label="Search transactions by description"
              style={{
                flex: "1 1 220px",
                minWidth: 0,
                padding: "12px 14px",
                border: "1px solid #dce6dc",
                borderRadius: "10px",
                outlineColor: "#8dbb57",
                color: "#34483b",
              }}
            />

            <select
              value={transactionFilter}
              onChange={(event) =>
                setTransactionFilter(
                  event.target.value as "all" | TransactionType
                )
              }
              aria-label="Filter transactions by type"
              style={{
                flex: "0 1 160px",
                padding: "12px 14px",
                border: "1px solid #dce6dc",
                borderRadius: "10px",
                background: "white",
                color: "#34483b",
                cursor: "pointer",
              }}
            >
              <option value="all">All transactions</option>
              <option value="income">Income only</option>
              <option value="expense">Expenses only</option>
            </select>

            <select
              value={dateRange}
              onChange={(event) =>
                setDateRange(
                  event.target.value as
                    | "all"
                    | "today"
                    | "week"
                    | "month"
                )
              }
              aria-label="Filter transactions by date"
              style={{
                flex: "0 1 170px",
                padding: "12px 14px",
                border: "1px solid #dce6dc",
                borderRadius: "10px",
                background: "white",
                color: "#34483b",
                cursor: "pointer",
              }}
            >
              <option value="all">Any date</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>

          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div className="transaction-row" key={transaction.id}>
                <div
                  className={`transaction-icon ${
                    transaction.type === "income"
                      ? "income-icon"
                      : "expense-icon"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <TrendingUp size={19} />
                  ) : (
                    <TrendingDown size={19} />
                  )}
                </div>

                <div className="transaction-details">
                  <strong>{transaction.title}</strong>
                  <span>
                    {transaction.type === "income" ? "Income" : "Expense"} ·{" "}
                    {formatTransactionDate(transaction.date)}
                  </span>
                </div>

                <strong
                  className={
                    transaction.type === "income"
                      ? "income-amount"
                      : "expense-amount"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatMoney(transaction.amount)}
                </strong>

                <button
                  type="button"
                  onClick={() => openEditModal(transaction)}
                  aria-label={`Edit ${transaction.title}`}
                  style={{
                    marginLeft: "14px",
                    padding: "8px 10px",
                    border: "1px solid #dce6dc",
                    borderRadius: "8px",
                    background: "#f5f8f3",
                    color: "#315b3d",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTransaction(transaction)}
                  aria-label={`Delete ${transaction.title}`}
                  style={{
                    marginLeft: "14px",
                    padding: "8px 10px",
                    border: "1px solid #ead5ce",
                    borderRadius: "8px",
                    background: "#fff8f5",
                    color: "#a45d42",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p
              style={{
                padding: "24px 12px",
                textAlign: "center",
                color: "#89958a",
                background: "#f8faf7",
                borderRadius: "10px",
              }}
            >
              No transactions found. Try a different search or filter.
            </p>
          )}
        </section>

        {/* SETTINGS */}
        <section
          className="transactions-card"
          id="settings"
          style={{ marginTop: "22px" }}
        >
          <div className="section-heading">
            <div>
              <p className="welcome-small">ACCOUNT PREFERENCES</p>
              <h2>Settings</h2>
            </div>
            <Settings size={25} color="#315b3d" />
          </div>

          <p
            style={{
              color: "#89958a",
              fontSize: "13px",
              margin: "8px 0 22px",
            }}
          >
            Manage your profile and notification preferences.
          </p>

          <form
            onSubmit={handleSaveSettings}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div>
              <label
                htmlFor="display-name"
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#34483b",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Display name
              </label>

              <input
                id="display-name"
                type="text"
                value={userSettings.displayName}
                onChange={(event) => {
                  setUserSettings((previous) => ({
                    ...previous,
                    displayName: event.target.value,
                  }));
                }}
                placeholder="Enter your name"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #dce6dc",
                  borderRadius: "10px",
                  color: "#34483b",
                  outlineColor: "#8dbb57",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="settings-email"
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#34483b",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Email address
              </label>

              <input
                id="settings-email"
                type="email"
                value={userSettings.email}
                onChange={(event) => {
                  setUserSettings((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }));
                }}
                placeholder="Enter your email address"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border: "1px solid #dce6dc",
                  borderRadius: "10px",
                  color: "#34483b",
                  outlineColor: "#8dbb57",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                padding: "16px",
                background: "#f6f9f4",
                border: "1px solid #e5ece3",
                borderRadius: "10px",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    color: "#34483b",
                    fontSize: "14px",
                  }}
                >
                  Notifications
                </strong>

                <span
                  style={{
                    display: "block",
                    color: "#89958a",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Enable or disable notification preferences
                </span>
              </div>

              <label
                htmlFor="notification-toggle"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <input
                  id="notification-toggle"
                  type="checkbox"
                  checked={userSettings.notifications}
                  onChange={(event) => {
                    setUserSettings((previous) => ({
                      ...previous,
                      notifications: event.target.checked,
                    }));
                  }}
                  style={{
                    width: "19px",
                    height: "19px",
                    accentColor: "#315b3d",
                    cursor: "pointer",
                  }}
                />

                <span
                  style={{
                    color: "#315b3d",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {userSettings.notifications ? "On" : "Off"}
                </span>
              </label>
            </div>

            <div
              style={{
                padding: "13px",
                background: "#f6f9f4",
                borderRadius: "10px",
                color: "#52645a",
                fontSize: "13px",
              }}
            >
              <strong style={{ color: "#34483b" }}>Currency:</strong>{" "}
              Nigerian Naira (₦)
            </div>

            <button
              type="submit"
              className="primary-button"
              style={{ marginTop: "5px" }}
            >
              Save Settings
            </button>

            {settingsMessage && (
              <p
                role="status"
                style={{
                  color: "#315b3d",
                  background: "#edf6e9",
                  borderRadius: "9px",
                  padding: "12px",
                  fontSize: "13px",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {settingsMessage}
              </p>
            )}
          </form>

          <p
            style={{
              color: "#89958a",
              fontSize: "11px",
              marginTop: "18px",
              lineHeight: 1.6,
            }}
          >
            Settings are saved in this browser on this device. This demo does
            not send emails or deliver real notifications.
          </p>
        </section>

        <p className="dashboard-disclaimer">
          SaveWise demo dashboard · Sample figures, not real financial data.
        </p>
      </section>

      {/* ADD OR EDIT TRANSACTION MODAL */}
      {modalType && (
        <div
          onClick={() => {
            setModalType(null);
            setEditingTransaction(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16, 40, 27, 0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "430px",
              background: "white",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ color: "#103b2a", fontSize: "22px" }}>
                {editingTransaction
                  ? "Edit Transaction"
                  : modalType === "income"
                    ? "Add Income"
                    : "Add Expense"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setModalType(null);
                  setEditingTransaction(null);
                }}
                aria-label="Close form"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#52645a",
                  cursor: "pointer",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <label
              htmlFor="transaction-description"
              style={{ fontWeight: 600, color: "#34483b" }}
            >
              Description
            </label>

            <input
              id="transaction-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={
                modalType === "income" ? "e.g. Salary" : "e.g. Groceries"
              }
              required
              style={{
                padding: "13px",
                border: "1px solid #dce6dc",
                borderRadius: "10px",
                outlineColor: "#8dbb57",
              }}
            />

            <label
              htmlFor="transaction-amount"
              style={{ fontWeight: 600, color: "#34483b" }}
            >
              Amount (₦)
            </label>

            <input
              id="transaction-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              required
              style={{
                padding: "13px",
                border: "1px solid #dce6dc",
                borderRadius: "10px",
                outlineColor: "#8dbb57",
              }}
            />

            <button type="submit" className="primary-button">
              {editingTransaction
                ? "Save Changes"
                : `Save ${modalType === "income" ? "Income" : "Expense"}`}
            </button>

            <p
              style={{
                color: "#89958a",
                fontSize: "11px",
                textAlign: "center",
              }}
            >
              Demo only. No real money will be transferred.
            </p>
          </form>
        </div>
      )}

      {/* ADD TO SAVINGS MODAL */}
      {showSavingsForm && (
        <div
          onClick={() => setShowSavingsForm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16, 40, 27, 0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={handleAddSavings}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "430px",
              background: "white",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ color: "#103b2a", fontSize: "22px" }}>
                Add to Emergency Fund
              </h2>

              <button
                type="button"
                onClick={() => setShowSavingsForm(false)}
                aria-label="Close savings form"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#52645a",
                  cursor: "pointer",
                }}
              >
                <X size={22} />
              </button>
            </div>

            <label
              htmlFor="savings-amount"
              style={{ fontWeight: 600, color: "#34483b" }}
            >
              Amount (₦)
            </label>

            <input
              id="savings-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={savingsAmount}
              onChange={(event) => setSavingsAmount(event.target.value)}
              placeholder="Enter amount"
              required
              style={{
                padding: "13px",
                border: "1px solid #dce6dc",
                borderRadius: "10px",
                outlineColor: "#8dbb57",
              }}
            />

            <p style={{ color: "#89958a", fontSize: "12px" }}>
              Available balance: {formatMoney(balance)}
            </p>

            <button type="submit" className="primary-button">
              Save to Goal
            </button>

            <p
              style={{
                color: "#89958a",
                fontSize: "11px",
                textAlign: "center",
              }}
            >
              Demo only. No real money will be transferred.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
