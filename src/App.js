import './App.css';
import Orbits from './components/Orbits';
import NetworkBackground from './components/NetworkBackground';
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { ChevronDown } from 'react-bootstrap-icons';


function App() {
  const [titleSize, setTitleSize] = React.useState([1920, 1080]);

  useEffect(() => {
    function handleResize() {
      setTitleSize([window.innerWidth, window.innerHeight]);
      console.log(titleSize);
    }
    window.addEventListener('resize', handleResize)
    handleResize();
  }, []);


  return (
    <div className="App">
      <Row className="title-window" style={{ width: titleSize[0] + 'px', height: titleSize[1] + 'px' }}>
        <Orbits size={titleSize} />
        <NetworkBackground size={titleSize} />
        <Row height='10rem'>
          <Row>
            <h1 className="title">Un titolo molto accattivante</h1>
          </Row>
          <Row>
            <h3 className="subtitle">Un sottotitolo che suona bene ma non vuol dire nulla</h3>
          </Row>
          <Row>
            <Col className="mb-2">
              <Button className="on-title-card title-btn" size="lg" variant="link" onClick={() => console.log(titleSize)}>
                <ChevronDown size={32} />
              </Button>
            </Col>
          </Row>
        </Row>
      </Row>

    </div>
  );
}

export default App;
