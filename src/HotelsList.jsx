import axios from "axios";
import React, { useState, useEffect } from "react";

const suppliers1 = axios.create({
  baseURL: "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme",
});

const suppliers2 = axios.create({
  baseURL: "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia",
});

const suppliers3 = axios.create({
  baseURL: "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies",
});

function HotelsList() {
  const [hotels, setHotels] = useState([]);
  const [hotelIds, setHotelIds] = useState("");
  const [destinationIds, setDestinationIds] = useState("");

  useEffect(() => {
    Promise.all([suppliers1.get(), suppliers2.get(), suppliers3.get()])
      .then(([response1, response2, response3]) => {
        const mergedData = mergeHotels(
          response1.data,
          response2.data,
          response3.data
        ); // merge data
        setHotels(mergedData);
      })
      .catch((error) => {
        console.log("Error fetching data from suppliers", error);
      });
  }, []);

  function handleHoteIdsChange(event) {
    setHotelIds(event.target.value);
  }

  function handleDestinationIdsChange(event) {
    setDestinationIds(event.target.value);
  }

  function findHotels() {
    if (hotelIds.length !== 0 && destinationIds.length !== 0) {
      setHotels(
        filterData(hotels, hotelIds.split(","), destinationIds.split(","))
      );
    }
  }

  return (
    <div className="hotels-list">
      <h1>Hotels</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter hotelIds to find..."
          value={hotelIds}
          onChange={handleHoteIdsChange}
        />

        <input
          type="text"
          placeholder="Enter destinationIds to find..."
          value={destinationIds}
          onChange={handleDestinationIdsChange}
        />

        <button className="find-button" onClick={findHotels}>
          Find
        </button>
      </div>

      <ol>
        {hotels.length === 0 ? (
          <li>No Hotel</li>
        ) : (
          hotels.map((hotel) => (
            <li key={hotel.Id}>
              <h2>{hotel.Name}</h2>
              <p>
                <strong>Hotel ID: </strong>
                {hotel.Id}
              </p>
              <p>
                <strong>Destination ID: </strong>
                {hotel.DestinationId}
              </p>
              <p>
                <strong>Latitude: </strong>
                {hotel.Latitude}
              </p>
              <p>
                <strong>Longitude: </strong>
                {hotel.Longitude}
              </p>
              <p>
                <strong>Address: </strong>
                {hotel.Address}
              </p>
              <p>
                <strong>City: </strong>
                {hotel.City}
              </p>
              <p>
                <strong>Country: </strong>
                {hotel.Country}
              </p>
              <p>
                <strong>Postal Code: </strong>
                {hotel.PostalCode}
              </p>
              <p>
                <strong>Description: </strong>
                {hotel.Description}
              </p>
              <p>
                <strong>Info: </strong>
                {hotel.info}
              </p>
              <p>
                <strong>Details: </strong>
                {hotel.details}
              </p>
              <p>
                <strong>Amenities: </strong>
                <ul>
                  {hotel.Amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </p>
              <p>
                <strong>Images: </strong>{" "}
                <ul>
                  {hotel.Images.Rooms.map((img, index) => (
                    <li key={index}>
                      <img src={img.url} alt={img.description} />
                      <p>{img.description}</p>
                    </li>
                  ))}
                </ul>
                <ul>
                  {hotel.Images.Site.map((img, index) => (
                    <li key={index}>
                      <img src={img.url} alt={img.description} />
                      <p>{img.description}</p>
                    </li>
                  ))}
                </ul>
              </p>
              <p>
                <strong>Facilalities: </strong>
                <ul>
                  {hotel.Facilities.map((facility, index) => (
                    <li key={index}>{facility}</li>
                  ))}
                </ul>
              </p>
              <p>
                <strong>Booking conditions: </strong>
                <ul>
                  {hotel.BookingConditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </p>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

function mergeHotels(hotels1, hotels2, hotels3) {
  return hotels1.map((hotel1) => {
    const hotel2 = hotels2.find((hotel) => hotel.id === hotel1.Id) || {};
    const hotel3 = hotels3.find((hotel) => hotel.hotel_id === hotel1.Id) || {};

    return {
      Id: hotel1.Id || hotel2.id || hotel3.hotel_id,
      DestinationId:
        hotel1.DestinationId || hotel2.destination || hotel3.destination_id,
      Name: hotel1.Name || hotel2.name || hotel3.hotel_name,
      Latitude: hotel1.Latitude || hotel2.lat || null,
      Longitude: hotel1.Longitude || hotel2.lng || null,
      Address: hotel1.Address || hotel2.address || hotel3.location?.address,
      City: hotel1.City,
      Country: hotel1.Country || hotel3.location?.country,
      PostalCode: hotel1.PostalCode,
      Description: hotel1.Description,
      info: hotel2.info,
      details: hotel3.details,
      Facilities: Array.from(
        new Set([
          ...(hotel1.Facilities || []),
          ...(hotel3.amenities?.general.map((item) =>
            capitalizeFirstLetter(item)
          ) || []),
        ])
      ),
      Amenities: Array.from(
        new Set([
          ...(hotel2.amenities || []),
          ...(hotel3.amenities?.room.map((item) =>
            capitalizeFirstLetter(item)
          ) || []),
        ])
      ),
      Images: {
        Rooms: [
          ...(hotel2.images?.rooms || []),
          ...(hotel3.images?.rooms || []),
        ].map((img) => ({
          url: img.url || img.link,
          description: img.description || img.caption,
        })),
        Site: [...(hotel3.images?.site || [])].map((img) => ({
          url: img.link,
          description: img.caption,
        })),
      },
      BookingConditions: hotel3.booking_conditions || [],
    };
  });
}

function filterData(hotels, hotelIds, destinationIds) {
  return hotels.filter((hotel) => {
    const matchHotelId = hotelIds.includes(hotel.Id);
    const matchDestinationId = destinationIds.includes(hotel.DestinationId);
    return matchHotelId || matchDestinationId;
  });
}

function capitalizeFirstLetter(str) {
  if (!str) return str; //check if string is empty
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default HotelsList;
