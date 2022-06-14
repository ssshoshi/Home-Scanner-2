import React, {useState, useEffect} from 'react';
import logo from '../../assets/img/logo.svg';
import './Newtab.css';
import './Newtab.scss';
 



const Newtab = () => {

  const [homes, setHomes] = useState([]);
  useEffect(()=>{
    chrome.runtime.sendMessage({message:"hi"}, async response => {
      const homes = await response
      setHomes(homes)

    })
  })
console.log(homes)

  return (
    <div className="App">
      <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
       <>
      {homes.map(({zpid, address}, index) => (
        <p key={index}>{zpid}{address}</p>
      ))}
    </>
    </div>
  );
};

export default Newtab;
