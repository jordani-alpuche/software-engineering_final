"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isValidSchedule } from "@/lib/serverActions/visitors/[id]/route"; // Adjust path as needed

export default function QRScanner() {
  // State to store the scanned QR code data
  const [scanned, setScanned] = useState<string | null>(null);

  // Ref to hold the div element for the QR scanner
  const scannerRef = useRef<HTMLDivElement>(null);

  // Ref to hold the instance of Html5Qrcode
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Ref to track whether the component is mounted or not
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Function to initialize and start the QR scanner
    const startScanner = async () => {
      if (!scannerRef.current) return;

      // Initialize Html5Qrcode with the 'qr-reader' ID (div to display the scanner)
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      // Configuration for the QR scanner (fps - frames per second, qrbox - size of scanning box)
      const config = { fps: 10, qrbox: 250 };

      try {
        // Start scanning using the camera facing the environment (back camera)
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          async (decodedText) => {
            // If we already have a scanned code, do nothing
            if (!scanned) {
              // Set the scanned QR code value
              setScanned(decodedText);

              try {
                // Stop and clear the scanner after successfully scanning
                await html5QrCode.stop();
                await html5QrCode.clear();
              } catch (stopError) {
                // Log any error stopping the scanner
                console.warn("Error stopping scanner:", stopError);
              }

              // Regular expression pattern to match a valid visitor URL
              const pattern =
                /^http:\/\/localhost:3000\/visitors\/viewvisitor\/([a-zA-Z0-9-]+)$/;

              // Match the scanned QR code with the pattern
              const match = decodedText.match(pattern);

              if (match && match[1]) {
                // Extract the visitor ID from the URL
                const visitorId = match[1];

                try {
                  // Validate the visitor schedule using the extracted visitor ID
                  const res = await isValidSchedule(Number(visitorId));
                  const data = await res;

                  // If valid schedule, redirect to the visitor URL
                  if (res && data.valid) {
                    window.location.href = decodedText;
                  } else {
                    // If invalid schedule, show an error
                    toast.error("Invalid QR Code: Visitor not found");
                  }
                } catch (err) {
                  // If there is an error in validation, show an error
                  console.error(err);
                  toast.error("Error validating QR code");
                }
              } else {
                // If the scanned QR code is not a valid visitor URL
                toast.error("Scanned code is not a valid visitor URL");
              }
            }
          },
          (error) => {
            // Handle any errors encountered during the scan (this can be useful for debugging)
            // console.log("Scan error:", error);
          }
        );
      } catch (err) {
        // Log any error that occurs while starting the camera
        console.error("Camera start error", err);
      }
    };

    // Start the scanner when the component is mounted
    startScanner();

    // Cleanup function to stop the scanner when the component is unmounted
    return () => {
      // Mark the component as unmounted
      isMountedRef.current = false;

      // Function to stop the QR scanner and clean up resources
      const cleanup = async () => {
        if (html5QrCodeRef.current) {
          try {
            // Stop the QR scanner
            await html5QrCodeRef.current.stop();
          } catch (stopErr) {
            // Log any error while stopping the scanner
            console.warn("Scanner stop error during cleanup:", stopErr);
          }

          try {
            // Clear the scanner element if it exists
            const el = document.getElementById("qr-reader");
            if (el) {
              await html5QrCodeRef.current.clear();
            }
          } catch (clearErr) {
            // Log any error while clearing the scanner element
            console.warn("Scanner clear error during cleanup:", clearErr);
          }
        }
      };

      // Run the cleanup function when the component is unmounted
      cleanup();
    };
  }, [scanned]); // Dependency array ensures that the effect runs when the 'scanned' state changes

  return (
    <div className="p-4 text-center">
      {/* Heading */}
      <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
      {/* Div where the QR code scanner will be rendered */}
      <div
        id="qr-reader" // ID for the HTML div element that will hold the scanner
        ref={scannerRef} // Ref to attach to the div
        className="mx-auto max-w-md w-full" // Tailwind classes for styling
      />
    </div>
  );
}
