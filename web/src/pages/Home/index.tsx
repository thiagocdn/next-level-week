import React, { useState, ChangeEvent, useEffect, FormEvent } from 'react';
import { FiLogIn, FiSearch } from 'react-icons/fi'
import { Link, useHistory } from 'react-router-dom';

import './styles.css'

import logo from '../../assets/logo.svg';
import axios from 'axios';
import api from '../../services/api';

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

const Home = () => {

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [uf, setUF] = useState<UF[]>([]);
  const [city, setCity] = useState<City[]>([]);

  const history = useHistory();
  
  const [searchPoints, setSearchPoints] = useState(false);

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

  async function handleSearchPoints(event: FormEvent){
    event.preventDefault();

    if(selectedCity === '0' || selectedUf === '0'){
      setSearchPoints(false);
      return;
    }

    const points = await api.get('/points', {
      params: {
        city: selectedCity,
        uf: selectedUf,
        items: [1,2,3,4,5,6,7,8,9]
      }
    });

    const pointsData = points.data

    history.push('/search-points', {pointsData});

  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setSearchPoints(true);
  }


  return (
    <div id="page-home">

    {searchPoints ?
    <div id="search-points">
      <form onSubmit={handleSearchPoints}>
        <span>Pontos de Coleta</span>
        
        <div className="field-group">
            <div className="field">
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
        <button type='submit'>Buscar!</button>
      </form>
    </div> : false}

      <header>
        <img src={logo} alt="Ecoleta-logo"/>
        <Link to="/create-point">
          <FiLogIn />
          Cadastre um ponto de coleta
        </Link>
      </header>
      <div className="content">
        
        <main>
          <h1>Seu marketplace de coleta de resíduos.</h1>
          <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</p>
          
          <form onSubmit={handleSearch}>
          <button type='submit'>
            <span>
              <FiSearch />
            </span>
            <strong>Pesquisar pontos de coleta</strong>
          </button>
          </form>
        </main>
      </div>
    </div>
  )
}

export default Home;