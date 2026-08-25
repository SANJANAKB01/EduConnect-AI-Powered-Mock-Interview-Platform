// 'use client'

// import { useEffect, useRef, useState, useCallback } from "react";
// // @ts-ignore
// import type {} from "@mediapipe/tasks-vision";
// interface ProctorCameraProps {
//   isActive: boolean;
//   onViolation?: (type: string) => void;
//   onTerminate?: (reason: string) => void;
// }

// const NO_FACE_TIMEOUT_MS = 5000;

// const CHEATING_OBJECTS = [
//   "cell phone", "mobile phone", "book", "laptop", "notebook",
//   "remote", "keyboard", "mouse", "paper", "pen", "pencil", "tablet"
// ];

// const ProctorCamera = ({ isActive, onViolation, onTerminate }: ProctorCameraProps) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const terminatedRef = useRef(false);
//   const startTimeRef = useRef<number | null>(null);
//   const noFaceStartRef = useRef<number | null>(null);
//   const multipleFaceStartRef = useRef<number | null>(null);
//   const objectDetectorRef = useRef<any>(null);

//   const [cameraReady, setCameraReady] = useState(false);
//   const [faceApiLoaded, setFaceApiLoaded] = useState(false);
//   const [objectModelLoaded, setObjectModelLoaded] = useState(false);
//   const [terminated, setTerminated] = useState(false);
//   const [currentAlert, setCurrentAlert] = useState<string | null>(null);
//   const [faceCount, setFaceCount] = useState<number | null>(null);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const [noFaceSeconds, setNoFaceSeconds] = useState(0);
//   const [showModal, setShowModal] = useState(false);
//   const [modalReason, setModalReason] = useState("");
//   const [detectedObject, setDetectedObject] = useState<string | null>(null);

//   // Camera start
//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: 320, height: 240, facingMode: "user" },
//           audio: false,
//         });
//         streamRef.current = stream;
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           videoRef.current.onloadedmetadata = () => {
//             videoRef.current?.play();
//             setCameraReady(true);
//           };
//         }
//       } catch (err) {
//         console.error("Camera access denied:", err);
//       }
//     };
//     startCamera();
//     return () => {
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, []);

//   // face-api.js load
//   useEffect(() => {
//     const loadFaceApi = async () => {
//       try {
//         const faceapi = await import("face-api.js");
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
//           faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//         ]);
//         setFaceApiLoaded(true);
//       } catch (err) {
//         console.error("face-api load error:", err);
//       }
//     };
//     loadFaceApi();
//   }, []);

//   // MediaPipe ObjectDetector load
//   useEffect(() => {
//     const loadObjectDetector = async () => {
//       try {
//         // @ts-ignore
//         const vision = await import("@mediapipe/tasks-vision");
//         const { ObjectDetector, FilesetResolver } = vision;

//         const filesetResolver = await FilesetResolver.forVisionTasks(
//           "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
//         );

//         const detector = await ObjectDetector.createFromOptions(filesetResolver, {
//           baseOptions: {
//             modelAssetPath:
//               "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
//             delegate: "CPU",
//           },
//           scoreThreshold: 0.5,
//           runningMode: "VIDEO",
//         });

//         objectDetectorRef.current = detector;
//         setObjectModelLoaded(true);
//         console.log("✅ MediaPipe Object Detector loaded");
//       } catch (err) {
//         console.error("MediaPipe load error:", err);
//         // Object detection fail ho toh bhi face detection chalti rahe
//         setObjectModelLoaded(true);
//       }
//     };
//     loadObjectDetector();
//   }, []);

//   // Interview timer
//   useEffect(() => {
//     if (isActive && !terminated) {
//       startTimeRef.current = Date.now();
//       timerRef.current = setInterval(() => {
//         setElapsedTime(Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000));
//       }, 1000);
//     }
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [isActive, terminated]);

//   const terminate = useCallback((reason: string) => {
//     if (terminatedRef.current) return;
//     terminatedRef.current = true;
//     setTerminated(true);
//     setModalReason(reason);
//     setShowModal(true);
//     setCurrentAlert(`🚫 ${reason}`);
//     if (intervalRef.current) clearInterval(intervalRef.current);
//     if (timerRef.current) clearInterval(timerRef.current);
//     setTimeout(() => { onTerminate?.(reason); }, 3000);
//   }, [onTerminate]);

//   // Main detection loop
//   useEffect(() => {
//     if (!isActive || !cameraReady || !faceApiLoaded || terminatedRef.current) return;

//     let lastVideoTime = -1;

//     const detect = async () => {
//       if (!videoRef.current || !canvasRef.current || terminatedRef.current) return;

//       try {
//         const faceapi = await import("face-api.js");
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");
//         if (!ctx) return;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         // ---- FACE DETECTION ----
//         const detections = await faceapi
//           .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
//           .withFaceLandmarks();

//         const count = detections.length;
//         setFaceCount(count);
//         const now = Date.now();

//         // Multiple faces → terminate
//         if (count > 1) {
//           if (!multipleFaceStartRef.current) multipleFaceStartRef.current = now;
//           if (now - multipleFaceStartRef.current >= 1000) {
//             onViolation?.("MULTIPLE_FACES");
//             terminate("Cheating detected — multiple people visible in camera");
//           } else {
//             setCurrentAlert(`🚫 Multiple faces detected (${count})! Terminating...`);
//           }
//           detections.forEach(d => {
//             const b = d.detection.box;
//             ctx.strokeStyle = "#ff0000";
//             ctx.lineWidth = 3;
//             ctx.strokeRect(b.x, b.y, b.width, b.height);
//           });
//           noFaceStartRef.current = null;
//           return;
//         }

//         multipleFaceStartRef.current = null;

//         // No face → 5 sec countdown
//         if (count === 0) {
//           if (!noFaceStartRef.current) noFaceStartRef.current = now;
//           const elapsed = now - noFaceStartRef.current;
//           const secondsGone = Math.floor(elapsed / 1000);
//           setNoFaceSeconds(secondsGone);
//           if (elapsed >= NO_FACE_TIMEOUT_MS) {
//             onViolation?.("NO_FACE");
//             terminate("Face not visible for 5 seconds — interview terminated");
//           } else {
//             setCurrentAlert(`⚠️ No face detected! Terminating in ${5 - secondsGone}s...`);
//           }
//           return;
//         }

//         // Single face — all good
//         noFaceStartRef.current = null;
//         setNoFaceSeconds(0);
//         setCurrentAlert(null);

//         // Draw green face box + eye dots
//         const box = detections[0].detection.box;
//         ctx.strokeStyle = "#00ff88";
//         ctx.lineWidth = 2;
//         ctx.strokeRect(box.x, box.y, box.width, box.height);

//         const avg = (pts: {x:number,y:number}[]) => ({
//           x: pts.reduce((s,p)=>s+p.x,0)/pts.length,
//           y: pts.reduce((s,p)=>s+p.y,0)/pts.length,
//         });
//         const landmarks = detections[0].landmarks;
//         ctx.fillStyle = "#00ff88";
//         [avg(landmarks.getLeftEye()), avg(landmarks.getRightEye())].forEach(pt => {
//           ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill();
//         });

//         // ---- OBJECT DETECTION with MediaPipe ----
//         if (objectDetectorRef.current && videoRef.current) {
//           const video = videoRef.current;
//           const currentTime = video.currentTime;

//           // Only detect if frame changed
//           if (currentTime !== lastVideoTime) {
//             lastVideoTime = currentTime;
//             try {
//               const results = objectDetectorRef.current.detectForVideo(video, Date.now());

//               if (results?.detections) {
//                 results.detections.forEach((detection: any) => {
//                   const label = detection.categories?.[0]?.categoryName?.toLowerCase() || "";
//                   const score = detection.categories?.[0]?.score || 0;
//                   const bbox = detection.boundingBox;

//                   if (!bbox) return;

//                   const isCheating = CHEATING_OBJECTS.some(obj => label.includes(obj));

//                   if (isCheating && score > 0.5) {
//                     // Draw red box
//                     ctx.strokeStyle = "#ff4444";
//                     ctx.lineWidth = 3;
//                     ctx.strokeRect(bbox.originX, bbox.originY, bbox.width, bbox.height);

//                     // Label
//                     ctx.fillStyle = "rgba(255,68,68,0.8)";
//                     ctx.fillRect(bbox.originX, bbox.originY - 22, bbox.width, 22);
//                     ctx.fillStyle = "#ffffff";
//                     ctx.font = "bold 12px Arial";
//                     ctx.fillText(
//                       `${label} ${Math.round(score * 100)}%`,
//                       bbox.originX + 4,
//                       bbox.originY - 6
//                     );

//                     setDetectedObject(label);
//                     onViolation?.("CHEATING_OBJECT");
//                     terminate(`Cheating material detected — ${label} visible in camera`);
//                   }
//                 });
//               }
//             } catch (objErr) {
//               // Object detection error — silently ignore, face detection continues
//             }
//           }
//         }

//       } catch (err) {}
//     };

//     intervalRef.current = setInterval(detect, 500);
//     return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
//   }, [isActive, cameraReady, faceApiLoaded, terminate, onViolation]);

//   const formatTime = (sec: number) =>
//     `${Math.floor(sec/60).toString().padStart(2,"0")}:${(sec%60).toString().padStart(2,"0")}`;

//   return (
//     <>
//       {/* Terminate Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
//           <div className="bg-red-950 border-2 border-red-500 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
//             <div className="text-5xl text-center mb-4">🚫</div>
//             <h3 className="text-xl font-bold text-red-100 text-center mb-3">Interview Terminated</h3>
//             <p className="text-sm text-red-200 text-center leading-relaxed">{modalReason}</p>
//             {detectedObject && (
//               <div className="mt-3 bg-red-900/50 rounded-lg px-3 py-2 text-center">
//                 <p className="text-xs text-red-300">
//                   Detected: <span className="font-bold capitalize">{detectedObject}</span>
//                 </p>
//               </div>
//             )}
//             <div className="mt-3 bg-red-900/50 rounded-lg p-3 text-center">
//               <p className="text-xs text-red-300">This incident has been recorded.</p>
//               <p className="text-xs text-red-400 mt-1">Redirecting in 3 seconds...</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex flex-col gap-3 w-[320px]">
//         {/* Camera */}
//         <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300
//           ${terminated ? "border-red-500 shadow-lg shadow-red-500/30"
//             : faceCount === 0 && isActive ? "border-yellow-400"
//             : faceCount && faceCount > 1 ? "border-red-500"
//             : faceCount === 1 ? "border-green-500/60"
//             : "border-dark-300"}`}>

//           <video ref={videoRef} width={320} height={240} muted playsInline
//             className="rounded-xl block" style={{ transform: "scaleX(-1)" }} />
//           <canvas ref={canvasRef} width={320} height={240}
//             className="absolute top-0 left-0 pointer-events-none" style={{ transform: "scaleX(-1)" }} />

//           {/* Status bar */}
//           <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-2 py-1.5 bg-black/60 backdrop-blur-sm">
//             <div>
//               {terminated ? (
//                 <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">🚫 TERMINATED</span>
//               ) : !cameraReady ? (
//                 <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">📷 Starting...</span>
//               ) : !faceApiLoaded ? (
//                 <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">🔄 Loading face AI...</span>
//               ) : !objectModelLoaded ? (
//                 <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">🔄 Loading object AI...</span>
//               ) : isActive ? (
//                 <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">🔴 LIVE</span>
//               ) : (
//                 <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full">⏸ Standby</span>
//               )}
//             </div>
//             {isActive && (
//               <span className="text-white text-xs font-mono bg-black/60 px-2 py-0.5 rounded-full">
//                 ⏱ {formatTime(elapsedTime)}
//               </span>
//             )}
//           </div>

//           {/* Face count badge */}
//           {isActive && faceApiLoaded && faceCount !== null && (
//             <div className="absolute bottom-2 right-2">
//               <span className={`text-xs px-2 py-0.5 rounded-full font-bold
//                 ${faceCount === 1 ? "bg-green-500 text-white"
//                   : faceCount === 0 ? "bg-yellow-500 text-black"
//                   : "bg-red-600 text-white"}`}>
//                 👤 {faceCount}
//               </span>
//             </div>
//           )}

//           {/* No face countdown overlay */}
//           {isActive && faceCount === 0 && noFaceSeconds > 0 && !terminated && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
//               <div className="text-center">
//                 <div className="text-5xl font-bold text-yellow-400">{5 - noFaceSeconds}</div>
//                 <div className="text-xs text-yellow-300 mt-1">seconds remaining</div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Alert */}
//         {currentAlert && !terminated && (
//           <div className="bg-red-600/20 border border-red-500 text-red-300 text-sm px-3 py-2 rounded-xl font-medium">
//             {currentAlert}
//           </div>
//         )}

//         {/* Loading status */}
//         {(!faceApiLoaded || !objectModelLoaded) && !terminated && (
//           <div className="bg-dark-200 rounded-xl p-2 border border-dark-300">
//             <div className="flex gap-4 text-xs text-gray-500">
//               <span>{faceApiLoaded ? "✅" : "⏳"} Face AI</span>
//               <span>{objectModelLoaded ? "✅" : "⏳"} Object AI</span>
//               <span>{cameraReady ? "✅" : "⏳"} Camera</span>
//             </div>
//           </div>
//         )}

//         {/* Rules */}
//         {!isActive && !terminated && (
//           <div className="bg-dark-200 rounded-xl p-3 border border-dark-300">
//             <p className="text-xs text-gray-400 font-medium mb-2">📋 Proctoring Rules</p>
//             <ul className="text-xs text-gray-500 space-y-1.5">
//               <li>✅ Keep your face visible at all times</li>
//               <li>✅ Only you should be in the camera</li>
//               <li>✅ Do not switch tabs or windows</li>
//               <li>❌ Phone / book / paper = immediate termination</li>
//               <li>❌ Multiple people = immediate termination</li>
//               <li>❌ Face hidden 5 seconds = termination</li>
//             </ul>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default ProctorCamera;
'use client'

import { useEffect, useRef, useState, useCallback } from "react";
// @ts-ignore
import type {} from "@mediapipe/tasks-vision";

interface ProctorCameraProps {
  isActive: boolean;
  onViolation?: (type: string) => void;
  onTerminate?: (reason: string) => void;
}

const NO_FACE_TIMEOUT_MS = 5000;

const CHEATING_OBJECTS = [
  "cell phone", "mobile phone", "book", "laptop", "notebook",
  "remote", "keyboard", "mouse", "paper", "pen", "pencil", "tablet"
];

const ProctorCamera = ({ isActive, onViolation, onTerminate }: ProctorCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const terminatedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const noFaceStartRef = useRef<number | null>(null);
  const multipleFaceStartRef = useRef<number | null>(null);
  const objectDetectorRef = useRef<any>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [objectModelLoaded, setObjectModelLoaded] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<string | null>(null);
  const [faceCount, setFaceCount] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [noFaceSeconds, setNoFaceSeconds] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalReason, setModalReason] = useState("");
  const [detectedObject, setDetectedObject] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      } catch (err) { console.error("Camera access denied:", err); }
    };
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        const faceapi = await import("face-api.js");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        setFaceApiLoaded(true);
      } catch (err) { console.error("face-api load error:", err); }
    };
    loadFaceApi();
  }, []);

  useEffect(() => {
    const loadObjectDetector = async () => {
      try {
        // @ts-ignore
        const vision = await import("@mediapipe/tasks-vision");
        const { ObjectDetector, FilesetResolver } = vision;
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const detector = await ObjectDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
            delegate: "CPU",
          },
          scoreThreshold: 0.5,
          runningMode: "VIDEO",
        });
        objectDetectorRef.current = detector;
        setObjectModelLoaded(true);
      } catch (err) {
        console.error("MediaPipe load error:", err);
        setObjectModelLoaded(true);
      }
    };
    loadObjectDetector();
  }, []);

  useEffect(() => {
    if (isActive && !terminated) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, terminated]);

  const terminate = useCallback((reason: string) => {
    if (terminatedRef.current) return;
    terminatedRef.current = true;
    setTerminated(true);
    setModalReason(reason);
    setShowModal(true);
    setCurrentAlert(`🚫 ${reason}`);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => { onTerminate?.(reason); }, 3000);
  }, [onTerminate]);

  useEffect(() => {
    if (!isActive || !cameraReady || !faceApiLoaded || terminatedRef.current) return;
    let lastVideoTime = -1;

    const detect = async () => {
      if (!videoRef.current || !canvasRef.current || terminatedRef.current) return;
      try {
        const faceapi = await import("face-api.js");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceLandmarks();

        const count = detections.length;
        setFaceCount(count);
        const now = Date.now();

        if (count > 1) {
          if (!multipleFaceStartRef.current) multipleFaceStartRef.current = now;
          if (now - multipleFaceStartRef.current >= 1000) {
            onViolation?.("MULTIPLE_FACES");
            terminate("Cheating detected — multiple people visible in camera");
          } else {
            setCurrentAlert(`🚫 Multiple faces detected (${count})! Terminating...`);
          }
          detections.forEach(d => {
            const b = d.detection.box;
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, b.y, b.width, b.height);
          });
          noFaceStartRef.current = null;
          return;
        }

        multipleFaceStartRef.current = null;

        if (count === 0) {
          if (!noFaceStartRef.current) noFaceStartRef.current = now;
          const elapsed = now - noFaceStartRef.current;
          const secondsGone = Math.floor(elapsed / 1000);
          setNoFaceSeconds(secondsGone);
          if (elapsed >= NO_FACE_TIMEOUT_MS) {
            onViolation?.("NO_FACE");
            terminate("Face not visible for 5 seconds — interview terminated");
          } else {
            setCurrentAlert(`⚠️ No face detected! Terminating in ${5 - secondsGone}s...`);
          }
          return;
        }

        noFaceStartRef.current = null;
        setNoFaceSeconds(0);
        setCurrentAlert(null);

        const box = detections[0].detection.box;
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        const avg = (pts: { x: number; y: number }[]) => ({
          x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
          y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
        });
        const landmarks = detections[0].landmarks;
        ctx.fillStyle = "#22c55e";
        [avg(landmarks.getLeftEye()), avg(landmarks.getRightEye())].forEach(pt => {
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill();
        });

        if (objectDetectorRef.current && videoRef.current) {
          const video = videoRef.current;
          const currentTime = video.currentTime;
          if (currentTime !== lastVideoTime) {
            lastVideoTime = currentTime;
            try {
              const results = objectDetectorRef.current.detectForVideo(video, Date.now());
              if (results?.detections) {
                results.detections.forEach((detection: any) => {
                  const label = detection.categories?.[0]?.categoryName?.toLowerCase() || "";
                  const score = detection.categories?.[0]?.score || 0;
                  const bbox = detection.boundingBox;
                  if (!bbox) return;
                  const isCheating = CHEATING_OBJECTS.some(obj => label.includes(obj));
                  if (isCheating && score > 0.5) {
                    ctx.strokeStyle = "#ef4444";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(bbox.originX, bbox.originY, bbox.width, bbox.height);
                    ctx.fillStyle = "rgba(239,68,68,0.85)";
                    ctx.fillRect(bbox.originX, bbox.originY - 22, bbox.width, 22);
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 11px sans-serif";
                    ctx.fillText(`${label} ${Math.round(score * 100)}%`, bbox.originX + 4, bbox.originY - 6);
                    setDetectedObject(label);
                    onViolation?.("CHEATING_OBJECT");
                    terminate(`Cheating material detected — ${label} visible in camera`);
                  }
                });
              }
            } catch (objErr) {}
          }
        }
      } catch (err) {}
    };

    intervalRef.current = setInterval(detect, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, cameraReady, faceApiLoaded, terminate, onViolation]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  // Status badge
  const getStatus = () => {
    if (terminated) return { label: "TERMINATED", color: "#ef4444", bg: "#fef2f2", dot: "#ef4444" };
    if (!cameraReady) return { label: "Starting camera…", color: "#d97706", bg: "#fffbeb", dot: "#f59e0b" };
    if (!faceApiLoaded) return { label: "Loading face AI…", color: "#7c3aed", bg: "#faf5ff", dot: "#7c3aed" };
    if (!objectModelLoaded) return { label: "Loading object AI…", color: "#7c3aed", bg: "#faf5ff", dot: "#7c3aed" };
    if (isActive) return { label: "LIVE", color: "#15803d", bg: "#f0fdf4", dot: "#22c55e" };
    return { label: "Standby", color: "#6b7280", bg: "#f9fafb", dot: "#d1d5db" };
  };

  const status = getStatus();

  const borderColor = terminated ? "#fca5a5"
    : faceCount === 0 && isActive ? "#fcd34d"
    : faceCount && faceCount > 1 ? "#fca5a5"
    : faceCount === 1 && isActive ? "#86efac"
    : "#e5e7eb";

  return (
    <>
      {/* Termination Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}>
          <div style={{
            background: "white",
            borderRadius: 20,
            padding: "32px 28px",
            maxWidth: 380,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
            border: "1px solid #fecaca",
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🚫</div>
            <h3 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: "#111827" }}>
              Interview Terminated
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{modalReason}</p>
            {detectedObject && (
              <div style={{
                marginTop: 12, padding: "8px 14px", borderRadius: 10,
                background: "#fef2f2", border: "1px solid #fecaca",
              }}>
                <p style={{ margin: 0, fontSize: 12, color: "#b91c1c" }}>
                  Detected: <strong style={{ textTransform: "capitalize" }}>{detectedObject}</strong>
                </p>
              </div>
            )}
            <div style={{
              marginTop: 12, padding: "10px 14px", borderRadius: 10,
              background: "#fef2f2", border: "1px solid #fecaca",
            }}>
              <p style={{ margin: 0, fontSize: 12, color: "#b91c1c" }}>This incident has been recorded.</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#ef4444" }}>Redirecting in 3 seconds…</p>
            </div>
          </div>
        </div>
      )}

      {/* Camera container */}
      <div style={{
        borderRadius: 16,
        overflow: "hidden",
        border: `1.5px solid ${borderColor}`,
        background: "white",
        boxShadow: terminated
          ? "0 4px 20px rgba(239,68,68,0.15)"
          : isActive && faceCount === 1
          ? "0 4px 20px rgba(34,197,94,0.1)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        transition: "border-color 0.3s, box-shadow 0.3s",
        position: "relative",
      }}>
        {/* Status bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px",
          background: status.bg,
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: status.dot,
              boxShadow: isActive ? `0 0 0 3px ${status.dot}33` : "none",
              animation: isActive && !terminated ? "agentPulse 2s infinite" : "none",
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: status.color, letterSpacing: "0.03em" }}>
              {status.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isActive && faceCount !== null && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                padding: "2px 7px", borderRadius: 20,
                background: faceCount === 1 ? "#dcfce7" : faceCount === 0 ? "#fef3c7" : "#fee2e2",
                color: faceCount === 1 ? "#15803d" : faceCount === 0 ? "#b45309" : "#b91c1c",
                border: `1px solid ${faceCount === 1 ? "#86efac" : faceCount === 0 ? "#fcd34d" : "#fca5a5"}`,
              }}>
                👤 {faceCount}
              </span>
            )}
            {isActive && (
              <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace", fontWeight: 600 }}>
                {formatTime(elapsedTime)}
              </span>
            )}
          </div>
        </div>

        {/* Video */}
        <div style={{ position: "relative", lineHeight: 0 }}>
          <video
            ref={videoRef}
            width={320} height={240}
            muted playsInline
            style={{ display: "block", transform: "scaleX(-1)", width: "100%", height: "auto" }}
          />
          <canvas
            ref={canvasRef}
            width={320} height={240}
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              pointerEvents: "none",
              transform: "scaleX(-1)",
            }}
          />

          {/* No-face countdown overlay */}
          {isActive && faceCount === 0 && noFaceSeconds > 0 && !terminated && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 4,
            }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>
                {5 - noFaceSeconds}
              </div>
              <div style={{ fontSize: 11, color: "#fde68a" }}>seconds remaining</div>
            </div>
          )}
        </div>

        {/* Alert strip */}
        {currentAlert && !terminated && (
          <div style={{
            padding: "7px 12px",
            background: "#fef2f2",
            borderTop: "1px solid #fecaca",
            fontSize: 11, color: "#b91c1c", fontWeight: 600,
          }}>
            {currentAlert}
          </div>
        )}

        {/* Loading bar */}
        {(!faceApiLoaded || !objectModelLoaded) && !terminated && (
          <div style={{
            padding: "7px 12px",
            background: "#faf5ff",
            borderTop: "1px solid #e9d5ff",
            display: "flex", gap: 12,
          }}>
            {[
              { label: "Face AI", done: faceApiLoaded },
              { label: "Object AI", done: objectModelLoaded },
              { label: "Camera", done: cameraReady },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10 }}>{item.done ? "✅" : "⏳"}</span>
                <span style={{ fontSize: 10, color: item.done ? "#7c3aed" : "#9ca3af" }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rules (standby only) */}
        {!isActive && !terminated && (
          <div style={{
            padding: "10px 14px",
            background: "#fafafa",
            borderTop: "1px solid #f3f4f6",
          }}>
            {/* <p style={{ margin: "0 0 7px", fontSize: 10, fontWeight: 700, color: "#374151", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Proctoring Rules
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { icon: "✅", text: "Keep your face visible at all times", ok: true },
                { icon: "✅", text: "Only you should be in the camera", ok: true },
                { icon: "✅", text: "Do not switch tabs or windows", ok: true },
                { icon: "❌", text: "Phone / book / paper = immediate termination", ok: false },
                { icon: "❌", text: "Multiple people = immediate termination", ok: false },
                { icon: "❌", text: "Face hidden 5 seconds = termination", ok: false },
              ].map((rule, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 9, marginTop: 1 }}>{rule.icon}</span>
                  <span style={{ fontSize: 10, color: rule.ok ? "#15803d" : "#b91c1c", lineHeight: 1.4 }}>
                    {rule.text}
                  </span>
                </div>
              ))}
            </div> */}
          </div>
        )}
      </div>
    </>
  );
};

export default ProctorCamera;