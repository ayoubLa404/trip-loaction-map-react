import CityItem from './CityItem';
import Spinner from './Spinner';
import styles from './CityList.module.css';
import Message from './Message';
import { useCities } from '../context/CitiesContext';

export default function Cities() {
  const { cities, isLoading } = useCities();

  if (isLoading) return <Spinner />;
  // if cities empty display a message
  if (!cities.length)
    return <Message message={'Please Add a city by clicking on city on the map 😉'} />;

  return (
    <ul className={styles.cityList}>
      {cities.map((city) => (
        <CityItem key={city.id} city={city} />
      ))}
    </ul>
  );
}
