"use client";
import { useEffect, useRef } from "react";

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.google?.maps) return resolve();
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

export default function Map({ center, markers = [] }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const key =
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyBUmdRvBbDk7ogouT_3sHccqgZpDAYrqJE"; // fallback (for testing only)

    if (!key) {
      console.warn("[Map] Missing Google Maps API key");
      return;
    }

    const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center fallback
    const mapCenter =
      center && center.lat && center.lng ? center : defaultCenter;

    const src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;

    // 🗺️ Initialize Google Map once
    function initMap() {
      if (!ref.current) return;

      mapRef.current = new window.google.maps.Map(ref.current, {
        center: mapCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        clickableIcons: true,
      });

      // Add initial markers
      updateMarkers();
    }

    // 🧭 Add / update markers dynamically
    function updateMarkers() {
      if (!mapRef.current) return;
      // Clear existing markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();

      markers.forEach((m) => {
        if (!m?.position?.lat || !m?.position?.lng) return;
        const marker = new window.google.maps.Marker({
          position: m.position,
          map: mapRef.current,
          title: m.title,
          animation: window.google.maps.Animation.DROP,
        });

        const infowindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-size:14px; line-height:1.4;">
              <strong>${m.title || ""}</strong><br/>
              ${m.description || ""}
            </div>`,
        });

        marker.addListener("click", () => {
          infowindow.open({ anchor: marker, map: mapRef.current });
        });

        markersRef.current.push(marker);
        bounds.extend(m.position);
      });

      // Fit map to all markers if any exist
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds);
      }
    }

    // 🚀 Load Google Maps API and initialize
    if (window.google?.maps) {
      initMap();
    } else {
      loadScriptOnce(src)
        .then(() => initMap())
        .catch((e) => console.warn("[Map] Failed to load Google Maps", e));
    }

    // Cleanup on unmount
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []); // run once on mount

  // 🔄 Recenter smoothly when "center" changes
  useEffect(() => {
    if (mapRef.current && center?.lat && center?.lng) {
      mapRef.current.panTo(center);
      mapRef.current.setZoom(14);
    }
  }, [center]);

  // 🔁 Update markers dynamically when results change
  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;
    const bounds = new window.google.maps.LatLngBounds();

    // Remove old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    markers.forEach((m) => {
      if (!m?.position?.lat || !m?.position?.lng) return;
      const marker = new window.google.maps.Marker({
        position: m.position,
        map: mapRef.current,
        title: m.title,
        animation: window.google.maps.Animation.DROP,
      });

      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-size:14px; line-height:1.4;">
            <strong>${m.title || ""}</strong><br/>
            ${m.description || ""}
          </div>`,
      });

      marker.addListener("click", () => {
        infowindow.open({ anchor: marker, map: mapRef.current });
      });

      markersRef.current.push(marker);
      bounds.extend(m.position);
    });

    if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds);
  }, [markers]);

  return (
    <div
      ref={ref}
      className="w-full h-full min-h-[350px] rounded-xl overflow-hidden shadow-inner"
    />
  );
}
