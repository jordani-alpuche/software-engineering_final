"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isValidSchedule } from "@/app/api/visitors/[id]/route"; // Adjust path as needed

export default function QRScanner() {
  const [scanned, setScanned] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const startScanner = async () => {
      if (!scannerRef.current) return;

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 10, qrbox: 250 };

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          async (decodedText) => {
            if (!scanned) {
              setScanned(decodedText);
              try {
                await html5QrCode.stop();
                await html5QrCode.clear();
              } catch (stopError) {
                console.warn("Error stopping scanner:", stopError);
              }

              const pattern =
                /^http:\/\/localhost:3000\/visitors\/viewvisitor\/([a-zA-Z0-9-]+)$/;
              const match = decodedText.match(pattern);

              if (match && match[1]) {
                const visitorId = match[1];

                try {
                  const res = await isValidSchedule(Number(visitorId));
                  const data = await res;

                  if (res && data.valid) {
                    window.location.href = decodedText;
                  } else {
                    toast.error("Invalid QR Code: Visitor not found");
                  }
                } catch (err) {
                  console.error(err);
                  toast.error("Error validating QR code");
                }
              } else {
                toast.error("Scanned code is not a valid visitor URL");
              }
            }
          },
          (error) => {
            // Mute noisy scan errors but keep here for debugging
            // console.log("Scan error:", error);
          }
        );
      } catch (err) {
        console.error("Camera start error", err);
      }
    };

    startScanner();

    return () => {
      isMountedRef.current = false;

      const cleanup = async () => {
        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop();
          } catch (stopErr) {
            console.warn("Scanner stop error during cleanup:", stopErr);
          }

          try {
            const el = document.getElementById("qr-reader");
            if (el) {
              await html5QrCodeRef.current.clear();
            }
          } catch (clearErr) {
            console.warn("Scanner clear error during cleanup:", clearErr);
          }
        }
      };

      cleanup();
    };
  }, [scanned]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
      <div
        id="qr-reader"
        ref={scannerRef}
        className="mx-auto max-w-md w-full"
      />
    </div>
  );
}
