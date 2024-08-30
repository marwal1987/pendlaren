import React, { useState, useEffect } from "react";
import "./App.css";

const VITE_RESROBOT_API_KEY = import.meta.env.VITE_RESROBOT_API_KEY;

javascript;

const App = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [stops, setStops] = useState([]);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [departures, setDepartures] = useState([]);

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

/*
Ingående förklaringar:

  State-hantering:
        location: Håller reda på användarens latitud och longitud.
        stops: En lista över närliggande hållplatser baserat på användarens plats.
        selectedStopId: ID för den hållplats som användaren valt.
        departures: En lista över avgångar från den valda hållplatsen.

  useEffect - Geolocation : Denna hook körs en gång när komponenten först laddas, eftersom beroendearrayen [] är tom.
    Geolocation API:
        Om webbläsaren stödjer geolocation, hämtas användarens nuvarande position.
        Latitud och longitud sparas i location state.
        Om geolocation inte stöds, visas en varning.

  useEffect - fetchStops: Denna hook körs när location ändras, dvs. när användarens plats har hämtats.
    API-anrop:
        Ett anrop görs till ResRobots API för att hämta närliggande hållplatser baserat på användarens plats.
        Resultatet (en lista med hållplatser) sparas i stops.
        Eventuella fel loggas i konsolen.


  useEffect - fetchDepartures: Denna hook körs när selectedStopId ändras, dvs. när användaren har valt en hållplats.
    API-anrop:
        Ett anrop görs till ResRobots API för att hämta avgångar från den valda hållplatsen.
        Resultatet (en lista med avgångar) sparas i departures.
        console.log(data) används för att visa de mottagna data i utvecklingskonsolen.
        Eventuella fel loggas i konsolen.


    HTML-struktur:
        Titeln "Pendlaren" visas högst upp.
        Användarens latitud och longitud visas.
        En lista över närliggande hållplatser renderas dynamiskt baserat på stops state.
        För varje hållplats skapas en knapp som när den klickas sätter selectedStopId.
        Om en hållplats är vald (selectedStopId är inte null), visas avgångarna från den hållplatsen.
        Avgångarna renderas som en lista.


Export: Komponenten App exporteras som standard för att kunna användas i andra delar av applikationen.

Sammanfattning

Koden är en React-applikation som använder geolocation för att hämta användarens position och sedan visa närliggande kollektivtrafikhållplatser och deras avgångar genom att anropa ResRobots API. Applikationen använder useState för att hantera state och useEffect för att hantera sidoseffekter som API-anrop.
*/
