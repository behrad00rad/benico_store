// src/App.js
import React, { useEffect, useState } from 'react';
import {useLanguage} from '../language';

const SearchBar = () => {
  const {t} = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [Results, setResults] = useState([]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const handleSubmit = async () => {
      try {
        const response = await fetch(`/product/search/?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        setResults(data.results);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    handleSubmit();
  }, [searchTerm]);

  return (
    <div className="relative w-full z-50">
      <form onSubmit={event => event.preventDefault()} className="rounded-full flex items-center w-full font-yek">
        <input
          type="text"
          placeholder={t('جستجوی محصول…', 'Search products…')}
          aria-label={t('جستجوی محصول', 'Search products')}
          value={searchTerm}
          onChange={handleInputChange}
          className="bg-secondary p-4 focus:outline-none rounded-tl w-full text-end"
        />
        <div className="p-4 bg-secondary rounded-tr">
          <svg className="w-fit" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"
              fill="rgba(255,255,255,1)"
            ></path>
          </svg>
        </div>
      </form>
      {Results.length > 0 && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md">
          {Results.map((res) => (
            <a href={'/item/'+res.id} key={res.id} className=" justify-between transition-all hover:text-base-100 bg-secondary w-full h-1/2 p-4  flex items-center hover:bg-accent">
              {res.image?.length > 0 && <img src={`/image/item/${res.image[0]}/`} alt={res.title} className="w-16 h-16 mr-4 bg-white" />}
              <span>{res.title}</span>
              <span> #{res.id}</span>
            </a>
          ))}
        </div>
      )}
      {searchTerm && Results.length === 0 && <p className="ui-message">{t('محصولی یافت نشد.', 'No products found.')}</p>}
    </div>
  );
};

export default SearchBar;
