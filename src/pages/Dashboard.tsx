// Dashboard.tsx
// Features:
// 1. User profile with email + unique user ID
// 2. Create Roster button -> redirects to workspace
// 3. Created roster list for that user
// 4. Uses Supabase table `rosters` to store user rosters

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface DashboardProps {
  onCreateRoster: () => void;
  onLogout: () => void;
}

interface Roster {
  id: string;
  title: string;
  created_at: string;
}

export function Dashboard({ onCreateRoster, onLogout }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchRosters();
  }, [user]);
  async function fetchProfile() {
    if (!user) return;
  
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
  
    if (!error && data) {
      setProfile(data);
    }
  }
    
  async function fetchRosters() {
    if (!user) return;

    const { data, error } = await supabase
      .from("rosters")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRosters(data);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-3xl text-black font-bold mb-4">User Dashboard</h1>

          <div className="space-y-2">
          <p>
  <strong>Username:</strong>{" "}
  {user?.user_metadata?.username || "No Username"}
</p>
<p><strong>Email:</strong> {profile?.email || user?.email}</p>
<p><strong>User ID:</strong> {user?.id}</p>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={onCreateRoster}
              className="px-6 py-3 bg-black text-white rounded-xl"
            >
              Create New Roster
            </button>

            <button
  onClick={async () => {
    await signOut();
    onLogout();
  }}
  className="px-6 py-3 border rounded-xl"
>
  Logout
</button>
          </div>
        </div>

        {/* Roster List */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl text-black font-semibold mb-4">Created Rosters</h2>

          {loading ? (
            <p>Loading rosters...</p>
          ) : rosters.length === 0 ? (
            <p>No rosters created yet.</p>
          ) : (
            <div className="space-y-3">
 {rosters.map((roster, index) => (
  <div
    key={roster.id}
    className="border rounded-xl p-4 flex justify-between items-center"
  >
    <div>
      <p className="font-semibold">
        {index + 1}. {roster.title}
      </p>

      <p className="text-sm text-gray-500">
        Created: {new Date(roster.created_at).toLocaleDateString("en-GB")}
      </p>
    </div>

    <div className="flex gap-2 flex-wrap">
      <button className="px-4 py-2 text-black border rounded-lg">
        Open
      </button>

      <button className="px-4 py-2 text-black  border rounded-lg">
        Edit
      </button>

      <button className="px-4 py-2 text-black border rounded-lg">
        Download PDF
      </button>

      <button className="px-4 py-2 border rounded-lg text-red-600">
        Delete
      </button>
    </div>
  </div>
))}
</div>
)}
        </div>
      </div>
    </div>
  );
}


// ------------------------------------------
// IMPORTANT: SUPABASE TABLE REQUIRED
// ------------------------------------------

/*
Run this SQL inside Supabase SQL Editor:

create table rosters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default now()
);
*/


// ------------------------------------------
// APP.TSX CHANGE
// ------------------------------------------

/*
Replace:

if (currentPage === "dashboard") {
  return <Dashboard />;
}

With:

if (currentPage === "dashboard") {
  return (
    <Dashboard
      onCreateRoster={() => setCurrentPage("workspace")}
    />
  );
}
*/
