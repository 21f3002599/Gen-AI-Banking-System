export const ROLES = {
    CUSTOMER: {
        id: "bb6d3348-0696-4edd-9445-03df9be95722",
        name: "customer",
        dashboard: "/dashboard"
    },
    CLERK: {
        id: "f48feab3-510e-4c0f-b782-54c34b711650",
        name: "clerk",
        dashboard: "/dashboard/clerk"
    },
    ANALYST: {
        id: "b282e4e2-61f6-428d-b3eb-575ea6b90314",
        name: "analyst",
        dashboard: "/dashboard/analyst"
    },
    CARE: {
        id: "4e4bda72-a7b9-416f-a554-ee7c8299feb5",
        name: "care",
        dashboard: "/dashboard/care"
    }
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];
