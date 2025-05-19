"use client";

import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeResult,
  Html5QrcodeSupportedFormats,
  Html5QrcodeScannerState,
} from "html5-qrcode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isValidSchedule } from "@/lib/serverActions/visitors/[id]/route";

const SCANNER_ELEMENT_ID = "qr-scanner-region";

export default function QRScanner() {
  const [scanAttempt, setScanAttempt] = useState(0);
  const html5QrCodeInstanceRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  // New state for status messages
  const [statusMessage, setStatusMessage] = useState<string>("Initializing Scanner...");

  useEffect(() => {
    let isEffectMounted = true;
    setStatusMessage("Initializing Scanner..."); // Set status on each attempt

    if (!scannerContainerRef.current) {
      console.warn("Scanner container ref not available during effect run.");
      if (isEffectMounted) setStatusMessage("Error: Scanner container not found.");
      return;
    }

    let scannerTargetElement = document.getElementById(SCANNER_ELEMENT_ID);
    if (!scannerTargetElement && scannerContainerRef.current) {
      scannerContainerRef.current.innerHTML = '';
      scannerTargetElement = document.createElement('div');
      scannerTargetElement.id = SCANNER_ELEMENT_ID;
      scannerTargetElement.style.width = "100%";
      scannerTargetElement.style.height = "100%";
      scannerContainerRef.current.appendChild(scannerTargetElement);
    } else if (scannerTargetElement) {
      scannerTargetElement.innerHTML = '';
    } else {
      console.error("Cannot create or find scanner target element.");
      if (isEffectMounted) setStatusMessage("Error: Could not prepare scanner area.");
      return;
    }
    
    const initializeAndStartScanner = async () => {
      if (!isEffectMounted || !scannerTargetElement) return;

      if (isEffectMounted) setStatusMessage("Preparing scanner...");

      const scannerToCleanup = html5QrCodeInstanceRef.current;
      html5QrCodeInstanceRef.current = null;

      if (scannerToCleanup) {
        try {
          if (typeof scannerToCleanup.getState === 'function' &&
              scannerToCleanup.getState() === Html5QrcodeScannerState.SCANNING) {
            await scannerToCleanup.stop();
          }
          await scannerToCleanup.clear();
        } catch (cleanupError: unknown) {
          console.warn("Error during cleanup of previous scanner:", cleanupError instanceof Error ? cleanupError.message : cleanupError);
        }
      }

      if (!isEffectMounted) return;

      try {
        const newScanner = new Html5Qrcode(
          SCANNER_ELEMENT_ID,
          {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false,
          }
        );

        if (!isEffectMounted) {
          if (newScanner && typeof newScanner.clear === 'function') {
            try {
              await newScanner.clear();
            } catch (e: unknown) { // Fixed TypeScript error here
              console.warn("Cleanup error on unmount during init (newScanner):", e instanceof Error ? e.message : e);
            }
          }
          return;
        }
        html5QrCodeInstanceRef.current = newScanner;

        const scannerConfig = {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minDimension = Math.min(viewfinderWidth, viewfinderHeight);
            const qrBoxSize = Math.floor(minDimension * 0.75);
            return { width: qrBoxSize, height: qrBoxSize };
          },
        };
        let hasProcessedThisScan = false;

        if (isEffectMounted) setStatusMessage("Starting camera...");

        await newScanner.start(
          { facingMode: "environment" },
          scannerConfig,
          async (decodedText: string, result: Html5QrcodeResult) => {
            if (hasProcessedThisScan || !isEffectMounted) return;
            hasProcessedThisScan = true;

            if (isEffectMounted) setStatusMessage("QR Code detected, processing...");

            if (newScanner && typeof newScanner.stop === 'function') {
              try {
                await newScanner.stop();
              } catch (stopError: unknown) {
                console.warn("Error stopping scanner immediately after scan:", stopError instanceof Error ? stopError.message : stopError);
              }
            }

            const pattern = /^https:\/\/gatecommunity.techadmin.me\/visitors\/viewvisitor\/([a-zA-Z0-9-]+)$/;
            const match = decodedText.match(pattern);

            if (match && match[1]) {
              const visitorId = match[1];
              try {
                const validationResponse = await isValidSchedule(Number(visitorId));
                if (validationResponse && validationResponse.valid) {
                  const successMsg = "QR Code Valid. Redirecting in 3 seconds...";
                  toast.success(successMsg);
                  if (isEffectMounted) setStatusMessage(successMsg);
                  
                  setTimeout(() => {
                    if (isEffectMounted) { // Check again before redirecting
                        window.location.href = decodedText;
                    }
                  }, 3000); // 3-second delay
                  return; 
                } else {
                  const errorMsg = "Invalid QR Code: Visitor/schedule not valid.";
                  toast.error(errorMsg);
                  if (isEffectMounted) setStatusMessage(errorMsg + " Please try again.");
                }
              } catch (err: unknown) {
                const errorMsg = "Error validating QR code.";
                console.error(errorMsg, err instanceof Error ? err.message : err);
                toast.error(errorMsg);
                if (isEffectMounted) setStatusMessage(errorMsg + " Please try again.");
              }
            } else {
              const errorMsg = "Scanned code is not a valid visitor URL.";
              toast.error(errorMsg);
              if (isEffectMounted) setStatusMessage(errorMsg + " Please try again.");
            }

            if (isEffectMounted) {
              setTimeout(() => {
                if (isEffectMounted) {
                    setScanAttempt(prev => prev + 1);
                    // Status will be reset to "Initializing Scanner..." by the effect re-run
                }
              }, 1500); // Delay before trying to rescan/reinitialize
            }
          },
          (errorMessage: string, errorDetails: any) => {
            // Non-fatal scan errors (e.g., QR not found)
            // console.log(`QR Scan Runtime Error: ${errorMessage}`);
            // Can set a transient status message if desired, e.g., "Searching for QR code..."
            // but "Please scan QR code" usually covers this.
          }
        );
        
        // If newScanner.start() promise resolves, it means the camera has started
        if (isEffectMounted) {
            setStatusMessage("Please scan QR code");
        }

      } catch (error: unknown) { 
        if (!isEffectMounted) return;
        
        const errInstance = error instanceof Error ? error : new Error(String(error));
        console.error("Failed to initialize or start QR scanner:", errInstance.message, error);
        let friendlyMessage = "Failed to start QR scanner.";
        const errStr = errInstance.message.toLowerCase();

        if (errStr.includes("permission denied") || errStr.includes("notallowederror")) {
            friendlyMessage = "Camera permission denied. Please enable camera access.";
        } else if (errStr.includes("notfounderror")) {
            friendlyMessage = "No camera found. Ensure a camera is connected and enabled.";
        } else if (errStr.includes("not readable") || errStr.includes("aborterror") || errStr.includes("overconstrainederror")) {
            friendlyMessage = "Camera is not readable, blocked, or settings are not supported.";
        }
        toast.error(friendlyMessage);
        if (isEffectMounted) setStatusMessage(friendlyMessage + " Refresh or check settings.");
      }
    };

    initializeAndStartScanner();

    return () => {
      isEffectMounted = false;
      const scannerToCleanupOnUnmount = html5QrCodeInstanceRef.current;
      html5QrCodeInstanceRef.current = null;

      if (scannerToCleanupOnUnmount) {
        (async () => {
          try {
            if (typeof scannerToCleanupOnUnmount.getState === 'function' &&
                scannerToCleanupOnUnmount.getState() === Html5QrcodeScannerState.SCANNING) {
              await scannerToCleanupOnUnmount.stop();
            }
            if (typeof scannerToCleanupOnUnmount.clear === 'function') {
                 await scannerToCleanupOnUnmount.clear();
            }
          } catch (err: unknown) {
            console.warn("Error during effect cleanup (unmount):", err instanceof Error ? err.message : err);
          }
        })();
      }
    };
  }, [scanAttempt]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
      <div
        ref={scannerContainerRef}
        className="mx-auto max-w-md w-full aspect-square bg-gray-200 border border-gray-300 rounded-lg shadow-inner overflow-hidden" // Added some styling
        style={{ minHeight: '280px' }} // Ensured min height
      >
        {/* SCANNER_ELEMENT_ID div is created and managed by the useEffect hook */}
      </div>
      {/* Status Message Display */}
      {statusMessage && (
        <div className="mt-4 p-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
          {statusMessage}
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000} // Toasts for errors will auto-close
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}