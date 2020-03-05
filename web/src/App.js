import React, { useState, useEffect } from 'react';

import GlobalStyle from './styles/global';
import api from './services/api';

import './App.css';
import './Sidebar.css';
import './Main.css';

import DevForm from './components/DevForm';
import DevItem from './components/DevItem';

function App() {
  const [devs, setDevs] = useState([]);

  useEffect(() => {
    async function loadDevs() {
      const response = await api.get('/devs');

      setDevs(response.data);
    }
    loadDevs();
  }, []);

  async function handleAddDev(data) {
    const response = await api.post('devs', data);
    const { data:newDev } = response;
    let add = true;
    for (let oldDev in devs)
      if (devs[oldDev]._id===newDev._id)
        add = false;
    if (add) // Evitar adicionar duplicatas
      setDevs([...devs, newDev]); // Spread para manter imutabilidade
  }
  /*
    The child component can inherit a function,
    as a prop, in this case onSubmit is passed to DevForm
  */

  return (
    <>
      <div id="app">
        <aside>
          <strong>Cadastrar</strong>
          <DevForm onSubmit={handleAddDev} />
        </aside>

        <main>
          <ul>
            {devs.map(dev => (
              <DevItem key={dev._id} dev={dev} />
            ))}
          </ul>
        </main>
      </div>
      <GlobalStyle />
    </>
  );
}

export default App;
