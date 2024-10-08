import React, { useState, useEffect } from "react";
import "./App.css";

const VITE_RESROBOT_API_KEY = import.meta.env.VITE_RESROBOT_API_KEY;

const App = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [stops, setStops] = useState([]);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [departures, setDepartures] = useState([]);

  // Hämta användarens position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => console.error("Error getting location:", error)
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  // Hämta närmaste hållplatser
  useEffect(() => {
    if (location.latitude && location.longitude) {
      const fetchStops = async () => {
        try {
          const response = await fetch(
            `https://api.resrobot.se/v2.1/location.nearbystops?originCoordLat=${location.latitude}&originCoordLong=${location.longitude}&format=json&accessId=${VITE_RESROBOT_API_KEY}`
          );
          const data = await response.json();
          setStops(data.stopLocationOrCoordLocation);
        } catch (error) {
          console.error("Error fetching stops:", error);
        }
      };

      fetchStops();
    }
  }, [location]);

  // Hämta avgångar från vald hållplats
  useEffect(() => {
    if (selectedStopId) {
      const fetchDepartures = async () => {
        try {
          const response = await fetch(
            `https://api.resrobot.se/v2.1/departureBoard?id=${selectedStopId}&format=json&accessId=${VITE_RESROBOT_API_KEY}`
          );
          const data = await response.json();
          console.log(data);

          // Kontrollera att strukturen matchar det som förväntas
          const allDepartures = data.Departure || [];
          setDepartures(allDepartures);
        } catch (error) {
          console.error("Error fetching departures:", error);
        }
      };

      fetchDepartures();
    }
  }, [selectedStopId]);

  return (
    <div>
      <h1>Pendlaren</h1>

      <h2>Your Location</h2>
      <p>Latitude: {location.latitude}</p>
      <p>Longitude: {location.longitude}</p>

      <h2>Nearby Stops</h2>
      <ul>
        {stops.map((stop) => (
          <li key={stop.StopLocation.extId}>
            <button onClick={() => setSelectedStopId(stop.StopLocation.extId)}>
              {stop.StopLocation.name}
            </button>
          </li>
        ))}
      </ul>

      {selectedStopId && (
        <>
          <h2>
            Departures from{" "}
            {
              stops.find((stop) => stop.StopLocation.extId === selectedStopId)
                ?.StopLocation.name
            }
          </h2>
          <ul>
            {departures.map((departure, index) => (
              <li key={index}>
                {departure.ProductAtStop.name} - {departure.direction} -{" "}
                {departure.time}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;
