import { useEffect, useMemo, useState } from "react";
import { teamsApi } from "../services/teamsApi";

function extractEmailCandidates(users) {
  return Array.from(
    new Set(
      (Array.isArray(users) ? users : [])
        .map((user) => {
          if (typeof user === "string") return user.trim();
          return String(
            user?.email ||
              user?.userEmail ||
              user?.mail ||
              user?.contactEmail ||
              "",
          ).trim();
        })
        .filter(Boolean),
    ),
  );
}

export function useTeamEmailSuggestions() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const response = await teamsApi.getAdminUsers();
        const data = response?.data ?? response;
        if (!cancelled) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => extractEmailCandidates(users), [users]);
}