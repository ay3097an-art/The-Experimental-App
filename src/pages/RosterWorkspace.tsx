import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

interface Member {
  id: number;
  name: string;
  role: string;
}

interface RosterWorkspaceProps {
  isGuest: boolean;
  onReturnHome: () => void;
  mode?: "create" | "edit";
  initialData?: any;
}

export function RosterWorkspace({
  isGuest,
  onReturnHome,
  mode = "create",
  initialData,
}: RosterWorkspaceProps) 
{
  const { user } = useAuth();

  const [institutionName, setInstitutionName] = useState(
    initialData?.institution_name || ""
  );
  const [rosterPurpose, setRosterPurpose] = useState(
    initialData?.roster_purpose || ""
  );
  
  const [groupName, setGroupName] = useState(
    initialData?.group_name || ""
  );
  
  const [placeOfDuty, setPlaceOfDuty] = useState(
    initialData?.place_of_duty || ""
  );
  
  const [rosterNumber, setRosterNumber] = useState(
    initialData?.roster_number || "1"
  );

  const [name, setName] = useState("");
  const [role, setRole] = useState("Student");
  const [members, setMembers] = useState<Member[]>(
    mode === "edit" && initialData?.final_roster_data
      ? initialData.final_roster_data.map((row: any, index: number) => ({
          id: Date.now() + index,
          name: row.name,
          role: "Member",
        }))
      : []
  );

  const [confirmedTimings, setConfirmedTimings] = useState<string[]>(
    mode === "edit" && initialData?.timing_data
      ? Object.keys(initialData.timing_data).filter(
          (key) =>
            initialData.timing_data[key]?.from &&
            initialData.timing_data[key]?.to
        )
      : []
  );
  const [selectedTimings, setSelectedTimings] = useState<string[]>(
    mode === "edit" && initialData?.timing_data
      ? Object.keys(initialData.timing_data)
      : []
  );
  const [recentlyConfirmed, setRecentlyConfirmed] = useState<string[]>([]);
  const [editModeTimings, setEditModeTimings] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(
    initialData?.selected_week || ""
  );
  const [dayOffType, setDayOffType] = useState(
    initialData?.day_off_type || ""
  );
  
  const [selectedDayOffs, setSelectedDayOffs] = useState<string[]>(
    initialData?.selected_day_offs || []
  );
  
  const [dayOffConfirmed, setDayOffConfirmed] = useState(
    mode === "edit" && initialData?.day_off_type ? true : false
  );
  const [draggedMemberId, setDraggedMemberId] = useState<number | null>(null);
  const [nightDutyDays, setNightDutyDays] = useState(
    initialData?.night_duty_days || ""
  );
  
  const [selectedNightDays, setSelectedNightDays] = useState<string[]>(
    initialData?.selected_night_days || []
  );
  
  const [selectedNightMembers, setSelectedNightMembers] = useState<string[]>(
    initialData?.selected_night_members || []
  );
  
  const [nightDutyConfirmed, setNightDutyConfirmed] = useState(
    mode === "edit" && initialData?.night_duty_days ? true : false
  );
  const [dutyType, setDutyType] = useState(
    initialData?.duty_type || "irregular"
  );
  const [rosterConfirmed, setRosterConfirmed] = useState(false);
  const [manualEditMode, setManualEditMode] = useState(
    mode === "edit"
  );
  const [manualRosterData, setManualRosterData] = useState<Record<string, string>>(
    mode === "edit" && initialData?.final_roster_data
      ? Object.fromEntries(
          initialData.final_roster_data.flatMap((row: any, rowIndex: number) =>
            Object.keys(row)
              .filter((key) => key !== "sl" && key !== "name")
              .map((day, dayIndex) => [
                `${rowIndex}-${dayIndex}`,
                row[day],
              ])
          )
        )
      : {}
  );
  const [draftManualRosterData, setDraftManualRosterData] = useState<Record<string, string>>({});

  const [timingData, setTimingData] = useState<Record<string, { from: string; to: string }>>(
    initialData?.timing_data || {
      Morning: { from: "", to: "" },
      Evening: { from: "", to: "" },
      Night: { from: "", to: "" },
    }
  );

  const shifts = ["Morning", "Evening", "Night"];

  const addMember = () => {
    if (!name.trim()) return;
    setMembers((prev) => [
      ...prev,
      { id: Date.now(), name: name.trim(), role },
    ]);
    setName("");
  };

  const flashConfirmed = (key: string) => {
    setRecentlyConfirmed((prev) => [...new Set([...prev, key])]);
    setTimeout(() => {
      setRecentlyConfirmed((prev) => prev.filter((item) => item !== key));
    }, 2000);
  };

  const toggleShift = (shift: string) => {
    if (selectedTimings.includes(shift)) {
      setSelectedTimings((prev) => prev.filter((s) => s !== shift));
      setConfirmedTimings((prev) => prev.filter((s) => s !== shift));
      return;
    }

    setSelectedTimings((prev) => [...prev, shift]);

    if (confirmedTimings.includes(shift)) {
      setEditModeTimings((prev) =>
        prev.includes(shift) ? prev : [...prev, shift]
      );
    }
  };

  const continueWithPrevious = (shift: string) => {
    setEditModeTimings((prev) => prev.filter((item) => item !== shift));
    flashConfirmed(shift);

    setEditModeTimings((prev) =>
      prev.filter((item) => item !== shift)
    );
  };

  const confirmShift = (shift: string) => {
    if (!timingData[shift].from.trim() || !timingData[shift].to.trim()) {
      alert("Please fill both From and To time before confirming.");
      return;
    }

    setConfirmedTimings((prev) =>
      prev.includes(shift) ? prev : [...prev, shift]
    );

    flashConfirmed(shift);

    setTimeout(() => {
      setEditModeTimings((prev) =>
        prev.filter((item) => item !== shift)
      );
    }, 2000);
  };

  const updateTiming = (shift: string, field: string, value: string) => {
    setTimingData((prev) => ({
      ...prev,
      [shift]: { ...prev[shift], [field]: value.toUpperCase() },
    }));
  };

  const getWeekDates = () => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    if (!selectedWeek) return days;

    const start = new Date(selectedWeek);
    return days.map((day, index) => {
      const current = new Date(start);
      current.setDate(start.getDate() + index);
      const formatted = current.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
      return `${day} (${formatted})`;
    });
  };

  const weekHeaders = getWeekDates();

  const getAutoDuty = (rowIndex: number, dayIndex: number) => {
    const dayCodeMap = ["M", "T", "W", "TH", "F", "S", "SU"];
    const currentDayCode = dayCodeMap[dayIndex];

    if (
      confirmedTimings.includes("Night") &&
      nightDutyConfirmed &&
      (selectedNightMembers.length === 0
        ? rowIndex === 0
        : selectedNightMembers.includes(String(rowIndex)))
    ) {
      if (selectedNightDays.includes(currentDayCode)) {
        return "N";
      }

      const selectedIndexes = selectedNightDays
        .map((day) => dayCodeMap.indexOf(day))
        .filter((index) => index !== -1)
        .sort((a, b) => a - b);

      if (selectedIndexes.length > 0) {
        const firstNightIndex = selectedIndexes[0];
        const lastNightIndex = selectedIndexes[selectedIndexes.length - 1];
        const nextOffIndex = (lastNightIndex + 1) % 7;

        if (dayCodeMap[nextOffIndex] === currentDayCode) {
          return "N/O";
        }

        if (lastNightIndex === 5 || lastNightIndex === 6) {
          const beforeFirstNightIndex = (firstNightIndex - 1 + 7) % 7;

          if (dayCodeMap[beforeFirstNightIndex] === currentDayCode) {
            return "W/O";
          }
        }
      }
    }

    if (dayOffConfirmed) {
      if (dayOffType === "all-sunday" && currentDayCode === "SU") {
        return "W/O";
      }

      if (
        dayOffType === "customize" &&
        selectedDayOffs.includes(currentDayCode)
      ) {
        const totalSelectedDays = selectedDayOffs.length;
        const hasSaturday = selectedDayOffs.includes("S");
        const hasSunday = selectedDayOffs.includes("SU");

        if (totalSelectedDays === 1) {
          return "W/O";
        }

        let assignedOffDay = "";

        if (hasSaturday && hasSunday) {
          assignedOffDay = rowIndex % 2 === 0 ? "SU" : selectedDayOffs.filter((d) => d !== "SU")[rowIndex % Math.max(1, selectedDayOffs.filter((d) => d !== "SU").length)];
        }
        else if (hasSaturday && !hasSunday) {
          assignedOffDay = rowIndex % 2 === 0 ? "S" : selectedDayOffs.filter((d) => d !== "S")[rowIndex % Math.max(1, selectedDayOffs.filter((d) => d !== "S").length)];
        }
        else {
          assignedOffDay = selectedDayOffs[
            (rowIndex + (rowIndex % totalSelectedDays) + members.length) % totalSelectedDays
          ];
        }

        if (currentDayCode === assignedOffDay) {
          return "W/O";
        }
      }
    }

    const duties = [];

    if (confirmedTimings.includes("Morning")) duties.push("M");
    if (confirmedTimings.includes("Evening")) duties.push("E");

    if (duties.length === 0) return "";

    if (duties.length === 1) {
      return duties[0];
    }

    const memberPatternSeed = (rowIndex + members.length) % 10;

    if (dutyType === "regular") {
      return duties[(rowIndex + dayIndex) % duties.length];
    }

    if (memberPatternSeed < 3) {
      return duties[(rowIndex + dayIndex) % duties.length];
    }

    const irregularSeed = (rowIndex * 5 + dayIndex * 3 + members.length) % 8;

    if (irregularSeed === 0 || irregularSeed === 1 || irregularSeed === 4 || irregularSeed === 6) {
      return "M";
    }

    return "E";
  };

  const orderedConfirmedTimings = shifts.filter((s) =>
    confirmedTimings.includes(s)
  );
  const getFormattedDateTime = () => {
    const now = new Date();
  
    return now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };
  const downloadRosterPDF = () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "letter",
    });
    const addWatermark = (pdf: jsPDF) => {
      if (!user) return;
    
      const pageHeight = pdf.internal.pageSize.getHeight();
      const username = user.user_metadata?.username || "User";
      const email = user.email;
    
      const createdText = `Created by & at: ${username}, ${email}, ${getFormattedDateTime()}`;
    
      pdf.setFontSize(9);
      pdf.text(createdText, 15, pageHeight - 10);
    
      if (mode === "edit") {
        const editedText = `Edited by & at: ${username}, ${email}, ${getFormattedDateTime()}`;
        pdf.text(editedText, 15, pageHeight - 5);
      }
    };
    const rosterRows = (members.length === 0
      ? [{ id: 1, name: "" }]
      : members.map((member, index) => ({
          id: index + 1,
          name: member.name,
        }))
    ).map((row, rowIndex) => ({
      sl: String(row.id),
      name: row.name,
      ...Object.fromEntries(
        weekHeaders.map((day, dayIndex) => [
          day,
          String(
            manualRosterData[`${rowIndex}-${dayIndex}`] ??
              getAutoDuty(rowIndex, dayIndex) ??
              ""
          ),
        ])
      ),
    } as Record<string, string>));

    pdf.setFontSize(16);
    pdf.text(
      institutionName || "Duty Roster",
      pdf.internal.pageSize.getWidth() / 2,
      15,
      { align: "center" }
    );

    pdf.setFontSize(11);
    pdf.text(
      `Roster For: ${rosterPurpose || "__________"}`,
      pdf.internal.pageSize.getWidth() / 2,
      23,
      { align: "center" }
    );

    pdf.text(
      `Duty at: ${placeOfDuty || "__________"}`,
      pdf.internal.pageSize.getWidth() / 2,
      30,
      { align: "center" }
    );

    pdf.text(
      `Group: ${groupName || "__________"}`,
      pdf.internal.pageSize.getWidth() / 2,
      37,
      { align: "center" }
    );

    pdf.text(
      `Timing: ${timingPreview}`,
      pdf.internal.pageSize.getWidth() / 2,
      44,
      { align: "center" }
    );

    pdf.text(
      `Roster No. ${rosterNumber.trim() ? rosterNumber : "1"}`,
      15,
      44
    );


    autoTable(pdf, {
      head: [["Sl", "Name", ...weekHeaders]],
      body: rosterRows.map((row) => [
        row.sl,
        row.name,
        ...weekHeaders.map((day) => row[day] || ""),
      ]),
      startY: 52,
      theme: "grid",
    
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: "center",
        valign: "middle",
      },
    
      headStyles: {
        fontSize: 8,
      },
    
      margin: {
        left: 8,
        right: 8,
      },
    
      didDrawPage: () => {
        addWatermark(pdf); // 🔥 THIS LINE FIXES YOUR PROBLEM
      },
    });

    pdf.save("duty-roster.pdf");
  };

  const timingPreview =
    orderedConfirmedTimings.length === 0
      ? "__________"
      : orderedConfirmedTimings
          .map(
            (s) =>
              `${s} ${timingData[s].from || "--:--"} - ${timingData[s].to || "--:--"}`
          )
          .join(", ");
          const saveRosterToDatabase = async () => {
            if (isGuest || !user) return;
          
            const firstDate = selectedWeek
              ? new Date(selectedWeek).toLocaleDateString("en-GB")
              : new Date().toLocaleDateString("en-GB");
          
            const title = `${rosterNumber || "1"}_${rosterPurpose || "Duty"}_${groupName || "Group"}_${placeOfDuty || "DutyPlace"}_${firstDate}`;
          
            console.log("USER:", user);
            console.log("USER ID:", user?.id);
          
            const finalRosterData = (members.length === 0
              ? [{ id: 1, name: "" }]
              : members.map((member, index) => ({
                  id: index + 1,
                  name: member.name,
                }))
            ).map((row, rowIndex) => ({
              sl: String(row.id),
              name: row.name,
              ...Object.fromEntries(
                weekHeaders.map((day, dayIndex) => [
                  day,
                  String(
                    manualRosterData[`${rowIndex}-${dayIndex}`] ??
                      getAutoDuty(rowIndex, dayIndex) ??
                      ""
                  ),
                ])
              ),
            }));
            let error;

if (mode === "edit" && initialData?.id) {
  const res = await supabase
    .from("rosters")
    .update({
      institution_name: institutionName,
      roster_purpose: rosterPurpose,
      group_name: groupName,
      place_of_duty: placeOfDuty,
      roster_number: rosterNumber,
      selected_week: selectedWeek,

      members: members,
      timing_data: timingData,
      manual_roster_data: manualRosterData,
      final_roster_data: finalRosterData,

      // ✅ NEW FIELDS
      duty_type: dutyType,
      day_off_type: dayOffType,
      selected_day_offs: selectedDayOffs,

      night_duty_days: nightDutyDays,
      selected_night_days: selectedNightDays,
      selected_night_members: selectedNightMembers,

      updated_at: new Date().toISOString(),
    })
    .eq("id", initialData.id);

  error = res.error;

} else {
  const res = await supabase.from("rosters").insert([
    {
      user_id: user.id,
      title: title,

      institution_name: institutionName,
      roster_purpose: rosterPurpose,
      group_name: groupName,
      place_of_duty: placeOfDuty,
      roster_number: rosterNumber,
      selected_week: selectedWeek,

      members: members,
      timing_data: timingData,
      manual_roster_data: manualRosterData,
      final_roster_data: finalRosterData,

      // ✅ NEW FIELDS
      duty_type: dutyType,
      day_off_type: dayOffType,
      selected_day_offs: selectedDayOffs,

      night_duty_days: nightDutyDays,
      selected_night_days: selectedNightDays,
      selected_night_members: selectedNightMembers,

      updated_at: new Date().toISOString(),
    },
  ]);

  error = res.error;
}
            if (error) {
              console.log("SUPABASE ERROR:", error);
              alert(error.message);
              return;
            }
          
            alert(mode === "edit" ? "Roster updated successfully!" : "Roster saved successfully!");
          };
          
          return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">
          {isGuest ? "Guest Mode" : "Duty Roster Workspace"}
        </h1>
        <Button variant="outline" onClick={onReturnHome}>
          Return Home
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-xl font-semibold text-black text-center">Roster Details</h2>
          <Input placeholder="Institution" value={institutionName} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setInstitutionName(e.target.value)} />
          <Input placeholder="Roster For" value={rosterPurpose} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setRosterPurpose(e.target.value)} />
          <Input placeholder="Place of Duty" value={placeOfDuty} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPlaceOfDuty(e.target.value)} />
          <Input placeholder="Group Name of Roster Members" value={groupName} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setGroupName(e.target.value)} />
          <Input placeholder="Roster Number (Optional)" value={rosterNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setRosterNumber(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-black text-center">Timing</h2>

          {shifts.map((shift) => (
            <div key={shift} className="border p-4 rounded-lg space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTimings.includes(shift)}
                  onChange={() => toggleShift(shift)}
                />
                {shift}
              </label>

              {selectedTimings.includes(shift) && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="From"
                    value={timingData[shift]?.from ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTiming(shift, "from", e.target.value)}
                  />
                  <Input
                    placeholder="To"
                    value={timingData[shift]?.to ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTiming(shift, "to", e.target.value)}
                  />
                <div className="flex gap-3 items-center flex-wrap">
                  {recentlyConfirmed.includes(shift) ? (
                    <p className="text-sm font-medium">Confirmed...</p>
                  ) : editModeTimings.includes(shift) ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => continueWithPrevious(shift)}
                      >
                        Continue with Previous
                      </Button>
                      <Button type="button" onClick={() => confirmShift(shift)}>
                        Update & Confirm
                      </Button>
                    </>
                  ) : !confirmedTimings.includes(shift) ? (
                    <>
                      <Button type="button" onClick={() => confirmShift(shift)}>
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => toggleShift(shift)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-xl font-semibold text-black text-center">Select Week</h2>
          <Input
            type="date"
            className="[color-scheme:light]"
            value={selectedWeek}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const d = new Date(e.target.value);
              const day = d.getDay();
              const diff = day === 0 ? -6 : 1 - day;
              d.setDate(d.getDate() + diff);
              setSelectedWeek(d.toISOString().split("T")[0]);
            }}

          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-xl text-black font-semibold">Add Member</h2>
          <Input
            placeholder="Enter name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>)=>{
              if (e.key === "Enter") {
                e.preventDefault();
                addMember();
              }
            }}
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Teacher">Teacher</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
              <SelectItem value="Worker">Worker</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={addMember}>Add to Roster</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl text-black font-semibold">Roster Planning</h2>

          <p className="text-sm text-gray-500">
            Double click a name to delete. Drag and drop to reorder.
          </p>

          <div className="border rounded-xl p-4 min-h-[80px] flex flex-wrap gap-2">
            {members.length === 0 ? (
              <p className="text-gray-400">No members added yet.</p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  draggable
                  onDragStart={() => setDraggedMemberId(member.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!draggedMemberId || draggedMemberId === member.id) return;

                    setMembers((prev) => {
                      const updated = [...prev];
                      const draggedIndex = updated.findIndex(
                        (item) => item.id === draggedMemberId
                      );
                      const targetIndex = updated.findIndex(
                        (item) => item.id === member.id
                      );

                      if (draggedIndex === -1 || targetIndex === -1) return prev;

                      const [draggedItem] = updated.splice(draggedIndex, 1);
                      updated.splice(targetIndex, 0, draggedItem);
                      return updated;
                    });

                    setDraggedMemberId(null);
                  }}
                  onDoubleClick={() =>
                    setMembers((prev) =>
                      prev.filter((item) => item.id !== member.id)
                    )
                  }
                  className="px-3 py-2 border rounded-lg bg-white"
                >
                  {member.name}
                </div>
              ))
            )}
          </div>

          {confirmedTimings.includes("Night") && (
            <div className="pt-4 space-y-4 border-t">
              <h3 className="text-lg text-black font-semibold">Night Duty Setup</h3>

              <Input
                placeholder="Number of Night Duty Days"
                value={nightDutyDays}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNightDutyConfirmed(false);
                  setNightDutyDays(e.target.value.replace(/[^0-9]/g, ""));
                }}
              />

              <div className="space-y-3">
                <label className="font-medium text-black block">
                  Give Night Duty To
                </label>

                <div className="border rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-500">No members added yet</p>
                  ) : (
                    members.map((member, index) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedNightMembers.includes(String(index))}
                          onChange={() => {
                            setNightDutyConfirmed(false);
                            const value = String(index);
                            if (selectedNightMembers.includes(value)) {
                              setSelectedNightMembers((prev) =>
                                prev.filter((item) => item !== value)
                              );
                            } else {
                              setSelectedNightMembers((prev) => [...prev, value]);
                            }
                          }}
                        />
                        {index + 1}. {member.name}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {["M", "T", "W", "TH", "F", "S", "SU"].map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNightDays.includes(day)}
                      onChange={() => {
                        setNightDutyConfirmed(false);
                        if (selectedNightDays.includes(day)) {
                          setSelectedNightDays((prev) =>
                            prev.filter((item) => item !== day)
                          );
                        } else {
                          setSelectedNightDays((prev) => [...prev, day]);
                        }
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap items-center">
                {recentlyConfirmed.includes("nightduty") ? (
                  <p className="text-sm font-medium">Confirmed...</p>
                ) : nightDutyConfirmed ? null : (
                  <>
                    <Button
                      type="button"
                      onClick={() => {
                        if (!nightDutyDays.trim()) {
                          alert("Please enter number of night duty days.");
                          return;
                        }
                        if (selectedNightDays.length === 0) {
                          alert("Please select night duty days.");
                          return;
                        }
                        setNightDutyConfirmed(true);
                        flashConfirmed("nightduty");
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNightDutyDays("");
                        setSelectedNightDays([]);
                        setNightDutyConfirmed(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 space-y-4 border-t">
            <h3 className="text-lg text-black font-semibold">Duty Type</h3>

            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <input
                  type="checkbox"
                  checked={dutyType === "regular"}
                  onChange={() => setDutyType("regular")}
                />
                Regular
              </label>

              <label className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <input
                  type="checkbox"
                  checked={dutyType === "irregular"}
                  onChange={() => setDutyType("irregular")}
                />
                Irregular
              </label>
            </div>
          </div>

          <div className="pt-4 space-y-4 border-t">
            <h3 className="text-lg text-black font-semibold">Day Off Setup</h3>

            <Select
              value={dayOffType}
              onValueChange={(value) => {
                setDayOffType(value);
                setDayOffConfirmed(false);
                if (value === "all-sunday") {
                  setSelectedDayOffs(["SU"]);
                } else {
                  setSelectedDayOffs([]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Day Off Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sunday">All Sunday</SelectItem>
                <SelectItem value="customize">Customize</SelectItem>
              </SelectContent>
            </Select>

            {dayOffType === "customize" && (
              <div className="flex flex-wrap gap-3">
                {["M", "T", "W", "TH", "F", "S", "SU"].map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDayOffs.includes(day)}
                      onChange={() => {
                        setDayOffConfirmed(false);
                        if (selectedDayOffs.includes(day)) {
                          setSelectedDayOffs((prev) =>
                            prev.filter((item) => item !== day)
                          );
                        } else {
                          setSelectedDayOffs((prev) => [...prev, day]);
                        }
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            )}

            {dayOffType && (
              <div className="flex gap-3 flex-wrap items-center">
                {recentlyConfirmed.includes("dayoff") ? (
                  <p className="text-sm font-medium">Confirmed...</p>
                ) : dayOffConfirmed ? null : (
                  <>
                    <Button
                      type="button"
                      onClick={() => {
                        setDayOffConfirmed(true);
                        flashConfirmed("dayoff");
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDayOffType("");
                        setSelectedDayOffs([]);
                        setDayOffConfirmed(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-black text-center mb-4">Preview Section</h2>
          <p className="text-center text-black font-bold">{institutionName || "Institution / Company Name"}</p>
          <p className="text-center text-black font-bold">Roster For {rosterPurpose || "__________"}</p>
          <p className="text-center text-black font-bold">Duty at {placeOfDuty || "__________"}</p>
          <p className="text-center text-black font-bold">Group: {groupName || "__________"}</p>
          <p className="text-black font-bold text-left pl-4">Roster No. {rosterNumber.trim() ? rosterNumber : "1"}</p>
          <p className="text-center text-black font-bold">Timing: {timingPreview}</p>

          <div className="flex gap-3 flex-wrap items-center mb-4">
            {recentlyConfirmed.includes("roster") ? (
              <p className="text-sm font-medium">Confirmed...</p>
            ) : manualEditMode ? (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    setManualRosterData(draftManualRosterData);
                    setManualEditMode(false);
                  }}
                >
                  Continue with this Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDraftManualRosterData(manualRosterData);
                    setManualEditMode(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : rosterConfirmed ? (
              <Button
                type="button"
                onClick={downloadRosterPDF}
              >
                Download PDF
              </Button>
            ) : (
              <>
                <Button
  type="button"
  onClick={async () => {
    setRosterConfirmed(true);
    flashConfirmed("roster");
    await saveRosterToDatabase();
  }}
>
{mode === "edit" ? "Update Roster" : "Confirm Roster"}
</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDraftManualRosterData(manualRosterData);
                    setManualEditMode(true);
                    setRosterConfirmed(false);
                  }}
                >
                  Manual Edit
                </Button>
              </>
            )}
          </div>

          <table className="w-full border mt-4 text-sm">
            <thead>
              <tr>
                <th className="border p-2">Sl</th>
                <th className="border p-2">Name</th>
                {weekHeaders.map((day) => (
                  <th key={day} className="border p-2">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td className="border p-2 text-center">1</td>
                  <td className="border p-2"></td>
                  {weekHeaders.map((d, di) => (
                    <td key={d} className="border p-2 text-center">
                      {manualEditMode ? (
                        <Input
                          value={draftManualRosterData[`0-${di}`] ?? manualRosterData[`0-${di}`] ?? getAutoDuty(0, di) ?? ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setDraftManualRosterData((prev) => ({
                              ...prev,
                              [`0-${di}`]: e.target.value.toUpperCase(),
                            }))
                          }
                          className="text-center"
                        />
                      ) : (
                        manualRosterData[`0-${di}`] ?? getAutoDuty(0, di) ?? ""
                      )}
                    </td>
                  ))}
                </tr>
              ) : (
                members.map((m, i) => (
                  <tr key={m.id}>
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2">{m.name}</td>
                    {weekHeaders.map((d, di) => (
                      <td key={d} className="border p-2 text-center">
                        {manualEditMode ? (
                          <Input
                            value={draftManualRosterData[`${i}-${di}`] ?? manualRosterData[`${i}-${di}`] ?? getAutoDuty(i, di) ?? ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setDraftManualRosterData((prev) => ({
                                ...prev,
                                [`${i}-${di}`]: e.target.value.toUpperCase(),
                              }))
                            }
                            className="text-center"
                          />
                        ) : (
                          manualRosterData[`${i}-${di}`] ?? getAutoDuty(i, di)
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
}
