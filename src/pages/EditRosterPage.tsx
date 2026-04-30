import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent, Button, Input } from "../components/UI";

interface EditRosterPageProps {
  roster: any;
  onCancel: () => void;
}

export function EditRosterPage({ roster, onCancel }: EditRosterPageProps) {
  if (!roster) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No roster found.</p>
      </div>
    );
  }

  const [institution, setInstitution] = useState(roster.institution_name || "");
const [purpose, setPurpose] = useState(roster.roster_purpose || "");
const [group, setGroup] = useState(roster.group_name || "");
const [place, setPlace] = useState(roster.place_of_duty || "");
const [rosterNo, setRosterNo] = useState(roster.roster_number || "");

const [tableData, setTableData] = useState(roster.final_roster_data || []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <Card>
          <CardContent className="p-6 space-y-4">
            <h1 className="text-3xl font-bold text-black">
              Edit Roster
            </h1>

            <p><strong>Title:</strong> {roster.title}</p>
            <Input value={institution} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstitution(e.target.value)} />

<Input value={purpose} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPurpose(e.target.value)} />

<Input value={group} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroup(e.target.value)} />

<Input value={place} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlace(e.target.value)} />

<Input value={rosterNo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRosterNo(e.target.value)} />
          </CardContent>
        </Card>

        <Card>
  <CardContent className="p-6">
    <h2 className="text-xl font-bold text-black mb-4">Edit Roster Table</h2>

    {tableData.length === 0 ? (
      <p>No roster data found.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr>
              {Object.keys(tableData[0]).map((header) => (
                <th key={header} className="border p-2 bg-gray-100">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tableData.map((row: any, rowIndex: number) => (
              <tr key={rowIndex}>
                {Object.keys(row).map((key) => (
                  <td key={key} className="border p-2 text-center">
                    <input
                      value={row[key] || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const updated = [...tableData];
                        updated[rowIndex][key] = e.target.value.toUpperCase();
                        setTableData(updated);
                      }}
                      className="w-full text-center"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </CardContent>
</Card>

        <div className="flex gap-4">
        <Button
  className="bg-black text-white"
  onClick={async () => {
    const password = prompt("Enter your password to confirm edit:");
    if (!password) return;

    const { error } = await supabase
      .from("rosters")
      .update({
        institution_name: institution,
        roster_purpose: purpose,
        group_name: group,
        place_of_duty: place,
        roster_number: rosterNo,
        final_roster_data: tableData,
      })
      .eq("id", roster.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Roster updated successfully!");
    onCancel();
  }}
>
  Confirm Edit
</Button>

          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

      </div>
    </div>
  );
}