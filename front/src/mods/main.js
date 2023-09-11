import React, { useContext, useEffect, useState } from 'react';
import logo from '../logo.png';
import Cookies from 'universal-cookie';
import { ThemeContext } from './themeprovider';
import Prod from './prods';
import Footer from './Footer';
import Nav from './nav';

// Define your translated texts here
const translatedTexts = {
  en: {
    tshirt: 'T-shirts',
    hoodie: 'Hoodies',
    languageModal: 'Language',
    english: 'English',
    farsi: 'فارسی',
  },
  fa: {
    tshirt: 'تی‌شرت',
    hoodie: 'هودی',
    languageModal: 'زبان',
    english: 'انگلیسی',
    farsi: 'فارسی',
  },
};

const MAINURL = 'http://127.0.0.1:2000';

const Main = () => {
  const theme = useContext(ThemeContext);
  const cookies = new Cookies();
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [inverted, setInverted] = useState(theme === 'benidark' ? '' : 'invert');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [Data, setData] = useState([]);
  const uuidA = '6d3c6b0f-8470-4f3a-a213-ffde2b95e70a';
  const uuidC = '29924df9-1786-4b0d-a40e-7cf4b7df52d3';
  const isFarsi = cookies.getAll().Lang === 'fa';
  const handleScroll = () => {
    setIsScrolledDown(window.scrollY > 200);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (cookies.get('Lang') === undefined) {
      window.my_modal_5.showModal();
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const renderProducts = async () => {
      if (products.length > 0 && Array.isArray(products)) {
        const newComponents = products.map((product) => (
          <Prod key={product.productId} prod={product} />
        ));
        setData((oldP) => [...oldP, ...newComponents]);
      } else {
        setData([]);
      }
    };
    renderProducts();
  }, [products]);

  const fetchProducts = async () => {
    if (products.length > 0) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${MAINURL}/product/recommend/`);
      const data = await response.json();
      setProducts(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setIsLoading(false);
    }
  };

  const handleLangSelect = (lang) => {
    cookies.set('Lang', lang);
    window.location.reload(); // Reload the page to apply the selected language
  };

  // Get the selected language from cookies or default to English
  const selectedLang = cookies.getAll().Lang || 'en';
  const texts = translatedTexts[selectedLang];

  return (
    <div className={`min-w-screen  2xl:px-96 2xl:py-52 ${isFarsi?'':'font-thin'}  ${isFarsi?'font-yek':'font-mont'} `}>
      <div className={`w-full fixed top-0  transition-all 2xl:px-96 ease-linear left-0 z-50 ${
        isScrolledDown ? ' opacity-1 ' : ' opacity-0 '
      } `}>
        <Nav />
      </div>
      <div className='bg-base-100 text-accent space-y-10' data-theme={theme}>
        <div className={`items-center m-0 flex flex-col justify-center mt-12 ${inverted}`}>
          <img
            src={logo}
            className={`${
              isScrolledDown ? ' opacity-0 ' : ' opacity-1'
            }  transition-all ease-linear `}
            alt='Logo'
          />
        </div>
        <div className='flex min-w-screen object-cover sm:p-4 sm:gap-2 flex-col sm:flex-row '>
          <a className='sm:w-1/2 relative bg-black ' href='/products/t-shirt/1'>
            <img
              src={`http://127.0.0.1:2000/image/item/${uuidA}`}
              alt='Item A'
              className='opacity-60 hover:opacity-40 ease-linear transition-all '
            />
            <p className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-white font-bold '>
              {texts.tshirt}
            </p>
          </a>
          <a className='sm:w-1/2 relative bg-black ' href='/products/hoodie/1'>
            <img
              src={`http://127.0.0.1:2000/image/item/${uuidC}`}
              alt='Item C'
              className='opacity-60 hover:opacity-40 ease-linear transition-all '
            />
            <p className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-white font-bold'>
              {texts.hoodie}
            </p>
          </a>
        </div>
        <div className='divider divider-vertical'></div>
        <div className='p-4 grid grid-cols-1 sm:grid-cols-4 gap-5 grid-rows-1 min-w-screen '>
          {Data}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Main;
