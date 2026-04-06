import { AnimatePresence, motion as Motion } from "framer-motion";
import { ChevronDown, ChevronUp, UploadCloud } from "lucide-react";
import { useState } from "react";
import { insights } from "../data/mockData";
import { buttonHoverProps, fadeInProps, slideUpProps, subtle } from "../lib/motionPresets";
import { UploadProcessor } from '../components/UploadProcessor';
const card =
  "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/50 transition-shadow dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-lg dark:shadow-black/30";
const innerMuted =
  "rounded-xl bg-slate-50 dark:bg-slate-800/80";
const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

export default function DashboardPage() {
  const [fileName, setFileName] = useState("");
  const [uploadStep, setUploadStep] = useState(-1);
  const [meetingLink, setMeetingLink] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [detectedMeetings, setDetectedMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState("Me");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedActionItems, setUploadedActionItems] = useState([]); // 👈 NEW: Store uploaded action items
  const [taskStatuses, setTaskStatuses] = useState(
    Object.fromEntries(insights.actions.map((item) => [item.id, item.status])),
  );

  // Use uploaded action items if available, otherwise use mock data
  const currentActionItems = uploadedActionItems.length > 0 ? uploadedActionItems : insights.actions;
  
  const activeMeetingId = selectedMeetingId || detectedMeetings[0]?.meetingId || "";
  const meetingTasks = currentActionItems.filter((item) => {
    // If using uploaded items, filter by meeting_id; if mock data, filter by meetingId
    return item.meeting_id === activeMeetingId || item.meetingId === activeMeetingId;
  });
  // Filter out "Unassigned" and "Me" from participants, only show actual assigned people
  const participants = Array.from(new Set(["Me", ...meetingTasks
    .map((item) => item.assigned_to || item.assignee)
    .filter((name) => name && name !== "Unassigned")
  ]));
  const visibleTasks = meetingTasks.filter((item) => (item.assigned_to || item.assignee) === selectedParticipant);
  const groupedTasks = visibleTasks.reduce((acc, item) => {
    const meetingName = item.meetingName || "Uploaded Meeting";
    if (!acc[meetingName]) acc[meetingName] = [];
    acc[meetingName].push(item);
    return acc;
  }, {});

  const onAnalyzeMeeting = () => {
    if (!meetingLink.trim()) return;
        setUploadStep(0);
        setTimeout(() => setUploadStep(1), 1500);
        setTimeout(() => setUploadStep(2), 3500);
        setTimeout(() => setUploadStep(3), 5500);
    const meetings = Array.from(
      new Map(
        insights.actions.map((item) => [
          item.meetingId,
          { meetingId: item.meetingId, meetingName: item.meetingName },
        ]),
      ).values(),
    );
    setDetectedMeetings(meetings);
    setSelectedMeetingId(meetings[0]?.meetingId || "");
  };

  const handleUpload = async () => {
  if (!file) {
    alert("Please select a file");
    return;
  }

  setLoading(true);
  setUploadStep(0);

  try {
    // Get auth token
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No authentication token found. Please login first.");
    }

    // STEP 1: Upload
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("http://127.0.0.1:8000/audio", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      throw new Error(errorData.detail || `Upload failed: ${uploadRes.status}`);
    }

    const uploadData = await uploadRes.json();
    console.log("Upload:", uploadData);

    setUploadStep(1);

    // STEP 2: Process
    const processRes = await fetch("http://127.0.0.1:8000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        file_path: uploadData.file_path,
        file_name: uploadData.file_name
      }),
    });

    if (!processRes.ok) {
      const errorData = await processRes.json();
      throw new Error(errorData.detail || `Process failed: ${processRes.status}`);
    }

    const processData = await processRes.json();
    console.log("Process Response:", processData);
    console.log("Transcript Data:", processData?.transcript);

    if (!processData?.transcript) {
      console.warn("Warning: No transcript in response", processData);
    }

    setResult(processData);
    setShowTranscript(true); // 👈 AUTO-OPEN EXTRACTED TEXT
    setShowSummary(true); // 👈 AUTO-OPEN PROCESSING RESULTS
    
    // Create a meeting from the uploaded file
    if (processData?.meeting_id) {
      const meetingTitle = processData.title || fileName.replace(".mp3", "");
      const newMeeting = {
        meetingId: processData.meeting_id,
        meetingName: meetingTitle
      };
      setDetectedMeetings([newMeeting]);
      setSelectedMeetingId(newMeeting.meetingId);
      
      // Store action items with proper fields for display
      const actionItemsForDisplay = (processData.action_items || []).map((item, index) => ({
        id: index,
        meeting_id: processData.meeting_id,
        meetingId: processData.meeting_id,
        meetingName: meetingTitle,
        description: item.description || "",
        assigned_to: item.assigned_to || "Unassigned",
        assignee: item.assigned_to || "Unassigned",
        deadline: item.deadline || "Not specified",
        status: item.status || "Pending",
        title: item.title || item.description?.substring(0, 50) || "Action Item"
      }));
      
      setUploadedActionItems(actionItemsForDisplay);
      console.log("📋 Processed action items:", actionItemsForDisplay);
    }
    
    setUploadStep(2);

    // Small delay to show animation
    setTimeout(() => {
      setUploadStep(3); // 👈 FINAL STEP SHOW UI
    }, 1000);
  } catch (err) {
    console.error("Upload/Process error:", err);
    alert("Error while processing: " + err.message);
    setUploadStep(-1);
  }

  setLoading(false);
};

  const sendParticipantTasks = () => {
    const participantTasks = visibleTasks
      .map((item, index) => `${index + 1}. ${item.description || item.title || "Task"}`)
      .join("%0D%0A");
    const subject = encodeURIComponent(`Action items pending - ${selectedParticipant}`);
    const body = encodeURIComponent(
      `Hi ${selectedParticipant},\n\nHere are your pending meeting action items:\n${participantTasks}\n\nThanks.`,
    );
    window.open(
      `mailto:${selectedParticipant.toLowerCase().replace(/\s+/g, '.')}@company.com?subject=${subject}&body=${body}`,
      "_self",
    );
  };

  return (
    <Motion.div className="space-y-6" {...fadeInProps}>
      <Motion.h1
        className="text-3xl font-bold text-slate-900 dark:text-slate-100"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={subtle}
      >
        Meeting Intelligence Dashboard
      </Motion.h1>

      <div className="space-y-3">
        <Motion.label
          className="block rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 p-8 text-center shadow-sm shadow-slate-200/40 transition-shadow dark:border-violet-600/45 dark:bg-violet-950/35 dark:shadow-black/25"
          {...slideUpProps}
          transition={{ ...subtle, delay: 0.04 }}
        >
          <UploadCloud className="mx-auto h-8 w-8 text-violet-600 dark:text-violet-400" />
          <p className="mt-3 font-semibold text-violet-700 dark:text-violet-300">Upload .mp3 meeting recording</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{fileName || "Drag and drop or click to choose file"}</p>
          <input
            type="file"
            accept=".mp3,audio/mpeg"
            className="mt-3"
            onChange={(event) => {
            const selectedFile = event.target.files?.[0];
            if (!selectedFile) return;

            setFile(selectedFile); // 👈 IMPORTANT
            setFileName(selectedFile.name);
         }}
          />
        </Motion.label>

        {file && (
          <Motion.button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 px-4 py-3 text-white font-semibold shadow-sm shadow-violet-600/25 dark:shadow-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 dark:hover:bg-violet-700 transition-colors"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={subtle}
          >
            {loading ? "Processing..." : "Submit & Process"}
          </Motion.button>
        )}
      </div>

      <Motion.section className={`space-y-3 ${card}`} {...slideUpProps} transition={{ ...subtle, delay: 0.08 }}>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Or paste meeting link</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={meetingLink}
            onChange={(event) => setMeetingLink(event.target.value)}
            placeholder="https://meet.example.com/recording/123"
            className={inputClass}
          />
          <Motion.button
          onClick={handleUpload}
          className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-white"
          >
          {loading ? "Processing..." : "Upload & Analyze"}
          </Motion.button>
          <Motion.button
            type="button"
            onClick={onAnalyzeMeeting}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 dark:shadow-violet-900/40"
            {...buttonHoverProps}
          >
            Analyze Link
          </Motion.button>
        </div>
      </Motion.section>
{uploadStep >= 0 && (
  <UploadProcessor step={uploadStep} />
)}
{uploadStep === 3 && (
      <Motion.section className={`space-y-3 ${card}`} {...slideUpProps} transition={{ ...subtle, delay: 0.12 }}>
        <Motion.button
          type="button"
          onClick={() => setShowSummary((value) => !value)}
          className={`flex w-full items-center justify-between px-4 py-3 text-left ${innerMuted}`}
          {...buttonHoverProps}
        >
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Processing Results</span>
          {showSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Motion.button>
        <AnimatePresence>
          {showSummary && (
            <Motion.p
              key="summary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-xl bg-slate-50 p-4 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
            >
              {result?.summary || "No summary available"}
            </Motion.p>
          )}
        </AnimatePresence>

        <Motion.button
          type="button"
          onClick={() => setShowTranscript((value) => !value)}
          className={`flex w-full items-center justify-between px-4 py-3 text-left ${innerMuted}`}
          {...buttonHoverProps}
        >
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Extracted Text</span>
          {showTranscript ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Motion.button>
        <AnimatePresence>
          {showTranscript && (
            <Motion.div
              key="transcript"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-xl bg-slate-50 p-4 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed"
            >
              {result?.transcript || "No transcript available"}
            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.section>
)}

{uploadStep === 3 && (
      <Motion.section className={`space-y-3 ${card}`} {...slideUpProps} transition={{ ...subtle, delay: 0.16 }}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Detected Action Items</h2>
        {detectedMeetings.length === 0 ? (
          <p className={`p-4 text-sm text-slate-600 dark:text-slate-400 ${innerMuted}`}>
            No action items detected yet. Upload a meeting file or analyze a meeting link to generate tasks.
          </p>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Meetings</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {detectedMeetings.map((meeting) => (
                  <Motion.button
                    key={meeting.meetingId}
                    type="button"
                    onClick={() => setSelectedMeetingId(meeting.meetingId)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                      activeMeetingId === meeting.meetingId
                        ? "bg-violet-600 text-white shadow-sm"
                        : `border border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300`
                    }`}
                    {...buttonHoverProps}
                  >
                    {meeting.meetingName}
                  </Motion.button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Participants</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {participants.map((name) => (
                  <Motion.button
                    key={name}
                    type="button"
                    onClick={() => setSelectedParticipant(name)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      selectedParticipant === name
                        ? "bg-violet-600 text-white shadow-sm"
                        : `border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`
                    }`}
                    {...buttonHoverProps}
                  >
                    {name}
                  </Motion.button>
                ))}
              </div>
            </div>

            {selectedParticipant !== "Me" && visibleTasks.length > 0 && (
              <Motion.button
                type="button"
                onClick={sendParticipantTasks}
                className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                {...buttonHoverProps}
              >
                Send Email to {selectedParticipant}
              </Motion.button>
            )}

            {Object.keys(groupedTasks).length === 0 ? (
              <p className={`p-3 text-sm text-slate-600 dark:text-slate-400 ${innerMuted}`}>
                No tasks found for {selectedParticipant} in this meeting.
              </p>
            ) : (
              <div className="space-y-4" key={`${activeMeetingId}-${selectedParticipant}`}>
                {Object.entries(groupedTasks).map(([meetingName, tasks]) => (
                  <div key={meetingName} className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{meetingName}</p>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {tasks.map((item, index) => (
                        <Motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...subtle, delay: index * 0.06 }}
                          className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm shadow-slate-200/40 dark:border-slate-700/80 dark:bg-slate-900/50 dark:shadow-lg dark:shadow-black/25"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100">{item.title || item.description || item.task}</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Assigned to: {item.assigned_to || item.assignee}</p>
                              {item.deadline && item.deadline !== "Not specified" && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Deadline: {item.deadline}</p>
                              )}
                            </div>
                            {(item.assigned_to || item.assignee) === "Me" ? (
                              <select
                                value={taskStatuses[item.id] || item.status || "Open"}
                                onChange={(event) =>
                                  setTaskStatuses((prev) => ({
                                    ...prev,
                                    [item.id]: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                              >
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Done</option>
                              </select>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {taskStatuses[item.id] || item.status || "Pending"}
                              </span>
                            )}
                          </div>
                        </Motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Motion.section>
)}
    </Motion.div>
  );
}


