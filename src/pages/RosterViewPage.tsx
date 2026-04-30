import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, Button } from "../components/UI";

interface RosterViewPageProps {
  roster: any;
  onReturnDashboard: () => void;
}

export function RosterViewPage({
  roster,
  onReturnDashboard,
}: RosterViewPageProps) {
  if (!roster) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No roster found.</p>
      </div>
    );
  }

  const finalRosterData = roster.final_roster_data || [];

  const correctDayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  
  const tableHeaders =
    finalRosterData.length > 0
      ? [
          "sl",
          "name",
          ...correctDayOrder.map((day) =>
            Object.keys(finalRosterData[0]).find((key) =>
              key.startsWith(day)
            )
          ).filter(Boolean),
        ]
      : [];
      const downloadSavedRosterPDF = () => {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "letter",
        });
      
        pdf.setFontSize(16);
        pdf.text(
          roster.institution_name || "Duty Roster",
          pdf.internal.pageSize.getWidth() / 2,
          15,
          { align: "center" }
        );
      
        pdf.setFontSize(11);
        pdf.text(
          `Roster For: ${roster.roster_purpose || "__________"}`,
          pdf.internal.pageSize.getWidth() / 2,
          23,
          { align: "center" }
        );
      
        pdf.text(
          `Duty at: ${roster.place_of_duty || "__________"}`,
          pdf.internal.pageSize.getWidth() / 2,
          30,
          { align: "center" }
        );
      
        pdf.text(
          `Group: ${roster.group_name || "__________"}`,
          pdf.internal.pageSize.getWidth() / 2,
          37,
          { align: "center" }
        );
      
        pdf.text(
          `Roster No. ${roster.roster_number || "1"}`,
          15,
          44
        );
      
        autoTable(pdf, {
          head: [tableHeaders],
          body: finalRosterData.map((row: any) =>
            tableHeaders.map((header) => row[header] || "")
          ),
          startY: 52,
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2,
            halign: "center",
            valign: "middle",
          },
          margin: {
            left: 8,
            right: 8,
          },
        });
      
        pdf.save("saved-roster.pdf");
      };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <Card>
          <CardContent className="p-6 space-y-4">
            <h1 className="text-3xl font-bold text-black">
              Roster Preview
            </h1>

            <p><strong>Roster Title:</strong> {roster.title}</p>
            <p><strong>Institution:</strong> {roster.institution_name}</p>
            <p><strong>Roster Purpose:</strong> {roster.roster_purpose}</p>
            <p><strong>Place of Duty:</strong> {roster.place_of_duty}</p>
            <p><strong>Group Name:</strong> {roster.group_name}</p>
            <p><strong>Roster Number:</strong> {roster.roster_number}</p>
            <p>
              <strong>Created On:</strong>{" "}
              {new Date(roster.created_at).toLocaleDateString("en-GB")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              Final Saved Roster
            </h2>

            {finalRosterData.length === 0 ? (
              <p>No saved roster table found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead>
                    <tr>
                      {tableHeaders.map((header) => (
                        <th
                          key={header}
                          className="border p-2 bg-gray-100"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {finalRosterData.map((row: any, index: number) => (
                      <tr key={index}>
                        {tableHeaders.map((header) => (
                          <td
                            key={header}
                            className="border p-2 text-center"
                          >
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button onClick={onReturnDashboard}>
                Return to Dashboard
              </Button>

              <Button
  variant="outline"
  onClick={downloadSavedRosterPDF}
>
  Print PDF
</Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}