import { useEffect, useState } from 'react';

import styles from './Form.module.css';
import Button from './Button';
import BackButton from './BackButton';
import { usePositionFromURL } from '../hooks/getPositionFromURL';
import Spinner from './Spinner';
import Message from './Message';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { useCities } from '../context/CitiesContext';
import { useNavigate } from 'react-router-dom';

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const API = 'https://api.bigdatacloud.net/data/reverse-geocode-client?';

function Form() {
  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [lat, lng] = usePositionFromURL();
  const [emoji, setEmojie] = useState('');
  const navigate = useNavigate();
  const { createAndPostNewCity, isLoading } = useCities();

  // state for fetch city that has been clicked on the map
  const [isLoadingGeoCoding, setIsLoadingGeoCoding] = useState(false);
  const [errorGeoCoding, setErrorGeoCoding] = useState(null);
  // fetch city when user click on map so that city show in the form(pre fill the form)

  useEffect(() => {
    if (!lat || !lng) return;

    async function fetchClickedCity() {
      try {
        setIsLoadingGeoCoding(true);
        setErrorGeoCoding(null);

        const res = await fetch(`${API}latitude=${lat}&longitude=${lng}`);
        const data = await res.json();

        if (!res.ok) throw new Error('something wrong with fetching this city ');
        if (!data.countryCode)
          throw new Error(
            'this place don\t seem to be a city please click somewhere else😁 '
          );

        setCityName(data.city || data.locality || '');
        setCountry(data.countryName);
        setEmojie(convertToEmoji(data.countryCode));
      } catch (error) {
        setErrorGeoCoding(error.message);
      } finally {
        setIsLoadingGeoCoding(false);
      }
    }
    fetchClickedCity();
  }, [lat, lng]);

  // whne the form filled create a new city on the server

  async function handleSubmit(e) {
    e.preventDefault();
    if (!date || !cityName) return;

    const newCity = { cityName, country, emoji, date, notes, position: { lat, lng } };
    await createAndPostNewCity(newCity);
    navigate('/app');
  }

  if (!lat || !lng) return <Message message="start by clicking somewhere on the map" />;
  if (isLoadingGeoCoding) return <Spinner />;
  if (errorGeoCoding) return <Message message={errorGeoCoding} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ''}`}
      onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />

        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input id="date" onChange={(e) => setDate(e.target.value)} value={date} /> */}
        {/* we want a date from npm daepicker 💀 */}
        <DatePicker
          id="date"
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea id="notes" onChange={(e) => setNotes(e.target.value)} value={notes} />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
