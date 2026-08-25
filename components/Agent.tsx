// 'use client'

// import React, { useEffect, useRef, useState } from 'react'
// import Image from "next/image"
// import { cn } from "@/lib/utils";
// import { useRouter } from "next/navigation";
// import { vapi } from "@/lib/vapi.sdk";
// import { interviewer } from "@/constants";
// import { createFeedback } from "@/lib/actions/general.action";

// enum CallStatus {
//     INACTIVE = 'INACTIVE',
//     CONNECTING = 'CONNECTING',
//     ACTIVE = 'ACTIVE',
//     FINISHED = 'FINISHED'
// }

// interface SavedMessage {
//     // role: 'user' | 'system' | 'assistant';
//     // content: string;
//     role: 'user' | 'assistant';
//     content: string;
// }

// const Agent = ({ userName, userId, type, interviewId, feedbackId, questions }: AgentProps) => {

//   const router = useRouter();
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
//   const [messages, setMessages] = useState<SavedMessage[]>([]);
//   const [isSaving, setIsSaving] = useState(false);
// const hasSavedRef = useRef(false); // prevent duplicate feedback save


//   useEffect(() => {
//     const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
//     const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

//     const onMessage = (message: Message) => {
//         if(message.type === 'transcript' && message.transcriptType === 'final'){
//             // const newMessage = { role: message.role, content: message.transcript };

//             // setMessages((prev) => [...prev, newMessage]);
//             const newMessage: SavedMessage = {
//                 role: message.role === "assistant" ? "assistant" : "user",
//                 content: message.transcript,
//         };
//         setMessages((prev) => [...prev, newMessage]);

//         }
//     }

//     const onSpeechStart = () => setIsSpeaking(true);
//     const onSpeechEnd = () => setIsSpeaking(false);

//     const onError = (error: Error) => console.log('Error', error);

//     vapi.on('call-start', onCallStart);
//     vapi.on('call-end', onCallEnd);
//     vapi.on('message', onMessage);
//     vapi.on('speech-start', onSpeechStart);
//     vapi.on('speech-end', onSpeechEnd);
//     vapi.on('error', onError);

//     return () => {
//         vapi.off('call-start', onCallStart);
//         vapi.off('call-end', onCallEnd);
//         vapi.off('message', onMessage);
//         vapi.off('speech-start', onSpeechStart);
//         vapi.off('speech-end', onSpeechEnd);
//         vapi.off('error', onError);
//     }
//   }, [])  

//   useEffect(() => {

//     const handleGenerateFeedback = async (messages: SavedMessage[]) => {
//       console.log("Generate feedback here");

//       // TODO: Create a server action that generates feedback
//       const { success, feedbackId: id } = await createFeedback({
//           interviewId: interviewId!,
//           userId: userId!,
//           transcript: messages
//       })

//       if(success && id){
//           router.push(`/interview/${interviewId}/feedback`);
//       } else {
//           console.log("Error saving feedback");
//           router.push("/");
//       }
//     }

//     if(callStatus === CallStatus.FINISHED){
//         if(type === "generate"){
//             router.push("/");
//         } else{
//             handleGenerateFeedback(messages);
//         }
//     }

//   }, [messages, callStatus, feedbackId, interviewId, router, type, userId])

// //   const handleCall = async () => {
// //     setCallStatus(CallStatus.CONNECTING);

// //     if (type === "generate") {
// //       await vapi.start(
// //         undefined,
// //         undefined,
// //         undefined,
// //         process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
// //         {
// //           variableValues: {
// //             username: userName,
// //             userid: userId,
// //           },
// //         }
// //       );
// //     } else {
// //       let formattedQuestions = "";
// //       if (questions) {
// //         formattedQuestions = questions
// //           .map((question) => `- ${question}`)
// //           .join("\n");
// //       }

// //       await vapi.start(interviewer, {
// //         variableValues: {
// //           questions: formattedQuestions,
// //         },
// //       });
// //     }
// //   };

// const handleCall = async () => {
//   try {
//     setCallStatus(CallStatus.CONNECTING);

//     let formattedQuestions = "";

//     if (questions) {
//       formattedQuestions = questions
//         .map((question) => `- ${question}`)
//         .join("\n");
//     }

//     await vapi.start(
//       process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!,
//       {
//         variableValues: {
//           username: userName,
//         //   userid: userId,
//           questions: formattedQuestions,
//         },
//       }
//     );

//   } catch (err) {
//     console.error("Vapi Start Error:", err);
//     setCallStatus(CallStatus.INACTIVE);
//   }
// };


//   const handleDisconnect = async () => {
//     setCallStatus(CallStatus.FINISHED);
//     vapi.stop();
//   }

//   const latestMessage = messages[messages.length - 1]?.content;
//   const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

//   return (
//     <>
//         <div className="call-view">
//             <div className="card-interviewer">
//                 <div className="avatar">
//                     <Image 
//                         src="/ai-avatar.png" 
//                         alt="vapi" 
//                         width={65} 
//                         height={54} 
//                         className="object-cover" 
//                     />
//                     {isSpeaking && <span className="animate-speak"/>}
//                 </div>
//                 <h3>AI Interviewer</h3>
//             </div>

//             <div className="card-border">
//                 <div className="card-content">
//                     <Image 
//                         src="/user-avatar.png" 
//                         alt="user avatar" 
//                         width={540} 
//                         height={540} 
//                         className="rounded-full object-cover size-[120px] "
//                     />
//                     <h3>{userName}</h3>
//                 </div>
//             </div>
//         </div>

//         {messages.length > 0 && (
//             <div className="transcript-border">
//                 <div className="transcript">
//                     <p key={latestMessage} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
//                         {latestMessage}
//                     </p>
//                 </div>
//             </div>
//         )}

//         <div className="w-full flex justify-center">
//             {callStatus !== "ACTIVE" ? (
//                 <button className="relative btn-call" onClick={handleCall}>
//                     <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !== "CONNECTING" && "hidden")}/>
                    
//                     <span>
//                         {isCallInactiveOrFinished ? "Call" : ". . ."}
//                     </span>
//                 </button>
//             ) : (
//                 <button className="btn-disconnect" onClick={handleDisconnect}>
//                     End
//                 </button>
//             )}
//         </div>
//     </>
    
//   )
// }

// export default Agent

// new code adding this is perfect code which run properly
'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from "next/image"
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";
import ProctorCamera from "./ProctorCamera";
enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED'
}

interface SavedMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Stores what Vapi workflow extracted from conversation
interface ExtractedInterviewData {
  role: string;
  type: string;
  level: string;
  techstack: string;
  amount: string;
}
const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {

  const router = useRouter();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const interviewIdRef = useRef(interviewId); // ← ADD KARO
  const [isSaving, setIsSaving] = useState(false);

  const hasSavedRef = useRef(false); // prevent duplicate feedback save
  const terminatedByCheatingRef = useRef(false); // ← ADD KARO
    // FIX 1: Keep a ref in sync with messages state to avoid race condition
  // when callStatus = FINISHED but messages state hasn't updated yet
  const messagesRef = useRef<SavedMessage[]>([]);
   // 🔥 NEW: Store extracted data from Vapi workflow conversation
  const extractedDataRef = useRef<ExtractedInterviewData>({
    role: "",
    type: "",
    level: "",
    techstack: "",
    amount: "5",
  });
  // const interviewIdRef = useRef(interviewId);

  /* ----------------------------------------
     VAPI EVENT LISTENERS
  -----------------------------------------*/
  useEffect(() => {

    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = (callData?: any) => {
      console.log("🔚 Full call-end data:", JSON.stringify(callData, null, 2));
      
      // Vapi sends extracted variables here
      const vars = callData?.artifact?.variableValues 
        || callData?.variableValues 
        || callData?.variables
        || {};

      console.log("📦 Extracted vars:", vars);

      if (vars.role || vars.level || vars.techstack) {
        extractedDataRef.current = {
          role: vars.role || extractedDataRef.current.role,
          type: vars.type || extractedDataRef.current.type,
          level: vars.level || extractedDataRef.current.level,
          techstack: vars.techstack || extractedDataRef.current.techstack,
          amount: vars.amount?.toString() || extractedDataRef.current.amount,
        };
      }
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: any) => {
       // 🔥 LOG EVERY MESSAGE TYPE to find where variables come
       console.log("📨 Message type:", message.type, message);
      
      // 🔥 CAPTURE VAPI WORKFLOW EXTRACTED VARIABLES
      // Vapi sends variable-values when workflow extracts data from conversation
      if (message.type === "variable-values" || message.type === "variables") {
        const vars = message.values || message.variableValues || {};
        console.log("📦 Vapi Variables Received:", vars);

        extractedDataRef.current = {
          role: vars.role || extractedDataRef.current.role,
          type: vars.type || extractedDataRef.current.type,
          level: vars.level || extractedDataRef.current.level,
          techstack: vars.techstack || extractedDataRef.current.techstack,
          amount: vars.amount?.toString() || extractedDataRef.current.amount,
        };
      }

      // 🔥 ALSO: Some Vapi versions send it inside function-call
      if (message.type === "function-call") {
        console.log("📞 Function Call:", message);
        const params = message.functionCall?.parameters || {};
        if (params.role || params.level || params.techstack) {
          extractedDataRef.current = {
            role: params.role || extractedDataRef.current.role,
            type: params.type || extractedDataRef.current.type,
            level: params.level || extractedDataRef.current.level,
            techstack: params.techstack || extractedDataRef.current.techstack,
            amount: params.amount?.toString() || extractedDataRef.current.amount,
          };
        }
      }

      // Save transcript messages as before
      if (
        message.type === "transcript" &&
        message.transcriptType === "final"
        // message.transcript
      ) {
        const newMessage: SavedMessage = {
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.transcript,
        };

        // FIX 1: Update both state AND ref together
        messagesRef.current = [...messagesRef.current, newMessage];
        setMessages(prev => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);

    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: any) => {
      // / Ignore normal meeting end noise
      // 
      const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
      if (
        errorStr?.toLowerCase()?.includes("ejected") || 
        errorStr?.toLowerCase()?.includes("Meeting has ended")
        // errorStr.includes("participant-ejected")
        
      ) {
        console.log("ℹ️ Call session closed gracefully.");
        // setCallStatus(CallStatus.FINISHED);
        return;
      }
        console.error("❌ REAL VAPI ERROR:", error);
    }

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };

  }, []);

/* ----------------------------------------
     TAB SWITCH DETECTION
  ----------------------------------------- */
  useEffect(() => {
    if (callStatus !== CallStatus.ACTIVE) return;
 
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleCheatingTermination("Tab switch detected — candidate left the interview tab");
      }
    };
 
    const handleBlur = () => {
      handleCheatingTermination("Window switched — candidate left the interview tab");
    };
 
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
 
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [callStatus]);
 

  /* ----------------------------------------
     GENERATE FEEDBACK AFTER CALL FINISH
  -----------------------------------------*/
  useEffect(() => {

    const generateFeedback = async () => {
        // If cheating — skip normal feedback (cheating feedback already saved in onTerminate)
        if (terminatedByCheatingRef.current) return;
        if (type === "generate") {
          // const currentMessages = messagesRef.current;
          // const fullText = currentMessages.map(m => m.content).join(" ");
          
          // const levelMatch = fullText.match(/(?:junior|mid-level|senior|entry)/i);
          // const amountMatch = fullText.match(/(\d+)\s*questions/i);
          const currentMessages = messagesRef.current;
          const extracted = extractedDataRef.current;

        // // Fallback: try to extract from transcript if Vapi didn't send variables
        const fullText = currentMessages.map(m => m.content).join(" ");
        // const levelMatch = fullText.match(/\b(junior|mid-level|senior|entry.level)\b/i);
        // const amountMatch = fullText.match(/(\d+)\s*questions?/i);
        // const roleMatch = fullText.match(/\b(software engineer|frontend|backend|fullstack|developer|designer|data scientist|devops)\b/i);
        // const techMatch = fullText.match(/\b(react|angular|vue|node|python|java|typescript|javascript|nextjs|django|spring)\b/gi);

        // const finalData = {
        //   userid: userId,
        //   type: extracted.type || "Technical",
        //   role: extracted.role || roleMatch?.[0] || "Software Engineer",
        //   level: extracted.level || levelMatch?.[0] || "Junior",
        //   techstack: extracted.techstack || (techMatch ? [...new Set(techMatch)].join(", ") : "React, Node.js"),
        //   amount: extracted.amount || amountMatch?.[1] || "5",
        // };

        // console.log("💾 Saving interview with data:", finalData);
        // Better extraction - user ke jawab se
          const userMessages = currentMessages
            .filter(m => m.role === "user")
            .map(m => m.content)
            .join(" ");

          const levelMatch = userMessages.match(/\b(junior|mid-level|senior|entry)\b/i);
          const amountMatch = userMessages.match(/\b(\d+)\b/);
          const typeMatch = userMessages.match(/\b(technical|behavioural|mixed)\b/i);
          const roleMatch = userMessages.match(/\b(software engineer|frontend|backend|fullstack|developer|designer|data scientist|devops|engineer)\b/i);
          const techMatch = userMessages.match(/\b(react|angular|vue|node|python|java|typescript|javascript|nextjs|django|spring|express)\b/gi);

          const finalData = {
            userid: userId,
            type: extracted.type || typeMatch?.[0] || "Technical",
            role: roleMatch?.[0] || "Software Engineer",
            level: levelMatch?.[0] || "Junior",
            techstack: techMatch ? [...new Set(techMatch.map(t => t.toLowerCase()))].join(", ") : "React",
            amount: amountMatch?.[1] || "5",
          };

          console.log("💾 Saving:", finalData);
//changes done in 23
          try {
            const res = await fetch("/api/vapi/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(finalData),
            });
            const data = await res.json();
            const newInterviewId = data.interviewId; // ← naya interviewId lo

            if (newInterviewId) {
              // Ab feedback banao us interview ka
              const { success } = await createFeedback({
                interviewId: newInterviewId,
                userId: userId!,
                transcript: currentMessages.length > 0
                  ? currentMessages
                  : [{ role: "user", content: "Interview completed via voice" }],
              });

              if (success) {
                router.push(`/interview/${newInterviewId}/feedback`); // ← feedback page
                return;
              }
            }
          } catch(err) {
            console.error("Failed to save interview:", err);
          }
          
          router.push("/");
          return;
        }
            // FIX 1: Read from ref, not state — guaranteed to have all messages
      const currentMessages = messagesRef.current;
      if (!interviewId || !userId || hasSavedRef.current) {
        router.push("/");
        return;
      }
      // if (hasSavedRef.current) return;
      hasSavedRef.current = true;

      try {
        setIsSaving(true);
        // hasSavedRef.current = true;

        const { success } = await createFeedback({
          interviewId,
          userId,
          transcript: currentMessages.length > 0 
          ? currentMessages 
          : [{ role: "user", content: "Interview completed via voice" }],
          
        });
        if (success) {
          vapi.stop(); // <--- Manually stop the call here
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          router.push("/");
        }

      } catch (err) {
        console.error("Feedback error:", err);
        router.push("/");
      } finally {
        setIsSaving(false);
      }
    };
    if (callStatus === CallStatus.FINISHED) {
      generateFeedback();
  }
  

  }, [callStatus]);
  /* ----------------------------------------
     CHEATING TERMINATION — save to Firebase
  ----------------------------------------- */
  // const handleCheatingTermination = async (reason: string) => {
  //   if (hasSavedRef.current) return;
  //   hasSavedRef.current = true;
  //   terminatedByCheatingRef.current = true;
 
  //   vapi.stop();

  //   const currentId = interviewIdRef.current;
  //   console.log("🚨 Cheating terminated. interviewId:", currentId);
  //   if (!currentId || !userId) {
  //   router.push("/");
  //   return;
  // }
  //   // Save cheating feedback to Firebase so it shows in card & feedback page
  //   if (interviewId && userId) {
  //     try {
  //       await createFeedback({
  //         interviewId: currentId,
  //         userId,
  //         transcript: [
  //           { role: "assistant", content: "Interview started." },
  //           { role: "user", content: `TERMINATED: ${reason}` },
  //         ],
  //         cheating: true,
  //         cheatingReason: reason,
  //       });
  //       router.push(`/interview/${currentId}/feedback`);
  //     } catch (err) {
  //       console.error("Failed to save cheating feedback:", err);
  //       router.push("/");
  //     }
  //   }
 
  //   // router.push(`/interview/${currentId}/feedback`);
  // };
  
  const handleCheatingTermination = async (reason: string) => {
  if (hasSavedRef.current) return;
  hasSavedRef.current = true;
  terminatedByCheatingRef.current = true;

  vapi.stop();

  let currentId = interviewIdRef.current;

  console.log("🚨 Cheating terminated. interviewId:", currentId);

  try {
    // Generate mode — pehle interview save karo
    if (!currentId && userId) {
      const extracted = extractedDataRef.current;
      const currentMessages = messagesRef.current;
      const userMessages = currentMessages.filter(m => m.role === "user").map(m => m.content).join(" ");

      const roleMatch = userMessages.match(/\b(software engineer|frontend|backend|fullstack|developer|designer|data scientist|devops|engineer)\b/i);
      const levelMatch = userMessages.match(/\b(junior|mid-level|senior|entry)\b/i);
      const typeMatch = userMessages.match(/\b(technical|behavioural|mixed)\b/i);
      const techMatch = userMessages.match(/\b(react|angular|vue|node|python|java|typescript|javascript|nextjs|django|spring|express)\b/gi);

      const finalData = {
        userid: userId,
        type: extracted.type || typeMatch?.[0] || "Technical",
        role: extracted.role || roleMatch?.[0] || "Software Engineer",
        level: extracted.level || levelMatch?.[0] || "Junior",
        techstack: techMatch ? [...new Set(techMatch.map(t => t.toLowerCase()))].join(", ") : "React",
        amount: extracted.amount || "5",
      };

      const res = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      const data = await res.json();
      currentId = data.interviewId;
      console.log("✅ Interview saved with ID:", currentId);
    }

    if (!currentId || !userId) {
      router.push("/");
      return;
    }

    // Cheating feedback save karo
    await createFeedback({
      interviewId: currentId,
      userId,
      transcript: [
        { role: "assistant", content: "Interview started." },
        { role: "user", content: `TERMINATED: ${reason}` },
      ],
      cheating: true,
      cheatingReason: reason,
    });

    router.push(`/interview/${currentId}/feedback`);

  } catch (err) {
    console.error("Failed:", err);
    router.push("/");
  }
  };
  /* ----------------------------------------
     START CALL (WORKFLOW VERSION)
  -----------------------------------------*/
  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);

      let formattedQuestions = "";

      if (questions?.length) {
        formattedQuestions = questions.map((q) => `- ${q}`)
        .join("\n");
      }

  //     // 🔥 IMPORTANT: USE WORKFLOW ID (NOT ASSISTANT ID)
  //     await vapi.start(
  //       undefined,
  //       undefined,
  //       undefined,
  //       process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
  //       {
  //         variableValues: {
  //           username: userName,
  //           userid: userId,
  //           // These must match the blue tags in your image
  //           amount: questions?.length || 5, 
  //           techstack: type || "General", 
  //           // role: "Candidate",
  //           // level: "Professional",
  //           // questions: questions?.join("\n") || ""
  //           questions: questions?.map((q) => `- ${q}`).join("\n"),
  //           // questions: formattedQuestions,
  //         },
  //       }
  //     );

  //   } catch (err) {
  //     console.error("Vapi Start Error:", err);
  //     setCallStatus(CallStatus.INACTIVE);
  //   }
  // };
  
      if (type === "generate") {
        // Workflow mode — Vapi will ask user for role, level, techstack etc.
        await vapi.start(
          undefined,
          undefined,
          undefined,
          process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
          {
            variableValues: {
              username: userName,
              userid: userId,
            },
          }
        );
      } else {
        // Interview mode — pass questions directly
        await vapi.start(
          // undefined,
          // undefined,
          // undefined,
          process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!,
          { 
            variableValues: {
              username: userName,
              userid: userId,
              amount: questions?.length || 5,
              questions: questions?.map((q) => `- ${q}`).join("\n") || "",
            },
          }
        );
      }

    } catch (err) {
      console.error("Vapi Start Error:", err);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  /* ----------------------------------------
     END CALL
  -----------------------------------------*/
  const handleDisconnect = () => {
    vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE ||
    callStatus === CallStatus.FINISHED;

  /* ----------------------------------------
     UI
  -----------------------------------------*/
  return (
    <>
      <style>{`
        @keyframes agentPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
        }
        @keyframes speakRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .speak-ring::before, .speak-ring::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #7c3aed;
          animation: speakRing 1.2s ease-out infinite;
        }
        .speak-ring::after { animation-delay: 0.4s; }
      `}</style>
 
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        width: "100%",
        maxWidth: 860,
        margin: "0 auto",
        padding: "8px 0 24px",
      }}>
 
        {/* ── TOP ROW: AI card + Camera-over-User card ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          width: "100%",
        }}>
 
          {/* AI Interviewer Card */}
          <div style={{
            background: "white",
            borderRadius: 20,
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "36px 24px",
            gap: 16,
            minHeight: 260,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Background decoration */}
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 120, height: 120, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,58,237,0.08), transparent)",
            }} />
            <div style={{
              position: "absolute", bottom: -20, left: -20,
              width: 80, height: 80, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(79,70,229,0.06), transparent)",
            }} />
 
            {/* Avatar */}
            <div style={{
              position: "relative",
              width: 88, height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ede9fe, #dbeafe)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isSpeaking
                ? "0 0 0 3px #7c3aed, 0 8px 24px rgba(124,58,237,0.3)"
                : "0 4px 16px rgba(124,58,237,0.15)",
              animation: isSpeaking ? "agentPulse 1.5s ease-in-out infinite" : "none",
              transition: "box-shadow 0.3s ease",
            }} className={isSpeaking ? "speak-ring" : ""}>
              <Image src="/ai-avatar.png" alt="AI" width={52} height={52} className="object-cover" />
            </div>
 
            <div style={{ textAlign: "center" }}>
              <p style={{
                margin: 0, fontSize: 15, fontWeight: 700, color: "#111827",
                letterSpacing: "-0.01em",
              }}>AI Interviewer</p>
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                justifyContent: "center", marginTop: 6,
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: callStatus === CallStatus.ACTIVE ? "#22c55e"
                    : callStatus === CallStatus.CONNECTING ? "#f59e0b"
                    : "#d1d5db",
                  boxShadow: callStatus === CallStatus.ACTIVE ? "0 0 0 3px rgba(34,197,94,0.2)" : "none",
                  animation: callStatus === CallStatus.ACTIVE ? "agentPulse 2s infinite" : "none",
                }} />
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
                  {callStatus === CallStatus.ACTIVE ? "Speaking" :
                   callStatus === CallStatus.CONNECTING ? "Connecting…" : "Ready"}
                </span>
              </div>
            </div>
 
            {isSpeaking && (
              <div style={{ display: "flex", gap: 3, alignItems: "center", height: 20 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    width: 3, borderRadius: 99,
                    background: "#7c3aed",
                    height: `${8 + Math.sin(i * 1.2) * 8}px`,
                    animation: `speakRing ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                  }} />
                ))}
              </div>
            )}
          </div>
 
          {/* RIGHT: Camera stacked above User card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
 
            {/* ProctorCamera — sits on top */}
            <ProctorCamera
              isActive={callStatus === CallStatus.ACTIVE}
              onViolation={(t) => console.log("Violation:", t)}
              onTerminate={(reason) => handleCheatingTermination(reason)}
            />
 
            {/* User Card — below camera */}
            <div style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 18px",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                overflow: "hidden", flexShrink: 0,
                border: "2px solid #ede9fe",
                boxShadow: "0 2px 8px rgba(124,58,237,0.15)",
              }}>
                <Image src="/user-avatar.png" alt="user" width={48} height={48}
                  className="rounded-full object-cover" style={{ width: "100%", height: "100%" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>{userName}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Candidate</p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: callStatus === CallStatus.ACTIVE ? "#22c55e" : "#d1d5db",
                  boxShadow: callStatus === CallStatus.ACTIVE ? "0 0 0 3px rgba(34,197,94,0.2)" : "none",
                }} />
              </div>
            </div>
          </div>
        </div>
        {/* Tab Switch Warning Banner — shows when active */}
        {callStatus === CallStatus.ACTIVE && (
          <div style={{
            width: "100%",
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: 10,
            padding: "8px 16px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 11, color: "#92400e", fontWeight: 600 }}>
              Do not switch tabs or windows — this will immediately terminate your interview.
            </p>
          </div>
        )}
        {/* Transcript */}
        {latestMessage && (
          <div style={{
            width: "100%",
            background: "white",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            padding: "14px 20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            animation: "fadeInUp 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed" }} />
              <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Live Transcript
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              {latestMessage}
            </p>
          </div>
        )}
 
        {/* Call Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {callStatus !== CallStatus.ACTIVE ? (
            <button
              onClick={handleCall}
              disabled={isSaving || callStatus === CallStatus.CONNECTING}
              style={{
                padding: "14px 40px",
                borderRadius: 50,
                border: "none",
                background: callStatus === CallStatus.CONNECTING
                  ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                  : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s ease",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => { if (!isSaving) e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(34,197,94,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(34,197,94,0.4)"; }}
            >
              <span style={{ fontSize: 16 }}>
                {callStatus === CallStatus.CONNECTING ? "⏳" : "🎙️"}
              </span>
              {isCallInactiveOrFinished ? "Start Interview" : "Connecting…"}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              style={{
                padding: "14px 40px",
                borderRadius: 50,
                border: "none",
                background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(239,68,68,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(239,68,68,0.4)"; }}
            >
              <span>🔴</span> End Interview
            </button>
          )}
        </div>
 
      </div>
    </>
  );
};
export default Agent;