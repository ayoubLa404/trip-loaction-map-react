import Spinner from './Spinner';
import styles from './CountryList.module.css';
import Message from './Message';
import CountryItem from './CountryItem';
import { useCities } from '../context/CitiesContext';

export default function CountryList() {
  const { cities, isLoading } = useCities();

  if (isLoading) return <Spinner />;
  // if cities empty display a message
  if (!cities.length)
    return <Message message={'Please Add a country by clicking on city on the map 🚩'} />;

  // this will prevent dublicate country and create  {country:'',emoji:''}
  const countries = cities.reduce((arr, city) => {
    if (!arr.map((el) => el.country).includes(city.country))
      return [...arr, { country: city.country, emoji: city.emoji }];
    else return arr;
  }, []);

  return (
    <ul className={styles.countryList}>
      {countries.map((country) => (
        <CountryItem key={country.country} country={country} />
      ))}
    </ul>
  );
}
