"use client";

import { useEffect } from "react";
import ScanbotSDKService from "@/app/services/scanbot-sdk-service";

type BarcodeScannerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
};

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    ScanbotSDKService.instance.createBarcodeScanner("barcode-scanner", async (barcode) => {
      if (barcode.sourceImage) {
        const base64Image = await ScanbotSDKService.instance.sdk?.toDataUrl(
          await ScanbotSDKService.instance.sdk?.imageToJpeg(barcode.sourceImage)
        );
        const result = `${barcode.text} (${barcode.format})`;
        onScan(result);

        // Optionnel : fermeture auto après scan
        setTimeout(() => onClose(), 1000);
      }
    });

    return () => {
      ScanbotSDKService.instance.disposeBarcodeScanner();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.75)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        width: "90%",
        height: "80%",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "5px 10px"
          }}
        >
          Fermer
        </button>
        <div id="barcode-scanner" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
