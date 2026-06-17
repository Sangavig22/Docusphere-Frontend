import { useState, useEffect } from "react";
import { teamsApi } from "../services/teamsApi";

export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        const response = await teamsApi.getMyTeams();
        const teamsData = response?.data ?? response;

        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError(err.message);
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const createTeam = async (teamName, members = []) => {
    try {
      const teamData = {
        name: teamName,
        description: "",
        members,
      };

      const response = await teamsApi.createTeam(teamData);
      const newTeam = response?.data ?? response;

      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      console.error("Error creating team:", err);
      setError(err.message);
      throw err;
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      await teamsApi.deleteTeam(teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
    } catch (err) {
      console.error("Error deleting team:", err);
      setError(err.message);
      throw err;
    }
  };

  return {
    teams,
    isLoading,
    error,
    createTeam,
    deleteTeam,
  };
}
