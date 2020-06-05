import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';
import Dropzone from '../../components/Dropzone';

import './styles.css'

import logo from '../../assets/logo.svg'

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface UF {
  id: number;
  nome: string;
  sigla: string;
}

interface City {
  id: number;
  nome: string;
  sigla: string;
}

const CreatePoint = () => {
  const [registerCompleted, setRegisterCompleted] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [uf, setUF] = useState<UF[]>([]);
  const [city, setCity] = useState<City[]>([]);
  
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [selectedFile, setSelectedFile] = useState<File>()

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    })
  }, [])


  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, []);

  useEffect(() => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(response => {
        setUF(response.data);
      })
  }, []);

  useEffect(() => {
    if(selectedUf === '0') {
      return;
    }
    axios
      .get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        setCity(response.data);
      })
  }, [selectedUf]);

  function handleSelectedUf (event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }

  function handleSelectedCity (event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    const { name, value } = event.target;
    setFormData({...formData, [name]: value });
  }

  function handleSelectItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0){
      const filteredItem = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItem);
    } else {
      setSelectedItems([...selectedItems, id]);
    }

  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));

    if(selectedFile) {
      data.append('image', selectedFile);
    }

    await api.post('/points', data);

    setRegisterCompleted(true);

  }

  return (
    <div id="page-create-point">

      {registerCompleted ? <div id="register-completed">
        <FiCheckCircle size={40} color={"#00FF00"} />
        <span>Cadastro Concluído!</span>
        <button type='submit' onClick={() => history.push('/')}>Ok!</button>
      </div> : false}

      <header>
        <img src={logo} alt="Ecoleta-logo"/>
        <Link to='/'>
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type='text'
              name='name'
              id='name'
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">

            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type='email'
                name='email'
                id='email'
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type='text'
                name='whatsapp'
                id='whatsapp'
                onChange={handleInputChange}
              />
            </div>
          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map 
            center={initialPosition}
            zoom={15}
            onClick={handleMapClick}
            >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectedUf}
                >
                <option value="0">Selecione uma UF</option>
                {
                  uf.map(item => (
                  <option key={item.sigla} value={item.sigla}>{`${item.sigla} - ${item.nome}`}</option>
                  ))
                }
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectedCity}
                >>
                <option value="0">Selecione uma Cidade</option>
                {
                  city.map(item => (
                  <option key={item.nome} value={item.nome}>{item.nome}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itema abaixo</span>
          </legend>

          <ul className='items-grid'>
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>

        </fieldset>

        <button type='submit'>
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
};

export default CreatePoint;