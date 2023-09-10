import './App.css';
import Orbits from './components/Orbits';
import NetworkBackground from './components/NetworkBackground';
import "bootstrap/dist/css/bootstrap.min.css";
import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const title_width = 1920;
const title_height = 600;

function App() {


  return (
    <div className="App">
      <Row className="title-window" style={{ width: title_width + 'px', height: title_height + 'px' }}>
        <Orbits w={title_width} h={title_height} />
        <NetworkBackground w={title_width} h={title_height} />
        <Row height='10rem'>
          <Row>
            <h1 className="title">Un titolo molto accattivante</h1>
          </Row>
          <Row>
            <h3 className="subtitle">Un sottotitolo che suona bene ma non vuol dire nulla</h3>
          </Row>
        </Row>
      </Row>

    </div>
  );
}

export default App;
