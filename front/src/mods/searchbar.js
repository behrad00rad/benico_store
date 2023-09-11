// src/App.js
import React, { useState } from 'react';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle the search logic here (e.g., fetch data from the server)
  };

  return (
    <div className="w-fit ">
      <form className="rounded-full flex items-center font-thin font-mont" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleInputChange}
          className="bg-secondary p-4 focus:outline-none rounded-l"
        />
        <button
          type="submit"
          className='p-4 bg-secondary rounded-r'
        >
                <svg className='w-fit' width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" fill="rgba(255,255,255,1)"></path>
                </svg>  
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
