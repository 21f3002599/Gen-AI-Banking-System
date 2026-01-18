export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * Helper function to handle API responses
 */
async function fetchJSON(url: string, options: RequestInit = {}) {
    try {
        // Retrieve token from localStorage
        let token = null;
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("vault42_user");
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    token = parsedUser.token;
                } catch (e) {
                    console.error("Failed to parse user token", e);
                }
            }
        }

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${res.statusText}`);
        }

        return res.json();
    } catch (error) {
        console.warn(`API Request failed for ${url}. Falling back to mock data.`, error);

        // Return mock data based on URL
        if (url.includes("/customers/dashboard")) return MOCK_OVERVIEW;
        if (url.includes("/transactions/account")) return MOCK_TRANSACTIONS;
        if (url.includes("/chatbot/chat")) return MOCK_CHAT_RESPONSE;

        throw error;
    }
}

/**
 * 1.1 Dashboard Overview
 */
export async function getDashboardOverview(userId: string) {
    return fetchJSON(`/customers/dashboard/${userId}`);
}

/**
 * 1.2 Transaction History
 */
export async function getTransactions(accountNo: string) {
    return fetchJSON(`/transactions/account/${accountNo}`);
}

/**
 * 1.3 Monthly Spending Stats
 */
export async function getMonthlyStats() {
    return fetchJSON(`/transactions/stats/monthly`);
}

/**
 * 1.4 Spending Analysis
 */
export async function getSpendingAnalysis() {
    return fetchJSON(`/transactions/spending-analysis`);
}

/**
 * 1.7 Chatbot
 */
export async function chatWithBot(message: string, userId: string) {
    return fetchJSON(`/chatbot/chat`, {
        method: "POST",
        body: JSON.stringify({ message, user_id: userId }),
    });
}

/**
 * 1.5 Cash Deposit
 */
export async function depositCash(accountNo: string, amount: number) {
    return fetchJSON(`/transactions/deposit-cash`, {
        method: "POST",
        body: JSON.stringify({ account_no: accountNo, amount }),
    });
}

/**
 * 1.6 Customer Profile
 */
export async function getCustomerProfile() {
    return fetchJSON(`/customers/profile`);
}

/**
 * 2.1 Grievance Management
 */
export async function getGrievances(statusFilter: string = "all") {
    return fetchJSON(`/grievances/?status_filter=${statusFilter}`);
}

export async function updateGrievanceStatus(id: string, status: string) {
    return fetchJSON(`/grievances/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
    });
}

/**
 * 2.2 AI Operational Summary
 */
export async function getGrievanceAiSummary() {
    return fetchJSON(`/grievances/ai-summary`);
}

export async function getGrievanceStats() {
    return fetchJSON(`/grievances/stats`);
}

/**
 * 2.3 Customer 360 View
 */
export async function getCustomer360(userId: string) {
    return fetchJSON(`/care/customer-360/${userId}`);
}

/**
 * 3. Analyst Dashboard API
 */
export async function getAnalystStats() {
    return fetchJSON(`/analyst/dashboard-stats`);
}

export async function getAnalystAlerts() {
    return fetchJSON(`/analyst/alerts`);
}

export async function blockAccount(accountNo: string, reason: string) {
    return fetchJSON(`/analyst/block/${accountNo}`, {
        method: "POST",
        body: JSON.stringify({ reason })
    });
}

export async function unblockAccount(accountNo: string) {
    return fetchJSON(`/analyst/unblock/${accountNo}`, {
        method: "POST"
    });
}

export async function getAnalystBlockedAccounts() {
    return fetchJSON(`/analyst/blocked-accounts`);
}

export async function searchAnalystAccount(query: string) {
    return fetchJSON(`/analyst/search?query=${query}`);
}

export async function getAnalystAccountDetails(accountNo: string) {
    return fetchJSON(`/analyst/account/${accountNo}`);
}

export async function downloadDailyReport() {
    let token = null;
    if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("vault42_user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                token = parsedUser.token;
            } catch (e) {
                console.error("Failed to parse user token", e);
            }
        }
    }

    const headers: Record<string, string> = {
        "ngrok-skip-browser-warning": "true",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/reports/generate/daily-alerts`, {
        method: "POST",
        headers,
    });

    if (!res.ok) {
        throw new Error(`Failed to download report: ${res.statusText}`);
    }

    return res.blob();
}

/**
 * 4. Clerk Dashboard API
 */

// 4.1 Pending Applications
export async function getPendingApplications() {
    return fetchJSON(`/applications/?status=pending`).catch(() => [
        { application_no: "APP-001", firstname: "Alice", lastname: "Smith", application_status: "pending", created_at: "2023-10-27" },
        { application_no: "APP-002", firstname: "Bob", lastname: "Jones", application_status: "pending", created_at: "2023-10-28" },
    ]);
}

export async function approveApplication(appNo: string) {
    return fetchJSON(`/applications/${appNo}/approve`, { method: "POST" });
}

export async function rejectApplication(appNo: string, reason: string) {
    return fetchJSON(`/applications/${appNo}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason })
    });
}

// 4.3 Pending Deposits
export async function getPendingDeposits() {
    return fetchJSON(`/transactions/pending-deposits`).catch(() => [
        { transaction_id: "TXN-DEP-001", credit_account_no: "ACC123", amount: 500.00, date: "2023-10-27" },
        { transaction_id: "TXN-DEP-002", credit_account_no: "ACC456", amount: 1500.00, date: "2023-10-28" }
    ]);
}

export async function approveDeposit(txnId: string) {
    return fetchJSON(`/transactions/${txnId}/approve-deposit`, { method: "POST" });
}

export async function rejectDeposit(txnId: string) {
    return fetchJSON(`/transactions/${txnId}/reject-deposit`, { method: "POST" });
}

// 4.5 Analyst Reports
export async function getGeneratedReports() {
    return fetchJSON(`/reports/`).catch(() => [
        { report_id: "REP-001", title: "Daily Alerts - 2023-10-27", generated_at: "2023-10-27T10:00:00Z" },
        { report_id: "REP-002", title: "Daily Alerts - 2023-10-26", generated_at: "2023-10-26T10:00:00Z" }
    ]);
}

export async function downloadReport(id: string) {
    // Similar to downloadDailyReport but for a specific ID
    let token = null;
    if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("vault42_user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                token = parsedUser.token;
            } catch (e) {
                console.error("Failed to parse user token", e);
            }
        }
    }

    const headers: Record<string, string> = {
        "ngrok-skip-browser-warning": "true",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/reports/${id}/download`, {
        method: "GET",
        headers,
    });

    if (!res.ok) {
        throw new Error(`Failed to download report: ${res.statusText}`);
    }

    return res.blob();
}

