// src/hooks/use-barcode-scanner.ts
import { useEffect, useRef } from "react";

interface Options {
  onBarcode: (barcode: string) => void;
  enabled?: boolean;
}

export function useBarcodeScanner({ onBarcode, enabled = true }: Options) {
  const onBarcodeRef = useRef(onBarcode);
  useEffect(() => {
    onBarcodeRef.current = onBarcode;
  }, [onBarcode]);

  useEffect(() => {
    if (!enabled) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      ws = new WebSocket("ws://localhost:8765");

      ws.onopen = () => {
        console.log("[BarcodeScanner] WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as { barcode: string };
          if (data.barcode) {
            onBarcodeRef.current(data.barcode);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        console.log("[BarcodeScanner] WebSocket closed, retrying in 2s...");
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [enabled]);
}
