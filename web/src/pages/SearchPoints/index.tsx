import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import './styles.css'

import logo from '../../assets/logo.svg'

interface pointsData {
  id: number;
  city: string;
  image: string;
  name: string;
  uf: string;
}

interface ReceivedData {
  location: {
    state: {
      pointsData: pointsData[]
    }
  }
  
}

const SearchPoints = (data: ReceivedData) => {
  const points = data.location.state.pointsData;

  return (

    <div id="page-search-points">

      <header>
        <div id="header">
          <img src={logo} alt="Ecoleta-logo"/>
          <Link to='/'>
            <FiArrowLeft />
            Voltar para home
          </Link>
        </div>
        <div id="points">
          <strong>{points.length} pontos</strong>
          <span> encontrados</span>
        </div>
      </header>


      <div id="search-background">
        <div id="search-content">

          {points.map(item => (

            <div key={item.id} id="point">
              <img src={item.image} alt={item.name}/>
              <h1>{item.name}</h1>
              <strong>Lâmpadas, Pilhas e Baterias</strong>
              <span>{item.city}, {item.uf}</span>
            </div>

          ))}

          
        </div>
      </div>


    </div>
  );
};

export default SearchPoints;